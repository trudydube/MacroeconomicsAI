# Botswana Macroeconomics Modeling

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.14.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## About

For my final year project in my BSc Computer Science degree, I made a desktop application that addresses the gap in the application of AI in macroeconomics, specifically policy making. There is very limited use of AI in analysing historical economic data and producing recommendations for the most optimal policy combination that will lead economic performance in the optimal direction. There were two separate models used for this project as discussed below.

### User Manual
[User Manual](/Botswana%20Macroeconomics%20Modeling%20User%20Manual.pdf)

### RandomForest Policy Recommender and Scenario Analysis Model

The first model uses RandomForest model to analyse Botswana's historical economic data from the year 2000 up to 2023 to identify trends in the data. It integrates with SHAP eXplainable AI (XAI) to identify the relationships between policy instruments (govt expenditure, tax, money supply, interest rate, exchange rate policy) and non-policy economic variables (GDP, unemployment rate, inflation, economic growth, net exports, income and wealth distribution). Upon obtaining the weights, or importance of each policy instrument against each economic variable, the model assesses the previous quarter's performance to identify which economic indicators need to  be improved, and then makes individual adjustments based on each instrument's weight for that indicator, and the same is repeated for every variable until all have been adjusted. Thereafter the adjustments are aggragated to produce the optimal policy mix to be implemented for the next quarter, and the model applies the same weights to the latest values to also produce a prediction for how exactly the recommmended policy will influence outcome.

The model uses that same predictive capability to also allow for scenario analysis. The policy maker can input hypothetical values for the policy instruments (within a reasonable stipulated range), and see what the outcome of that policy combination will be for each economic variable. Both the policy recommendation model and the scenario analysis models also have SHAP graphical outputs that show in detail the relationship between policy instruments and economic variables in order to aid in model transparency and enhance understandability of the outcome/recommendatoin produced by the model.

### LSTM Forecasting Model

The second model is an LSTM model which is a time-series based model. It analyses the same historical economic data for Botswana, but this time to simply identify patterns in the outcome of economic variables regardless of policy instrument impact. It then uses its findings to forecast what the values for each economic variable will be over the next 5 years (annual quarter 4 values). 

### Accuracy Measures

In order to measure accuracy of the models, Root Mean Square Error (RMSE) and Mean Absolute Error (MAE) in order to indicate the accuracy of each economic variables prediction and analysis.

### Additional Features

The system has its own in-built models and uses Botswana's historical economic data by default, however users are also able to upload their own datasets and/or models to the system for analysis. This facilitates the use of a user-friendly dashboard for economists to analyse and process data. The user is able to download reports for any generated recommendations, predictions, or forecasts. The admin is able to edit the model scripts from the front end by navigating to system configuration. The python scripts are called to the frontend and loaded in an IDE on the app making editing seamless for the admin.

The application uses Keycloak as an IAM for login as well as role based access control. The admin is able to update users from the admin keycloak realm. The database used for this project is MySQL. This stores user generated reports, uploaded datasets, and uploaded models. Flask was used as an API to call and run the python scripts from the backend. Node.js was used for loading the scripts as well as the editable historical data the in-built system uses.

### Technologies
Angular 18 (Typescript, Javascript, HTML, CSS)

Python 3.10 (for the models)

Flask API

Node.js

Keycloak

MySQL (php)

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
