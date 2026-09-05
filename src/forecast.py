from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

DATA_FILE = (
    ROOT
    / "data"
    / "processed"
    / "daily_sales.csv"
)

MODEL_FILE = (
    ROOT
    / "models"
    / "final_sales_forecasting_model.joblib"
)

FORECAST_DIR = (
    ROOT
    / "outputs"
    / "forecasts"
)

FORECAST_DIR.mkdir(
    parents=True,
    exist_ok=True
)

CSV_FILE = (
    FORECAST_DIR
    / "future_forecast.csv"
)

JSON_FILE = (
    FORECAST_DIR
    / "future_forecast.json"
)


# ============================================================
# SETTINGS
# ============================================================

FORECAST_DAYS = 30

EPSILON = 1e-6


# ============================================================
# LOAD MODEL
# ============================================================

print("=" * 80)
print("SALES DEMAND FORECAST")
print("=" * 80)

print("\nLoading final model...")

package = joblib.load(
    MODEL_FILE
)

models = package["models"]

features = package["features"]

top_three = package["top_three"]

blend_weights = package["blend_weights"]


print("Model loaded successfully.")

print("\nBlend models:")

for name in top_three:

    print(
        f"{name:20s}"
        f" = "
        f"{blend_weights[name] * 100:.1f}%"
    )


# ============================================================
# LOAD HISTORICAL DATA
# ============================================================

print("\nLoading processed sales data...")

history = pd.read_csv(
    DATA_FILE
)

history["date"] = pd.to_datetime(
    history["date"]
)

history = (
    history
    .sort_values("date")
    .reset_index(drop=True)
)


print(
    f"Historical rows: "
    f"{len(history):,}"
)

print(
    f"Last historical date: "
    f"{history['date'].max().date()}"
)


# ============================================================
# FUTURE BUSINESS ASSUMPTIONS
# ============================================================
#
# For this MVP:
#
# promotion     -> recent 28-day average
# transactions  -> recent 28-day average
# oil price     -> latest known oil price
# holidays      -> 0 unless later supplied externally
#
# Later the frontend/API can replace these assumptions.
# ============================================================

recent_28 = history.tail(28)


future_onpromotion = (
    recent_28["onpromotion"]
    .mean()
)

future_transactions = (
    recent_28["transactions"]
    .mean()
)

future_oil_price = (
    history["oil_price"]
    .iloc[-1]
)


print("\nFuture assumptions:")

print(
    f"On-promotion average : "
    f"{future_onpromotion:.2f}"
)

print(
    f"Transactions average : "
    f"{future_transactions:.2f}"
)

print(
    f"Oil price            : "
    f"{future_oil_price:.2f}"
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
        data["date"]
        .dt
        .year
    )

    data["month"] = (
        data["date"]
        .dt
        .month
    )

    data["quarter"] = (
        data["date"]
        .dt
        .quarter
    )

    data["day"] = (
        data["date"]
        .dt
        .day
    )

    data["day_of_week"] = (
        data["date"]
        .dt
        .dayofweek
    )

    data["day_of_year"] = (
        data["date"]
        .dt
        .dayofyear
    )

    data["week_of_year"] = (
        data["date"]
        .dt
        .isocalendar()
        .week
        .astype(int)
    )

    data["is_weekend"] = (
        data["day_of_week"]
        >= 5
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
        84
    ]

    for lag in short_lags:

        data[f"lag_{lag}"] = (
            data["sales"]
            .shift(lag)
        )


    for lag in [
        364,
        365,
        366
    ]:

        data[f"lag_{lag}"] = (
            data["sales"]
            .shift(lag)
        )


    # --------------------------------------------------------
    # SHIFTED SALES
    # --------------------------------------------------------

    shifted_sales = (
        data["sales"]
        .shift(1)
    )


    # --------------------------------------------------------
    # ROLLING MEAN
    # --------------------------------------------------------

    for window in [
        7,
        14,
        21,
        28,
        42,
        56,
        84
    ]:

        data[
            f"rolling_mean_{window}"
        ] = (
            shifted_sales
            .rolling(window)
            .mean()
        )


    # --------------------------------------------------------
    # ROLLING MEDIAN
    # --------------------------------------------------------

    for window in [
        7,
        14,
        28,
        56
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
        84
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
        56
    ]:

        data[
            f"ewm_{span}"
        ] = (
            shifted_sales
            .ewm(
                span=span,
                adjust=False
            )
            .mean()
        )


    # --------------------------------------------------------
    # DIFFERENCES
    # --------------------------------------------------------

    data["diff_1"] = (
        data["sales"]
        .shift(1)
        -
        data["sales"]
        .shift(2)
    )

    data["diff_7"] = (
        data["sales"]
        .shift(1)
        -
        data["sales"]
        .shift(8)
    )

    data["diff_28"] = (
        data["sales"]
        .shift(1)
        -
        data["sales"]
        .shift(29)
    )


    # --------------------------------------------------------
    # YOY
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
    # MOMENTUM
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
    # CLEAN RATIOS
    # --------------------------------------------------------

    ratio_columns = [
        "yoy_weekday_ratio",
        "yoy_change_364",
        "yoy_change_365",
        "short_long_ratio",
        "momentum_7",
        "momentum_28",
        "volatility_ratio"
    ]

    for col in ratio_columns:

        data[col] = (
            data[col]
            .replace(
                [np.inf, -np.inf],
                np.nan
            )
            .clip(
                lower=-10,
                upper=10
            )
        )


    return data


