from pathlib import Path

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates


# ============================================================
# PATHS
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

HISTORY_FILE = (
    ROOT
    / "data"
    / "processed"
    / "daily_sales.csv"
)

FORECAST_FILE = (
    ROOT
    / "outputs"
    / "forecasts"
    / "future_forecast.csv"
)

OUTPUT_DIR = (
    ROOT
    / "outputs"
    / "plots"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

PLOT_FILE = (
    OUTPUT_DIR
    / "sales_forecast.png"
)


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("SALES FORECAST VISUALIZATION")
print("=" * 70)

history = pd.read_csv(
    HISTORY_FILE
)

forecast = pd.read_csv(
    FORECAST_FILE
)


history["date"] = pd.to_datetime(
    history["date"]
)

forecast["date"] = pd.to_datetime(
    forecast["date"]
)


history = (
    history
    .sort_values("date")
    .reset_index(drop=True)
)

forecast = (
    forecast
    .sort_values("date")
    .reset_index(drop=True)
)


print(
    f"\nHistorical data: "
    f"{history['date'].min().date()} "
    f"to "
    f"{history['date'].max().date()}"
)

print(
    f"Forecast data:   "
    f"{forecast['date'].min().date()} "
    f"to "
    f"{forecast['date'].max().date()}"
)


# ============================================================
# SHOW RECENT HISTORY
# ============================================================
#
# Showing the last 120 days makes the forecast much easier
# to understand than plotting all 4+ years.
# ============================================================

RECENT_DAYS = 120

recent_history = history.tail(
    RECENT_DAYS
).copy()


# ============================================================
# CONNECT HISTORICAL LINE TO FORECAST LINE
# ============================================================

last_history = pd.DataFrame(
    {
        "date": [
            recent_history["date"].iloc[-1]
        ],

        "predicted_sales": [
            recent_history["sales"].iloc[-1]
        ]
    }
)


forecast_line = pd.concat(
    [
        last_history,
        forecast[
            [
                "date",
                "predicted_sales"
            ]
        ]
    ],
    ignore_index=True
)


# ============================================================
# CREATE GRAPH
# ============================================================

fig, ax = plt.subplots(
    figsize=(14, 7)
)


# Historical sales
ax.plot(
    recent_history["date"],
    recent_history["sales"],
    linewidth=2,
    label="Historical Sales"
)


# Forecast
ax.plot(
    forecast_line["date"],
    forecast_line["predicted_sales"],
    linewidth=2.5,
    linestyle="--",
    marker="o",
    markersize=3,
    label="30-Day Forecast"
)


# ============================================================
# FORECAST START LINE
# ============================================================

forecast_start = forecast[
    "date"
].iloc[0]


ax.axvline(
    forecast_start,
    linestyle=":",
    linewidth=2,
    label="Forecast Start"
)


# ============================================================
# FORECAST AREA
# ============================================================

ax.axvspan(
    forecast["date"].min(),
    forecast["date"].max(),
    alpha=0.08
)


# ============================================================
# TITLE
# ============================================================

ax.set_title(
    "Sales Demand Forecast - Historical vs Future",
    fontsize=16,
    pad=15
)

ax.set_xlabel(
    "Date",
    fontsize=12
)

ax.set_ylabel(
    "Daily Sales",
    fontsize=12
)


# ============================================================
# DATE FORMATTING
# ============================================================

ax.xaxis.set_major_locator(
    mdates.WeekdayLocator(
        interval=2
    )
)

ax.xaxis.set_major_formatter(
    mdates.DateFormatter(
        "%d %b %Y"
    )
)

plt.xticks(
    rotation=45,
    ha="right"
)


# ============================================================
# GRID + LEGEND
# ============================================================

ax.grid(
    True,
    alpha=0.25
)

ax.legend()


# ============================================================
# MODEL INFORMATION
# ============================================================

model_info = (
    "Final validation model\n"
    "R² = 0.9561\n"
    "MAPE = 3.13%\n"
    "RMSE = 31,877.44"
)

ax.text(
    0.02,
    0.97,
    model_info,
    transform=ax.transAxes,
    verticalalignment="top",
    bbox={
        "boxstyle": "round",
        "alpha": 0.15
    }
)


# ============================================================
# FORECAST SUMMARY
# ============================================================

average_forecast = (
    forecast[
        "predicted_sales"
    ]
    .mean()
)

minimum_forecast = (
    forecast[
        "predicted_sales"
    ]
    .min()
)

maximum_forecast = (
    forecast[
        "predicted_sales"
    ]
    .max()
)


summary = (
    f"30-Day Forecast\n"
    f"Average: {average_forecast:,.0f}\n"
    f"Minimum: {minimum_forecast:,.0f}\n"
    f"Maximum: {maximum_forecast:,.0f}"
)


ax.text(
    0.98,
    0.97,
    summary,
    transform=ax.transAxes,
    horizontalalignment="right",
    verticalalignment="top",
    bbox={
        "boxstyle": "round",
        "alpha": 0.15
    }
)


# ============================================================
# SAVE
# ============================================================

plt.tight_layout()

plt.savefig(
    PLOT_FILE,
    dpi=300,
    bbox_inches="tight"
)


print("\n" + "=" * 70)
print("VISUALIZATION COMPLETED")
print("=" * 70)

print("\nGraph saved:")
print(PLOT_FILE)

print(
    f"\nForecast average : "
    f"{average_forecast:,.2f}"
)

print(
    f"Forecast minimum : "
    f"{minimum_forecast:,.2f}"
)

print(
    f"Forecast maximum : "
    f"{maximum_forecast:,.2f}"
)


# Display graph
plt.show()
