import json
import math
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sqlfunc

from app.database import get_db
from app.models.models import (
    RiskPrediction, Location, WeatherData, SoilSensor,
    LandslideEvent, Village, Road, RiskLevel
)
from app.schemas import (
    RiskResponse, RiskDetailResponse, RiskExplanation,
    RiskForecastResponse, RiskForecastPoint,
    RiskGridResponse, RiskGridCell
)

router = APIRouter(prefix="/api/risk", tags=["Risk"])


def classify_risk(probability: float) -> RiskLevel:
    if probability <= 0.25:
        return RiskLevel.LOW
    elif probability <= 0.50:
        return RiskLevel.MODERATE
    elif probability <= 0.75:
        return RiskLevel.HIGH
    return RiskLevel.CRITICAL


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlng / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("/{lat}/{lng}", response_model=RiskDetailResponse)
async def get_risk(lat: float, lng: float, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(RiskPrediction)
        .where(
            RiskPrediction.latitude.between(lat - 0.05, lat + 0.05),
            RiskPrediction.longitude.between(lng - 0.05, lng + 0.05),
        )
        .order_by(RiskPrediction.timestamp.desc())
        .limit(1)
    )
    prediction = result.scalar_one_or_none()

    weather_result = await db.execute(
        select(WeatherData)
        .where(
            WeatherData.latitude.between(lat - 0.1, lat + 0.1),
            WeatherData.longitude.between(lng - 0.1, lng + 0.1),
        )
        .order_by(WeatherData.timestamp.desc())
        .limit(1)
    )
    weather = weather_result.scalar_one_or_none()

    sensor_result = await db.execute(
        select(SoilSensor)
        .where(
            SoilSensor.latitude.between(lat - 0.1, lat + 0.1),
            SoilSensor.longitude.between(lng - 0.1, lng + 0.1),
        )
        .order_by(SoilSensor.timestamp.desc())
        .limit(1)
    )
    sensor = sensor_result.scalar_one_or_none()

    loc_result = await db.execute(
        select(Location)
        .where(
            Location.latitude.between(lat - 0.05, lat + 0.05),
            Location.longitude.between(lng - 0.05, lng + 0.05),
        )
        .limit(1)
    )
    location = loc_result.scalar_one_or_none()

    events_result = await db.execute(
        select(sqlfunc.count(LandslideEvent.id))
        .where(
            LandslideEvent.latitude.between(lat - 0.1, lat + 0.1),
            LandslideEvent.longitude.between(lng - 0.1, lng + 0.1),
        )
    )
    historical_count = events_result.scalar() or 0

    villages_result = await db.execute(
        select(sqlfunc.count(Village.id))
        .where(
            Village.latitude.between(lat - 0.1, lat + 0.1),
            Village.longitude.between(lng - 0.1, lng + 0.1),
        )
    )
    village_count = villages_result.scalar() or 0

    roads_result = await db.execute(
        select(sqlfunc.count(Road.id))
        .where(
            Road.start_lat.between(lat - 0.15, lat + 0.15),
            Road.start_lng.between(lng - 0.15, lng + 0.15),
        )
    )
    road_count = roads_result.scalar() or 0

    prob = prediction.probability if prediction else 0.3
    risk = classify_risk(prob)

    explanations = []
    if prediction and prediction.explanation:
        try:
            raw = json.loads(prediction.explanation)
            explanations = [RiskExplanation(**e) for e in raw]
        except Exception:
            pass

    return RiskDetailResponse(
        latitude=lat,
        longitude=lng,
        probability=prob,
        risk_level=risk,
        confidence=prediction.confidence if prediction else 0.5,
        timestamp=prediction.timestamp if prediction else datetime.utcnow(),
        model_version=prediction.model_version if prediction else "v1.0",
        district=location.district if location else None,
        explanation=explanations,
        rainfall_24h=weather.rainfall_24h if weather else None,
        soil_moisture=sensor.soil_moisture if sensor else None,
        slope=location.slope if location else None,
        elevation=location.elevation if location else None,
        historical_events=historical_count,
        nearby_villages=village_count,
        nearby_roads=road_count,
        population_exposure=village_count * 800,
    )


@router.get("/forecast/{lat}/{lng}", response_model=RiskForecastResponse)
async def get_forecast(lat: float, lng: float, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(RiskPrediction)
        .where(
            RiskPrediction.latitude.between(lat - 0.05, lat + 0.05),
            RiskPrediction.longitude.between(lng - 0.05, lng + 0.05),
        )
        .order_by(RiskPrediction.timestamp.desc())
        .limit(1)
    )
    prediction = result.scalar_one_or_none()
    base_prob = prediction.probability if prediction else 0.25

    forecast_points = []
    hours = [0, 3, 6, 9, 12, 15, 18, 21, 24]
    now = datetime.utcnow()

    for h in hours:
        hour_of_day = (now.hour + h) % 24
        if 12 <= hour_of_day <= 20:
            modifier = 0.15 + (0.05 * (hour_of_day - 12) / 8)
        elif 6 <= hour_of_day < 12:
            modifier = 0.05
        else:
            modifier = -0.05

        prob = max(0.0, min(1.0, base_prob + modifier + (h * 0.01)))
        forecast_points.append(RiskForecastPoint(
            time=f"+{h}h",
            probability=round(prob, 2),
            risk_level=classify_risk(prob),
        ))

    loc_result = await db.execute(
        select(Location)
        .where(
            Location.latitude.between(lat - 0.05, lat + 0.05),
            Location.longitude.between(lng - 0.05, lng + 0.05),
        )
        .limit(1)
    )
    location = loc_result.scalar_one_or_none()

    return RiskForecastResponse(
        latitude=lat,
        longitude=lng,
        district=location.district if location else None,
        forecast=forecast_points,
    )


@router.get("/grid", response_model=RiskGridResponse)
async def get_risk_grid(
    db: AsyncSession = Depends(get_db),
    min_lat: Optional[float] = Query(None),
    max_lat: Optional[float] = Query(None),
    min_lng: Optional[float] = Query(None),
    max_lng: Optional[float] = Query(None),
):
    query = select(RiskPrediction).order_by(RiskPrediction.timestamp.desc())

    if min_lat is not None and max_lat is not None:
        query = query.where(
            RiskPrediction.latitude.between(min_lat, max_lat),
            RiskPrediction.longitude.between(min_lng or 88.0, max_lng or 98.0),
        )

    query = query.limit(5000)
    result = await db.execute(query)
    predictions = result.scalars().all()

    cells = [
        RiskGridCell(
            lat=p.latitude,
            lng=p.longitude,
            probability=p.probability,
            risk_level=p.risk_level.value if isinstance(p.risk_level, RiskLevel) else p.risk_level,
        )
        for p in predictions
    ]

    return RiskGridResponse(
        cells=cells,
        total=len(cells),
        timestamp=datetime.utcnow(),
    )