# ============================================================
# RECURSIVE FORECAST
# ============================================================

print("\n" + "=" * 80)
print("GENERATING 30-DAY FORECAST")
print("=" * 80)


working = history.copy()

forecast_rows = []


for step in range(
    1,
    FORECAST_DAYS + 1
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
            future_onpromotion,

        "transactions":
            future_transactions,

        "oil_price":
            future_oil_price,

        "holiday_count":
            0,

        "is_holiday":
            0
    }


    working = pd.concat(
        [
            working,
            pd.DataFrame(
                [future_row]
            )
        ],
        ignore_index=True
    )


    # Build all features
    featured = create_features(
        working
    )


    # Get newest row
    newest = (
        featured
        .iloc[[-1]]
    )


    # Check feature availability
    missing = (
        newest[features]
        .isna()
        .sum()
    )


    missing = missing[
        missing > 0
    ]


    if len(missing) > 0:

        print(
            "\nERROR: Missing forecast features:"
        )

        print(missing)

        raise SystemExit


    X_future = (
        newest[features]
    )


    # --------------------------------------------------------
    # BLENDED PREDICTION
    # --------------------------------------------------------

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
            blend_weights[name]
        )


    prediction = max(
        float(prediction),
        0
    )


    # Put prediction back into history
    working.loc[
        working.index[-1],
        "sales"
    ] = prediction


    forecast_rows.append({

        "date":
            next_date,

        "predicted_sales":
            prediction

    })


    print(
        f"Day {step:2d} | "
        f"{next_date.date()} | "
        f"{prediction:,.2f}"
    )


# ============================================================
# FORECAST DATAFRAME
# ============================================================

forecast = pd.DataFrame(
    forecast_rows
)


# ============================================================
# ADD SUMMARY INFORMATION
# ============================================================

forecast["forecast_day"] = np.arange(
    1,
    len(forecast) + 1
)


# ============================================================
# SAVE CSV
# ============================================================

forecast.to_csv(
    CSV_FILE,
    index=False
)


# ============================================================
# SAVE JSON
# ============================================================

json_output = {

    "model": {
        "type":
            package["type"],

        "R2":
            package["metrics"]["R2"],

        "MAPE":
            package["metrics"]["MAPE"],

        "RMSE":
            package["metrics"]["RMSE"]
    },

    "forecast": [

        {
            "date":
                row["date"]
                .strftime(
                    "%Y-%m-%d"
                ),

            "forecast_day":
                int(
                    row[
                        "forecast_day"
                    ]
                ),

            "predicted_sales":
                round(
                    float(
                        row[
                            "predicted_sales"
                        ]
                    ),
                    2
                )
        }

        for _, row
        in forecast.iterrows()
    ]

}


with open(
    JSON_FILE,
    "w"
) as file:

    json.dump(
        json_output,
        file,
        indent=4
    )


# ============================================================
# SUMMARY
# ============================================================

print("\n" + "=" * 80)
print("FORECAST COMPLETED")
print("=" * 80)


print(
    f"\nForecast start: "
    f"{forecast['date'].min().date()}"
)

print(
    f"Forecast end  : "
    f"{forecast['date'].max().date()}"
)


print(
    f"\nAverage predicted sales: "
    f"{forecast['predicted_sales'].mean():,.2f}"
)


print(
    f"Minimum predicted sales: "
    f"{forecast['predicted_sales'].min():,.2f}"
)


print(
    f"Maximum predicted sales: "
    f"{forecast['predicted_sales'].max():,.2f}"
)


print("\nCSV saved:")
print(CSV_FILE)

print("\nJSON saved:")
print(JSON_FILE)
