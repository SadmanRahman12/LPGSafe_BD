"""
LPGSafe Bangladesh — Synthetic Data Generator
==============================================
Generates clearly-labelled SYNTHETIC / DEMO datasets for model training.
DO NOT use these datasets for real regulatory enforcement decisions.

Run: python ml/src/generate_synthetic_data.py
Output: ml/data/processed/*.csv
"""

import numpy as np
import pandas as pd
import os
import random
from datetime import datetime, timedelta

SEED = 42
np.random.seed(SEED)
random.seed(SEED)

# Bangladesh geography
DIVISIONS = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Sylhet", "Barishal", "Rangpur", "Mymensingh"]
DISTRICT_MAP = {
    "Dhaka":       ["Dhaka", "Gazipur", "Narayanganj", "Manikganj", "Munshiganj", "Narsingdi"],
    "Chattogram":  ["Chattogram", "Cox's Bazar", "Comilla", "Feni", "Noakhali", "Lakshmipur"],
    "Rajshahi":    ["Rajshahi", "Bogura", "Pabna", "Sirajganj", "Natore", "Naogaon"],
    "Khulna":      ["Khulna", "Jessore", "Satkhira", "Bagerhat", "Chuadanga", "Kushtia"],
    "Sylhet":      ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
    "Barishal":    ["Barishal", "Bhola", "Patuakhali", "Pirojpur", "Jhalokati", "Barguna"],
    "Rangpur":     ["Rangpur", "Dinajpur", "Kurigram", "Gaibandha", "Nilphamari", "Lalmonirhat"],
    "Mymensingh":  ["Mymensingh", "Netrokona", "Jamalpur", "Sherpur"],
}
CYLINDER_BRANDS = ["Jamuna", "Petrochem", "Basundhara", "BPC", "Oman Gas", "RPGCL"]
CYLINDER_SIZES  = [5.5, 12.0, 22.5, 33.0]
COMPLAINT_CATEGORIES = [
    "OVERPRICING", "GAS_LEAKAGE", "DAMAGED_CYLINDER",
    "UNSAFE_INSTALLATION", "POOR_EQUIPMENT", "UNLICENSED_DEALER", "OTHER"
]

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "processed")
os.makedirs(OUT_DIR, exist_ok=True)


# ── Helpers ─────────────────────────────────────────────────────────────────

def random_division():
    return random.choice(DIVISIONS)

def random_district(division):
    return random.choice(DISTRICT_MAP[division])

def random_date(start="2023-01-01", end="2026-09-01"):
    s = datetime.strptime(start, "%Y-%m-%d")
    e = datetime.strptime(end,   "%Y-%m-%d")
    delta = (e - s).days
    return s + timedelta(days=random.randint(0, delta))


# ── 1. Safety Dataset (10,000 records) ───────────────────────────────────────

def generate_safety_data(n=10_000):
    """
    Each row represents one dealer inspection snapshot.
    TARGET: high_risk  (1 = HIGH/CRITICAL risk, 0 = LOW/MEDIUM)
    """
    records = []
    for i in range(n):
        division   = random_division()
        district   = random_district(division)
        cert_expired = random.random() < 0.15

        # Correlated feature block
        inspection_failures   = np.random.poisson(0.6) if not cert_expired else np.random.poisson(2.1)
        previous_violations   = np.random.poisson(0.4)
        complaints_90d        = np.random.poisson(0.8) if not cert_expired else np.random.poisson(2.5)
        leakage_complaints    = np.random.binomial(1, 0.08 if not cert_expired else 0.30)
        cylinder_age_days     = random.randint(90, 3650)
        regulator_condition   = random.choices(["GOOD","FAIR","POOR"], weights=[60,30,10])[0]
        tube_condition        = random.choices(["GOOD","FAIR","POOR"], weights=[65,25,10])[0]
        installation_ok       = int(random.random() > 0.10)
        storage_ok            = int(random.random() > 0.12)
        ventilation_ok        = int(random.random() > 0.15)
        fire_equipment        = int(random.random() > 0.25)
        days_since_inspection = random.randint(1, 730)

        # Derived risk score (used to set label)
        risk_raw = (
            inspection_failures * 15
            + previous_violations * 8
            + complaints_90d * 5
            + leakage_complaints * 20
            + int(cert_expired) * 25
            + (cylinder_age_days / 3650) * 10
            + (0 if regulator_condition == "GOOD" else (5 if regulator_condition == "FAIR" else 15))
            + (0 if tube_condition == "GOOD"      else (5 if tube_condition == "FAIR"      else 15))
            + (1 - installation_ok) * 10
            + (1 - storage_ok)      * 8
            + (1 - ventilation_ok)  * 7
            + (1 - fire_equipment)  * 5
            + (days_since_inspection / 730) * 8
            + random.gauss(0, 5)          # noise
        )
        risk_score = max(0.0, min(100.0, risk_raw))
        high_risk  = int(risk_score >= 55)

        records.append({
            "SYNTHETIC_DATA": True,
            "dealer_id":             f"DLR-{i:06d}",
            "division":              division,
            "district":              district,
            "inspection_failures":   inspection_failures,
            "previous_violations":   previous_violations,
            "complaints_last_90_days": complaints_90d,
            "leakage_complaints":    leakage_complaints,
            "certification_expired": int(cert_expired),
            "cylinder_age_days":     cylinder_age_days,
            "regulator_condition_enc": {"GOOD": 0, "FAIR": 1, "POOR": 2}[regulator_condition],
            "tube_condition_enc":      {"GOOD": 0, "FAIR": 1, "POOR": 2}[tube_condition],
            "installation_ok":       installation_ok,
            "storage_ok":            storage_ok,
            "ventilation_ok":        ventilation_ok,
            "fire_equipment":        fire_equipment,
            "days_since_inspection": days_since_inspection,
            "risk_score":            round(risk_score, 2),
            "high_risk":             high_risk,
        })

    df = pd.DataFrame(records)
    path = os.path.join(OUT_DIR, "safety_data.csv")
    df.to_csv(path, index=False)
    print(f"[SYNTHETIC] Safety data: {len(df):,} rows → {path}")
    print(f"  High-risk rate: {df.high_risk.mean():.1%}")
    return df


