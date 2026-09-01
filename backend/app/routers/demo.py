import json
import random
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete

from app.database import get_db
from app.models.models import (
    RiskPrediction, WeatherData, SoilSensor, Alert, FieldReport,
    Village, Road, RiskLevel, AlertSeverity, IncidentType, SyncStatus
)

router = APIRouter(prefix="/api/demo", tags=["Demo"])

DEMO_LAT = 25.2700
DEMO_LNG = 91.7200
DEMO_DISTRICT = "East Khasi Hills"
DEMO_STATE = "Meghalaya"

DEMO_STEPS = [
    {
        "step": 1,
        "title": "Normal Conditions",
        "description": "The region is under normal monitoring. Moderate rainfall, stable slopes. Risk is LOW at 24%.",
    },
    {
        "step": 2,
        "title": "Heavy Rainfall Detected",
        "description": "Rainfall intensity increases sharply. 85mm recorded in last 6 hours. Risk rises to 51% — HIGH.",
    },
    {
        "step": 3,
        "title": "Soil Moisture Surge",
        "description": "Soil sensors report moisture rising from 65% to 83%. Ground is becoming saturated. Risk jumps to 76%.",
    },
    {
        "step": 4,
        "title": "AI Critical Warning",
        "description": "The ML model detects convergence of all risk factors. CRITICAL ZONE identified at 89% probability.",
    },
    {
        "step": 5,
        "title": "Exposure Analysis",
        "description": "System identifies 3 villages, 1 major road (NH-6), 2 bridges, and ~5,000 people in the exposure zone.",
    },
    {
        "step": 6,
        "title": "Response Prioritisation",
        "description": "Priority Score calculated: CRITICAL. Recommended: inspect NH-6, alert settlements, prepare evacuation.",
    },
    {
        "step": 7,
        "title": "Field Report Received",
        "description": "A field officer uploads a slope crack photo with GPS coordinates. Report marked HIGH PRIORITY.",
    },
    {
        "step": 8,
        "title": "Multilingual Alert Issued",
        "description": "Platform generates alerts in English, Hindi, and Khasi. SMS and push notifications dispatched.",
    },
]


@router.get("/steps")
async def get_steps():
    return {"steps": DEMO_STEPS, "total": len(DEMO_STEPS)}


@router.post("/reset")
async def reset_demo(db: AsyncSession = Depends(get_db)):
    await db.execute(
        delete(RiskPrediction).where(
            RiskPrediction.latitude.between(DEMO_LAT - 0.2, DEMO_LAT + 0.2),
            RiskPrediction.longitude.between(DEMO_LNG - 0.2, DEMO_LNG + 0.2),
        )
    )
    await db.execute(
        delete(WeatherData).where(
            WeatherData.latitude.between(DEMO_LAT - 0.2, DEMO_LAT + 0.2),
            WeatherData.longitude.between(DEMO_LNG - 0.2, DEMO_LNG + 0.2),
        )
    )
    await db.execute(
        delete(Alert).where(Alert.district == DEMO_DISTRICT)
    )
    await db.execute(
        delete(FieldReport).where(
            FieldReport.latitude.between(DEMO_LAT - 0.2, DEMO_LAT + 0.2),
        )
    )
    await db.commit()
    await _apply_step_1(db)
    return {"status": "reset", "message": "Demo reset to initial state"}


@router.post("/step/{step_number}")
async def execute_step(step_number: int, db: AsyncSession = Depends(get_db)):
    if step_number < 1 or step_number > 8:
        return {"error": "Step must be between 1 and 8"}

    step_handlers = {
        1: _apply_step_1,
        2: _apply_step_2,
        3: _apply_step_3,
        4: _apply_step_4,
        5: _apply_step_5,
        6: _apply_step_6,
        7: _apply_step_7,
        8: _apply_step_8,
    }

    await step_handlers[step_number](db)
    await db.commit()

    step_info = DEMO_STEPS[step_number - 1]
    return {
        "step": step_number,
        "title": step_info["title"],
        "description": step_info["description"],
        "status": "applied",
    }


