import pandas as pd
import numpy as np
import shap
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import tensorflow as tf
import matplotlib.pyplot as plt
import sys
import os
import joblib
import logging

# Random Seed for reproducibility
np.random.seed(5)
tf.random.set_seed(5)

trained_models = joblib.load("random_forest_model.pkl")
policy_impact_weights = joblib.load("policy_impact_weights.pkl")
scaler = joblib.load("scaler.pkl")

output_file = "scenario_analysis.txt"


# Read user inputs
input_policies = [
    float(sys.argv[2]),
    float(sys.argv[3]), 
    float(sys.argv[4]), 
    float(sys.argv[5]),
    float(sys.argv[6])
]


with open(output_file, "w") as f:
    f.write(policy_impact_weights.to_csv(sep='\t'))

dataset_path = sys.argv[1]

df = pd.read_csv(dataset_path, delimiter="\t")

# Define policy instruments and economic variables
policy_vars = ['Govt Expenditure (% of GDP)', 'Tax Revenue (% of GDP)', 'Money supply ($M)', 'Interest Rate (%)', 'Rate of crawl (%)']
economic_vars = ['GDP ($M)', 'Unemployment Rate (%)', 'Inflation Rate (%)', 'Economic growth (%)', 'Q on Q Economic Growth (%)', 'Income and Wealth Distribution (Gini coefficient)', 'Net Exports (PM)']
all_features = policy_vars + economic_vars

# Normalise Data
df_scaled = scaler.fit_transform(df[all_features])
df_scaled = pd.DataFrame(df_scaled, columns=all_features)


# Calculating policy adjustments using shap importance

