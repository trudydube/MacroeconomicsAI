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

logging.basicConfig(level=logging.DEBUG, filename="debug.log")

logging.debug(f"Received args: {sys.argv}")

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
    # Print data before scaling
    # print(f"\nOriginal data being analysed for {column_name}:")
    # print(df[[column_name]])

    # Calculate the fluctuation margin dynamically based on average absolute difference between consecutive values
    # This aids in predictions for highly fluctuating data
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
        model.add(Input(shape=(X_train.shape[1], 1)))  # Specifying shape of input layer
        model.add(LSTM(units=75, return_sequences=True))  # First LSTM hidden layer
        model.add(LSTM(units=75, return_sequences=False))  # Second LSTM hidden layer
        model.add(Dense(units=1))  # Output layer

        # N.B. Too many layers led to overfitting during testing

        # Compiling the model
        model.compile(optimizer='adam', loss='mean_squared_error')

        # Training the model
        # N.B. Higher batch sizes resulted in overfitting due to longer convergence time during testing
        model.fit(X_train, y_train, epochs=150, batch_size=6, verbose=0)

    # Test Predictions
    y_pred_scaled = model.predict(X_test)

    # Inverse transform predictions and actual values back to original scale
    y_pred = scaler.inverse_transform(y_pred_scaled)
    y_test_original = scaler.inverse_transform(y_test.reshape(-1, 1)) # -1 used to determine exact number of rows, 1 specifies 1 column


    mape = mean_absolute_percentage_error(y_test_original, y_pred)
    with open(output_file, "a") as f:
        f.write(f"Mean Absolute Percentage Error for {column_name}: {mape:.2f}%\n")



    # Calculate accuracy considering acceptable fluctuation based on dynamic margin
    acceptable_predictions = 0
    for i in range(len(y_pred)):
        # Define the fluctuation tolerance as the calculated fluctuation margin
        actual_value = y_test_original[i][0]
        predicted_value = y_pred[i][0]

        # Adjust the fluctuation margin by multiplying by 1.5
        adjusted_fluctuation_margin = fluctuation_margin * 2.0


        # Checking if the predicted value is within the acceptable fluctuation margin
        if abs(predicted_value - actual_value) <= adjusted_fluctuation_margin:
            acceptable_predictions += 1

    # Calculating accuracy as the percentage of acceptable predictions
    accuracy = (acceptable_predictions / len(y_pred)) * 100

    # Printing adjusted accuracy
    with open(output_file, "a") as f:
        f.write(f"Adjusted Accuracy for {column_name}: {accuracy:.2f}% within ±{adjusted_fluctuation_margin:.2f} fluctuation\n")

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
    model = None

    return future_predictions

# Remove duplicate rows for GDP and Unemployment Rate (keep only one entry per year)
# N.B. Droppinng duplpicates aided in better comprehension for the model and more accurate forecasts
df_unique = df.drop_duplicates(subset=['Year'], keep='first')

# Forecast GDP with lag
# N.B. lower lags for more linear relationships increased accuracy during training of model
gdp_predictions = forecast_column(df_unique, 'GDP', 3)

# Forecast Unemployment Rate with lag
unemployment_predictions = forecast_column(df_unique, 'Unemployment Rate', 1)

# Forecast Inflation Rate with lag
inflation_predictions = forecast_column(df, 'Inflation Rate', 5)

# Forecast Economic Growth with lag
economic_growth_predictions = forecast_column(df_unique, 'Economic Growth', 3)

# Forecast quarterly Economic Growth with lag
quarterly_growth_predictions = forecast_column(df, 'Q on Q Economic Growth', 4)

# Forecast Income Distribution with lag
income_distribution_predictions = forecast_column(df_unique, 'Income Distribution', 3)

# Forecast Net Exports with lag
net_exports_predictions = forecast_column(df, 'Net Exports', 4)

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
plt.plot(future_df['Year'], future_df['Forecasted GDP ($M)'], label="Forecasted GDP", marker="o", linestyle="dashed")
plt.xlabel("Year")
plt.ylabel("GDP ($M)")
plt.legend()

plt.subplot(3, 3, 2)
plt.plot(df['Year'], df['Unemployment Rate'], label="Actual Unemployment Rate", marker="o")
plt.plot(future_df['Year'], future_df['Forecasted Unemployment Rate (%)'], label="Forecasted Unemployment Rate", marker="o", linestyle="dashed")
plt.xlabel("Year")
plt.ylabel("Unemployment Rate (%)")
plt.legend()

plt.subplot(3, 3, 3)
plt.plot(df['Year'], df['Inflation Rate'], label="Actual Inflation Rate", marker="o")
plt.plot(future_df['Year'], future_df['Forecasted Inflation Rate (%)'], label="Forecasted Inflation Rate", marker="o", linestyle="dashed")
plt.xlabel("Year")
plt.ylabel("Inflation Rate (%)")
plt.legend()

plt.subplot(3, 3, 4)
plt.plot(df['Year'], df['Economic Growth'], label="Actual Economic Growth", marker="o")
plt.plot(future_df['Year'], future_df['Forecasted Economic Growth (%)'], label="Forecasted Economic Growth", marker="o", linestyle="dashed")
plt.xlabel("Year")
plt.ylabel("Economic Growth (%)")
plt.legend()

plt.subplot(3, 3, 5)
plt.plot(df['Year'], df['Q on Q Economic Growth'], label="Actual Quarterly Growth", marker="o")
plt.plot(future_df['Year'], future_df['Forecasted Quarterly Economic Growth (%)'], label="Forecasted Economic Growth", marker="o", linestyle="dashed")
plt.xlabel("Year")
plt.ylabel("Quarterly Economic Growth (%)")
plt.legend()

plt.subplot(3, 3, 6)
plt.plot(df['Year'], df['Income Distribution'], label="Actual Income Distribution", marker="o")
plt.plot(future_df['Year'], future_df['Forecasted Income Distribution (Gini Coefficient)'], label="Forecasted Income Distribution", marker="o", linestyle="dashed")
plt.xlabel("Year")
plt.ylabel("Income and Wealth Distribution")
plt.legend()

plt.subplot(3, 3, 7)
plt.plot(df['Year'], df['Net Exports'], label="Actual Net Exports", marker="o")
plt.plot(future_df['Year'], future_df['Forecasted Net Exports (PM)'], label="Forecasted Net Exports", marker="o", linestyle="dashed")
plt.xlabel("Year")
plt.ylabel("Net Exports (PM)")
plt.legend()


plt.tight_layout()

public_dir = os.path.abspath(os.path.join(os.getcwd(), "..", "..", "public"))

plt.savefig(os.path.join(public_dir, "forecasts.png"))
plt.close()