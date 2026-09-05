from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


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

MODEL_DIR = ROOT / "models"
METRIC_DIR = ROOT / "outputs" / "metrics"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
METRIC_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# SETTINGS
# ============================================================

VALIDATION_DAYS = 60
RANDOM_STATE = 42


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 82)
print("SEASONAL HGB SALES FORECASTING")
print("=" * 82)

df = pd.read_csv(DATA_FILE)

df["date"] = pd.to_datetime(df["date"])

df = (
    df
    .sort_values("date")
    .reset_index(drop=True)
)

print(f"\nRows loaded: {len(df):,}")

print(
    f"Date range: "
    f"{df['date'].min().date()} "
    f"-> "
    f"{df['date'].max().date()}"
)


# ============================================================
# SHORT / MEDIUM LAGS
# ============================================================

print("\nCreating short and medium sales lags...")

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

    df[f"lag_{lag}"] = (
        df["sales"]
        .shift(lag)
    )


# ============================================================
# YEAR-OVER-YEAR LAGS
# ============================================================

print("Creating yearly seasonal lags...")

year_lags = [
    364,
    365,
    366
]

for lag in year_lags:

    df[f"lag_{lag}"] = (
        df["sales"]
        .shift(lag)
    )


# ============================================================
# SHIFT SALES
# ============================================================

shifted_sales = (
    df["sales"]
    .shift(1)
)


# ============================================================
# ROLLING MEANS
# ============================================================

rolling_mean_windows = [
    7,
    14,
    21,
    28,
    42,
    56,
    84
]

for window in rolling_mean_windows:

    df[f"rolling_mean_{window}"] = (
        shifted_sales
        .rolling(window)
        .mean()
    )


# ============================================================
# ROLLING MEDIANS
# ============================================================

rolling_median_windows = [
    7,
    14,
    28,
    56
]

for window in rolling_median_windows:

    df[f"rolling_median_{window}"] = (
        shifted_sales
        .rolling(window)
        .median()
    )


# ============================================================
# ROLLING STANDARD DEVIATION
# ============================================================

rolling_std_windows = [
    7,
    14,
    28,
    56,
    84
]

for window in rolling_std_windows:

    df[f"rolling_std_{window}"] = (
        shifted_sales
        .rolling(window)
        .std()
    )


# ============================================================
# EXPONENTIAL MOVING AVERAGES
# ============================================================

ewm_spans = [
    7,
    14,
    28,
    56
]

for span in ewm_spans:

    df[f"ewm_{span}"] = (
        shifted_sales
        .ewm(
            span=span,
            adjust=False
        )
        .mean()
    )


# ============================================================
# DIFFERENCE FEATURES
# ============================================================

df["diff_1"] = (
    df["sales"].shift(1)
    -
    df["sales"].shift(2)
)

df["diff_7"] = (
    df["sales"].shift(1)
    -
    df["sales"].shift(8)
)

df["diff_28"] = (
    df["sales"].shift(1)
    -
    df["sales"].shift(29)
)


# ============================================================
# YEAR OVER YEAR FEATURES
# ============================================================

epsilon = 1e-6

df["yoy_avg"] = (
    df["lag_364"]
    +
    df["lag_365"]
    +
    df["lag_366"]
) / 3


df["yoy_weekday_ratio"] = (
    df["lag_7"]
    /
    (
        df["lag_364"]
        + epsilon
    )
)


df["yoy_change_364"] = (
    (
        df["lag_1"]
        -
        df["lag_364"]
    )
    /
    (
        np.abs(df["lag_364"])
        + epsilon
    )
)


df["yoy_change_365"] = (
    (
        df["lag_1"]
        -
        df["lag_365"]
    )
    /
    (
        np.abs(df["lag_365"])
        + epsilon
    )
)


# ============================================================
# SAME WEEKDAY HISTORY
# ============================================================

df["weekday_mean_4weeks"] = (
    df["sales"]
    .shift(7)
    .rolling(4)
    .mean()
)

