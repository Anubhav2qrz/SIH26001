import enum
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text, Boolean, Enum as SAEnum
)
from sqlalchemy.sql import func
from app.database import Base


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertSeverity(str, enum.Enum):
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    ORANGE = "ORANGE"
    RED = "RED"


class IncidentType(str, enum.Enum):
    CRACK = "CRACK"
    SLOPE_MOVEMENT = "SLOPE_MOVEMENT"
    ROCKFALL = "ROCKFALL"
    LANDSLIDE = "LANDSLIDE"
    MUD_MOVEMENT = "MUD_MOVEMENT"
    BLOCKED_ROAD = "BLOCKED_ROAD"
    FLOODING = "FLOODING"


class RoadStatus(str, enum.Enum):
    OPEN = "OPEN"
    AT_RISK = "AT_RISK"
    BLOCKED = "BLOCKED"
    UNKNOWN = "UNKNOWN"


class SyncStatus(str, enum.Enum):
    PENDING = "PENDING"
    SYNCED = "SYNCED"
    FAILED = "FAILED"


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    AUTHORITY = "AUTHORITY"
    FIELD_OFFICER = "FIELD_OFFICER"
    CITIZEN = "CITIZEN"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    role = Column(SAEnum(UserRole), default=UserRole.CITIZEN)
    language = Column(String(10), default="en")
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime, server_default=func.now())


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district = Column(String(255))
    state = Column(String(255))
    elevation = Column(Float)
    slope = Column(Float)
    aspect = Column(Float)
    curvature = Column(Float)
    twi = Column(Float)
    terrain_ruggedness = Column(Float)
    soil_type = Column(String(100))
    land_cover = Column(String(100))


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    location_id = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, server_default=func.now())
    probability = Column(Float, nullable=False)
    risk_level = Column(SAEnum(RiskLevel), nullable=False)
    confidence = Column(Float, default=0.0)
    model_version = Column(String(50), default="v1.0")
    explanation = Column(Text)


class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, autoincrement=True)
    location_id = Column(Integer)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, server_default=func.now())
    rainfall_mm = Column(Float, default=0.0)
    rainfall_1h = Column(Float, default=0.0)
    rainfall_3h = Column(Float, default=0.0)
    rainfall_6h = Column(Float, default=0.0)
    rainfall_12h = Column(Float, default=0.0)
    rainfall_24h = Column(Float, default=0.0)
    rainfall_3d = Column(Float, default=0.0)
    rainfall_7d = Column(Float, default=0.0)
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    forecast_rainfall_24h = Column(Float, default=0.0)


class SoilSensor(Base):
    __tablename__ = "soil_sensors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sensor_id = Column(String(50), unique=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, server_default=func.now())
    soil_moisture = Column(Float, default=0.0)
    battery_level = Column(Float, default=100.0)
    status = Column(String(20), default="ONLINE")


class LandslideEvent(Base):
    __tablename__ = "landslide_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    event_date = Column(DateTime, nullable=False)
    district = Column(String(255))
    state = Column(String(255))
    severity = Column(String(50))
    rainfall_mm = Column(Float)
    affected_road = Column(String(255))
    affected_settlement = Column(String(255))
    damage_description = Column(Text)
    fatalities = Column(Integer, default=0)
    source = Column(String(255))


class FieldReport(Base):
    __tablename__ = "field_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, server_default=func.now())
    incident_type = Column(SAEnum(IncidentType), nullable=False)
    description = Column(Text)
    media_url = Column(String(500))
    severity = Column(SAEnum(RiskLevel), default=RiskLevel.LOW)
    sync_status = Column(SAEnum(SyncStatus), default=SyncStatus.SYNCED)
    verified = Column(Boolean, default=False)
    district = Column(String(255))


class Road(Base):
    __tablename__ = "roads"

    id = Column(Integer, primary_key=True, autoincrement=True)
    road_name = Column(String(255), nullable=False)
    road_type = Column(String(50))
    start_lat = Column(Float)
    start_lng = Column(Float)
    end_lat = Column(Float)
    end_lng = Column(Float)
    status = Column(SAEnum(RoadStatus), default=RoadStatus.OPEN)
    risk_level = Column(SAEnum(RiskLevel), default=RiskLevel.LOW)
    priority = Column(String(50))
    nearby_villages = Column(Integer, default=0)
    exposure_km = Column(Float, default=0.0)
    district = Column(String(255))
    state = Column(String(255))


class Village(Base):
    __tablename__ = "villages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district = Column(String(255))
    state = Column(String(255))
    population = Column(Integer, default=0)
    risk_level = Column(SAEnum(RiskLevel), default=RiskLevel.LOW)
    nearest_road = Column(String(255))
    has_hospital = Column(Boolean, default=False)
    has_school = Column(Boolean, default=False)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    location_id = Column(Integer)
    latitude = Column(Float)
    longitude = Column(Float)
    district = Column(String(255))
    severity = Column(SAEnum(AlertSeverity), nullable=False)
    risk_level = Column(SAEnum(RiskLevel))
    message_en = Column(Text)
    message_hi = Column(Text)
    message_local = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime)
    status = Column(String(20), default="ACTIVE")
    affected_villages = Column(Integer, default=0)
    affected_roads = Column(Integer, default=0)
    population_exposed = Column(Integer, default=0)
