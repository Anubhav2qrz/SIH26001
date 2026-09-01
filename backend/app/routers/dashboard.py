from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sqlfunc

from app.database import get_db
from app.models.models import (
    Alert, RiskPrediction, Road, Village, FieldReport,
    SoilSensor, LandslideEvent, RiskLevel
)
from app.schemas import DashboardKPIs

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/kpis", response_model=DashboardKPIs)
async def get_kpis(db: AsyncSession = Depends(get_db)):
    alert_result = await db.execute(
        select(sqlfunc.count(Alert.id)).where(Alert.status == "ACTIVE")
    )
    active_alerts = alert_result.scalar() or 0

    critical_result = await db.execute(
        select(sqlfunc.count(RiskPrediction.id))
        .where(RiskPrediction.risk_level == RiskLevel.CRITICAL)
    )
    critical_zones = critical_result.scalar() or 0

    high_result = await db.execute(
        select(sqlfunc.count(RiskPrediction.id))
        .where(RiskPrediction.risk_level == RiskLevel.HIGH)
    )
    high_risk_zones = high_result.scalar() or 0

    roads_result = await db.execute(
        select(sqlfunc.count(Road.id))
        .where(Road.risk_level.in_([RiskLevel.HIGH, RiskLevel.CRITICAL]))
    )
    roads_at_risk = roads_result.scalar() or 0

    villages_result = await db.execute(
        select(sqlfunc.count(Village.id))
        .where(Village.risk_level.in_([RiskLevel.HIGH, RiskLevel.CRITICAL]))
    )
    villages_at_risk = villages_result.scalar() or 0

    pop_result = await db.execute(
        select(sqlfunc.sum(Village.population))
        .where(Village.risk_level.in_([RiskLevel.HIGH, RiskLevel.CRITICAL]))
    )
    population_exposed = pop_result.scalar() or 0

    reports_result = await db.execute(
        select(sqlfunc.count(FieldReport.id))
    )
    field_reports = reports_result.scalar() or 0

    sensors_result = await db.execute(
        select(sqlfunc.count(SoilSensor.id))
        .where(SoilSensor.status == "ONLINE")
    )
    sensors_online = sensors_result.scalar() or 0

    return DashboardKPIs(
        active_alerts=active_alerts,
        critical_zones=critical_zones,
        high_risk_zones=high_risk_zones,
        roads_at_risk=roads_at_risk,
        villages_at_risk=villages_at_risk,
        population_exposed=population_exposed,
        field_reports=field_reports,
        sensors_online=sensors_online,
        data_sources_online=4,
        system_status="ACTIVE",
        last_updated=datetime.utcnow(),
    )


@router.get("/analytics")
async def get_analytics(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LandslideEvent))
    events = result.scalars().all()

    monthly: dict[int, int] = {i: 0 for i in range(1, 13)}
    yearly: dict[int, int] = {}
    by_district: dict[str, int] = {}
    by_severity: dict[str, int] = {}

    for e in events:
        if e.event_date:
            monthly[e.event_date.month] = monthly.get(e.event_date.month, 0) + 1
            yr = e.event_date.year
            yearly[yr] = yearly.get(yr, 0) + 1

        d = e.district or "Unknown"
        by_district[d] = by_district.get(d, 0) + 1

        s = e.severity or "Unknown"
        by_severity[s] = by_severity.get(s, 0) + 1

    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    return {
        "total_events": len(events),
        "monthly": [{"month": month_names[i - 1], "count": monthly[i]} for i in range(1, 13)],
        "yearly": [{"year": y, "count": c} for y, c in sorted(yearly.items())],
        "by_district": [{"district": d, "count": c} for d, c in
                        sorted(by_district.items(), key=lambda x: -x[1])[:15]],
        "by_severity": by_severity,
    }