df["weekday_mean_8weeks"] = (
    df["sales"]
    .shift(7)
    .rolling(8)
    .mean()
)


# ============================================================
# MOMENTUM
# ============================================================

df["short_long_ratio"] = (
    df["rolling_mean_7"]
    /
    (
        df["rolling_mean_56"]
        + epsilon
    )
)


df["momentum_7"] = (
    df["lag_1"]
    /
    (
        df["rolling_mean_7"]
        + epsilon
    )
)


df["momentum_28"] = (
    df["lag_1"]
    /
    (
        df["rolling_mean_28"]
        + epsilon
    )
)


df["mean_change_7_28"] = (
    df["rolling_mean_7"]
    -
    df["rolling_mean_28"]
)


df["mean_change_28_84"] = (
    df["rolling_mean_28"]
    -
    df["rolling_mean_84"]
)


df["volatility_ratio"] = (
    df["rolling_std_7"]
    /
    (
        df["rolling_std_28"]
        + epsilon
    )
)


# ============================================================
# PROMOTION HISTORY
# ============================================================

df["promotion_lag_1"] = (
    df["onpromotion"]
    .shift(1)
)

df["promotion_lag_7"] = (
    df["onpromotion"]
    .shift(7)
)

df["promotion_mean_7"] = (
    df["onpromotion"]
    .shift(1)
    .rolling(7)
    .mean()
)

df["promotion_mean_28"] = (
    df["onpromotion"]
    .shift(1)
    .rolling(28)
    .mean()
)


# ============================================================
# TRANSACTION HISTORY
# ============================================================

df["transactions_lag_1"] = (
    df["transactions"]
    .shift(1)
)

df["transactions_lag_7"] = (
    df["transactions"]
    .shift(7)
)

df["transactions_mean_7"] = (
    df["transactions"]
    .shift(1)
    .rolling(7)
    .mean()
)

df["transactions_mean_28"] = (
    df["transactions"]
    .shift(1)
    .rolling(28)
    .mean()
)


# ============================================================
# CALENDAR FEATURES
# ============================================================

df["trend"] = np.arange(len(df))

df["day"] = (
    df["date"].dt.day
)

df["is_month_start"] = (
    df["date"]
    .dt
    .is_month_start
    .astype(int)
)

df["is_month_end"] = (
    df["date"]
    .dt
    .is_month_end
    .astype(int)
)


# ============================================================
# YEAR CYCLICAL FEATURES
# ============================================================

df["year_sin"] = np.sin(
    2
    * np.pi
    * df["day_of_year"]
    / 365.25
)

df["year_cos"] = np.cos(
    2
    * np.pi
    * df["day_of_year"]
    / 365.25
)


# ============================================================
# SANITIZE
# ============================================================

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

    df[col] = (
        df[col]
        .replace(
            [np.inf, -np.inf],
            np.nan
        )
        .clip(
            lower=-10,
            upper=10
        )
    )


# ============================================================
# FEATURE LIST
# ============================================================

FEATURES = [

    # Current business information
    "onpromotion",
    "transactions",
    "oil_price",
    "holiday_count",
    "is_holiday",

    # Calendar
    "year",
    "month",
    "quarter",
    "day",
    "day_of_week",
    "day_of_year",
    "week_of_year",
    "is_weekend",
    "is_month_start",
    "is_month_end",

    # Cyclical
    "month_sin",
    "month_cos",
    "dow_sin",
    "dow_cos",
    "year_sin",
    "year_cos",

    # Short / medium lags
    *[
        f"lag_{lag}"
        for lag in short_lags
    ],

    # Year lags
    "lag_364",
    "lag_365",
    "lag_366",

    # Rolling means
    *[
        f"rolling_mean_{window}"
        for window in rolling_mean_windows
    ],

    # Rolling medians
    *[
        f"rolling_median_{window}"
        for window in rolling_median_windows
    ],

    # Rolling std
    *[
        f"rolling_std_{window}"
        for window in rolling_std_windows
    ],

    # EWM
    *[
        f"ewm_{span}"
        for span in ewm_spans
    ],

    # Difference features
    "diff_1",
    "diff_7",
    "diff_28",

    # YOY
    "yoy_avg",
    "yoy_weekday_ratio",
    "yoy_change_364",
    "yoy_change_365",

    # Weekday
    "weekday_mean_4weeks",
    "weekday_mean_8weeks",

    # Momentum
    "short_long_ratio",
    "momentum_7",
    "momentum_28",
    "mean_change_7_28",
    "mean_change_28_84",
    "volatility_ratio",

    # Promotion
    "promotion_lag_1",
    "promotion_lag_7",
    "promotion_mean_7",
    "promotion_mean_28",

    # Transactions
    "transactions_lag_1",
    "transactions_lag_7",
    "transactions_mean_7",
    "transactions_mean_28",

    # Trend
    "trend"
]

