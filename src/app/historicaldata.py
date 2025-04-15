import pandas as pd
import sys


output_file = "historical_data.txt"

dataset_path = "C:/Users/trudy/OneDrive/Documents/CSI408/beta/aiapp/src/app/Economic_Indicators.txt"

df = pd.read_csv(dataset_path, delimiter="\t")

policy_vars = ['Govt Expenditure (% of GDP)', 'Tax Revenue (% of GDP)', 'Money supply ($M)', 'Interest Rate (%)']
economic_vars = ['GDP ($M)', 'Unemployment Rate (%)', 'Inflation Rate (%)', 'Economic growth (%)', 'Q on Q Economic Growth (%)', 'Income and Wealth Distribution (Gini coefficient)', 'Net Exports (PM)']
all_features = ['Year'] + economic_vars + policy_vars 


with open(output_file, "w") as f:
    f.write(df.to_csv(sep='\t', index=False))


