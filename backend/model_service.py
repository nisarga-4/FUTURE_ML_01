from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
from functools import lru_cache


# ============================================================
# PATHS
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

MODEL_FILE = (
    ROOT
    / "models"
    / "final_sales_forecasting_model.joblib"
)

DATA_FILE = (
    ROOT
    / "data"
    / "processed"
    / "daily_sales.csv"
)

METRICS_FILE = (
    ROOT
    / "outputs"
    / "metrics"
    / "final_model_metrics.json"
)

EPSILON = 1e-6


# ============================================================
# LOAD MODEL PACKAGE
# ============================================================

if not MODEL_FILE.exists():
    raise FileNotFoundError(
        f"Model file not found: {MODEL_FILE}"
    )

package = joblib.load(MODEL_FILE)

models = package["models"]
features = package["features"]
top_three = package["top_three"]
blend_weights = package["blend_weights"]

model_metrics = package.get("metrics", {})
model_type = package.get(
    "type",
    "seasonal_hgb_blend"
)

validation_days = package.get(
    "validation_days",
    None
)


# ============================================================
# LOAD HISTORY
# ============================================================

if not DATA_FILE.exists():
    raise FileNotFoundError(
        f"Processed data not found: {DATA_FILE}"
    )

history = pd.read_csv(DATA_FILE)

history["date"] = pd.to_datetime(
    history["date"]
)

history = (
    history
    .sort_values("date")
    .reset_index(drop=True)
)


# ============================================================
# CREATE FEATURES
# ============================================================