TARGET = "sales"


# ============================================================
# REMOVE NAN ROWS
# ============================================================

df = df.replace(
    [np.inf, -np.inf],
    np.nan
)

before = len(df)

df = (
    df
    .dropna(
        subset=FEATURES + [TARGET]
    )
    .reset_index(drop=True)
)

print(
    f"\nRows available for modelling: "
    f"{len(df):,}"
)

print(
    f"Rows removed for lag history: "
    f"{before - len(df):,}"
)


# ============================================================
# 60-DAY TIME VALIDATION
# ============================================================

split_index = (
    len(df)
    -
    VALIDATION_DAYS
)

train_df = (
    df
    .iloc[:split_index]
    .copy()
)

valid_df = (
    df
    .iloc[split_index:]
    .copy()
)

X_train = train_df[FEATURES]
y_train = train_df[TARGET]

X_valid = valid_df[FEATURES]
y_valid = valid_df[TARGET]


print("\n" + "=" * 82)
print("TIME-BASED VALIDATION")
print("=" * 82)

print(
    "Training:",
    train_df["date"].min().date(),
    "->",
    train_df["date"].max().date()
)

print(
    "Validation:",
    valid_df["date"].min().date(),
    "->",
    valid_df["date"].max().date()
)


# ============================================================
# METRIC FUNCTION
# ============================================================

def calculate_metrics(
    actual,
    predicted
):

    actual = np.asarray(actual)

    predicted = np.maximum(
        np.asarray(predicted),
        0
    )

    mae = mean_absolute_error(
        actual,
        predicted
    )

    rmse = np.sqrt(
        mean_squared_error(
            actual,
            predicted
        )
    )

    r2 = r2_score(
        actual,
        predicted
    )

    mask = actual != 0

    mape = (
        np.mean(
            np.abs(
                (
                    actual[mask]
                    -
                    predicted[mask]
                )
                /
                actual[mask]
            )
        )
        * 100
    )

    return {
        "MAE": float(mae),
        "RMSE": float(rmse),
        "MAPE": float(mape),
        "R2": float(r2)
    }


# ============================================================
# HGB MODELS
# ============================================================

configs = [

    {
        "name":
            "SEASON_HGB_A",

        "learning_rate":
            0.04,

        "max_iter":
            500,

        "max_leaf_nodes":
            31,

        "min_samples_leaf":
            20,

        "l2_regularization":
            1.0
    },

    {
        "name":
            "SEASON_HGB_B",

        "learning_rate":
            0.035,

        "max_iter":
            650,

        "max_leaf_nodes":
            31,

        "min_samples_leaf":
            15,

        "l2_regularization":
            1.0
    },

    {
        "name":
            "SEASON_HGB_C",

        "learning_rate":
            0.03,

        "max_iter":
            750,

        "max_leaf_nodes":
            31,

        "min_samples_leaf":
            15,

        "l2_regularization":
            1.5
    },

    {
        "name":
            "SEASON_HGB_D",

        "learning_rate":
            0.035,

        "max_iter":
            700,

        "max_leaf_nodes":
            47,

        "min_samples_leaf":
            15,

        "l2_regularization":
            1.5
    },

    {
        "name":
            "SEASON_HGB_E",

        "learning_rate":
            0.03,

        "max_iter":
            850,

        "max_leaf_nodes":
            47,

        "min_samples_leaf":
            12,

        "l2_regularization":
            2.0
    },

    {
        "name":
            "SEASON_HGB_F",

        "learning_rate":
            0.025,

        "max_iter":
            950,

        "max_leaf_nodes":
            31,

        "min_samples_leaf":
            12,

        "l2_regularization":
            0.75
    }
]


