from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.models import Alert, AlertSeverity
from app.schemas import AlertResponse

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("", response_model=list[AlertResponse])
async def list_alerts(
    db: AsyncSession = Depends(get_db),
    severity: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    status: str = Query("ACTIVE"),
    limit: int = Query(50, le=200),
):
    query = select(Alert).where(Alert.status == status).order_by(Alert.created_at.desc())

    if severity:
        query = query.where(Alert.severity == severity)
    if district:
        query = query.where(Alert.district == district)

    query = query.limit(limit)
    result = await db.execute(query)
    alerts = result.scalars().all()

    return [AlertResponse.model_validate(a) for a in alerts]


@router.get("/count")
async def alert_counts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Alert).where(Alert.status == "ACTIVE"))
    alerts = result.scalars().all()

    counts = {"GREEN": 0, "YELLOW": 0, "ORANGE": 0, "RED": 0, "total": 0}
    for alert in alerts:
        sev = alert.severity.value if isinstance(alert.severity, AlertSeverity) else alert.severity
        counts[sev] = counts.get(sev, 0) + 1
        counts["total"] += 1

    return counts
