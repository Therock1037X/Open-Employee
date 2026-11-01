import os
import sys
import json
import random
import numpy as np
from pathlib import Path

# Add server root to sys.path so ml imports work cleanly
SERVER_ROOT = Path(__file__).resolve().parent.parent
if str(SERVER_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVER_ROOT))

# Fixed seed for entire pipeline
FIXED_SEED = 42
random.seed(FIXED_SEED)
np.random.seed(FIXED_SEED)

from ml.entry_parser.dataset import create_or_load_dataset
from ml.entry_parser.trainer import EntryParserTrainer
from ml.forecasting.evaluator import run_forecasting_pipeline

REPORTS_DIR = Path(__file__).resolve().parent / "reports"
MODELS_DIR = Path(__file__).resolve().parent / "models"

def run_pipeline() -> dict:
    print("=" * 65)
    print("OPEN EMPLOYEE ML TRAINING PIPELINE (SEED: 42)")
    print("=" * 65)

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Entry Parser Dataset & QLoRA Fine-tuning
    print("\n[Step 1/2] Loading dataset and training QLoRA Entry Parser...")
    train_data, val_data, test_data = create_or_load_dataset()
    print(f"Data Split: Train={len(train_data)} (80%), Val={len(val_data)} (10%), Test={len(test_data)} (10% unseen entities)")

    parser_trainer = EntryParserTrainer()
    parser_results = parser_trainer.train_and_search_hyperparameters(train_data, val_data, test_data)

    print("\n--- Entry Parser Results ---")
    print(f"Exact Match Accuracy: {parser_results['evaluation']['exact_match_accuracy']}%")
    for f, acc in parser_results['evaluation']['per_field_accuracy'].items():
        print(f"  - {f}: {acc}%")

    # 2. Time-Series Product Demand Forecasting
    print("\n[Step 2/2] Training Prophet & XGBoost Forecasters (Time-based 60 days holdout)...")
    forecasting_results = run_forecasting_pipeline(holdout_days=60, seed=FIXED_SEED)

    print("\n--- Forecasting Product Summary ---")
    for prod, info in forecasting_results["products"].items():
        winner = info["selected_model"]
        wape = info["selected_metrics"]["WAPE"]
        acc = info["selected_metrics"]["Accuracy"]
        print(f"  - {prod:12} -> Winner: {winner:7} (WAPE: {wape}%, Accuracy: {acc}%)")

    # 3. Compile Master Metrics Report
    master_report = {
        "pipeline_metadata": {
            "fixed_seed": FIXED_SEED,
            "status": "COMPLETED_SUCCESSFULLY",
            "entry_parser_model": parser_results["model_name"],
            "forecasting_models_evaluated": ["Prophet", "XGBoost"],
        },
        "entry_parser": {
            "architecture": parser_results["architecture"],
            "hyperparameters": parser_results["hyperparameters"],
            "epochs": parser_results["epochs"],
            "early_stopping_triggered": parser_results["early_stopping_triggered"],
            "retraining_iterations": parser_results["retraining_iterations_performed"],
            "metrics": {
                "exact_match_accuracy": parser_results["evaluation"]["exact_match_accuracy"],
                "per_field_accuracy": parser_results["evaluation"]["per_field_accuracy"],
                "confusion_matrix_by_language": parser_results["evaluation"]["confusion_matrix_by_language"],
            },
        },
        "forecasting": forecasting_results,
    }

    metrics_path = REPORTS_DIR / "metrics.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(master_report, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 65)
    print(f"SUCCESS: Pipeline complete. Metrics logged to {metrics_path}")
    print("=" * 65)
    return master_report

if __name__ == "__main__":
    run_pipeline()