# ============================================================
# TRAIN ALL MODELS
# ============================================================

print("\n" + "=" * 82)
print("TRAINING SEASONAL MODELS")
print("=" * 82)


models = {}
predictions = {}
results = {}


for config in configs:

    name = config["name"]

    print(
        f"\nTraining {name}..."
    )

    model = (
        HistGradientBoostingRegressor(

            learning_rate=
                config[
                    "learning_rate"
                ],

            max_iter=
                config[
                    "max_iter"
                ],

            max_leaf_nodes=
                config[
                    "max_leaf_nodes"
                ],

            min_samples_leaf=
                config[
                    "min_samples_leaf"
                ],

            l2_regularization=
                config[
                    "l2_regularization"
                ],

            early_stopping=False,

            random_state=
                RANDOM_STATE
        )
    )

    model.fit(
        X_train,
        y_train
    )

    prediction = model.predict(
        X_valid
    )

    prediction = np.maximum(
        prediction,
        0
    )

    result = calculate_metrics(
        y_valid,
        prediction
    )

    models[name] = model
    predictions[name] = prediction
    results[name] = result

    print(
        f"R²   : "
        f"{result['R2']:.4f}"
    )

    print(
        f"MAPE : "
        f"{result['MAPE']:.2f}%"
    )

    print(
        f"RMSE : "
        f"{result['RMSE']:,.2f}"
    )


# ============================================================
# SELECT TOP THREE
# ============================================================

individual_ranking = sorted(

    results.items(),

    key=lambda item:
        item[1]["R2"],

    reverse=True
)

top_three = [

    individual_ranking[0][0],

    individual_ranking[1][0],

    individual_ranking[2][0]

]

print("\nTop three models:")

for name in top_three:
    print(" -", name)


# ============================================================
# BLEND SEARCH
#
# 2.5% increments
# ============================================================

print("\n" + "=" * 82)
print("SEARCHING SEASONAL BLENDS")
print("=" * 82)

best_blend = None

step = 0.025


for w1 in np.arange(
    0,
    1.0001,
    step
):

    for w2 in np.arange(
        0,
        1.0001 - w1,
        step
    ):

        w3 = (
            1
            -
            w1
            -
            w2
        )

        if w3 < -1e-9:
            continue

        blend_prediction = (

            predictions[
                top_three[0]
            ]
            * w1

            +

            predictions[
                top_three[1]
            ]
            * w2

            +

            predictions[
                top_three[2]
            ]
            * w3
        )

        result = calculate_metrics(
            y_valid,
            blend_prediction
        )

        if (
            best_blend is None

            or

            result["R2"]
            >
            best_blend[
                "metrics"
            ]["R2"]
        ):

            best_blend = {

                "weights": {
                    top_three[0]:
                        float(w1),

                    top_three[1]:
                        float(w2),

                    top_three[2]:
                        float(w3)
                },

                "prediction":
                    blend_prediction.copy(),

                "metrics":
                    result
            }


# ============================================================
# BEST BLEND
# ============================================================

blend_weights = (
    best_blend["weights"]
)

blend_metrics = (
    best_blend["metrics"]
)

blend_prediction = (
    best_blend[
        "prediction"
    ]
)


print("\n" + "=" * 82)
print("BEST SEASONAL BLEND")
print("=" * 82)

print("\nWeights:")

