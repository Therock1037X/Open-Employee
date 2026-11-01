import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List

from .data_generator import generate_sales_history
from .models import ProphetForecaster, XGBoostForecaster

MODELS_DIR = Path(__file__).resolve().parent.parent / "models" / "forecasting"

def compute_forecasting_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Computes time-series evaluation metrics:
    - MAE (Mean Absolute Error)
    - MAPE (Mean Absolute Percentage Error)
    - WAPE (Weighted Absolute Percentage Error)
    - Accuracy % (100 - WAPE)
    """
    mae = float(np.mean(np.abs(y_true - y_pred)))
    # Avoid division by zero with small epsilon
    mape = float(np.mean(np.abs((y_true - y_pred) / np.maximum(1e-4, y_true))) * 100)
    wape = float((np.sum(np.abs(y_true - y_pred)) / np.maximum(1e-4, np.sum(y_true))) * 100)
    accuracy = float(max(0.0, 100.0 - wape))

    return {
        "MAE": round(mae, 2),
        "MAPE": round(mape, 2),
        "WAPE": round(wape, 2),
        "Accuracy": round(accuracy, 2),
    }

def run_forecasting_pipeline(holdout_days: int = 60, seed: int = 42) -> Dict[str, Any]:
    """
    Trains Prophet and XGBoost per product with time-based validation (last 60 days held out).
    Selects and saves the winning model per product.
    Strictly NO random shuffling to preserve chronological causality.
    """
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    sales_df = generate_sales_history(seed=seed)
    sales_df["ds"] = pd.to_datetime(sales_df["date"])
    sales_df["y"] = sales_df["sales_quantity"]

    products = sales_df["product"].unique()
    product_reports = {}

    print(f"\n--- Running Time-Based Product Forecasting (60 Days Holdout) ---")

    for prod in products:
        prod_data = sales_df[sales_df["product"] == prod].sort_values("ds").reset_index(drop=True)

        # Chronological split: strictly NO random shuffling!
        train_df = prod_data.iloc[:-holdout_days].copy()
        test_df = prod_data.iloc[-holdout_days:].copy()
        y_true = test_df["y"].values

        # 1. Fit & Evaluate Prophet
        prophet_model = ProphetForecaster().fit(train_df)
        prophet_preds = prophet_model.predict(test_df)
        prophet_metrics = compute_forecasting_metrics(y_true, prophet_preds)

        # 2. Fit & Evaluate XGBoost
        xgb_model = XGBoostForecaster(random_state=seed).fit(train_df)
        xgb_preds = xgb_model.predict(prod_data, test_df["ds"])
        xgb_metrics = compute_forecasting_metrics(y_true, xgb_preds)

        # 3. Model Selection: Choose model with lower WAPE (higher accuracy)
        if prophet_metrics["WAPE"] <= xgb_metrics["WAPE"]:
            winner_name = "Prophet"
            winning_model = prophet_model
            winning_metrics = prophet_metrics
        else:
            winner_name = "XGBoost"
            winning_model = xgb_model
            winning_metrics = xgb_metrics

        # 4. Save winning model artifact
        safe_filename = prod.lower().replace(" ", "_") + "_best_model.joblib"
        joblib.dump(winning_model, MODELS_DIR / safe_filename)

        product_reports[prod] = {
            "holdout_days": holdout_days,
            "prophet": prophet_metrics,
            "xgboost": xgb_metrics,
            "selected_model": winner_name,
            "selected_metrics": winning_metrics,
            "artifact": safe_filename,
        }

        print(f"Product: {prod:12} | Winner: {winner_name:7} | WAPE: {winning_metrics['WAPE']}% | Accuracy: {winning_metrics['Accuracy']}%")

    return {
        "validation_strategy": f"Time-based chronological split (Last {holdout_days} days strictly held out, no random shuffling)",
        "products": product_reports,
    }

if __name__ == "__main__":
    report = run_forecasting_pipeline()
    print(report)
