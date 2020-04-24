from flask import Flask, jsonify, request, render_template
import json
import mysql.connector

app = Flask(__name__)

districts = [
    {
        'district_id': 1,
        'district_name': 'District One'
    }
]

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

app.run(port=5000)