async def _apply_step_1(db: AsyncSession):
    now = datetime.utcnow()
    explanation = json.dumps([
        {"feature": "Rainfall (24h)", "contribution": 0.08, "level": "LOW"},
        {"feature": "Soil Moisture", "contribution": 0.05, "level": "LOW"},
        {"feature": "Slope Gradient", "contribution": 0.12, "level": "MEDIUM"},
        {"feature": "Historical Events", "contribution": 0.06, "level": "LOW"},
        {"feature": "Vegetation Cover", "contribution": -0.04, "level": "LOW"},
    ])

    offsets = [
        (0, 0), (0.02, 0), (-0.02, 0), (0, 0.02), (0, -0.02),
        (0.02, 0.02), (-0.02, -0.02), (0.04, 0), (0, 0.04),
        (-0.04, 0), (0, -0.04), (0.04, 0.02), (-0.02, 0.04),
    ]
    for dlat, dlng in offsets:
        prob = max(0.05, min(0.35, 0.24 + random.uniform(-0.12, 0.12)))
        risk = RiskLevel.LOW if prob <= 0.25 else RiskLevel.MODERATE
        pred = RiskPrediction(
            location_id=1,
            latitude=DEMO_LAT + dlat,
            longitude=DEMO_LNG + dlng,
            timestamp=now,
            probability=round(prob, 2),
            risk_level=risk,
            confidence=0.75,
            model_version="v1.0",
            explanation=explanation,
        )
        db.add(pred)

    weather = WeatherData(
        latitude=DEMO_LAT, longitude=DEMO_LNG,
        timestamp=now,
        rainfall_mm=8.5, rainfall_1h=2.1, rainfall_3h=6.3,
        rainfall_6h=12.0, rainfall_12h=18.0, rainfall_24h=32.0,
        rainfall_3d=65.0, rainfall_7d=140.0,
        temperature=22.0, humidity=75.0, wind_speed=8.0,
        forecast_rainfall_24h=25.0,
    )
    db.add(weather)

    existing = await db.execute(
        select(SoilSensor).where(SoilSensor.sensor_id == "SENSOR-DEMO-001")
    )
    if not existing.scalar_one_or_none():
        sensor = SoilSensor(
            sensor_id="SENSOR-DEMO-001",
            latitude=DEMO_LAT + 0.01,
            longitude=DEMO_LNG - 0.01,
            timestamp=now,
            soil_moisture=45.0,
            battery_level=92.0,
            status="ONLINE",
        )
        db.add(sensor)


async def _apply_step_2(db: AsyncSession):
    now = datetime.utcnow()
    weather = WeatherData(
        latitude=DEMO_LAT, longitude=DEMO_LNG,
        timestamp=now,
        rainfall_mm=28.0, rainfall_1h=18.5, rainfall_3h=45.0,
        rainfall_6h=85.0, rainfall_12h=110.0, rainfall_24h=142.0,
        rainfall_3d=195.0, rainfall_7d=380.0,
        temperature=19.0, humidity=94.0, wind_speed=22.0,
        forecast_rainfall_24h=65.0,
    )
    db.add(weather)

    explanation = json.dumps([
        {"feature": "Rainfall (24h)", "contribution": 0.28, "level": "HIGH"},
        {"feature": "Cumulative Rainfall (7d)", "contribution": 0.18, "level": "HIGH"},
        {"feature": "Soil Moisture", "contribution": 0.10, "level": "MEDIUM"},
        {"feature": "Slope Gradient", "contribution": 0.12, "level": "MEDIUM"},
        {"feature": "Historical Events", "contribution": 0.08, "level": "MEDIUM"},
    ])

    offsets = [
        (0, 0), (0.02, 0), (-0.02, 0), (0, 0.02), (0, -0.02),
        (0.02, 0.02), (-0.02, -0.02), (0.04, 0), (0, 0.04),
        (-0.04, 0), (0, -0.04), (0.04, 0.02), (-0.02, 0.04),
    ]
    for dlat, dlng in offsets:
        prob = max(0.20, min(0.65, 0.51 + random.uniform(-0.18, 0.14)))
        risk = (RiskLevel.LOW if prob <= 0.25
                else RiskLevel.MODERATE if prob <= 0.50
                else RiskLevel.HIGH)
        pred = RiskPrediction(
            location_id=1,
            latitude=DEMO_LAT + dlat,
            longitude=DEMO_LNG + dlng,
            timestamp=now,
            probability=round(prob, 2),
            risk_level=risk,
            confidence=0.82,
            model_version="v1.0",
            explanation=explanation,
        )
        db.add(pred)


