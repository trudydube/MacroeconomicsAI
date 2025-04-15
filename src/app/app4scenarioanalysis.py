from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os

output_file = os.path.join(os.getcwd(), "scenario_analysis.txt")

app = Flask(__name__)
CORS(app)

default_dataset_path = "C:/Users/trudy/OneDrive/Documents/CSI408/beta/aiapp/src/app/Economic_Indicators.txt"

@app.route('/scenario-analysis', methods=['POST'])
def generate_policies():
    file = request.files.get("file")
    default_file_path = request.form.get("default_file_path", default_dataset_path)

    data = request.json
    policy_inputs = [
        str(data["govtExpenditure"]),
        str(data["taxRevenue"]),
        str(data["moneySupply"]),
        str(data["interestRate"]),
        str(data["rateOfCrawl"])
    ]

    if file:
        file_path = os.path.join(os.getcwd(), "uploaded_dataset.txt")
        file.save(file_path)
    else:
        file_path = default_file_path


    try:
        result = subprocess.run(['python', 'scenarioanalysis.py', file_path] + policy_inputs, capture_output=True, text=True, check=True)
        with open("scenario_analysis.txt", "r") as f:
            scenario_output = f.read()
        shap_output_path = os.path.join(os.getcwd(), "shap_output.txt")
        with open(shap_output_path, "r") as f:
            shap_output = f.read()
        return jsonify({'success': True, 'scenario_output': scenario_output, 'shap_output': shap_output})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

app.run(port=5004, debug=True)