# ── 2. Price Dataset (20,000 records) ────────────────────────────────────────

def generate_price_data(n=20_000):
    """
    Each row is one reported price observation.
    TARGET: is_anomaly  (1 = price anomaly, 0 = normal)
    """
    records = []
    ref_prices = {5.5: 650, 12.0: 1450, 22.5: 2700, 33.0: 3900}  # BDT

    for i in range(n):
        division      = random_division()
        district      = random_district(division)
        cyl_size      = random.choice(CYLINDER_SIZES)
        ref_price     = ref_prices[cyl_size]
        date          = random_date()
        day_of_week   = date.weekday()
        month         = date.month
        is_anomaly    = random.random() < 0.08    # ~8% anomaly rate

        if is_anomaly:
            # Anomalous: significantly above or below reference
            direction = random.choice([1, -1])
            reported  = ref_price + direction * random.uniform(0.12 * ref_price, 0.35 * ref_price)
        else:
            # Normal: small ±5% variation
            reported  = ref_price + random.uniform(-0.05 * ref_price, 0.05 * ref_price)

        hist_avg = ref_price * random.uniform(0.97, 1.03)
        reg_avg  = ref_price * random.uniform(0.98, 1.02)

        records.append({
            "SYNTHETIC_DATA":        True,
            "dealer_id":             f"DLR-{random.randint(0, 999):06d}",
            "division":              division,
            "district":              district,
            "cylinder_size_kg":      cyl_size,
            "reported_price":        round(reported, 2),
            "reference_price":       ref_price,
            "historical_avg_price":  round(hist_avg, 2),
            "regional_avg_price":    round(reg_avg, 2),
            "price_deviation_pct":   round((reported - ref_price) / ref_price * 100, 2),
            "day_of_week":           day_of_week,
            "month":                 month,
            "is_anomaly":            int(is_anomaly),
        })

    df = pd.DataFrame(records)
    path = os.path.join(OUT_DIR, "price_data.csv")
    df.to_csv(path, index=False)
    print(f"[SYNTHETIC] Price data: {len(df):,} rows → {path}")
    print(f"  Anomaly rate: {df.is_anomaly.mean():.1%}")
    return df


# ── 3. Demand Dataset (5,000 records) ────────────────────────────────────────

def generate_demand_data(n=5_000):
    """
    Weekly district-level LPG demand observations.
    TARGET: demand_quantity (kg)
    """
    records = []
    base_date = datetime(2021, 1, 4)   # start Monday

    for i in range(n):
        division = random_division()
        district = random_district(division)
        week_offset = random.randint(0, 260)  # ~5 years
        date = base_date + timedelta(weeks=week_offset)
        month = date.month

        # Population-based base demand
        base = random.uniform(5_000, 80_000)  # kg per week

        # Seasonal factor (higher in winter Dec-Feb)
        seasonal = 1.0 + 0.12 * np.sin((month - 1) * np.pi / 6)

        demand = base * seasonal + random.gauss(0, base * 0.05)
        demand = max(0, demand)

        prev_week  = demand * random.uniform(0.90, 1.10)
        prev_month = demand * random.uniform(0.85, 1.15)

        records.append({
            "SYNTHETIC_DATA":          True,
            "district":                district,
            "division":                division,
            "week_start":              date.strftime("%Y-%m-%d"),
            "month":                   month,
            "day_of_year":             date.timetuple().tm_yday,
            "demand_quantity_kg":      round(demand, 1),
            "prev_week_demand":        round(prev_week, 1),
            "prev_month_demand":       round(prev_month, 1),
            "seasonal_factor":         round(seasonal, 4),
        })

    df = pd.DataFrame(records)
    path = os.path.join(OUT_DIR, "demand_data.csv")
    df.to_csv(path, index=False)
    print(f"[SYNTHETIC] Demand data: {len(df):,} rows → {path}")
    return df


