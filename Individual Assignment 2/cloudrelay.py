import time
import sqlite3
import requests
import json



try:
	conn = sqlite3.connect('edge.db')
	
	base_uri = 'http://127.0.0.1:5000/'
	globaldistrict_uri = base_uri + 'addDistrictData'
	globalevent_uri = base_uri + 'addEventData'
	headers = {'content-type': 'application/json'}
	
	
	
	while True:
	
		time.sleep(10)
		
		print('Relaying data to cloud server...')
				
		c = conn.cursor()

		c.execute('SELECT recordId, deviceId, deviceName, district, temperature, fever, intruder, timestamp FROM trackers WHERE tocloud = 0')
		results = c.fetchall()
				
		for result in results:
					
			print('Relaying recordId={}; deviceId={}; deviceName={}; district={}; temperature={}; fever={}; intruder={}; timestamp={}'.format(result[0], result[1], result[2], result[3], result[4], result[5], result[6], result[7]))
			
			gdist = {
				'deviceId':result[1],
				'deviceName':result[2],
				'district':result[3],
				'temperature':result[4],
				'fever':result[5],
				'intruder':result[6],
				'timestamp':result[7],
			}
			req = requests.post(globaldistrict_uri, headers = headers, data = json.dumps(gdist))
			
			c.execute('UPDATE trackers SET toCloud = 1 WHERE recordId = ' + str(result[0]))

		c.execute('SELECT recordId, deviceId, deviceName, district, event, timestamp FROM events WHERE tocloud = 0')

		results = c.fetchall()

		for result in results:
					
			print('Relaying recordId={}; deviceId={}; deviceName={}; district={}; event={}; timestamp={}'.format(result[0], result[1], result[2], result[3], result[4], result[5]))
			
			gevent = {
				'deviceId':result[1],
				'deviceName':result[2],
				'district':result[3],
				'event':result[4],
				'timestamp':result[5]
			}
			req = requests.post(globalevent_uri, headers = headers, data = json.dumps(gevent))
			
			c.execute('UPDATE events SET toCloud = 1 WHERE recordId = ' + str(result[0]))

		conn.commit()



except KeyboardInterrupt:
	
	print('********** END')
	
except Error as err:

	print('********** ERROR: {}'.format(err))

finally:

	conn.close()
