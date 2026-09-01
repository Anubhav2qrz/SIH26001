import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.models import Village, Road, RiskLevel
from app.schemas import ExposureResponse, VillageExposure, RoadExposure

router = APIRouter(prefix="/api/exposure", tags=["Exposure"])


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlng / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("/{lat}/{lng}", response_model=ExposureResponse)
async def get_exposure(
    lat: float,
    lng: float,
    radius_km: float = Query(10.0, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    deg_offset = radius_km / 111.0

    village_result = await db.execute(
        select(Village).where(
            Village.latitude.between(lat - deg_offset, lat + deg_offset),
            Village.longitude.between(lng - deg_offset, lng + deg_offset),
        )
    )
    villages = village_result.scalars().all()

    village_exposures = []
    total_pop = 0
    for v in villages:
        dist = haversine(lat, lng, v.latitude, v.longitude)
        if dist <= radius_km:
            village_exposures.append(VillageExposure(
                name=v.name,
                latitude=v.latitude,
                longitude=v.longitude,
                population=v.population or 0,
                distance_km=round(dist, 1),
                risk_level=v.risk_level or RiskLevel.LOW,
            ))
            total_pop += v.population or 0

    village_exposures.sort(key=lambda x: x.distance_km)

    road_result = await db.execute(
        select(Road).where(
            Road.start_lat.between(lat - deg_offset, lat + deg_offset),
            Road.start_lng.between(lng - deg_offset, lng + deg_offset),
        )
    )
    roads = road_result.scalars().all()

    road_exposures = [
        RoadExposure(
            road_name=r.road_name,
            status=r.status or "OPEN",
            risk_level=r.risk_level or RiskLevel.LOW,
            exposure_km=r.exposure_km or 0,
            nearby_villages=r.nearby_villages or 0,
        )
        for r in roads
    ]

    critical = sum(1 for v in villages if v.has_hospital or v.has_school)

    return ExposureResponse(
        latitude=lat,
        longitude=lng,
        radius_km=radius_km,
        villages=village_exposures,
        roads=road_exposures,
        total_population=total_pop,
        critical_infrastructure=critical,
    )
