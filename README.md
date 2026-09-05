# DemandIQ — Sales Demand Forecasting

DemandIQ is an end-to-end sales demand forecasting web application that combines machine learning, historical sales analytics, and an interactive dashboard to generate future demand forecasts and support data-driven business decisions.

The system provides 7-day, 30-day, and 90-day demand forecasts through a FastAPI backend and a modern React dashboard.

## Project Objectives

DemandIQ was developed to:

- Analyze historical sales patterns
- Forecast future sales demand using machine learning
- Provide 7D, 30D, and 90D forecasting horizons
- Visualize demand trends through an interactive dashboard
- Evaluate forecasting accuracy using standard regression metrics
- Provide downloadable forecasting reports
- Support user authentication and account creation
- Help businesses make better inventory and planning decisions

## Key Features

### Demand Forecasting

The application generates future sales forecasts for:

- 7 Days
- 30 Days
- 90 Days

Forecasts are generated dynamically through the backend forecasting service.

### Interactive Dashboard

The DemandIQ dashboard displays:

- Forecasted sales demand
- Average demand
- Peak demand
- Minimum demand
- Demand trend
- Model R² score
- MAPE
- RMSE
- Model health status

### Sales Analytics

The Sales Analytics module provides visual analysis of historical and forecasted sales data, including multiple time horizons and demand trends.

### Model Performance

The Model Performance page presents forecasting evaluation metrics including:

- R² Score
- Mean Absolute Percentage Error (MAPE)
- Root Mean Squared Error (RMSE)
- Mean Absolute Error (MAE)

### Reports

Users can view forecasting summaries and export forecast information as CSV reports.

### Authentication

DemandIQ includes a SQLite-based authentication system with:

- User sign-in
- Account creation
- Password hashing
- User profile information
- Session information stored by the frontend
- Logout functionality

## Machine Learning Model

DemandIQ uses an ensemble forecasting approach built with Scikit-learn.

The forecasting system uses three `HistGradientBoostingRegressor` models and generates future predictions recursively using historical and derived forecasting features.

### Model Performance

| Metric | Result |
| --- | ---: |
| R² Score | 0.9561 / 95.61% |
| MAPE | 3.13% |
| RMSE | 31,877 |
| MAE | 23,465 |
| Validation Period | 60 Days |

These metrics are based on the final trained forecasting model used by the application.

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Recharts
- Lucide React
- React Router

### Backend

- Python
- FastAPI
- Uvicorn
- SQLite

### Machine Learning & Data

- Scikit-learn
- Pandas
- NumPy
- Joblib

## Project Structure

```text
Sales-Demand-Forecasting-V2/
│
├── backend/
│   ├── main.py
│   ├── model_service.py
│   ├── database.py
│   ├── demandiq.db
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── data/
│   └── processed/
│       └── daily_sales.csv
│
├── models/
│   └── final_sales_forecasting_model.joblib
│
├── outputs/
│   ├── forecasts/
│   └── metrics/
│
└── README.md
```

## Installation

### 1. Clone or Download the Project

Open the project directory:

```bash
cd Sales-Demand-Forecasting-V2
```

### 2. Install Backend Dependencies

Navigate to the backend:

```bash
cd backend
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### 3. Start the Backend

From the `backend` directory:

```bash
python -m uvicorn main:app --reload
```

The API will run locally on port `8000`.

FastAPI interactive API documentation is available at `/docs` while the backend is running.

### 4. Install Frontend Dependencies

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

### 5. Start the Frontend

```bash
npm run dev
```

Open the local address displayed by Vite in your browser.

## API Endpoints

The FastAPI backend provides endpoints for:

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Backend health check |
| `GET /api/dashboard` | Dashboard and forecast summary |
| `GET /api/forecast` | Future demand forecast |
| `GET /api/historical` | Historical sales data |
| `GET /api/model/metrics` | ML model evaluation metrics |
| `POST /api/login` | User authentication |
| `POST /api/users` | Create a user account |

## Application Modules

DemandIQ contains the following main pages:

1. Landing Page
2. Sign In / Create Account
3. Dashboard Overview
4. Sales Analytics
5. Demand Forecast
6. Model Performance
7. Reports
8. Settings

## Forecast Workflow

```text
Historical Sales Data
        ↓
Data Processing
        ↓
Feature Engineering
        ↓
Trained ML Ensemble
        ↓
Recursive Forecast Generation
        ↓
FastAPI Backend
        ↓
React Dashboard
        ↓
Analytics & Reports
```

## Business Value

DemandIQ is designed to support better business decisions by helping users:

- Predict future demand
- Identify sales trends
- Plan inventory requirements
- Reduce stock-related risk
- Monitor forecasting accuracy
- Convert forecasting results into understandable visual insights

## Future Improvements

Potential future enhancements include:

- Cloud deployment
- Role-based backend authorization
- Automated model retraining
- Real-time sales data integration
- Product-level forecasting
- Store-level forecasting
- Advanced inventory recommendations
- Forecast alerts and notifications

## Project Status

**Completed**

The application includes a functioning machine-learning forecasting pipeline, FastAPI backend, SQLite authentication system, React frontend, analytics dashboard, forecast visualization, model-performance monitoring, and report generation.

## Author

Developed as an internship project for sales demand forecasting and business analytics.