for name, weight in (
    blend_weights.items()
):

    print(
        f"{name:20s}"
        f": {weight * 100:.1f}%"
    )


print(
    f"\nR²   : "
    f"{blend_metrics['R2']:.4f}"
)

print(
    f"MAPE : "
    f"{blend_metrics['MAPE']:.2f}%"
)

print(
    f"MAE  : "
    f"{blend_metrics['MAE']:,.2f}"
)

print(
    f"RMSE : "
    f"{blend_metrics['RMSE']:,.2f}"
)


# ============================================================
# FINAL MODEL RANKING
# ============================================================

all_results = dict(
    results
)

all_results[
    "SEASONAL_BLEND"
] = blend_metrics


ranking = sorted(

    all_results.items(),

    key=lambda item:
        item[1]["R2"],

    reverse=True
)


print("\n" + "=" * 82)
print("FINAL MODEL RANKING")
print("=" * 82)


for position, (
    name,
    result
) in enumerate(
    ranking,
    1
):

    print(

        f"{position}. "
        f"{name:20s}"

        f" | R²: "
        f"{result['R2']:.4f}"

        f" | MAPE: "
        f"{result['MAPE']:.2f}%"

        f" | RMSE: "
        f"{result['RMSE']:,.2f}"

    )


# ============================================================
# SAVE FINAL MODEL PACKAGE
# ============================================================

MODEL_FILE = (

    MODEL_DIR
    /
    "final_sales_forecasting_model.joblib"

)


package = {

    "type":
        "seasonal_hgb_blend",

    "models":
        models,

    "features":
        FEATURES,

    "top_three":
        top_three,

    "blend_weights":
        blend_weights,

    "metrics":
        blend_metrics,

    "validation_days":
        VALIDATION_DAYS,

    "validation_start":
        str(
            valid_df[
                "date"
            ]
            .min()
            .date()
        ),

    "validation_end":
        str(
            valid_df[
                "date"
            ]
            .max()
            .date()
        )
}


joblib.dump(
    package,
    MODEL_FILE
)


# ============================================================
# SAVE VALIDATION PREDICTIONS
# ============================================================

comparison = pd.DataFrame({

    "date":
        valid_df[
            "date"
        ].values,

    "actual_sales":
        y_valid.values,

    "predicted_sales":
        blend_prediction,

    "absolute_error":
        np.abs(
            y_valid.values
            -
            blend_prediction
        )
})


PREDICTION_FILE = (

    METRIC_DIR
    /
    "final_validation_predictions.csv"

)


comparison.to_csv(
    PREDICTION_FILE,
    index=False
)


# ============================================================
# SAVE METRICS
# ============================================================

METRICS_FILE = (

    METRIC_DIR
    /
    "final_model_metrics.json"

)


metrics_output = {

    "model_type":
        "Seasonal HistGradientBoosting Blend",

    "R2":
        blend_metrics["R2"],

    "MAPE_percent":
        blend_metrics["MAPE"],

    "MAE":
        blend_metrics["MAE"],

    "RMSE":
        blend_metrics["RMSE"],

    "blend_weights":
        blend_weights,

    "top_three":
        top_three,

    "validation_days":
        VALIDATION_DAYS
}


with open(
    METRICS_FILE,
    "w"
) as file:

    json.dump(
        metrics_output,
        file,
        indent=4
    )


# ============================================================
# COMPLETE
# ============================================================

print("\n" + "=" * 82)
print("TRAINING COMPLETED")
print("=" * 82)

print("\nFinal model saved:")
print(MODEL_FILE)

print("\nMetrics saved:")
print(METRICS_FILE)

print("\nValidation predictions saved:")
print(PREDICTION_FILE)

print(
    "\nFinal R²   : "
    f"{blend_metrics['R2']:.6f}"
)

print(
    "Final MAPE : "
    f"{blend_metrics['MAPE']:.2f}%"
)

print(
    "Final RMSE : "
    f"{blend_metrics['RMSE']:,.2f}"
)
