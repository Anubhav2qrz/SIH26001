from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.models import RiskLevel, AlertSeverity, IncidentType, RoadStatus


class RiskResponse(BaseModel):
    latitude: float
    longitude: float
    probability: float = Field(ge=0, le=1)
    risk_level: RiskLevel
    confidence: float = Field(ge=0, le=1)
    timestamp: datetime
    model_version: str = "v1.0"
    district: Optional[str] = None

    class Config:
        from_attributes = True


class RiskExplanation(BaseModel):
    feature: str
    contribution: float
    level: str


class RiskDetailResponse(RiskResponse):
    explanation: list[RiskExplanation] = []
    rainfall_24h: Optional[float] = None
    soil_moisture: Optional[float] = None
    slope: Optional[float] = None
    elevation: Optional[float] = None
    historical_events: int = 0
    nearby_villages: int = 0
    nearby_roads: int = 0
    population_exposure: int = 0


class RiskForecastPoint(BaseModel):
    time: str
    probability: float
    risk_level: RiskLevel


class RiskForecastResponse(BaseModel):
    latitude: float
    longitude: float
    district: Optional[str] = None
    forecast: list[RiskForecastPoint] = []


class RiskGridCell(BaseModel):
    lat: float
    lng: float
    probability: float
    risk_level: str


class RiskGridResponse(BaseModel):
    cells: list[RiskGridCell]
    total: int
    timestamp: datetime


class WeatherResponse(BaseModel):
    latitude: float
    longitude: float
    timestamp: datetime
    rainfall_mm: float = 0.0
    rainfall_1h: float = 0.0
    rainfall_24h: float = 0.0
    rainfall_3d: float = 0.0
    rainfall_7d: float = 0.0
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    forecast_rainfall_24h: float = 0.0


class ReportCreate(BaseModel):
    latitude: float
    longitude: float
    incident_type: IncidentType
    description: Optional[str] = None
    severity: RiskLevel = RiskLevel.LOW
    media_url: Optional[str] = None
    district: Optional[str] = None


class ReportResponse(BaseModel):
    id: int
    latitude: float
    longitude: float
    timestamp: datetime
    incident_type: IncidentType
    description: Optional[str] = None
    media_url: Optional[str] = None
    severity: RiskLevel
    sync_status: str = "SYNCED"
    verified: bool = False
    district: Optional[str] = None

    class Config:
        from_attributes = True


class ReportSyncRequest(BaseModel):
    reports: list[ReportCreate]


class AlertResponse(BaseModel):
    id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    district: Optional[str] = None
    severity: AlertSeverity
    risk_level: Optional[RiskLevel] = None
    message_en: Optional[str] = None
    message_hi: Optional[str] = None
    created_at: datetime
    status: str = "ACTIVE"
    affected_villages: int = 0
    affected_roads: int = 0
    population_exposed: int = 0

    class Config:
        from_attributes = True


class LandslideEventResponse(BaseModel):
    id: int
    latitude: float
    longitude: float
    event_date: datetime
    district: Optional[str] = None
    state: Optional[str] = None
    severity: Optional[str] = None
    rainfall_mm: Optional[float] = None
    affected_road: Optional[str] = None
    affected_settlement: Optional[str] = None
    fatalities: int = 0
    source: Optional[str] = None

    class Config:
        from_attributes = True


class VillageExposure(BaseModel):
    name: str
    latitude: float
    longitude: float
    population: int = 0
    distance_km: float = 0.0
    risk_level: RiskLevel = RiskLevel.LOW


class RoadExposure(BaseModel):
    road_name: str
    status: RoadStatus = RoadStatus.OPEN
    risk_level: RiskLevel = RiskLevel.LOW
    exposure_km: float = 0.0
    nearby_villages: int = 0


class ExposureResponse(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 10.0
    villages: list[VillageExposure] = []
    roads: list[RoadExposure] = []
    total_population: int = 0
    critical_infrastructure: int = 0


class DistrictSummary(BaseModel):
    district: str
    state: str
    total_events: int
    avg_risk: float
    active_alerts: int
    roads_at_risk: int
    population_exposed: int


class TrendPoint(BaseModel):
    period: str
    count: int
    avg_rainfall: Optional[float] = None


class AnalyticsResponse(BaseModel):
    total_events: int
    districts: list[DistrictSummary] = []
    monthly_trends: list[TrendPoint] = []
    yearly_trends: list[TrendPoint] = []


class DashboardKPIs(BaseModel):
    active_alerts: int = 0
    critical_zones: int = 0
    high_risk_zones: int = 0
    roads_at_risk: int = 0
    villages_at_risk: int = 0
    population_exposed: int = 0
    field_reports: int = 0
    sensors_online: int = 0
    data_sources_online: int = 0
    system_status: str = "ACTIVE"
    last_updated: datetime


class DemoStepResponse(BaseModel):
    step: int
    title: str
    description: str
    changes: dict
