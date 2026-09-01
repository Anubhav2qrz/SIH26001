from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, extract

from app.database import get_db
from app.models.models import LandslideEvent
from app.schemas import LandslideEventResponse

router = APIRouter(prefix="/api/landslides", tags=["Landslides"])


@router.get("/history", response_model=list[LandslideEventResponse])
async def get_history(
    db: AsyncSession = Depends(get_db),
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    limit: int = Query(100, le=500),
):
    query = select(LandslideEvent).order_by(LandslideEvent.event_date.desc())

    if district:
        query = query.where(LandslideEvent.district == district)
    if state:
        query = query.where(LandslideEvent.state == state)
    if severity:
        query = query.where(LandslideEvent.severity == severity)
    if year:
        query = query.where(extract("year", LandslideEvent.event_date) == year)

    query = query.limit(limit)
    result = await db.execute(query)
    events = result.scalars().all()

    return [LandslideEventResponse.model_validate(e) for e in events]


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LandslideEvent))
    events = result.scalars().all()

    if not events:
        return {"total": 0, "by_state": {}, "by_severity": {}, "by_year": {}}

    by_state: dict[str, int] = {}
    by_severity: dict[str, int] = {}
    by_year: dict[int, int] = {}

    for e in events:
        st = e.state or "Unknown"
        by_state[st] = by_state.get(st, 0) + 1

        sev = e.severity or "Unknown"
        by_severity[sev] = by_severity.get(sev, 0) + 1

        yr = e.event_date.year if e.event_date else 0
        if yr:
            by_year[yr] = by_year.get(yr, 0) + 1

    return {
        "total": len(events),
        "by_state": by_state,
        "by_severity": by_severity,
        "by_year": dict(sorted(by_year.items())),
    }
