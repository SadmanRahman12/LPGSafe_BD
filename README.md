# LPGSafe Bangladesh

National LPG Safety, Verification, Price Transparency & Regulatory Compliance Network.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Demo Data
```bash
npm run db:setup
```
*Note: Includes automated local PostgreSQL runner (`PGlite`) for zero-config offline development. You can also point `DATABASE_URL` in `.env` to any external PostgreSQL instance (Neon, Supabase, Docker).*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Accounts
All accounts share password: `SafePass123!`

- **Consumer**: `consumer@example.com`
- **Dealer**: `dealer@example.com`
- **Inspector**: `inspector@example.com`
- **Admin**: `admin@example.com`

---

## Public Features (Part 1)
- `/`: Landing page with hero, trust metrics, problem/solution, 4-stage supply chain, and emergency hotlines.
- `/verify`: Cylinder serial & QR verification (`LPG-BD-2026-000123` verified, `LPG-BD-2026-000124` expired, `LPG-BD-2026-000125` suspended).
- `/dealers`: Authorized dealer directory filtered by Bangladesh divisions.
- `/prices`: BERC declared reference price monitoring with automated price violation flags.
- `/safety`: Comprehensive safety manual covering 6 categories, do's/don'ts, and 999 emergency hotlines.
- `/login`, `/register`, `/forgot-password`: NextAuth authentication with role-based access control (RBAC).

---

---

## 4-Part Safe Build Summary
- **PART 1 (Complete)**: Foundation + Public Website + Authentication + Core Database.
- **PART 2 (Complete)**: Consumer + Dealer + Cylinder + Price + Complaint Portals.
- **PART 3 (Complete)**: Inspector Digital Audits + Certification Workflows + Admin Command Center + Supply Chain + IoT Telemetry.
- **PART 4 (Complete)**: AI/ML Service (FastAPI) + Model Registry + Retraining Interface + Safety Predictions + Risk Integration.

---

## AI/ML Machine Learning Service (Part 4)

The platform includes a dedicated Machine Learning intelligence layer located in `ml/`.

### 1. Python ML Service Setup
```bash
# Optional: Setup Python virtual environment
cd ml
pip install -r requirements.txt

# Generate synthetic training data (clearly marked demo datasets)
python src/generate_synthetic_data.py

# Train models
python src/train_risk_model.py
python src/train_price_model.py
python src/train_demand_model.py
python src/train_complaint_model.py

# Start FastAPI ML microservice (port 8000)
uvicorn ml.api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Decision-Support AI Features
- **Dealer Safety Risk Scoring**: Assesses dealer violation probability using XGBoost/Random Forest (`/api/ai/predict/safety-risk`).
- **Fair Price Anomaly Detector**: Flags price-gouging outliers using Isolation Forest (`/api/ai/predict/price-anomaly`).
- **Demand Forecasting**: Multi-horizon weekly regional cylinder demand forecaster (`/api/ai/predict/demand`).
- **Complaint Triage NLP**: Auto-categorizes citizen safety complaints via TF-IDF + Logistic Regression (`/api/ai/classify/complaint`).
- **Admin AI Intelligence Hub**: `/admin/ai` — Live alerts, triage, model registry (`/admin/ai/models`), and retraining controls (`/admin/ai/training`).

*Note: AI outputs strictly serve as human-in-the-loop decision support. Regulatory and legal decisions remain with authorized officers.*