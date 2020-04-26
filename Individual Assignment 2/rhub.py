import serial
import time
import sqlite3
import socket
"""
import RPi.GPIO as GPIO

# Pin Definitions
ledRedPin = 7
ledGreenPin = 13
ledBluePin = 15
GPIO.setmode(GPIO.BOARD)
GPIO.setup(ledRedPin, GPIO.OUT)
GPIO.setup(ledGreenPin, GPIO.OUT)
GPIO.setup(ledBluePin, GPIO.OUT)
GPIO.output(ledGreenPin, True)
"""

def listenOnServer():
	host = socket.gethostname()
	port = 8888

	s = socket.socket()
	s.bind((host, port))

	s.settimeout(2)
	try:
		s.listen(2)
		client_socket, adress = s.accept()
		sendMessageResponse = ''
		
		print("Connection from: " + str(adress))
		
		data = client_socket.recv(1024).decode('utf-8')
		
		print('From online user: ' + data)

		if (data == 'deact=localLD'):
			sendCommand('deact=localLD')
			deactivateEvent1Sql = 'UPDATE events SET deactivated = 1 WHERE originDistrict = ? AND event = ?'
			
			c = conn.cursor()
			c.execute(deactivateEvent1Sql, (district, 1))
			conn.commit()
			
			sendMessageResponse = 'Local Lockdown Deactivated'
			# GPIO.output(ledRedPin, False)

		elif (data == 'act=globalLD'):
			sendCommand('act=globalLD')
			
			sendMessageResponse = 'Global Lockdown Activated'
		
		elif (data == 'deact=globalLD'):
			sendCommand('deact=globalLD')
			
			sendMessageResponse = 'Global Lockdown Deactivated'

		client_socket.send(sendMessageResponse.encode('utf-8'))
	except socket.timeout:
		pass
	
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
		print('intruder data:' + dataPacket)
		data = dataPacket.split(':')
		deviceName = data[0]
		deviceId = ""
		intruderDistrict = data[1]
		temperature = int(data[2])
		event1Sql = ''
		event2Sql = ''

		if (temperature > 38):
			fever = 'Y'


		else:
			fever = 'N'

			event2Sql = "INSERT INTO events (deviceId, deviceName, originDistrict, district, event, timestamp) VALUES (?, ?, ?, ?, '2', datetime('now', 'localtime'))"

		if (intruderDistrict != district):
			intruder = 'Y'
			# GPIO.output(ledBluePin, False)

		else:
			intruder = 'N'
		
		if (fever == 'Y' and intruder == 'Y'):
			event1Sql = "INSERT INTO events (deviceId, deviceName, originDistrict, district, event, timestamp) VALUES (?, ?, ?, ?, '1', datetime('now', 'localtime'))"
			event2Sql = "INSERT INTO events (deviceId, deviceName, originDistrict, district, event, timestamp) VALUES (?, ?, ?, ?, '2', datetime('now', 'localtime'))"
		elif (fever == 'Y' and intruder == 'N'):
			event1Sql = "INSERT INTO events (deviceId, deviceName, originDistrict, district, event, timestamp) VALUES (?, ?, ?, ?, '1', datetime('now', 'localtime'))"
		elif (fever == 'N' and intruder == 'Y'):
			event2Sql = "INSERT INTO events (deviceId, deviceName, originDistrict, district, event, timestamp) VALUES (?, ?, ?, ?, '2', datetime('now', 'localtime'))"

		deviceIdSql = "SELECT * FROM trackers WHERE deviceName =? LIMIT 1"
		c.execute(deviceIdSql, (deviceName,))
		records = c.fetchall()

		if (records == None or len(records) <= 0):
			for character in deviceName:
				number = ord(character) - 96
				deviceId = deviceId + str(number)
		else:
			deviceId = str(records[0][1])

		insertSql = "INSERT INTO trackers (deviceId, deviceName, originDistrict, district, temperature, fever, intruder, timestamp) VALUES (?,?,?,?,?,?,?, datetime('now', 'localtime'))"

		c.execute(insertSql, (deviceId, deviceName, str(district), str(intruderDistrict), str(temperature), fever, intruder,))

		if (event1Sql != ''):
			c.execute(event1Sql, (deviceId, deviceName, str(district), str(intruderDistrict),))
			sendCommand('act=localLD')
			# GPIO.output(ledRedPin, True)
		
		if (event2Sql != ''):
			c.execute(event2Sql, (deviceId, deviceName, str(district), str(intruderDistrict),))

		""" CHECKS IF THERE ARE OUTSTANDING EVENTS (SO ONLY 1 ROW PER EVENT IS PUBLISHED)
		if (event1Sql != ''):
			checkOutstandingEventsSql = "SELECT * FROM events WHERE deactivated = 0"
			c.execute(checkOutstandingEventsSql)
			outstandingEvents = c.fetchall()
			if (outstandingEvents == None or len(outstandingEvents) <= 0):
				c.execute(event1Sql, (deviceId, deviceName, str(district), str(intruderDistrict),))
				sendCommand('act=localLD')
			else:
				existingEvent1 = False
				for event in outstandingEvents:
					if (event[5] == 1):
						existingEvent1 = True
						break
				if (existingEvent1 == False):
					c.execute(event1Sql, (deviceId, deviceName, str(district), str(intruderDistrict),))
					sendCommand('act=localLD')

		if (event2Sql != ''):
			checkOutstandingEventsSql = "SELECT * FROM events WHERE deactivated = 0"
			c.execute(checkOutstandingEventsSql)
			outstandingEvents = c.fetchall()
			print(outstandingEvents)
			if (outstandingEvents == None or len(outstandingEvents) <= 0):
				c.execute(event2Sql, (deviceId, deviceName, str(district), str(intruderDistrict),))
			else:
				existingEvent2 = False
				for event in outstandingEvents:
					if (event[5] == 2):
						existingEvent2 = True
						break
				if (existingEvent2 == False):
					c.execute(event2Sql, (deviceId, deviceName, str(district), str(intruderDistrict),))
		"""
	
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
		eventSql = ''
		if (temperature > 38):
			fever = 'Y'
			eventSql = "INSERT INTO events (deviceId, deviceName, originDistrict, district, event, timestamp) VALUES (?, ?, ?, ?, '1', datetime('now', 'localtime'))"
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
			

		insertSql = "INSERT INTO trackers (deviceId, deviceName, originDistrict, district, temperature, fever, intruder, timestamp) VALUES (?,?,?,?,?,?,?, datetime('now', 'localtime'))"

		c.execute(insertSql, (deviceId, deviceName, str(district), str(district), str(temperature), fever, intruder,))
		
		if (eventSql != ''):
			c.execute(eventSql, (deviceId, deviceName, str(district), str(district),))
			sendCommand('act=localLD')
			# GPIO.output(ledRedPin, True)

		""" CHECKS IF THERE ARE OUTSTANDING EVENTS (SO ONLY 1 ROW PER EVENT IS PUBLISHED)
		if (eventSql != ''):
			checkOutstandingEventsSql = "SELECT * FROM events WHERE deactivated = 0"
			c.execute(checkOutstandingEventsSql)
			outstandingEvents = c.fetchall()
			if (outstandingEvents == None or len(outstandingEvents) <= 0):
				c.execute(eventSql, (deviceId, deviceName, str(district), str(district),))
				sendCommand('act=localLD')
			else:
				existingEvent1 = False
				for event in outstandingEvents:
					if (event[5] == 1):
						existingEvent1 = True
						break
				if (existingEvent1 == False):
					c.execute(eventSql, (deviceId, deviceName, str(district), str(district),))
					sendCommand('act=localLD')
		"""

	conn.commit()
	
	dataPackets.clear()

try:

	print("Listening on COM4... Press CTRL+C to exit")	
	ser = serial.Serial(port='COM4', baudrate=115200, timeout=1)

	conn = sqlite3.connect('edge.db')
	
	# Handshaking
	sendCommand('handshake')
	response = waitResponse().split('=')
	if (response[0] == ''):
		print('Handshake failed, check micro:bit radio controller.')
		exit()
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

				print('Listening on server for Edge commands:')
				listenOnServer()

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
