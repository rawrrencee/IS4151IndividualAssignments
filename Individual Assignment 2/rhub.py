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

def saveData(dataPackets):
	
	c = conn.cursor()
	
	for dataPacket in dataPackets:
		
		data = dataPacket.split(':')
		serialNumber = data[1]
		deviceName = dataPacket[0:5]
		hops = dataPacket[5:6]
		temp = dataPacket[6:8]

		sql = "INSERT INTO temperature (devicename, hops, temp, timestamp) VALUES('" + deviceName + "', " + hops + ", " + temp + ", datetime('now', 'localtime'))"
		c.execute(sql)
	
	conn.commit()
	
	dataPackets.clear()

try:

	print("Listening on COM4... Press CTRL+C to exit")	
	ser = serial.Serial(port='COM4', baudrate=115200, timeout=1)

	conn = sqlite3.connect('temperature.db')
	
	# Handshaking
	sendCommand('handshake')
	
	strMicrobitDevices = ''
	firstCycle = True
	
	while strMicrobitDevices == None or len(strMicrobitDevices) <= 0:
		
		strMicrobitDevices = waitResponse()
		time.sleep(10)
	
	strMicrobitDevices = strMicrobitDevices.split('=')
	
	if len(strMicrobitDevices[1]) > 0:

		listMicrobitDevices = strMicrobitDevices[1].split(',')
		
		if len(listMicrobitDevices) > 0:
				
			for mb in listMicrobitDevices:
			
				print('Connected to micro:bit device {}...'.format(mb))
			
			while True:

				if (firstCycle):
					time.sleep(5)
					firstCycle = False
				else:
					time.sleep(35)
				
				print('Sending command to all micro:bit devices...')
				
				commandToTx = 'sensor=temp'
				sendCommand('cmd:' + commandToTx)
				print('Finished sending command to all micro:bit devices...')
				
				if commandToTx.startswith('sensor='):
					
					strSensorValues = ''

					while strSensorValues == None or len(strSensorValues) <= 0:
						
						strSensorValues = waitResponse()
						time.sleep(0.1)

					listSensorValues = strSensorValues.split(',')

					for sensorValue in listSensorValues:
						
						print(sensorValue)
						
						if (sensorValue.startswith('sensor=')):
							
							listSensorValues.remove(sensorValue)
					
					saveData(listSensorValues)

except KeyboardInterrupt:
		
	print("Program terminated!")

finally:
	
	if ser.is_open:
		ser.close()