def create_features(data):
    data = (
        data
        .copy()
        .sort_values("date")
        .reset_index(drop=True)
    )

    # --------------------------------------------------------
    # DATE FEATURES
    # --------------------------------------------------------

    data["year"] = (
        data["date"].dt.year
    )

    data["month"] = (
        data["date"].dt.month
    )

    data["quarter"] = (
        data["date"].dt.quarter
    )

    data["day"] = (
        data["date"].dt.day
    )

    data["day_of_week"] = (
        data["date"].dt.dayofweek
    )

    data["day_of_year"] = (
        data["date"].dt.dayofyear
    )

    data["week_of_year"] = (
        data["date"]
        .dt
        .isocalendar()
        .week
        .astype(int)
    )

    data["is_weekend"] = (
        data["day_of_week"] >= 5
    ).astype(int)

    data["is_month_start"] = (
        data["date"]
        .dt
        .is_month_start
        .astype(int)
    )

    data["is_month_end"] = (
        data["date"]
        .dt
        .is_month_end
        .astype(int)
    )

    # --------------------------------------------------------
    # CYCLICAL FEATURES
    # --------------------------------------------------------

    data["month_sin"] = np.sin(
        2
        * np.pi
        * data["month"]
        / 12
    )

    data["month_cos"] = np.cos(
        2
        * np.pi
        * data["month"]
        / 12
    )

    data["dow_sin"] = np.sin(
        2
        * np.pi
        * data["day_of_week"]
        / 7
    )

    data["dow_cos"] = np.cos(
        2
        * np.pi
        * data["day_of_week"]
        / 7
    )

    data["year_sin"] = np.sin(
        2
        * np.pi
        * data["day_of_year"]
        / 365.25
    )

    data["year_cos"] = np.cos(
        2
        * np.pi
        * data["day_of_year"]
        / 365.25
    )

    # --------------------------------------------------------
    # SALES LAGS
    # --------------------------------------------------------

    short_lags = [
        1,
        2,
        3,
        7,
        14,
        21,
        28,
        35,
        42,
        56,
        84,
    ]

    for lag in short_lags:
        data[f"lag_{lag}"] = (
            data["sales"]
            .shift(lag)
        )

    for lag in [
        364,
        365,
        366,
    ]:
        data[f"lag_{lag}"] = (
            data["sales"]
            .shift(lag)
        )

    shifted_sales = (
        data["sales"]
        .shift(1)
    )

    # --------------------------------------------------------
    # ROLLING MEANS
    # --------------------------------------------------------

    for window in [
        7,
        14,
        21,
        28,
        42,
        56,
        84,
    ]:
        data[
            f"rolling_mean_{window}"
        ] = (
            shifted_sales
            .rolling(window)
            .mean()
        )

    # --------------------------------------------------------
    # ROLLING MEDIANS
    # --------------------------------------------------------

    for window in [
        7,
        14,
        28,
        56,
    ]:
        data[
            f"rolling_median_{window}"
        ] = (
            shifted_sales
            .rolling(window)
            .median()
        )

    # --------------------------------------------------------
    # ROLLING STD
    # --------------------------------------------------------

    for window in [
        7,
        14,
        28,
        56,
        84,
    ]:
        data[
            f"rolling_std_{window}"
        ] = (
            shifted_sales
            .rolling(window)
            .std()
        )

    # --------------------------------------------------------
    # EWM
    # --------------------------------------------------------

    for span in [
        7,
        14,
        28,
        56,
    ]:
        data[
            f"ewm_{span}"
        ] = (
            shifted_sales
            .ewm(
                span=span,
                adjust=False,
            )
            .mean()
        )

    # --------------------------------------------------------
    # DIFFERENCE FEATURES
    # --------------------------------------------------------

    data["diff_1"] = (
        data["sales"].shift(1)
        -
        data["sales"].shift(2)
    )

    data["diff_7"] = (
        data["sales"].shift(1)
        -
        data["sales"].shift(8)
    )

    data["diff_28"] = (
        data["sales"].shift(1)
        -
        data["sales"].shift(29)
    )

    # --------------------------------------------------------
    # YEAR OVER YEAR
    # --------------------------------------------------------

    data["yoy_avg"] = (
        data["lag_364"]
        +
        data["lag_365"]
        +
        data["lag_366"]
    ) / 3

    data["yoy_weekday_ratio"] = (
        data["lag_7"]
        /
        (
            data["lag_364"]
            + EPSILON
        )
    )

    data["yoy_change_364"] = (
        (
            data["lag_1"]
            -
            data["lag_364"]
        )
        /
        (
            np.abs(
                data["lag_364"]
            )
            + EPSILON
        )
    )

    data["yoy_change_365"] = (
        (
            data["lag_1"]
            -
            data["lag_365"]
        )
        /
        (
            np.abs(
                data["lag_365"]
            )
            + EPSILON
        )
    )

    # --------------------------------------------------------
    # WEEKDAY HISTORY
    # --------------------------------------------------------

    data[
        "weekday_mean_4weeks"
    ] = (
        data["sales"]
        .shift(7)
        .rolling(4)
        .mean()
    )

    data[
        "weekday_mean_8weeks"
    ] = (
        data["sales"]
        .shift(7)
        .rolling(8)
        .mean()
    )

    # --------------------------------------------------------
    # MOMENTUM FEATURES
    # --------------------------------------------------------

    data["short_long_ratio"] = (
        data["rolling_mean_7"]
        /
        (
            data["rolling_mean_56"]
            + EPSILON
        )
    )

    data["momentum_7"] = (
        data["lag_1"]
        /
        (
            data["rolling_mean_7"]
            + EPSILON
        )
    )

    data["momentum_28"] = (
        data["lag_1"]
        /
        (
            data["rolling_mean_28"]
            + EPSILON
        )
    )

    data["mean_change_7_28"] = (
        data["rolling_mean_7"]
        -
        data["rolling_mean_28"]
    )

    data["mean_change_28_84"] = (
        data["rolling_mean_28"]
        -
        data["rolling_mean_84"]
    )

    data["volatility_ratio"] = (
        data["rolling_std_7"]
        /
        (
            data["rolling_std_28"]
            + EPSILON
        )
    )

    # --------------------------------------------------------
    # PROMOTION HISTORY
    # --------------------------------------------------------

    data["promotion_lag_1"] = (
        data["onpromotion"]
        .shift(1)
    )

    data["promotion_lag_7"] = (
        data["onpromotion"]
        .shift(7)
    )

    data["promotion_mean_7"] = (
        data["onpromotion"]
        .shift(1)
        .rolling(7)
        .mean()
    )

    data["promotion_mean_28"] = (
        data["onpromotion"]
        .shift(1)
        .rolling(28)
        .mean()
    )

    # --------------------------------------------------------
    # TRANSACTION HISTORY
    # --------------------------------------------------------

    data["transactions_lag_1"] = (
        data["transactions"]
        .shift(1)
    )

    data["transactions_lag_7"] = (
        data["transactions"]
        .shift(7)
    )

    data["transactions_mean_7"] = (
        data["transactions"]
        .shift(1)
        .rolling(7)
        .mean()
    )

    data["transactions_mean_28"] = (
        data["transactions"]
        .shift(1)
        .rolling(28)
        .mean()
    )

    # --------------------------------------------------------
    # TREND
    # --------------------------------------------------------

    data["trend"] = np.arange(
        len(data)
    )

    # --------------------------------------------------------
    # CLEAN RATIO COLUMNS
    # --------------------------------------------------------

    ratio_columns = [
        "yoy_weekday_ratio",
        "yoy_change_364",
        "yoy_change_365",
        "short_long_ratio",
        "momentum_7",
        "momentum_28",
        "volatility_ratio",
    ]

    for column in ratio_columns:
        data[column] = (
            data[column]
            .replace(
                [np.inf, -np.inf],
                np.nan,
            )
            .clip(
                lower=-10,
                upper=10,
            )
        )

    return data


# ============================================================
# MODEL METRICS
# ============================================================

def get_model_metrics():
    metrics = {
        "model_type": model_type,
        "r2": float(
            model_metrics.get(
                "R2",
                0
            )
        ),
        "mape": float(
            model_metrics.get(
                "MAPE",
                0
            )
        ),
        "mae": float(
            model_metrics.get(
                "MAE",
                0
            )
        ),
        "rmse": float(
            model_metrics.get(
                "RMSE",
                0
            )
        ),
        "validation_days":
            validation_days,
        "top_three":
            top_three,
        "blend_weights":
            blend_weights,
    }

    return metrics


# ============================================================
# HISTORICAL DATA
# ============================================================

