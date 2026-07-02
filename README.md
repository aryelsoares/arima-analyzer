# 📈 ARIMA Analyzer

**ARIMA Analyzer** is a web-based time series analysis tool focused on **ARIMA / SARIMA modeling**, designed to run entirely on the client side. It allows users to upload CSV files, analyze statistical properties of the data, automatically fit ARIMA models, and visualize forecasts and diagnostics.

---

## 🚀 Features

- CSV file upload with ETL and model configs
- Time series visualization
- Density estimation and rolling statistics analysis
- Stationarity and seasonality detection
- ACF and PACF plots
- Performance metrics
- Residual diagnostics
- Custom AutoARIMA for best model selection
- ARIMA with seasonal components (SARIMA)
- Forecast visualization.

---

## 🧠 How It Works

- CSV file must contain two columns: a date column and a numeric value column
- Dataset size must be greater than **50** and less than **10.000** samples.
- Detailed documentation for each component is currently **WIP**.

> [!NOTE]
> A solid understanding of ARIMA models is highly recommended to use this tool effectively.
> Due to the lack of native statistical libraries in TypeScript, several features rely on heuristic methods.
> Results should not be used as the sole basis for critical decision-making.