async def _apply_step_3(db: AsyncSession):
    now = datetime.utcnow()
    await db.execute(
        update(SoilSensor)
        .where(SoilSensor.sensor_id == "SENSOR-DEMO-001")
        .values(soil_moisture=83.0, timestamp=now)
    )

    explanation = json.dumps([
        {"feature": "Rainfall (24h)", "contribution": 0.28, "level": "HIGH"},
        {"feature": "Soil Moisture", "contribution": 0.25, "level": "HIGH"},
        {"feature": "Cumulative Rainfall (7d)", "contribution": 0.18, "level": "HIGH"},
        {"feature": "Slope Gradient", "contribution": 0.14, "level": "HIGH"},
        {"feature": "Historical Events", "contribution": 0.10, "level": "MEDIUM"},
    ])

    offsets = [
        (0, 0), (0.02, 0), (-0.02, 0), (0, 0.02), (0, -0.02),
        (0.02, 0.02), (-0.02, -0.02), (0.04, 0), (0, 0.04),
        (-0.04, 0), (0, -0.04), (0.04, 0.02), (-0.02, 0.04),
    ]
    for dlat, dlng in offsets:
        prob = max(0.35, min(0.85, 0.76 + random.uniform(-0.22, 0.10)))
        risk = (RiskLevel.MODERATE if prob <= 0.50
                else RiskLevel.HIGH if prob <= 0.75
                else RiskLevel.CRITICAL)
        pred = RiskPrediction(
            location_id=1,
            latitude=DEMO_LAT + dlat,
            longitude=DEMO_LNG + dlng,
            timestamp=now,
            probability=round(prob, 2),
            risk_level=risk,
            confidence=0.88,
            model_version="v1.0",
            explanation=explanation,
        )
        db.add(pred)


async def _apply_step_4(db: AsyncSession):
    now = datetime.utcnow()
    explanation = json.dumps([
        {"feature": "Rainfall (24h)", "contribution": 0.30, "level": "HIGH"},
        {"feature": "Soil Moisture", "contribution": 0.28, "level": "HIGH"},
        {"feature": "Slope Gradient", "contribution": 0.16, "level": "HIGH"},
        {"feature": "Cumulative Rainfall (7d)", "contribution": 0.20, "level": "HIGH"},
        {"feature": "Historical Events", "contribution": 0.12, "level": "MEDIUM"},
        {"feature": "Satellite Change", "contribution": 0.08, "level": "HIGH"},
    ])

    offsets = [
        (0, 0), (0.02, 0), (-0.02, 0), (0, 0.02), (0, -0.02),
        (0.02, 0.02), (-0.02, -0.02), (0.04, 0), (0, 0.04),
        (-0.04, 0), (0, -0.04), (0.04, 0.02), (-0.02, 0.04),
    ]
    for i, (dlat, dlng) in enumerate(offsets):
        prob = 0.89 if i == 0 else max(0.50, min(0.92, 0.82 + random.uniform(-0.20, 0.10)))
        risk = (RiskLevel.HIGH if prob <= 0.75 else RiskLevel.CRITICAL)
        pred = RiskPrediction(
            location_id=1,
            latitude=DEMO_LAT + dlat,
            longitude=DEMO_LNG + dlng,
            timestamp=now,
            probability=round(prob, 2),
            risk_level=risk,
            confidence=0.93,
            model_version="v1.0",
            explanation=explanation,
        )
        db.add(pred)


