from flask import Flask, jsonify, request, render_template

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

@app.route('/district')
def get_all_districts():
    return jsonify({'districts': districts})

@app.route('/district', methods=['POST'])
def add_district():
    post_data = request.get_json()
    new_district = {
        'district_name': post_data['district_name']
    }
    districts.append(new_district)
    return jsonify(new_district)

@app.route('/district/<string:district_id>')
def get_district(district_id):
    pass


app.run(port=5000)