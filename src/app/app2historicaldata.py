from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
output_file = os.path.join(os.getcwd(), "historical_data.txt")


app = Flask(__name__)
CORS(app)

@app.route('/historical-data', methods=['POST'])
def historical_data():
    try:
        result = subprocess.run(['python', 'historicaldata.py'], capture_output=True, text=True, check=True)
        with open("historical_data.txt", "r") as f:
            output = f.read()
        return jsonify({'success': True, 'output': output})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

app.run(port=5002, debug=True)