async def _apply_step_5(db: AsyncSession):
    await db.execute(
        update(Village)
        .where(
            Village.latitude.between(DEMO_LAT - 0.1, DEMO_LAT + 0.1),
            Village.longitude.between(DEMO_LNG - 0.1, DEMO_LNG + 0.1),
        )
        .values(risk_level=RiskLevel.HIGH)
    )

    await db.execute(
        update(Road)
        .where(
            Road.start_lat.between(DEMO_LAT - 0.15, DEMO_LAT + 0.15),
            Road.start_lng.between(DEMO_LNG - 0.15, DEMO_LNG + 0.15),
        )
        .values(risk_level=RiskLevel.CRITICAL, status="AT_RISK", priority="CRITICAL")
    )


async def _apply_step_6(db: AsyncSession):
    now = datetime.utcnow()
    alert = Alert(
        latitude=DEMO_LAT, longitude=DEMO_LNG,
        district=DEMO_DISTRICT,
        severity=AlertSeverity.ORANGE,
        risk_level=RiskLevel.CRITICAL,
        message_en="RESPONSE PRIORITY: CRITICAL. Inspect NH-6, alert nearby settlements, prepare evacuation resources, deploy field team.",
        message_hi="प्रतिक्रिया प्राथमिकता: गंभीर। NH-6 का निरीक्षण करें, पास की बस्तियों को सचेत करें, निकासी संसाधन तैयार करें।",
        message_local="Response Priority: CRITICAL — Leit pynbna NH-6, pynsñiaw ia ki nongshong ha sahlang, pynkynmaw ia ki jingpynshlur jingleit bru.",
        created_at=now,
        status="ACTIVE",
        affected_villages=3,
        affected_roads=1,
        population_exposed=5200,
    )
    db.add(alert)


async def _apply_step_7(db: AsyncSession):
    now = datetime.utcnow()
    report = FieldReport(
        user_id=1,
        latitude=DEMO_LAT + 0.015,
        longitude=DEMO_LNG - 0.008,
        timestamp=now,
        incident_type=IncidentType.CRACK,
        description="Large crack observed on slope face near NH-6 km 34. Approximately 2m long, 5cm wide. Fresh displacement visible. Immediate inspection recommended.",
        severity=RiskLevel.HIGH,
        sync_status=SyncStatus.SYNCED,
        verified=False,
        district=DEMO_DISTRICT,
    )
    db.add(report)


async def _apply_step_8(db: AsyncSession):
    now = datetime.utcnow()
    alert = Alert(
        latitude=DEMO_LAT, longitude=DEMO_LNG,
        district=DEMO_DISTRICT,
        severity=AlertSeverity.RED,
        risk_level=RiskLevel.CRITICAL,
        message_en="URGENT LANDSLIDE WARNING: East Khasi Hills (Sohra & Mawsynram). Extreme soil saturation & 89% slope failure probability. Move to safe high ground immediately. Avoid NH-6.",
        message_hi="आपातकालीन भूस्खलन चेतावनी: पूर्वी खासी हिल्स (सोहरा एवं मॉसिनराम)। अत्यधिक मिट्टी संतृप्ति और 89% भूस्खलन की संभावना। तुरंत सुरक्षित ऊंचे स्थानों पर जाएं। NH-6 मार्ग से बचें।",
        message_local="JINGPYNBNA LYNTI BNENG: East Khasi Hills (Sohra & Mawsynram). Ka jingktah jur ka khyndew bad ka risk 89%. Kiew sha ki jaka ba shngain kloi kloi. Kiad na NH-6.",
        created_at=now,
        status="ACTIVE",
        affected_villages=3,
        affected_roads=1,
        population_exposed=5200,
    )
    db.add(alert)
