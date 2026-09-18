"""
LPGSafe Bangladesh — FastAPI ML Service
========================================
Serves all 4 ML models via REST endpoints.

Start: uvicorn ml.api.main:app --host 0.0.0.0 --port 8000 --reload
  (Run from project root: c:\\...\\LPGSafe_BD)

API Key: set ML_API_KEY in .env (default: dev-ml-secret-key)
"""

import os, json, sys, warnings
from pathlib import Path
from typing import Optional, List
from datetime import datetime

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

warnings.filterwarnings("ignore")

# ── Resolve paths ─────────────────────────────────────────────────────────────
ML_DIR     = Path(__file__).resolve().parent.parent   # ml/
MODELS_DIR = ML_DIR / "models"

API_KEY = os.getenv("ML_API_KEY", "dev-ml-secret-key")

# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="LPGSafe Bangladesh — AI/ML Service",
    description=(
        "Decision-support AI service. Predictions are for human review only. "
        "AI does not make legally binding regulatory decisions."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load models lazily ────────────────────────────────────────────────────────
_models: dict = {}

def load_model(name: str):
    if name not in _models:
        path = MODELS_DIR / f"{name}.joblib"
        if not path.exists():
            raise HTTPException(
                status_code=503,
                detail=f"Model '{name}' not trained yet. Run training scripts first."
            )
        _models[name] = joblib.load(path)
    return _models[name]

def load_metrics(name: str) -> dict:
    path = MODELS_DIR / f"{name}.json"
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return {}

# ── Auth ──────────────────────────────────────────────────────────────────────
def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return x_api_key

# ── Pydantic Schemas ──────────────────────────────────────────────────────────

class SafetyRiskRequest(BaseModel):
    dealer_id: str
    inspection_failures: int = Field(ge=0, default=0)
    previous_violations: int = Field(ge=0, default=0)
    complaints_last_90_days: int = Field(ge=0, default=0)
    leakage_complaints: int = Field(ge=0, default=0)
    certification_expired: int = Field(ge=0, le=1, default=0)
    cylinder_age_days: int = Field(ge=0, default=365)
    regulator_condition_enc: int = Field(ge=0, le=2, default=0, description="0=GOOD,1=FAIR,2=POOR")
    tube_condition_enc: int = Field(ge=0, le=2, default=0, description="0=GOOD,1=FAIR,2=POOR")
    installation_ok: int = Field(ge=0, le=1, default=1)
    storage_ok: int = Field(ge=0, le=1, default=1)
    ventilation_ok: int = Field(ge=0, le=1, default=1)
    fire_equipment: int = Field(ge=0, le=1, default=1)
    days_since_inspection: int = Field(ge=0, default=30)

class PriceAnomalyRequest(BaseModel):
    dealer_id: str
    cylinder_size_kg: float = Field(gt=0, default=12.0)
    reported_price: float = Field(gt=0)
    reference_price: float = Field(gt=0)
    historical_avg_price: Optional[float] = None
    regional_avg_price: Optional[float] = None
    day_of_week: Optional[int] = Field(ge=0, le=6, default=0)
    month: Optional[int] = Field(ge=1, le=12, default=1)

class DemandForecastRequest(BaseModel):
    division: str
    district: str
    month: int = Field(ge=1, le=12)
    day_of_year: int = Field(ge=1, le=366, default=180)
    prev_week_demand: float = Field(gt=0)
    prev_month_demand: float = Field(gt=0)
    seasonal_factor: float = Field(default=1.0)

class ComplaintClassifyRequest(BaseModel):
    text: str = Field(min_length=5, max_length=2000)
    complaint_id: Optional[str] = None

# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    trained = []
    for name in ["safety_risk_model", "price_anomaly_model", "demand_forecast_model", "complaint_classifier"]:
        if (MODELS_DIR / f"{name}.joblib").exists():
            trained.append(name)
    return {
        "status": "healthy",
        "service": "LPGSafe Bangladesh AI Service",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "models_trained": trained,
        "disclaimer": "AI predictions are decision-support only. Human review required.",
    }


@app.post("/predict/safety-risk")
def predict_safety_risk(
    request: SafetyRiskRequest,
    _: str = Depends(verify_api_key),
):
    artifact = load_model("safety_risk_model")
    model    = artifact["model"]
    features = artifact["features"]
    scaler   = artifact.get("scaler")

    row = np.array([[
        request.inspection_failures,
        request.previous_violations,
        request.complaints_last_90_days,
        request.leakage_complaints,
        request.certification_expired,
        request.cylinder_age_days,
        request.regulator_condition_enc,
        request.tube_condition_enc,
        request.installation_ok,
        request.storage_ok,
        request.ventilation_ok,
        request.fire_equipment,
        request.days_since_inspection,
    ]])

    if scaler is not None:
        row = scaler.transform(row)

    prob      = float(model.predict_proba(row)[0][1])
    risk_score = round(prob * 100, 1)

    if risk_score >= 75:
        risk_level = "CRITICAL"
    elif risk_score >= 55:
        risk_level = "HIGH"
    elif risk_score >= 35:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Simple rule-based SHAP-like explanation
    factors = []
    if request.inspection_failures >= 2:
        factors.append(f"{request.inspection_failures} failed inspection(s)")
    if request.certification_expired:
        factors.append("Certification is expired")
    if request.leakage_complaints:
        factors.append("Recent leakage complaint(s) on record")
    if request.complaints_last_90_days >= 3:
        factors.append(f"{request.complaints_last_90_days} complaints in last 90 days")
    if request.cylinder_age_days > 1825:
        factors.append("Cylinders older than 5 years in use")
    if request.days_since_inspection > 365:
        factors.append("No inspection in over 1 year")
    if request.regulator_condition_enc == 2:
        factors.append("Regulator in POOR condition")
    if request.tube_condition_enc == 2:
        factors.append("Rubber tube in POOR condition")
    if not request.fire_equipment:
        factors.append("No fire safety equipment present")

    return {
        "dealer_id": request.dealer_id,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "probability_high_risk": round(prob, 4),
        "contributing_factors": factors if factors else ["No major risk factors identified"],
        "recommended_action": {
            "CRITICAL": "Immediate suspension and emergency inspection required.",
            "HIGH":     "Schedule priority re-inspection within 7 days.",
            "MEDIUM":   "Monitor closely. Schedule routine inspection within 30 days.",
            "LOW":      "Routine monitoring. Next scheduled inspection as planned.",
        }[risk_level],
        "disclaimer": (
            "This is a SYNTHETIC-DATA-TRAINED AI prediction for decision-support only. "
            "Human inspector review is mandatory before any regulatory action."
        ),
        "model": "safety_risk_model",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.post("/detect/price-anomaly")
def detect_price_anomaly(
    request: PriceAnomalyRequest,
    _: str = Depends(verify_api_key),
):
    artifact     = load_model("price_anomaly_model")
    model        = artifact["model"]
    scaler       = artifact["scaler"]
    contamination = artifact["contamination"]

    hist_avg = request.historical_avg_price or request.reference_price
    reg_avg  = request.regional_avg_price   or request.reference_price
    deviation_pct = (request.reported_price - request.reference_price) / request.reference_price * 100

    row = np.array([[
        request.cylinder_size_kg,
        request.reported_price,
        request.reference_price,
        hist_avg,
        reg_avg,
        deviation_pct,
        request.day_of_week or 0,
        request.month or 1,
    ]])
    row_scaled = scaler.transform(row)

    raw_pred  = model.predict(row_scaled)[0]
    score     = float(-model.score_samples(row_scaled)[0])  # higher = more anomalous
    is_anomaly = (raw_pred == -1)

    # Normalize to 0–1
    anomaly_score = min(1.0, max(0.0, (score - 0.2) / 0.6))

    return {
        "dealer_id": request.dealer_id,
        "is_anomaly": bool(is_anomaly),
        "anomaly_score": round(anomaly_score, 4),
        "price_deviation_pct": round(deviation_pct, 2),
        "status": "POTENTIAL_PRICE_ANOMALY" if is_anomaly else "NORMAL",
        "message": (
            "Potential price anomaly detected. Requires human review before any action."
            if is_anomaly else
            "Price appears within normal range."
        ),
        "disclaimer": (
            "AI anomaly detection must not be used to conclude guilt. "
            "Human investigation required."
        ),
        "model": "price_anomaly_model",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.post("/forecast/demand")
def forecast_demand(
    request: DemandForecastRequest,
    _: str = Depends(verify_api_key),
):
    artifact   = load_model("demand_forecast_model")
    model      = artifact["model"]
    le_div     = artifact["le_division"]
    le_dist    = artifact["le_district"]
    div_classes  = artifact["division_classes"]
    dist_classes = artifact["district_classes"]

    # Safe encode: fallback to 0 for unknown labels
    try:
        div_enc  = le_div.transform([request.division])[0]
    except ValueError:
        div_enc = 0

    try:
        dist_enc = le_dist.transform([request.district])[0]
    except ValueError:
        dist_enc = 0

    import math
    seasonal = 1.0 + 0.12 * math.sin((request.month - 1) * math.pi / 6)

    row = np.array([[
        div_enc,
        dist_enc,
        request.month,
        request.day_of_year,
        request.prev_week_demand,
        request.prev_month_demand,
        seasonal,
    ]])

    pred = float(model.predict(row)[0])
    pred = max(0.0, pred)

    # Simple confidence interval: ±12%
    low  = round(pred * 0.88, 1)
    high = round(pred * 1.12, 1)

    return {
        "district": request.district,
        "division": request.division,
        "predicted_demand_kg": round(pred, 1),
        "forecast_range_low_kg": low,
        "forecast_range_high_kg": high,
        "seasonal_factor": round(seasonal, 4),
        "disclaimer": "Demand forecast based on SYNTHETIC training data. Use for planning guidance only.",
        "model": "demand_forecast_model",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.post("/classify/complaint")
def classify_complaint(
    request: ComplaintClassifyRequest,
    _: str = Depends(verify_api_key),
):
    artifact  = load_model("complaint_classifier")
    pipeline  = artifact["pipeline"]
    categories = artifact["categories"]

    proba   = pipeline.predict_proba([request.text])[0]
    classes = pipeline.classes_
    top_idx = int(np.argmax(proba))
    top_cat = classes[top_idx]
    confidence = float(proba[top_idx])

    # Second best
    sorted_idx = np.argsort(proba)[::-1]
    alternatives = [
        {"category": classes[i], "confidence": round(float(proba[i]), 4)}
        for i in sorted_idx[1:3]
    ]

    return {
        "complaint_id": request.complaint_id,
        "predicted_category": top_cat,
        "confidence": round(confidence, 4),
        "confidence_pct": f"{confidence:.0%}",
        "alternative_categories": alternatives,
        "priority_suggestion": (
            "HIGH" if top_cat in ["GAS_LEAKAGE", "DAMAGED_CYLINDER", "UNSAFE_INSTALLATION"]
            else "MEDIUM" if top_cat in ["OVERPRICING", "POOR_EQUIPMENT"]
            else "LOW"
        ),
        "disclaimer": (
            "AI classification is a suggestion only. "
            "Human review is required before actioning any complaint."
        ),
        "model": "complaint_classifier",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/models")
def list_models(_: str = Depends(verify_api_key)):
    model_configs = [
        {
            "id":        "safety_risk_model",
            "name":      "Safety Risk Predictor",
            "algorithm": "XGBoost / Random Forest / Logistic Regression",
            "task":      "binary_classification",
            "metrics_file": "safety_risk_metrics",
        },
        {
            "id":        "price_anomaly_model",
            "name":      "Price Anomaly Detector",
            "algorithm": "Isolation Forest",
            "task":      "anomaly_detection",
            "metrics_file": "price_anomaly_metrics",
        },
        {
            "id":        "demand_forecast_model",
            "name":      "Demand Forecaster",
            "algorithm": "XGBoost Regressor",
            "task":      "regression",
            "metrics_file": "demand_forecast_metrics",
        },
        {
            "id":        "complaint_classifier",
            "name":      "Complaint Classifier",
            "algorithm": "TF-IDF + Logistic Regression",
            "task":      "multiclass_classification",
            "metrics_file": "complaint_classifier_metrics",
        },
    ]
    result = []
    for m in model_configs:
        is_trained = (MODELS_DIR / f"{m['id']}.joblib").exists()
        metrics    = load_metrics(m["metrics_file"]) if is_trained else {}
        result.append({
            **m,
            "is_trained": is_trained,
            "training_date": metrics.get("training_date"),
            "dataset_size": metrics.get("dataset_size"),
            "metrics": metrics,
        })
    return {"models": result}


@app.get("/models/{model_id}")
def get_model(model_id: str, _: str = Depends(verify_api_key)):
    valid = ["safety_risk_model", "price_anomaly_model", "demand_forecast_model", "complaint_classifier"]
    if model_id not in valid:
        raise HTTPException(status_code=404, detail="Model not found")

    metrics_map = {
        "safety_risk_model":     "safety_risk_metrics",
        "price_anomaly_model":   "price_anomaly_metrics",
        "demand_forecast_model": "demand_forecast_metrics",
        "complaint_classifier":  "complaint_classifier_metrics",
    }
    is_trained = (MODELS_DIR / f"{model_id}.joblib").exists()
    metrics    = load_metrics(metrics_map[model_id]) if is_trained else {}

    return {
        "id":        model_id,
        "is_trained": is_trained,
        "metrics":   metrics,
    }
