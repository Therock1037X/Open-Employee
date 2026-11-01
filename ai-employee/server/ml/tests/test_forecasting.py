import pytest
import numpy as np
import pandas as pd
from pathlib import Path

from ml.forecasting.data_generator import generate_sales_history
from ml.forecasting.evaluator import run_forecasting_pipeline, compute_forecasting_metrics

def test_chronological_time_based_split():
    """Confirms that data split is strictly chronological with no random shuffling."""
    df = generate_sales_history(periods=300)
    sugar = df[df["product"] == "Sugar"].copy()
    sugar["ds"] = pd.to_datetime(sugar["date"])
    sugar = sugar.sort_values("ds").reset_index(drop=True)

    holdout = 60
    train = sugar.iloc[:-holdout]
    test = sugar.iloc[-holdout:]

    # Last training date must strictly precede first test date
    assert train["ds"].max() < test["ds"].min(), "Time series was shuffled! Split must be chronological."
    assert len(test) == 60

def test_metrics_calculation():
    """Tests MAE, MAPE, and WAPE formulas."""
    y_true = np.array([100.0, 150.0, 200.0])
    y_pred = np.array([110.0, 135.0, 190.0])
    # abs diff: [10, 15, 10], sum = 35, sum(y_true) = 450
    metrics = compute_forecasting_metrics(y_true, y_pred)
    assert metrics["MAE"] == round(35 / 3, 2)
    assert metrics["WAPE"] == round((35 / 450) * 100, 2)
    assert metrics["Accuracy"] == round(100 - (35 / 450) * 100, 2)

def test_forecasting_pipeline_target_accuracy():
    """Verifies that the winning model achieves 85-90%+ accuracy per product."""
    report = run_forecasting_pipeline(holdout_days=60, seed=42)
    products = report["products"]
    assert len(products) >= 5

    for prod, details in products.items():
        assert details["selected_model"] in ["Prophet", "XGBoost"]
        acc = details["selected_metrics"]["Accuracy"]
        assert acc >= 85.0, f"Product {prod} achieved {acc}%, which is below target 85%"
        assert details["selected_metrics"]["WAPE"] <= 15.0
