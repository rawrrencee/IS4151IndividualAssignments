import connexion
import sqlite3

app = connexion.App(__name__, specification_dir='./')

@app.route('/')
def index():

	conn = sqlite3.connect('edge.db')
	c = conn.cursor()
	c.execute('SELECT devicename, AVG(temp) AS averagetemp FROM temperature GROUP BY devicename ORDER BY devicename ASC')
	results = c.fetchall()
	
	html = '<html><head><title>Edge/Fog Processor</title></head><body><h1>Local Temperatures</h1><table cellspacing="1" cellpadding="3" border="1"><tr><th>Device Name</th><th>Average Temperature</th></tr>'
	for result in results:
				
		html += '<tr><td>' + result[0] + '</td><td>' + str(result[1]) + '</td></tr>'
	
	html += '</body></html>'
	
	conn.close()
	
	return html

# If we're running in stand alone mode, run the application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
