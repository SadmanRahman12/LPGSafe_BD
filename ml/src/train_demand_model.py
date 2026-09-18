"""
LPGSafe Bangladesh — Demand Forecasting Model Training
======================================================
Trains XGBoost regression with time-aware validation for LPG demand forecasting.

Run: python ml/src/train_demand_model.py
"""

import os, json, warnings
import numpy as np
import pandas as pd
import joblib
from datetime import datetime

from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

warnings.filterwarnings("ignore")

DATA_PATH  = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "demand_data.csv")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

FEATURES = [
    "division_enc",
    "district_enc",
    "month",
    "day_of_year",
    "prev_week_demand",
    "prev_month_demand",
    "seasonal_factor",
]
TARGET = "demand_quantity_kg"


def train():
    print("=" * 60)
    print("LPGSafe — Demand Forecasting Model Training")
    print("WARNING: Training on SYNTHETIC data.")
    print("=" * 60)

    df = pd.read_csv(DATA_PATH)
    df = df.sort_values("week_start").reset_index(drop=True)
    print(f"\nLoaded {len(df):,} records")

    # Encode categoricals
    le_div  = LabelEncoder()
    le_dist = LabelEncoder()
    df["division_enc"] = le_div.fit_transform(df["division"])
    df["district_enc"] = le_dist.fit_transform(df["district"])

    X = df[FEATURES].values
    y = df[TARGET].values

    # Time-aware cross-validation
    tscv = TimeSeriesSplit(n_splits=5)
    fold_maes, fold_rmses, fold_r2s = [], [], []

    for fold, (train_idx, test_idx) in enumerate(tscv.split(X)):
        X_tr, X_te = X[train_idx], X[test_idx]
        y_tr, y_te = y[train_idx], y[test_idx]

        model = xgb.XGBRegressor(
            n_estimators=300, max_depth=6, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8, random_state=42,
            verbosity=0, n_jobs=-1,
        )
        model.fit(X_tr, y_tr)
        y_pred = model.predict(X_te)

        mae  = mean_absolute_error(y_te, y_pred)
        rmse = np.sqrt(mean_squared_error(y_te, y_pred))
        r2   = r2_score(y_te, y_pred)

        fold_maes.append(mae)
        fold_rmses.append(rmse)
        fold_r2s.append(r2)
        print(f"  Fold {fold+1}: MAE={mae:.0f}  RMSE={rmse:.0f}  R²={r2:.4f}")

    avg_mae  = float(np.mean(fold_maes))
    avg_rmse = float(np.mean(fold_rmses))
    avg_r2   = float(np.mean(fold_r2s))

    print(f"\n── Time-Series CV Summary ──")
    print(f"  Avg MAE:  {avg_mae:.0f} kg")
    print(f"  Avg RMSE: {avg_rmse:.0f} kg")
    print(f"  Avg R²:   {avg_r2:.4f}")

    # Final model on all data
    final_model = xgb.XGBRegressor(
        n_estimators=300, max_depth=6, learning_rate=0.05,
        subsample=0.8, colsample_bytree=0.8, random_state=42,
        verbosity=0, n_jobs=-1,
    )
    final_model.fit(X, y)

    model_path = os.path.join(MODELS_DIR, "demand_forecast_model.joblib")
    joblib.dump({
        "model": final_model,
        "features": FEATURES,
        "le_division": le_div,
        "le_district": le_dist,
        "division_classes": list(le_div.classes_),
        "district_classes": list(le_dist.classes_),
    }, model_path)
    print(f"\n✅ Saved to: {model_path}")

    metrics = {
        "dataset": "SYNTHETIC — LPGSafe Bangladesh Demo Data",
        "training_date": datetime.utcnow().isoformat() + "Z",
        "dataset_size": len(df),
        "algorithm": "XGBoost Regressor",
        "validation": "TimeSeriesSplit (5-fold)",
        "features": FEATURES,
        "cv_mae_avg": round(avg_mae, 2),
        "cv_rmse_avg": round(avg_rmse, 2),
        "cv_r2_avg": round(avg_r2, 4),
        "fold_maes": [round(v, 2) for v in fold_maes],
        "fold_rmses": [round(v, 2) for v in fold_rmses],
        "fold_r2s": [round(v, 4) for v in fold_r2s],
        "disclaimer": "SYNTHETIC training data. For demo only.",
    }

    metrics_path = os.path.join(MODELS_DIR, "demand_forecast_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"   Metrics: {metrics_path}")
    return model_path, metrics


if __name__ == "__main__":
    train()
