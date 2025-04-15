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
from sklearn.metrics import r2_score, mean_squared_error

# Random Seed for reproducibility
np.random.seed(5)
tf.random.set_seed(5)

#output_file = "policy_output.txt"

default_dataset_path = "C:/Users/trudy/OneDrive/Documents/CSI408/beta/aiapp/src/app/Economic_Indicators.txt"
dataset_path = sys.argv[1] if len(sys.argv) > 1 else default_dataset_path
output_file = "shap_output.txt"


df = pd.read_csv(dataset_path, delimiter="\t")

# Define policy instruments and economic variables
policy_vars = ['Govt Expenditure (% of GDP)', 'Tax Revenue (% of GDP)', 'Money supply ($M)', 'Interest Rate (%)', 'Rate of crawl (%)']
economic_vars = ['GDP ($M)', 'Unemployment Rate (%)', 'Inflation Rate (%)', 'Economic growth (%)', 'Q on Q Economic Growth (%)', 'Income and Wealth Distribution (Gini coefficient)', 'Net Exports (PM)']
all_features = policy_vars + economic_vars

# Normalise Data
scaler = MinMaxScaler()
df_scaled = scaler.fit_transform(df[all_features])
df_scaled = pd.DataFrame(df_scaled, columns=all_features)


shap_values_dict = {}
explanation_results = {}


trained_models = {}
model_performance = {}

# Convert SHAP importance to adjustment weights for each economic var

# This allows each variable to be properly accommodated in the policy recommendation
policy_impact_weights = pd.DataFrame(index=policy_vars, columns=economic_vars)


# Train random forest model and obtain SHAP values
for target in economic_vars:
    X = df[policy_vars]  # Policy Variables as Features
    y = df[target]  # Economic Variable as Target

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=5)

    # Train the Random Forest Model
    model = RandomForestRegressor(n_estimators=100, random_state=5)
    model.fit(X_train, y_train)
    trained_models[target] = model

    y_pred = model.predict(X_test)
    
    # Compute R² score
    r2 = r2_score(y_test, y_pred)
    
    # Compute RMSE
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    
    # Store results
    model_performance[target] = {"R2 Score": r2, "RMSE": rmse}


    if(target == "Net Exports (PM)"):
        print("\nModel Performance Metrics:")
        for target, metrics in model_performance.items():
            print(f"{target}: R² Score = {metrics['R2 Score']:.4f}, RMSE = {metrics['RMSE']:.4f}")
        with open(output_file, "w") as f:
            for target, metrics in model_performance.items():
                f.write(f"{target}: R² Score = {metrics['R2 Score']:.4f}, RMSE = {metrics['RMSE']:.4f}\n")
        

    # Get the SHAP explanation
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_test)

    # Store SHAP values
    shap_values_dict[target] = shap_values

    # Aggregate SHAP values for feature importance
    avg_shap_values = np.mean(np.abs(shap_values), axis=0)
    feature_importance = pd.DataFrame({'Policy Variable': policy_vars, 'SHAP Importance': avg_shap_values})
    feature_importance = feature_importance.sort_values(by='SHAP Importance', ascending=False)

    # Store the explanation results
    explanation_results[target] = feature_importance


for economic_var, shap_table in explanation_results.items():
    # Normalise SHAP values across policy variables
    total_shap = shap_table["SHAP Importance"].sum()
    shap_table["Weight"] = shap_table["SHAP Importance"] / total_shap if total_shap != 0 else 0

    # Store in policy_impact_weights
    for index, row in shap_table.iterrows():
        policy_impact_weights.loc[row["Policy Variable"], economic_var] = row["Weight"]


print("\nPolicy Impact Weights (Derived from SHAP Values):")
print(policy_impact_weights)

# Shap visualisation to aid in understanding

public_dir = os.path.abspath(os.path.join(os.getcwd(), "..", "..", "public"))


# SHAP summary plots with explicit new figures
plt.figure()
plt.title("SHAP summary for GDP ($M)")
shap.summary_plot(shap_values_dict['GDP ($M)'], X_test, feature_names=policy_vars, show=False)
plt.savefig(os.path.join(public_dir, "shap_summary_gdp.png"))

plt.figure()
plt.title("SHAP summary for Unemployment Rate (%)")
shap.summary_plot(shap_values_dict['Unemployment Rate (%)'], X_test, feature_names=policy_vars, show=False)
plt.savefig(os.path.join(public_dir, "shap_summary_unemployment.png"))

plt.figure()
plt.title("SHAP summary for Inflation Rate (%)")
shap.summary_plot(shap_values_dict['Inflation Rate (%)'], X_test, feature_names=policy_vars, show=False)
plt.savefig(os.path.join(public_dir, "shap_summary_inflation.png"))

plt.figure()
plt.title("SHAP summary for Economic growth (%)")
shap.summary_plot(shap_values_dict['Economic growth (%)'], X_test, feature_names=policy_vars, show=False)
plt.savefig(os.path.join(public_dir, "shap_summary_economic_growth.png"))

plt.figure()
plt.title("SHAP summary for Quarterly Economic Growth (%)")
shap.summary_plot(shap_values_dict['Q on Q Economic Growth (%)'], X_test, feature_names=policy_vars, show=False)
plt.savefig(os.path.join(public_dir, "shap_summary_qoq_growth.png"))

plt.figure()
plt.title("SHAP summary for Income and Wealth Distribution (Gini coefficient)")
shap.summary_plot(shap_values_dict['Income and Wealth Distribution (Gini coefficient)'], X_test, feature_names=policy_vars, show=False)
plt.savefig(os.path.join(public_dir, "shap_summary_income_distribution.png"))

plt.figure()
plt.title("SHAP summary for Net Exports (PM)")
shap.summary_plot(shap_values_dict['Net Exports (PM)'], X_test, feature_names=policy_vars, show=False)
plt.savefig(os.path.join(public_dir, "shap_summary_net_exports.png"))

plt.close('all')  # Close all plots to free memory




joblib.dump(trained_models, os.path.join(os.getcwd(), "random_forest_model.pkl"))
joblib.dump(policy_impact_weights, os.path.join(os.getcwd(), "policy_impact_weights.pkl"))
joblib.dump(scaler, os.path.join(os.getcwd(), "scaler.pkl"))




