from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
output_file = os.path.join(os.getcwd(), "forecast.txt")


app = Flask(__name__)
CORS(app)

default_dataset_path = "C:/Users/trudy/OneDrive/Documents/CSI408/beta/aiapp/src/app/Economic_Indicators.txt"
model_save_path = os.path.join(os.getcwd(), "uploaded_model.pkl")

@app.route('/forecast', methods=['POST'])
def forecast():
    dataset = request.files.get("dataset")
    model = request.files.get("model")
    default_file_path = request.form.get("default_file_path", default_dataset_path)

    if dataset:
        dataset_path = os.path.join(os.getcwd(), "uploaded_dataset.txt")
        dataset.save(dataset_path)
    else:
        dataset_path = default_file_path

    if model:
        model.save(model_save_path)
    
    try:
        command = ['python', 'forecast.py', dataset_path]
        if model:
            command.append(model_save_path)

        result = subprocess.run(command, capture_output=True, text=True, check=True)
        with open("forecast.txt", "r") as f:
            output = f.read()
        return jsonify({'success': True, 'output': output})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

app.run(port=5001, debug=True)