# ── 4. Complaint Dataset (3,000 records) ─────────────────────────────────────

COMPLAINT_TEMPLATES = {
    "OVERPRICING": [
        "The dealer is selling LPG cylinders at {price} Taka which is far above the government set price.",
        "I was charged {price} BDT for a 12kg cylinder. The official price is much lower.",
        "This dealer overcharged me. Demanded {price} taka for a cylinder.",
        "Gas price too high. Paid {price} taka instead of standard rate.",
        "Dealer refused to sell at official price and demanded {price} taka.",
    ],
    "GAS_LEAKAGE": [
        "There is a gas leak from the cylinder installed at my home. I can smell gas strongly.",
        "LPG leaking from the regulator connection. Very dangerous situation.",
        "Cylinder delivered has leakage issue. Detected gas smell from valve.",
        "Gas pipe is leaking at the connection point. Immediate help needed.",
        "Strong smell of gas in kitchen. Suspect cylinder valve is leaking.",
    ],
    "DAMAGED_CYLINDER": [
        "Received a cylinder with visible dents and corrosion marks on the body.",
        "The cylinder provided has physical damage. I am worried about safety.",
        "Delivered a rusty and damaged LPG cylinder. Clearly unsafe to use.",
        "Cylinder neck appears bent and seal is damaged on delivery.",
        "Got a cylinder with cracks near the valve. Extremely unsafe.",
    ],
    "UNSAFE_INSTALLATION": [
        "Technician installed the gas line without proper safety checks.",
        "The installer did not follow safety protocols. No pressure test done.",
        "Gas connection installed by untrained person. No safety demonstration provided.",
        "Regulator installed improperly. Tube is too close to heat source.",
        "Installation was done very quickly without proper fittings or leak test.",
    ],
    "POOR_EQUIPMENT": [
        "Regulator provided is of substandard quality and does not fit properly.",
        "The rubber tube is cracked and low quality. Not up to safety standards.",
        "Equipment provided with cylinder is old and does not meet BDS standards.",
        "The gauge on the regulator is broken. Cannot check pressure safely.",
        "Hose provided is non-standard and shows signs of aging.",
    ],
    "UNLICENSED_DEALER": [
        "I believe this dealer does not have a valid license to sell LPG.",
        "No certification displayed at dealer premises. Appears to be unlicensed.",
        "Dealer could not produce any documentation when asked about license.",
        "This shop is operating without any visible government certification.",
        "No BSTI or Department of Explosives certificate visible at dealer.",
    ],
    "OTHER": [
        "Poor customer service and rude behavior from dealer staff.",
        "Cylinder weight was less than stated. Possible short delivery.",
        "Delivery was delayed by {days} days without any notice.",
        "Receipt not provided after payment. Suspicious transaction.",
        "Cylinder delivery person was intoxicated and reckless.",
    ],
}

def random_complaint_text(category):
    template = random.choice(COMPLAINT_TEMPLATES[category])
    return template.format(
        price=random.randint(1500, 2500),
        days=random.randint(2, 14),
    )

def generate_complaint_data(n=3_000):
    records = []
    for i in range(n):
        category = random.choice(COMPLAINT_CATEGORIES)
        text     = random_complaint_text(category)
        records.append({
            "SYNTHETIC_DATA": True,
            "complaint_id":   f"CMP-SYN-{i:05d}",
            "text":           text,
            "category":       category,
        })

    df = pd.DataFrame(records)
    path = os.path.join(OUT_DIR, "complaint_data.csv")
    df.to_csv(path, index=False)
    print(f"[SYNTHETIC] Complaint data: {len(df):,} rows → {path}")
    cat_counts = df.category.value_counts()
    print(cat_counts.to_string())
    return df


# ── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("LPGSafe Bangladesh — Synthetic Dataset Generator")
    print("WARNING: All data is SYNTHETIC/DEMO. Not for real regulatory use.")
    print("=" * 60)
    generate_safety_data()
    generate_price_data()
    generate_demand_data()
    generate_complaint_data()
    print("\n✅ All synthetic datasets generated successfully.")
    print(f"   Output directory: {os.path.abspath(OUT_DIR)}")
