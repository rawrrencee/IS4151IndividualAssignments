import serial
import time
import sqlite3

def sendCommand(command):
		
	command = command + '\n'
	ser.write(str.encode(command))

def waitResponse():
	
	response = ser.readline()
	response = response.decode('utf-8').strip()
	print("response: " + response)
	
	return response

def saveIntruderData(dataPackets):

	c = conn.cursor()

	for dataPacket in dataPackets:
		data = dataPacket.split(':')
		deviceName = data[0]
		deviceId = ""
		intruderDistrict = data[1]
		temperature = int(data[2])

		if (temperature > 38):
			fever = 'Y'
		else:
			fever = 'N'

		if (intruderDistrict != district):
			intruder = 'Y'
		else:
			intruder = 'N'

		deviceIdSql = "SELECT * FROM trackers WHERE deviceName =? LIMIT 1"
		c.execute(deviceIdSql, (deviceName,))
		records = c.fetchall()

		if (records == None or len(records) <= 0):
			for character in deviceName:
				number = ord(character) - 96
				deviceId = deviceId + str(number)
		else:
			deviceId = str(records[0][1])

		insertSql = "INSERT INTO trackers (deviceId, deviceName, district, temperature, fever, intruder, timestamp) VALUES (?,?,?,?,?,?, datetime('now', 'localtime'))"

		c.execute(insertSql, (deviceId, deviceName, str(intruderDistrict), str(temperature), fever, intruder,))
	
	conn.commit()
	
	dataPackets.clear()

def saveData(dataPackets):
	
	c = conn.cursor()
	
	for dataPacket in dataPackets:
		
		data = dataPacket.split(':')
		serialNumber = data[1]
		deviceId = ""
		deviceName = dataPacket[0:5]
		hops = dataPacket[5:6]
		temperature = int(dataPacket[6:8])
		fever = 'N'
		if (temperature > 38):
			fever = 'Y'
		intruder = 'N'

		deviceIdSql = "SELECT * FROM trackers WHERE deviceName =? LIMIT 1"
		c.execute(deviceIdSql, (deviceName,))
		records = c.fetchall()

		if (records == None or len(records) <= 0):
			for character in deviceName:
				number = ord(character) - 96
				deviceId = deviceId + str(number)
		else:
			deviceId = str(records[0][1])
			

		insertSql = "INSERT INTO trackers (deviceId, deviceName, district, temperature, fever, intruder, timestamp) VALUES (?,?,?,?,?,?, datetime('now', 'localtime'))"

		c.execute(insertSql, (deviceId, deviceName, str(district), str(temperature), fever, intruder,))
	
	conn.commit()
	
	dataPackets.clear()

try:

	print("Listening on COM4... Press CTRL+C to exit")	
	ser = serial.Serial(port='COM4', baudrate=115200, timeout=1)

	conn = sqlite3.connect('edge.db')
	
	# Handshaking
	sendCommand('handshake')
	response = waitResponse().split('=')
	radioControllerData = response[1].split(':')
	district = radioControllerData[1]
	print("District " + district + " connected via " + radioControllerData[0])
	
	strMicrobitDevices = ''
	initCycle = True
	numCycles = 0
	
	while strMicrobitDevices == None or len(strMicrobitDevices) <= 0:
		
		strMicrobitDevices = waitResponse()
		time.sleep(0.1)
	
	strMicrobitDevices = strMicrobitDevices.split('=')
	
	if len(strMicrobitDevices[1]) > 0:

		listMicrobitDevices = strMicrobitDevices[1].split(',')
		
		if len(listMicrobitDevices) > 0:
				
			for mb in listMicrobitDevices:
			
				print('Connected to micro:bit device {}...'.format(mb))
			
			while True:

				numCycles = 0

				if (initCycle):
					time.sleep(5)
					initCycle = False
				else:
					time.sleep(10)
				
				commandToTx = 'sensor=temp'
				sendCommand('cmd:' + commandToTx)
				print('Requesting for temperatures from trackers in District ' + district)
				
				if commandToTx.startswith('sensor='):
					
					strSensorValues = ''

					while strSensorValues == None or len(strSensorValues) <= 0:
						
						strSensorValues = waitResponse()
						if (numCycles > 25):
							numCycles = 0
							break
						time.sleep(0.1)
						numCycles = numCycles + 1

					if (strSensorValues == None or len(strSensorValues) <= 0):
						continue

					listSensorValues = strSensorValues.split(',')

					for sensorValue in listSensorValues:
						
						print(sensorValue)
						
						if (sensorValue.startswith('sensor=')):
							
							listSensorValues.remove(sensorValue)
					
					saveData(listSensorValues)

				commandToTx = 'intruder=2'
				sendCommand('cmd:' + commandToTx)
				print('Detecting intruders not in District ' + district + '!')

				if commandToTx.startswith('intruder='):
					
					intruderCheckValues = ''

					while intruderCheckValues == None or len(intruderCheckValues) <= 0:
						
						intruderCheckValues = waitResponse()
						if (numCycles > 20):
							numCycles = 0
							break
						time.sleep(0.1)
						numCycles = numCycles + 1
					
					if (intruderCheckValues == None or len(intruderCheckValues) <= 0):
						continue

					listIntruderValues = intruderCheckValues.split(',')

					for intruderData in listIntruderValues:

						print(intruderData)

						if (intruderData.startswith('senso:1:0')):
							listIntruderValues.remove(intruderData)
					
					saveIntruderData(listIntruderValues)

except KeyboardInterrupt:
		
	print("Program terminated!")

finally:
	
	if ser.is_open:
		ser.close()
