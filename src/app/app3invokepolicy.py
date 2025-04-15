from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os

output_file = os.path.join(os.getcwd(), "policy_output.txt")

app = Flask(__name__)
CORS(app)

default_dataset_path = "C:/Users/trudy/OneDrive/Documents/CSI408/beta/aiapp/src/app/Economic_Indicators.txt"
weights_save_path = os.path.join(os.getcwd(), "uploaded_model.pkl")

@app.route('/get-policies', methods=['POST'])
def generate_policies():
    dataset = request.files.get("dataset")
    weights = request.files.get("model")
    default_file_path = request.form.get("default_file_path", default_dataset_path)

    if dataset:
        dataset_path = os.path.join(os.getcwd(), "uploaded_dataset.txt")
        dataset.save(dataset_path)
    else:
        dataset_path = default_file_path
    
    if weights:
        weights.save(weights_save_path)


    try:
        command = ['python', 'getpolicy.py', dataset_path]
        if weights:
            command.append(weights_save_path)

        result = subprocess.run(command, capture_output=True, text=True, check=True)
        with open("policy_output.txt", "r") as f:
            policy_output = f.read()

        shap_output_path = os.path.join(os.getcwd(), "shap_output.txt")
        with open(shap_output_path, "r") as f:
            shap_output = f.read()

        return jsonify({'success': True, 'policy_output': policy_output, 'shap_output': shap_output})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

app.run(port=5003, debug=True)
