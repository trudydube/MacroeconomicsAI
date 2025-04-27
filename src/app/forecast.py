import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.layers import Input
import random
import sys
import os
import joblib
import tensorflow as tf
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import logging


# Random Seed making training more structured and reproducible
np.random.seed(5)
random.seed(5)
tf.random.set_seed(5)

output_file = "forecast.txt"
dataset_path = sys.argv[1]

if len(sys.argv) > 2:
    model_path = sys.argv[2]
    model = joblib.load(model_path)

df = pd.read_csv(dataset_path, delimiter="\t")

with open(output_file, "w") as f:
    f.write("")

df = df[['Year', 'GDP ($M)', 'Unemployment Rate (%)', 'Inflation Rate (%)', 'Economic growth (%)', 'Q on Q Economic Growth (%)', 'Income and Wealth Distribution (Gini coefficient)', 'Net Exports (PM)']]
df = df.rename(columns={'GDP ($M)': 'GDP', 'Unemployment Rate (%)': 'Unemployment Rate', 'Inflation Rate (%)': 'Inflation Rate', 'Economic growth (%)': 'Economic Growth', 'Q on Q Economic Growth (%)': 'Q on Q Economic Growth', 'Income and Wealth Distribution (Gini coefficient)': 'Income Distribution', 'Net Exports (PM)': 'Net Exports'})

def mean_absolute_percentage_error(y_true, y_pred):
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    non_zero_indices = y_true != 0
    y_true = y_true[non_zero_indices]
    y_pred = y_pred[non_zero_indices]
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100


# Function to forecast values for a single column
def forecast_column(df, column_name, lag):
    model = None
    if len(sys.argv) > 2:
        model_path = sys.argv[2]
        model = joblib.load(model_path)
    

    # Calculate the fluctuation margin dynamically based on average absolute difference between consecutive values
    fluctuations = df[column_name].diff().abs()
    fluctuation_margin = fluctuations.mean()


    with open(output_file, "a") as f:
        f.write(f"\n\n--- {column_name} Forecasting ---\n")
        f.write(f"Calculated fluctuation margin for {column_name}: {fluctuation_margin:.2f}\n")

    # Scale the data for the specified column thus introducing standardised values
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(df[[column_name]])

    # Prepare the data for LSTM using a look-back window (lag)
    # Aids in identifying patterns over time
    X = []
    y = []

    for i in range(lag, len(scaled_data)):
        X.append(scaled_data[i-lag:i, 0])  # Use lag years as input features
        y.append(scaled_data[i, 0])  # Current year as the target

    X = np.array(X)
    y = np.array(y)

    # X has to be reshaped into 3D (samples, time steps, features) since LSTM expects 3D input
    X = X.reshape(X.shape[0], X.shape[1], 1)

    # Split the data into training and test sets
    train_size = int(len(X) * 0.8)
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]

    if model is None:
        model = Sequential()
        if column_name == "Net Exports":
            model.add(Input(shape=(X_train.shape[1], 1)))  # Specifying shape of input layer
            model.add(LSTM(units=75, return_sequences=False))  # LSTM hidden layer
            model.add(Dense(units=1))  # Output layer
        else:
            model.add(Input(shape=(X_train.shape[1], 1)))  # Specifying shape of input layer
            model.add(LSTM(units=100, return_sequences=False))  # LSTM hidden layer
            model.add(Dense(units=1))  # Output layer

        # N.B. Too many layers led to overfitting during testing

        # Compiling the model
        model.compile(optimizer='adam', loss='mean_squared_error')

        # Training the model
        # N.B. Higher batch sizes resulted in overfitting due to longer convergence time during testing
        if column_name == "GDP":
            model.fit(X_train, y_train, epochs=250, batch_size=8, verbose=0)
        elif column_name == "Unemployment Rate":
            model.fit(X_train, y_train, epochs=150, batch_size=6, verbose=0)
        elif column_name == "Inflation Rate":
            model.fit(X_train, y_train, epochs=350, batch_size=7, verbose=0)
        elif column_name == "Economic Growth":
            model.fit(X_train, y_train, epochs=300, batch_size=6, verbose=0)
        elif column_name == "Q on Q Economic Growth":
            model.fit(X_train, y_train, epochs=300, batch_size=14, verbose=0)
        elif column_name == "Income Distribution":
            model.fit(X_train, y_train, epochs=150, batch_size=6, verbose=0)
        elif column_name == "Net Exports":
            model.fit(X_train, y_train, epochs=350, batch_size=5, verbose=0)

    years = df['Year'].values[lag:]  # Account for lag window
    test_years = years[train_size:]

    # Test Predictions
    y_pred_scaled = model.predict(X_test)

    # Inverse transform predictions and actual values back to original scale
    y_pred = scaler.inverse_transform(y_pred_scaled)
    y_test_original = scaler.inverse_transform(y_test.reshape(-1, 1)) # -1 used to determine exact number of rows, 1 specifies 1 column

    pred_df = pd.DataFrame({
    'Year': test_years,
    f'Predicted {column_name}': y_pred.flatten()
    })

    mape = mean_absolute_percentage_error(y_test_original, y_pred)
    with open(output_file, "a") as f:
        f.write(f"Mean Absolute Percentage Error for {column_name}: {mape:.2f}%\n")


    # Forecast the next 5 years for the given column
    last_data = scaled_data[-lag:]  # Last lag years of data

    future_predictions = []

    # Feeds prediction back into model so that it can be used to forecast following year
    for i in range(5):
        future_data = model.predict(last_data.reshape(1, lag, 1))  # Predict the next value
        future_predictions.append(future_data[0, 0])
        last_data = np.append(last_data[1:], future_data[0, 0])  # Update last data for the next prediction

    # Inverse transform the predictions to back to the original scale
    future_predictions = scaler.inverse_transform(np.array(future_predictions).reshape(-1, 1))
    prediction_years = df['Year'].values[lag:][train_size:]
    model = None

    return future_predictions, pred_df

