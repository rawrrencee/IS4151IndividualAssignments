import connexion
import sqlite3
import socket

app = connexion.App(__name__, specification_dir='./')

@app.route('/')
def index():

	html = '<html><head><title>Edge/Fog Processor</title></head><body><h1>Local Temperatures</h1><table cellspacing="1" cellpadding="3" border="1"><tr><th>Device ID</th><th>Device Name</th><th>District</th><th>Temperature</th><th>Fever</th><th>Intruder</th><th>Timestamp</th></tr>'

	conn = sqlite3.connect('edge.db')
	c = conn.cursor()
	c.execute('SELECT DISTINCT deviceId FROM trackers')
	trackers = c.fetchall()
	print(trackers)

	for tracker in trackers:
		print(tracker[0])
		selectSql = 'SELECT deviceId, deviceName, district, temperature, fever, intruder, timestamp FROM trackers WHERE deviceId = ? ORDER BY timestamp DESC LIMIT 1'
		c.execute(selectSql, (str(tracker[0]),))
		results = c.fetchall()
		html += '<tr><td>' + str(results[0][0]) + '</td><td>' + str(results[0][1]) + '</td><td>' + str(results[0][2]) + '</td><td>' + str(results[0][3]) + '</td><td>' + str(results[0][4]) + '</td><td>' + str(results[0][5]) + '</td><td>' + str(results[0][6]) + '</td></tr>'

	html += '</table><h1>Events</h1><table cellspacing="1" cellpadding="3" border="1"><tr><th>Device ID</th><th>Device Name</th><th>District</th><th>Event</th><th>Timestamp</th></tr>'

	selectEventsSql = 'SELECT deviceId, deviceName, district, event, timestamp FROM events ORDER BY timestamp DESC'
	c.execute(selectEventsSql)
	results = c.fetchall()

	for result in results:
		html += '<tr><td>' + str(result[0]) + '</td><td>' + str(result[1]) + '</td><td>' + str(result[2]) + '</td><td>' + str(result[3]) + '</td><td>' + str(result[4]) + '</td></tr>'
	
	html += '</table></body></html>'
	
	conn.close()
	
	return html

@app.route('/localLD')
def client():
	host = socket.gethostname()
	port = 8888

	s = socket.socket()

	try:
		s.connect((host, port))

		message = 'init=localLD'
		
		s.send(message.encode('utf-8'))
		data = s.recv(1024).decode('utf-8')
		print('Received from server: ' + data)
	
		s.close()
		return '<h1>Local Lockdown Initiated</h1><a href="/"><button type="button" >&larr; Back</button></a>'
	
	except ConnectionRefusedError:
		return '<h1>There was a connection error.</h1><a href="/"><button type="button" >&larr; Back</button></a>'

# If we're running in stand alone mode, run the application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