def get_historical_sales(
    days=120
):
    days = max(
        1,
        min(
            int(days),
            len(history),
        ),
    )

    subset = (
        history
        .tail(days)
        .copy()
    )

    return [
        {
            "date":
                row["date"]
                .strftime(
                    "%Y-%m-%d"
                ),

            "sales":
                round(
                    float(
                        row["sales"]
                    ),
                    2,
                ),

            "onpromotion":
                round(
                    float(
                        row[
                            "onpromotion"
                        ]
                    ),
                    2,
                ),

            "transactions":
                round(
                    float(
                        row[
                            "transactions"
                        ]
                    ),
                    2,
                ),

            "oil_price":
                round(
                    float(
                        row[
                            "oil_price"
                        ]
                    ),
                    2,
                ),

            "is_holiday":
                int(
                    row[
                        "is_holiday"
                    ]
                ),
        }

        for _, row
        in subset.iterrows()
    ]


# ============================================================
# RECURSIVE FORECAST
# ============================================================

@lru_cache(maxsize=8)
def generate_forecast(
    horizon=30,
    promotion=None,
    transactions=None,
    oil_price=None,
):
    horizon = int(horizon)

    if horizon not in [
        7,
        30,
        90,
    ]:
        raise ValueError(
            "Forecast horizon must be "
            "7, 30 or 90 days."
        )

    working = history.copy()

    recent_28 = (
        history.tail(28)
    )

    if promotion is None:
        future_promotion = (
            recent_28[
                "onpromotion"
            ]
            .mean()
        )
    else:
        future_promotion = (
            float(promotion)
        )

    if transactions is None:
        future_transactions = (
            recent_28[
                "transactions"
            ]
            .mean()
        )
    else:
        future_transactions = (
            float(transactions)
        )

    if oil_price is None:
        future_oil_price = (
            history[
                "oil_price"
            ]
            .iloc[-1]
        )
    else:
        future_oil_price = (
            float(oil_price)
        )

    forecast_rows = []

    for step in range(
        1,
        horizon + 1,
    ):
        next_date = (
            working["date"]
            .max()
            +
            pd.Timedelta(days=1)
        )

        future_row = {
            "date":
                next_date,

            "sales":
                np.nan,

            "onpromotion":
                future_promotion,

            "transactions":
                future_transactions,

            "oil_price":
                future_oil_price,

            "holiday_count":
                0,

            "is_holiday":
                0,
        }

        working = pd.concat(
            [
                working,
                pd.DataFrame(
                    [future_row]
                ),
            ],
            ignore_index=True,
        )

        featured = (
            create_features(
                working
            )
        )

        newest = (
            featured
            .iloc[[-1]]
        )

        missing = (
            newest[features]
            .isna()
            .sum()
        )

        missing = (
            missing[
                missing > 0
            ]
        )

        if len(missing) > 0:
            raise ValueError(
                "Missing forecast "
                "features: "
                +
                ", ".join(
                    missing
                    .index
                    .tolist()
                )
            )

        X_future = (
            newest[features]
        )

        prediction = 0.0

        for name in top_three:
            model_prediction = (
                models[name]
                .predict(
                    X_future
                )[0]
            )

            prediction += (
                model_prediction
                *
                blend_weights[
                    name
                ]
            )

        prediction = max(
            float(prediction),
            0,
        )

        working.loc[
            working.index[-1],
            "sales",
        ] = prediction

        forecast_rows.append(
            {
                "date":
                    next_date
                    .strftime(
                        "%Y-%m-%d"
                    ),

                "forecast_day":
                    step,

                "predicted_sales":
                    round(
                        prediction,
                        2,
                    ),
            }
        )

    return forecast_rows


# ============================================================
# FORECAST SUMMARY
# ============================================================

def get_forecast_summary(
    forecast
):
    values = [
        row[
            "predicted_sales"
        ]
        for row in forecast
    ]

    average = float(
        np.mean(values)
    )

    minimum = float(
        np.min(values)
    )

    maximum = float(
        np.max(values)
    )

    first = values[0]
    last = values[-1]

    if first == 0:
        trend = 0
    else:
        trend = (
            (
                last - first
            )
            /
            first
            *
            100
        )

    return {
        "average":
            round(
                average,
                2,
            ),

        "minimum":
            round(
                minimum,
                2,
            ),

        "maximum":
            round(
                maximum,
                2,
            ),

        "trend_percent":
            round(
                float(trend),
                2,
            ),

        "forecast_days":
            len(forecast),

        "start_date":
            forecast[0][
                "date"
            ],

        "end_date":
            forecast[-1][
                "date"
            ],
    }


# ============================================================
# COMPLETE DASHBOARD RESPONSE
# ============================================================

def get_dashboard_data(
    horizon=30
):
    forecast = (
        generate_forecast(
            horizon=horizon
        )
    )

    summary = (
        get_forecast_summary(
            forecast
        )
    )

    metrics = (
        get_model_metrics()
    )

    historical = (
        get_historical_sales(
            days=120
        )
    )

    return {
        "status":
            "success",

        "model":
            metrics,

        "summary":
            summary,

        "historical":
            historical,

        "forecast":
            forecast,
    }
