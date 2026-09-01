CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(50) DEFAULT 'CITIZEN' CHECK (role IN ('ADMIN', 'AUTHORITY', 'FIELD_OFFICER', 'CITIZEN')),
    language VARCHAR(10) DEFAULT 'en',
    district VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Meghalaya',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.locations (
    id SERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    district VARCHAR(255),
    state VARCHAR(255),
    elevation DOUBLE PRECISION,
    slope DOUBLE PRECISION,
    aspect DOUBLE PRECISION,
    curvature DOUBLE PRECISION,
    twi DOUBLE PRECISION,
    terrain_ruggedness DOUBLE PRECISION,
    soil_type VARCHAR(100),
    land_cover VARCHAR(100),
    geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_locations_coords ON public.locations(latitude, longitude);

CREATE TABLE IF NOT EXISTS public.risk_predictions (
    id SERIAL PRIMARY KEY,
    location_id INTEGER,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    probability DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    confidence DOUBLE PRECISION DEFAULT 0.85,
    model_version VARCHAR(50) DEFAULT 'v1.0',
    explanation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_coords ON public.risk_predictions(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_level ON public.risk_predictions(risk_level);

CREATE TABLE IF NOT EXISTS public.weather_data (
    id SERIAL PRIMARY KEY,
    location_id INTEGER,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    rainfall_mm DOUBLE PRECISION DEFAULT 0.0,
    rainfall_1h DOUBLE PRECISION DEFAULT 0.0,
    rainfall_3h DOUBLE PRECISION DEFAULT 0.0,
    rainfall_6h DOUBLE PRECISION DEFAULT 0.0,
    rainfall_12h DOUBLE PRECISION DEFAULT 0.0,
    rainfall_24h DOUBLE PRECISION DEFAULT 0.0,
    rainfall_3d DOUBLE PRECISION DEFAULT 0.0,
    rainfall_7d DOUBLE PRECISION DEFAULT 0.0,
    temperature DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    wind_speed DOUBLE PRECISION,
    forecast_rainfall_24h DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_weather_data_coords ON public.weather_data(latitude, longitude);

CREATE TABLE IF NOT EXISTS public.soil_sensors (
    id SERIAL PRIMARY KEY,
    sensor_id VARCHAR(50) UNIQUE NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    soil_moisture DOUBLE PRECISION DEFAULT 0.0,
    battery_level DOUBLE PRECISION DEFAULT 100.0,
    status VARCHAR(20) DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'MAINTENANCE')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.landslide_events (
    id SERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    district VARCHAR(255),
    state VARCHAR(255),
    severity VARCHAR(50),
    rainfall_mm DOUBLE PRECISION,
    affected_road VARCHAR(255),
    affected_settlement VARCHAR(255),
    damage_description TEXT,
    fatalities INTEGER DEFAULT 0,
    source VARCHAR(255) DEFAULT 'GSI Landslide Inventory',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_landslides_coords ON public.landslide_events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_landslides_date ON public.landslide_events(event_date);

CREATE TABLE IF NOT EXISTS public.field_reports (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('CRACK', 'SLOPE_MOVEMENT', 'ROCKFALL', 'LANDSLIDE', 'MUD_MOVEMENT', 'BLOCKED_ROAD', 'FLOODING')),
    description TEXT,
    media_url VARCHAR(500),
    severity VARCHAR(20) DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    sync_status VARCHAR(20) DEFAULT 'SYNCED' CHECK (sync_status IN ('PENDING', 'SYNCED', 'FAILED')),
    verified BOOLEAN DEFAULT FALSE,
    district VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_field_reports_coords ON public.field_reports(latitude, longitude);

CREATE TABLE IF NOT EXISTS public.roads (
    id SERIAL PRIMARY KEY,
    road_name VARCHAR(255) NOT NULL,
    road_type VARCHAR(50),
    start_lat DOUBLE PRECISION,
    start_lng DOUBLE PRECISION,
    end_lat DOUBLE PRECISION,
    end_lng DOUBLE PRECISION,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'AT_RISK', 'BLOCKED', 'UNKNOWN')),
    risk_level VARCHAR(20) DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    priority VARCHAR(50),
    nearby_villages INTEGER DEFAULT 0,
    exposure_km DOUBLE PRECISION DEFAULT 0.0,
    district VARCHAR(255),
    state VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.villages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    district VARCHAR(255),
    state VARCHAR(255),
    population INTEGER DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    nearest_road VARCHAR(255),
    has_hospital BOOLEAN DEFAULT FALSE,
    has_school BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.alerts (
    id SERIAL PRIMARY KEY,
    location_id INTEGER,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    district VARCHAR(255),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('GREEN', 'YELLOW', 'ORANGE', 'RED')),
    risk_level VARCHAR(20) CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    message_en TEXT,
    message_hi TEXT,
    message_local TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'DISMISSED')),
    affected_villages INTEGER DEFAULT 0,
    affected_roads INTEGER DEFAULT 0,
    population_exposed INTEGER DEFAULT 0
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Public can read risk predictions" ON public.risk_predictions FOR SELECT USING (true);
CREATE POLICY "Public can read locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Public can read weather" ON public.weather_data FOR SELECT USING (true);
CREATE POLICY "Public can read roads" ON public.roads FOR SELECT USING (true);
CREATE POLICY "Public can read villages" ON public.villages FOR SELECT USING (true);
CREATE POLICY "Public can read field reports" ON public.field_reports FOR SELECT USING (true);

CREATE POLICY "Authenticated users can submit reports" ON public.field_reports 
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can read own profile" ON public.profiles 
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles 
    FOR UPDATE USING (auth.uid() = id);
