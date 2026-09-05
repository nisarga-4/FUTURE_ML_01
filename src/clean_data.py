from pathlib import Path
import pandas as pd
import numpy as np


# ============================================================
# PATHS
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

RAW_DIR = ROOT / "data" / "raw"
PROCESSED_DIR = ROOT / "data" / "processed"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("SALES FORECASTING - DATA CLEANING")
print("=" * 70)

print("\nLoading train.csv...")

train = pd.read_csv(
    RAW_DIR / "train.csv",
    usecols=[
        "date",
        "store_nbr",
        "family",
        "sales",
        "onpromotion"
    ]
)

print(f"Train rows: {len(train):,}")


print("\nLoading transactions.csv...")

transactions = pd.read_csv(
    RAW_DIR / "transactions.csv"
)


print("Loading oil.csv...")

oil = pd.read_csv(
    RAW_DIR / "oil.csv"
)


print("Loading holidays_events.csv...")

holidays = pd.read_csv(
    RAW_DIR / "holidays_events.csv"
)


# ============================================================
# DATE CONVERSION
# ============================================================

train["date"] = pd.to_datetime(train["date"])
transactions["date"] = pd.to_datetime(transactions["date"])
oil["date"] = pd.to_datetime(oil["date"])
holidays["date"] = pd.to_datetime(holidays["date"])


# ============================================================
# BASIC CLEANING
# ============================================================

print("\nCleaning data...")

train["sales"] = (
    train["sales"]
    .clip(lower=0)
)

train["onpromotion"] = (
    train["onpromotion"]
    .clip(lower=0)
)


# ============================================================
# DAILY SALES AGGREGATION
# ============================================================

print("Aggregating daily sales...")

daily_sales = (
    train
    .groupby(
        "date",
        as_index=False
    )
    .agg(
        sales=("sales", "sum"),
        onpromotion=("onpromotion", "sum")
    )
)


# ============================================================
# DAILY TRANSACTIONS
# ============================================================

print("Aggregating transactions...")

daily_transactions = (
    transactions
    .groupby(
        "date",
        as_index=False
    )
    .agg(
        transactions=("transactions", "sum")
    )
)


# ============================================================
# OIL
# ============================================================

oil = oil[
    [
        "date",
        "dcoilwtico"
    ]
].copy()

oil = oil.rename(
    columns={
        "dcoilwtico": "oil_price"
    }
)

oil["oil_price"] = (
    oil["oil_price"]
    .interpolate()
    .ffill()
    .bfill()
)


# ============================================================
# HOLIDAY FEATURES
# ============================================================

print("Creating holiday features...")

holiday_daily = (
    holidays
    .groupby("date")
    .agg(
        holiday_count=(
            "description",
            "count"
        )
    )
    .reset_index()
)

holiday_daily["is_holiday"] = 1


# ============================================================
# MERGE
# ============================================================

print("Combining datasets...")

daily = (
    daily_sales
    .merge(
        daily_transactions,
        on="date",
        how="left"
    )
)

daily = (
    daily
    .merge(
        oil,
        on="date",
        how="left"
    )
)

daily = (
    daily
    .merge(
        holiday_daily,
        on="date",
        how="left"
    )
)


# ============================================================
# FILL MISSING VALUES
# ============================================================

daily["transactions"] = (
    daily["transactions"]
    .fillna(0)
)

daily["holiday_count"] = (
    daily["holiday_count"]
    .fillna(0)
)

daily["is_holiday"] = (
    daily["is_holiday"]
    .fillna(0)
)

daily["oil_price"] = (
    daily["oil_price"]
    .interpolate()
    .ffill()
    .bfill()
)


# ============================================================
# SORT
# ============================================================

daily = (
    daily
    .sort_values("date")
    .reset_index(drop=True)
)


# ============================================================
# CALENDAR FEATURES
# ============================================================

daily["year"] = (
    daily["date"].dt.year
)

daily["month"] = (
    daily["date"].dt.month
)

daily["quarter"] = (
    daily["date"].dt.quarter
)

daily["day_of_week"] = (
    daily["date"].dt.dayofweek
)

daily["day_of_year"] = (
    daily["date"].dt.dayofyear
)

daily["week_of_year"] = (
    daily["date"]
    .dt
    .isocalendar()
    .week
    .astype(int)
)

daily["is_weekend"] = (
    daily["day_of_week"] >= 5
).astype(int)


# ============================================================
# CYCLICAL FEATURES
# ============================================================

daily["month_sin"] = np.sin(
    2 * np.pi * daily["month"] / 12
)

daily["month_cos"] = np.cos(
    2 * np.pi * daily["month"] / 12
)

daily["dow_sin"] = np.sin(
    2 * np.pi * daily["day_of_week"] / 7
)

daily["dow_cos"] = np.cos(
    2 * np.pi * daily["day_of_week"] / 7
)


# ============================================================
# FINAL CHECK
# ============================================================

print("\nChecking missing values...")

print(
    daily.isna().sum()
)


# ============================================================
# SAVE
# ============================================================

OUTPUT_FILE = (
    PROCESSED_DIR
    / "daily_sales.csv"
)

daily.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("CLEANING COMPLETED")
print("=" * 70)

print(
    f"Rows: {len(daily):,}"
)

print(
    f"Columns: {len(daily.columns)}"
)

print(
    f"Start date: "
    f"{daily['date'].min().date()}"
)

print(
    f"End date: "
    f"{daily['date'].max().date()}"
)

print("\nSaved to:")
print(OUTPUT_FILE)

print("\nFirst 5 rows:")
print(
    daily.head()
)
