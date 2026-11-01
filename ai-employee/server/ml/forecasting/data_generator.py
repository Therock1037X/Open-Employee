import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

PRODUCTS = [
    {"name": "Sugar", "base": 30.0, "trend_slope": 0.02, "weekly_amp": 6.0, "noise_std": 2.5},
    {"name": "Rice", "base": 25.0, "trend_slope": 0.015, "weekly_amp": 5.0, "noise_std": 2.0},
    {"name": "Wheat Flour", "base": 40.0, "trend_slope": 0.03, "weekly_amp": 8.0, "noise_std": 3.0},
    {"name": "Mustard Oil", "base": 15.0, "trend_slope": 0.01, "weekly_amp": 3.5, "noise_std": 1.5},
    {"name": "Tea Powder", "base": 12.0, "trend_slope": 0.008, "weekly_amp": 2.5, "noise_std": 1.2},
]

def generate_sales_history(
    start_date: str = "2024-01-01",
    periods: int = 500,
    seed: int = 42,
) -> pd.DataFrame:
    """
    Generates realistic 500-day daily sales history for retail commodities.
    Features:
    - Weekly seasonality (higher sales on weekends)
    - Festival spikes (Diwali, Holi, New Year)
    - Upward retail growth trend
    - Gaussian velocity noise
    """
    np.random.seed(seed)
    dates = pd.date_range(start=start_date, periods=periods, freq="D")
    records = []

    for prod in PRODUCTS:
        name = prod["name"]
        base = prod["base"]
        trend = np.linspace(0, prod["trend_slope"] * periods, periods)

        # Weekly pattern: Saturday & Sunday peaks
        day_of_week = dates.dayofweek.values
        weekly = np.sin((day_of_week / 7.0) * 2 * np.pi) * prod["weekly_amp"]

        # Festive surge around October-November (Diwali season)
        day_of_year = dates.dayofyear.values
        diwali_spike = np.exp(-0.5 * ((day_of_year - 305) / 10.0) ** 2) * (prod["weekly_amp"] * 2.2)

        noise = np.random.normal(0, prod["noise_std"], periods)
        y = np.maximum(2.0, np.round(base + trend + weekly + diwali_spike + noise, 1))

        for d, val in zip(dates, y):
            records.append({
                "date": d.strftime("%Y-%m-%d"),
                "product": name,
                "sales_quantity": float(val),
            })

    df = pd.DataFrame(records)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(DATA_DIR / "sales_history.csv", index=False)
    return df

if __name__ == "__main__":
    df = generate_sales_history()
    print(f"Generated {len(df)} sales records across {len(PRODUCTS)} products.")