# Remove duplicate rows for GDP and Unemployment Rate (keep only one entry per year)
# N.B. Dropping duplicates aided in better comprehension for the model and more accurate forecasts
df_unique = df.drop_duplicates(subset=['Year'], keep='first')

# Forecast GDP with lag
# N.B. lower lags for more linear relationships increased accuracy during training of model
gdp_predictions, gdp_pred = forecast_column(df_unique, 'GDP', 3)

# Forecast Unemployment Rate with lag
unemployment_predictions, unemployment_pred = forecast_column(df_unique, 'Unemployment Rate', 1)

# Forecast Inflation Rate with lag
inflation_predictions, inflation_pred = forecast_column(df, 'Inflation Rate', 8)

# Forecast Economic Growth with lag
economic_growth_predictions, growth_pred = forecast_column(df_unique, 'Economic Growth', 4)

# Forecast quarterly Economic Growth with lag
quarterly_growth_predictions, quarterly_growth_pred= forecast_column(df, 'Q on Q Economic Growth', 4)

# Forecast Income Distribution with lag
income_distribution_predictions, income_pred = forecast_column(df_unique, 'Income Distribution', 3)

# Forecast Net Exports with lag
net_exports_predictions, net_exports_pred = forecast_column(df, 'Net Exports', 4)

# Creating a data frame for future years and their predicted variables
future_years = np.array(range(df['Year'].max() + 1, df['Year'].max() + 6))
future_df = pd.DataFrame({
    'Year': future_years,
    'Forecasted GDP ($M)': gdp_predictions.flatten(),
    'Forecasted Unemployment Rate (%)': unemployment_predictions.flatten(),
    'Forecasted Inflation Rate (%)': inflation_predictions.flatten(),
    'Forecasted Economic Growth (%)': economic_growth_predictions.flatten(),
    'Forecasted Quarterly Economic Growth (%)': quarterly_growth_predictions.flatten(),
    'Forecasted Income Distribution (Gini Coefficient)': income_distribution_predictions.flatten(),
    'Forecasted Net Exports (PM)': net_exports_predictions.flatten()
})

# Show forecasted results
with open(output_file, "a") as f:
    f.write(future_df.to_csv(sep='\t', index=False))

plt.figure(figsize=(15, 10))

