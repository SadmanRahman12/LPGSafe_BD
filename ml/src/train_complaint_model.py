"""
LPGSafe Bangladesh — Complaint Classification Model Training
============================================================
Trains TF-IDF + Logistic Regression for complaint category classification.

Run: python ml/src/train_complaint_model.py
"""

import os, json, warnings
import numpy as np
import pandas as pd
import joblib
from datetime import datetime

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, classification_report,
    confusion_matrix, f1_score
)

warnings.filterwarnings("ignore")

DATA_PATH  = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "complaint_data.csv")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

CATEGORIES = [
    "OVERPRICING", "GAS_LEAKAGE", "DAMAGED_CYLINDER",
    "UNSAFE_INSTALLATION", "POOR_EQUIPMENT", "UNLICENSED_DEALER", "OTHER"
]


def train():
    print("=" * 60)
    print("LPGSafe — Complaint Classification Training")
    print("WARNING: Training on SYNTHETIC data.")
    print("=" * 60)

    df = pd.read_csv(DATA_PATH)
    print(f"\nLoaded {len(df):,} records")
    print(df["category"].value_counts().to_string())

    X = df["text"].values
    y = df["category"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=8000,
            min_df=2,
            sublinear_tf=True,
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            random_state=42,
            class_weight="balanced",
            C=1.5,
        )),
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    f1  = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    cm  = confusion_matrix(y_test, y_pred, labels=CATEGORIES).tolist()
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

    print(f"\n── TF-IDF + Logistic Regression ──")
    print(f"  Accuracy: {acc:.4f}")
    print(f"  F1 (weighted): {f1:.4f}")
    print(classification_report(y_test, y_pred, zero_division=0))

    # Sample predictions
    samples = [
        "The dealer charged me 1900 taka for a 12kg cylinder. Government price is much less.",
        "I can smell gas from the kitchen. Cylinder is leaking badly.",
        "The cylinder has dents and rust. Very dangerous to use.",
    ]
    print("Sample predictions:")
    for text in samples:
        proba = pipeline.predict_proba([text])[0]
        top   = pipeline.classes_[np.argmax(proba)]
        conf  = np.max(proba)
        print(f"  \"{text[:50]}...\" → {top} ({conf:.0%})")

    model_path = os.path.join(MODELS_DIR, "complaint_classifier.joblib")
    joblib.dump({"pipeline": pipeline, "categories": CATEGORIES}, model_path)
    print(f"\n✅ Saved to: {model_path}")

    # Per-class metrics
    per_class = {}
    for cat in CATEGORIES:
        if cat in report:
            per_class[cat] = {
                "precision": round(report[cat]["precision"], 4),
                "recall":    round(report[cat]["recall"],    4),
                "f1":        round(report[cat]["f1-score"],  4),
                "support":   int(report[cat]["support"]),
            }

    metrics = {
        "dataset": "SYNTHETIC — LPGSafe Bangladesh Demo Data",
        "training_date": datetime.utcnow().isoformat() + "Z",
        "dataset_size": len(df),
        "algorithm": "TF-IDF + Logistic Regression",
        "categories": CATEGORIES,
        "accuracy": round(acc, 4),
        "f1_weighted": round(f1, 4),
        "per_class": per_class,
        "confusion_matrix": cm,
        "disclaimer": "SYNTHETIC training data. Human review required for all classifications.",
    }

    metrics_path = os.path.join(MODELS_DIR, "complaint_classifier_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"   Metrics: {metrics_path}")
    return model_path, metrics


if __name__ == "__main__":
    train()
