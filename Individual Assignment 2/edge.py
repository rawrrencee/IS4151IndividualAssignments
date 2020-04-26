#import connexion
import sqlite3
import socket
from flask import Flask, jsonify, request, render_template, current_app
import json

app = Flask(__name__)

#app = connexion.App(__name__, specification_dir='./')

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

@app.route('/deactivateLocalLD', methods=['GET', 'POST'])
def deactivateLocalLD():
	host = socket.gethostname()
	port = 8888

	s = socket.socket()

	connected = False

	while not connected:
		print('Trying to connect')
		try:
			s.connect((host, port))
			connected = True
		except Exception:
			print('not connected')
			pass

	try:
		message = 'deact=localLD'
		
		s.send(message.encode('utf-8'))
		data = s.recv(1024).decode('utf-8')
		print('Received from server: ' + data)
	
		s.close()
		return jsonify(True)
	
	except ConnectionRefusedError:
		return jsonify(False)

@app.route('/activateGlobalLD', methods=['GET', 'POST'])
def activateGlobalLD():
	host = socket.gethostname()
	port = 8888

	s = socket.socket()

	connected = False

	while not connected:
		print('Trying to connect')
		try:
			s.connect((host, port))
			connected = True
		except Exception:
			print('not connected')
			pass

	try:
		message = 'act=globalLD'
		
		s.send(message.encode('utf-8'))
		data = s.recv(1024).decode('utf-8')
		print('Received from server: ' + data)
	
		s.close()

		callback = request.args.get('callback', False)

		content = str(callback) + '(' + str(data) + ')'
		return jsonify(True)
	
	except ConnectionRefusedError:
		return jsonify(False)

@app.route('/deactivateGlobalLD', methods=['GET', 'POST'])
def deactivateGlobalLD():
	host = socket.gethostname()
	port = 8888

	s = socket.socket()

	connected = False

	while not connected:
		print('Trying to connect')
		try:
			s.connect((host, port))
			connected = True
		except Exception:
			print('not connected')
			pass

	try:
		message = 'deact=globalLD'
		
		s.send(message.encode('utf-8'))
		data = s.recv(1024).decode('utf-8')
		print('Received from server: ' + data)
	
		s.close()

		callback = request.args.get('callback', False)

		content = str(callback) + '(' + str(data) + ')'
		return jsonify(True)
	
	except ConnectionRefusedError:
		return jsonify(False)

# If we're running in stand alone mode, run the application
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)