def calculate_dynamic_adjustments(latest_economy, latest_policies, input_policies, policy_vars, economic_vars, policy_impact_weights):
    predicted_economy = np.copy(latest_economy)
    df_unique = df.drop_duplicates(subset=['Year'], keep='first')

    # Apply the adjustments to the latest policies values to obtain new policies values
    new_policies = input_policies
    govt_expenditure_change = new_policies[0] - latest_policies[0]
    tax_revenue_change = new_policies[1] - latest_policies[1]
    money_supply_change = (new_policies[2] - latest_policies[2])/1000
    interest_rate_change = new_policies[3] - latest_policies[3]
    rate_of_crawl_change = new_policies[4] - latest_policies[4]

    # Predict the new economic outcomes using the policy impact weights
    for j, economic_var in enumerate(economic_vars):
        for i, policy_var in enumerate(policy_vars):
            # Get the corresponding policy impact weight for this policy-economy combination
            impact_weight = policy_impact_weights.loc[policy_var, economic_var]

            if(economic_var == "GDP ($M)"):
                fluctuation = df_unique[economic_var].diff().abs()
                std_dev = fluctuation.mean()
                factor = std_dev/latest_economy[j]
                if(policy_var == "Govt Expenditure (% of GDP)"):
                    adjusted_impact = impact_weight * govt_expenditure_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] += new_value
                    else:
                        predicted_economy[j] -= new_value
                if(policy_var == "Tax Revenue (% of GDP)"):
                    adjusted_impact = impact_weight * tax_revenue_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] -= new_value
                    else:
                        predicted_economy[j] += new_value
                if(policy_var == "Money supply ($M)"):
                    adjusted_impact = impact_weight * money_supply_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] += new_value
                    else:
                        predicted_economy[j] -= new_value
                if(policy_var == "Interest Rate (%)"):
                    adjusted_impact = impact_weight * interest_rate_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] -= new_value
                    else:
                        predicted_economy[j] += new_value

            if(economic_var == "Unemployment Rate (%)"):
                fluctuation = df_unique[economic_var].diff().abs()
                std_dev = fluctuation.mean()
                factor = std_dev/latest_economy[j]
                if(policy_var == "Govt Expenditure (% of GDP)"):
                    adjusted_impact = impact_weight * govt_expenditure_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] -= new_value
                    else:
                        predicted_economy[j] += new_value
                
                elif(policy_var == "Tax Revenue (% of GDP)"):
                    adjusted_impact = impact_weight * tax_revenue_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] += new_value
                    else:
                        predicted_economy[j] -= new_value
    
                elif(policy_var == "Money supply ($M)"):
                    adjusted_impact = impact_weight * money_supply_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] -= new_value
            
                    else:
                        predicted_economy[j] += new_value
                    
                else:
                    adjusted_impact = impact_weight * interest_rate_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] += new_value
                    
                    else:
                        predicted_economy[j] -= new_value
                   




            if(economic_var == "Inflation Rate (%)"):
                fluctuation = df[economic_var].diff().abs()
                std_dev = fluctuation.mean()
                factor = std_dev/latest_economy[j]
                if(policy_var == "Govt Expenditure (% of GDP)"):  
                    adjusted_impact = impact_weight * govt_expenditure_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] += new_value
                    else:
                        predicted_economy[j] -= new_value
                elif(policy_var == "Tax Revenue (% of GDP)"):
                    adjusted_impact = impact_weight * tax_revenue_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] -= new_value
                    else:
                        predicted_economy[j] += new_value
                elif(policy_var == "Money supply ($M)"):
                    adjusted_impact = impact_weight * money_supply_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] += new_value
                    else:
                        predicted_economy[j] -= new_value
                else:
                    adjusted_impact = impact_weight * interest_rate_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] -= new_value
                    else:
                        predicted_economy[j] += new_value            

            if(economic_var == "Economic growth (%)"):
                fluctuation = df_unique[economic_var].diff().abs()
                std_dev = fluctuation.mean()
                factor = std_dev/latest_economy[j]
                if(policy_var == "Govt Expenditure (% of GDP)"):  
                    adjusted_impact = impact_weight * govt_expenditure_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] += new_value
                    else:
                        predicted_economy[j] -= new_value
                elif(policy_var == "Tax Revenue (% of GDP)"):
                    adjusted_impact = impact_weight * tax_revenue_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] -= new_value
                    else:
                        predicted_economy[j] += new_value
                elif(policy_var == "Money supply ($M)"):
                    adjusted_impact = impact_weight * money_supply_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] += new_value
                    else:
                        predicted_economy[j] -= new_value
                else:
                    adjusted_impact = impact_weight * interest_rate_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] -= new_value
                    else:
                        predicted_economy[j] += new_value
                        

            

            if(economic_var == "Q on Q Economic Growth (%)"):
                fluctuation = df[economic_var].diff().abs()
                std_dev = fluctuation.mean()
                factor = std_dev/latest_economy[j]
                if(policy_var == "Govt Expenditure (% of GDP)"):  
                    adjusted_impact = impact_weight * govt_expenditure_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] += new_value
                    else:
                        predicted_economy[j] -= new_value
                elif(policy_var == "Tax Revenue (% of GDP)"):
                    adjusted_impact = impact_weight * tax_revenue_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] -= new_value
                    else:
                        predicted_economy[j] += new_value
                elif(policy_var == "Money supply ($M)"):
                    adjusted_impact = impact_weight * money_supply_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] += new_value
                    else:
                        predicted_economy[j] -= new_value
                else:
                    adjusted_impact = impact_weight * interest_rate_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] -= new_value
                    else:
                        predicted_economy[j] += new_value


            if(economic_var == "Income and Wealth Distribution (Gini coefficient)"):
                fluctuation = df_unique[economic_var].diff().abs()
                std_dev = fluctuation.mean()
                factor = std_dev/latest_economy[j]
                if(policy_var == "Govt Expenditure (% of GDP)"):  
                    adjusted_impact = impact_weight * govt_expenditure_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] -= new_value
                    else:
                        predicted_economy[j] += new_value
                elif(policy_var == "Tax Revenue (% of GDP)"):
                    adjusted_impact = impact_weight * tax_revenue_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] += new_value
                    else:
                        predicted_economy[j] -= new_value
                elif(policy_var == "Money supply ($M)"):
                    adjusted_impact = impact_weight * money_supply_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] -= new_value
                    else:
                        predicted_economy[j] += new_value
                else:
                    adjusted_impact = impact_weight * interest_rate_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] += new_value
                    else:
                        predicted_economy[j] -= new_value


            if(economic_var == "Net Exports (PM)"):
                fluctuation = df[economic_var].diff().abs()
                std_dev = fluctuation.mean()
                factor = std_dev/latest_economy[j]
                if(policy_var == "Govt Expenditure (% of GDP)"):  
                    adjusted_impact = impact_weight * govt_expenditure_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] += new_value
                    else:
                        predicted_economy[j] -= new_value
                elif(policy_var == "Tax Revenue (% of GDP)"):
                    adjusted_impact = impact_weight * tax_revenue_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] -= new_value
                    else:
                        predicted_economy[j] += new_value
                elif(policy_var == "Money supply ($M)"):
                    adjusted_impact = impact_weight * money_supply_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] -= new_value
                    else:
                        predicted_economy[j] += new_value
                else:
                    adjusted_impact = impact_weight * rate_of_crawl_change * factor
                    new_value = abs(predicted_economy[j] * (adjusted_impact))
                    if(adjusted_impact > 0):
                        predicted_economy[j] += new_value
                    else:
                        predicted_economy[j] -= new_value

    return predicted_economy

# Get the latest economic and policy values to use in calculation of adjustments function
latest_data = df.iloc[-1][all_features].values
latest_policies = latest_data[:len(policy_vars)]
latest_economy = latest_data[len(policy_vars):]

# Calculate recommended policies
predicted_economy = calculate_dynamic_adjustments(
    latest_economy, latest_policies, input_policies, policy_vars, economic_vars, policy_impact_weights
)

print(predicted_economy)

with open(output_file, "a") as f:
    f.write("\nLatest Economic and Policy Data:\n")
    for var, value in zip(all_features, latest_data):
        f.write(f"{var}: {value:.2f}\n")

with open(output_file, "a") as f:
    for economic_var, prediction in zip(economic_vars, predicted_economy):
        f.write(f"{economic_var}: {prediction:.2f}\n")