# Plot forecasted variables alongside actual variables
plt.subplot(3, 3, 1)
plt.plot(df['Year'], df['GDP'], label="Actual GDP", marker="o")
plt.plot(gdp_pred['Year'], gdp_pred['Predicted GDP'], label="Predicted GDP", marker="o", linestyle="dashed")
plt.plot(future_df['Year'], future_df['Forecasted GDP ($M)'], label="Forecasted GDP", marker="o", linestyle="dashed")
plt.xlabel("Year")
plt.ylabel("GDP ($M)")
plt.legend()

plt.subplot(3, 3, 2)
plt.plot(df['Year'], df['Unemployment Rate'], label="Actual Unemployment Rate", marker="o")
plt.plot(unemployment_pred['Year'], unemployment_pred['Predicted Unemployment Rate'], label="Predicted Unemployment Rate", marker="o", linestyle="dashed")
plt.plot(future_df['Year'], future_df['Forecasted Unemployment Rate (%)'], label="Forecasted Unemployment Rate", marker="o", linestyle="dashed")
plt.xlabel("Year")
plt.ylabel("Unemployment Rate (%)")
plt.legend()

plt.subplot(3, 3, 3)
plt.plot(df['Year'], df['Inflation Rate'], label="Actual Inflation Rate", marker="o")
plt.plot(inflation_pred['Year'], inflation_pred['Predicted Inflation Rate'], label="Predicted Inflation Rate", marker="o", linestyle="dashed")
plt.plot(future_df['Year'], future_df['Forecasted Inflation Rate (%)'], label="Forecasted Inflation Rate", marker="o", linestyle="dashed")
plt.xlabel("Year")
plt.ylabel("Inflation Rate (%)")
plt.legend()

plt.subplot(3, 3, 4)
plt.plot(df['Year'], df['Economic Growth'], label="Actual Economic Growth", marker="o")
plt.plot(growth_pred['Year'], growth_pred['Predicted Economic Growth'], label="Predicted Economic Rate", marker="o", linestyle="dashed")
plt.plot(future_df['Year'], future_df['Forecasted Economic Growth (%)'], label="Forecasted Economic Growth", marker="o", linestyle="dashed")
plt.xlabel("Year")
plt.ylabel("Economic Growth (%)")
plt.legend()

plt.subplot(3, 3, 5)
plt.plot(df['Year'], df['Q on Q Economic Growth'], label="Actual Quarterly Growth", marker="o")
plt.plot(quarterly_growth_pred['Year'], quarterly_growth_pred['Predicted Q on Q Economic Growth'], label="Predicted Quarterly Growth", marker="o", linestyle="dashed")
plt.plot(future_df['Year'], future_df['Forecasted Quarterly Economic Growth (%)'], label="Forecasted Economic Growth", marker="o", linestyle="dashed")
plt.xlabel("Year")
plt.ylabel("Quarterly Economic Growth (%)")
plt.legend()

plt.subplot(3, 3, 6)
plt.plot(df['Year'], df['Income Distribution'], label="Actual Income Distribution", marker="o")
plt.plot(income_pred['Year'], income_pred['Predicted Income Distribution'], label="Predicted Income Distribution", marker="o", linestyle="dashed")
plt.plot(future_df['Year'], future_df['Forecasted Income Distribution (Gini Coefficient)'], label="Forecasted Income Distribution", marker="o", linestyle="dashed")
plt.xlabel("Year")
plt.ylabel("Income and Wealth Distribution")
plt.legend()

plt.subplot(3, 3, 7)
plt.plot(df['Year'], df['Net Exports'], label="Actual Net Exports", marker="o")
plt.plot(net_exports_pred['Year'], net_exports_pred['Predicted Net Exports'], label="Predicted Net Exports", marker="o", linestyle="dashed")
plt.plot(future_df['Year'], future_df['Forecasted Net Exports (PM)'], label="Forecasted Net Exports", marker="o", linestyle="dashed")
plt.xlabel("Year")
plt.ylabel("Net Exports (PM)")
plt.legend()


plt.tight_layout()

public_dir = os.path.abspath(os.path.join(os.getcwd(), "..", "..", "public"))

plt.savefig(os.path.join(public_dir, "forecasts.png"))
plt.close()