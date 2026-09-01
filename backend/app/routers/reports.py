import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.models import FieldReport, SyncStatus
from app.schemas import ReportCreate, ReportResponse, ReportSyncRequest
from app.config import get_settings

router = APIRouter(prefix="/api/reports", tags=["Field Reports"])
settings = get_settings()


@router.post("", response_model=ReportResponse)
async def create_report(report: ReportCreate, db: AsyncSession = Depends(get_db)):
    db_report = FieldReport(
        latitude=report.latitude,
        longitude=report.longitude,
        incident_type=report.incident_type,
        description=report.description,
        severity=report.severity,
        media_url=report.media_url,
        sync_status=SyncStatus.SYNCED,
        district=report.district,
        timestamp=datetime.utcnow(),
    )
    db.add(db_report)
    await db.flush()
    await db.refresh(db_report)
    return ReportResponse.model_validate(db_report)


@router.post("/sync")
async def sync_reports(sync_request: ReportSyncRequest, db: AsyncSession = Depends(get_db)):
    created = []
    duplicates = 0

    for report in sync_request.reports:
        existing = await db.execute(
            select(FieldReport).where(
                FieldReport.latitude.between(report.latitude - 0.001, report.latitude + 0.001),
                FieldReport.longitude.between(report.longitude - 0.001, report.longitude + 0.001),
                FieldReport.incident_type == report.incident_type,
            ).limit(1)
        )
        if existing.scalar_one_or_none():
            duplicates += 1
            continue

        db_report = FieldReport(
            latitude=report.latitude,
            longitude=report.longitude,
            incident_type=report.incident_type,
            description=report.description,
            severity=report.severity,
            media_url=report.media_url,
            sync_status=SyncStatus.SYNCED,
            district=report.district,
            timestamp=datetime.utcnow(),
        )
        db.add(db_report)
        created.append(report)

    return {
        "synced": len(created),
        "duplicates": duplicates,
        "total": len(sync_request.reports),
    }


@router.get("", response_model=list[ReportResponse])
async def list_reports(
    db: AsyncSession = Depends(get_db),
    district: Optional[str] = Query(None),
    incident_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
):
    query = select(FieldReport).order_by(FieldReport.timestamp.desc())

    if district:
        query = query.where(FieldReport.district == district)
    if incident_type:
        query = query.where(FieldReport.incident_type == incident_type)
    if severity:
        query = query.where(FieldReport.severity == severity)

    query = query.limit(limit)
    result = await db.execute(query)
    reports = result.scalars().all()

    return [ReportResponse.model_validate(r) for r in reports]


@router.post("/upload")
async def upload_media(file: UploadFile = File(...)):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)

    return {"url": f"/uploads/{filename}", "filename": filename}
