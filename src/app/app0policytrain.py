from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os

output_file = os.path.join(os.getcwd(), "shap_output.txt")

app = Flask(__name__)
CORS(app)

default_dataset_path = "C:/Users/trudy/OneDrive/Documents/CSI408/beta/aiapp/src/app/Economic_Indicators.txt"

@app.route('/generate-policies', methods=['POST'])
def generate_policies():
    file = request.files.get("file")
    default_file_path = request.form.get("default_file_path", default_dataset_path)

    if file:
        file_path = os.path.join(os.getcwd(), "uploaded_dataset.txt")
        file.save(file_path)
    else:
        file_path = default_file_path


    try:
        result = subprocess.run(['python', 'policyrec.py', file_path], capture_output=True, text=True, check=True)
        with open("shap_output.txt", "r") as f:
            output = f.read()
        return jsonify({'success': True, 'output': output})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

app.run(port=5000, debug=True)
