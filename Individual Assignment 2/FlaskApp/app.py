from flask import Flask, jsonify, request, render_template
import json
import mysql.connector
import requests

app = Flask(__name__)

globalLD = False

@app.route('/')
def home():

    return render_template('index.html')

@app.route('/districts', methods=['GET'])
def get_all_districts():

    districtToQuery = request.args.get("district")
    
    conn = mysql.connector.connect(
    host='localhost',
    user='root',
    passwd='password',
    database='is4151',
    )

    c = conn.cursor()
    c.execute('SELECT trackers.* FROM (SELECT MAX(recordId) AS recordId, deviceId, deviceName, district, temperature, fever, intruder, timestamp FROM trackers WHERE originDistrict = %s GROUP BY deviceId) AS A INNER JOIN trackers ON A.deviceId = trackers.deviceId AND A.recordId = trackers.recordId', (districtToQuery,))
    results = c.fetchall()
    
    print(results)

    return jsonify(results)

@app.route('/events', methods=['GET'])
def get_all_events():

    districtToQuery = request.args.get("district")
    
    conn = mysql.connector.connect(
    host='localhost',
    user='root',
    passwd='password',
    database='is4151',
    )

    c = conn.cursor()
    c.execute('SELECT deviceId, deviceName, district, event, timestamp FROM events WHERE deactivated = 0 AND originDistrict = %s ORDER BY timestamp DESC', (districtToQuery,))
    results = c.fetchall()
    
    print(results)

    return jsonify(results)

@app.route('/addDistrictData', methods=['POST'])
def add_district():

    post_data = request.get_json()
    deviceId = post_data['deviceId']
    deviceName = post_data['deviceName']
    originDistrict = post_data['originDistrict']
    district = post_data['district']
    temperature = post_data['temperature']
    fever = post_data['fever']
    intruder = post_data['intruder']
    timestamp = post_data['timestamp']

    conn = mysql.connector.connect(
    host='localhost',
    user='root',
    passwd='password',
    database='is4151',
    )

    c = conn.cursor()
    insertDataSql = "INSERT INTO trackers (deviceId, deviceName, originDistrict, district, temperature, fever, intruder, timestamp) VALUES ("+ str(deviceId) + ", '" + deviceName + "', " + str(originDistrict) + ", " + str(district) + ", " + str(temperature) + ", '" + fever + "', '" + intruder + "', '" + timestamp + "')"
    print(insertDataSql)
    c.execute(insertDataSql)
    conn.commit()
    conn.close()

    return jsonify(post_data)

@app.route('/addEventData', methods=['POST'])
def add_event():

    post_data = request.get_json()
    deviceId = post_data['deviceId']
    deviceName = post_data['deviceName']
    originDistrict = post_data['originDistrict']
    district = post_data['district']
    event = post_data['event']
    deactivated = post_data['deactivated']
    timestamp = post_data['timestamp']

    conn = mysql.connector.connect(
    host='localhost',
    user='root',
    passwd='password',
    database='is4151',
    )

    c = conn.cursor()
    insertDataSql = "INSERT INTO events (deviceId, deviceName, originDistrict, district, event, timestamp) VALUES ("+ str(deviceId) + ", '" + deviceName + "', " + str(originDistrict) + ", " + str(district) + ", " + str(event) + ", '" + timestamp + "')"
    print(insertDataSql)
    c.execute(insertDataSql)
    conn.commit()
    conn.close()

    return jsonify(post_data)

@app.route('/deactivateLocalLD', methods=['POST'])
def deactivateLocalLD():

    receivedJson = request.get_json()

    districtToDeactivate = receivedJson[0]
    eventToDeactivate = receivedJson[1]

    print('districtToDeact: ' + str(districtToDeactivate))
    print('eventToDeact: ' + str(eventToDeactivate))

    r = requests.get('http://127.0.0.1:5001/deactivateLocalLD')
    print(type(r.text))

    conn = mysql.connector.connect(
    host='localhost',
    user='root',
    passwd='password',
    database='is4151',
    )

    c = conn.cursor()
    c.execute('UPDATE events SET deactivated = 1 WHERE originDistrict = %s AND event = %s', (districtToDeactivate,eventToDeactivate,))

    conn.commit()
    conn.close()

    return jsonify(True)

@app.route('/getGlobalLDstatus', methods=['GET'])
def getGlobalLDstatus():

    global globalLD

    return jsonify(globalLD)

@app.route('/activateGlobalLD', methods=['POST'])
def activateGlobalLD():

    global globalLD

    globalLD = True
    r = requests.get('http://127.0.0.1:5001/activateGlobalLD')

    if (r.text == 'true\n'):
        return jsonify(True)
    else:
        return jsonify(False)

@app.route('/deactivateGlobalLD', methods=['POST'])
def deactivateGlobalLD():

    global globalLD

    globalLD = False
    r = requests.get('http://127.0.0.1:5001/deactivateGlobalLD')

    if (r.text == 'true\n'):
        return jsonify(True)
    else:
        return jsonify(False)

app.run(port=5000)