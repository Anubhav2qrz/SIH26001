const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
export type AlertSeverity = "GREEN" | "YELLOW" | "ORANGE" | "RED";
export type IncidentType =
  | "CRACK"
  | "SLOPE_MOVEMENT"
  | "ROCKFALL"
  | "LANDSLIDE"
  | "MUD_MOVEMENT"
  | "BLOCKED_ROAD"
  | "FLOODING";

export interface RiskExplanation {
  feature: string;
  contribution: number;
  level: string;
}

export interface RiskDetail {
  latitude: number;
  longitude: number;
  probability: number;
  risk_level: RiskLevel;
  confidence: number;
  timestamp: string;
  model_version: string;
  district: string | null;
  explanation: RiskExplanation[];
  rainfall_24h: number | null;
  soil_moisture: number | null;
  slope: number | null;
  elevation: number | null;
  historical_events: number;
  nearby_villages: number;
  nearby_roads: number;
  population_exposure: number;
}

export interface RiskForecastPoint {
  time: string;
  probability: number;
  risk_level: RiskLevel;
}

export interface RiskForecast {
  latitude: number;
  longitude: number;
  district: string | null;
  forecast: RiskForecastPoint[];
}

export interface RiskGridCell {
  lat: number;
  lng: number;
  probability: number;
  risk_level: string;
}

export interface RiskGridResponse {
  cells: RiskGridCell[];
  total: number;
  timestamp: string;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timestamp: string;
  rainfall_mm: number;
  rainfall_1h: number;
  rainfall_24h: number;
  rainfall_3d: number;
  rainfall_7d: number;
  temperature: number | null;
  humidity: number | null;
  wind_speed: number | null;
  forecast_rainfall_24h: number;
}

export interface Alert {
  id: number;
  latitude: number | null;
  longitude: number | null;
  district: string | null;
  severity: AlertSeverity;
  risk_level: RiskLevel | null;
  message_en: string | null;
  message_hi: string | null;
  created_at: string;
  status: string;
  affected_villages: number;
  affected_roads: number;
  population_exposed: number;
}

export interface FieldReport {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  incident_type: IncidentType;
  description: string | null;
  media_url: string | null;
  severity: RiskLevel;
  sync_status: string;
  verified: boolean;
  district: string | null;
}

export interface LandslideEvent {
  id: number;
  latitude: number;
  longitude: number;
  event_date: string;
  district: string | null;
  state: string | null;
  severity: string | null;
  rainfall_mm: number | null;
  affected_road: string | null;
  affected_settlement: string | null;
  fatalities: number;
  source: string | null;
}

export interface DashboardKPIs {
  active_alerts: number;
  critical_zones: number;
  high_risk_zones: number;
  roads_at_risk: number;
  villages_at_risk: number;
  population_exposed: number;
  field_reports: number;
  sensors_online: number;
  data_sources_online: number;
  system_status: string;
  last_updated: string;
}

export interface ExposureData {
  latitude: number;
  longitude: number;
  radius_km: number;
  villages: {
    name: string;
    latitude: number;
    longitude: number;
    population: number;
    distance_km: number;
    risk_level: RiskLevel;
  }[];
  roads: {
    road_name: string;
    status: string;
    risk_level: RiskLevel;
    exposure_km: number;
    nearby_villages: number;
  }[];
  total_population: number;
  critical_infrastructure: number;
}

export interface DemoStep {
  step: number;
  title: string;
  description: string;
}

export interface AnalyticsData {
  total_events: number;
  monthly: { month: string; count: number }[];
  yearly: { year: number; count: number }[];
  by_district: { district: string; count: number }[];
  by_severity: Record<string, number>;
}

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const getDashboardKPIs = () => fetchAPI<DashboardKPIs>("/api/dashboard/kpis");
export const getAnalytics = () => fetchAPI<AnalyticsData>("/api/dashboard/analytics");

export const getRisk = (lat: number, lng: number) =>
  fetchAPI<RiskDetail>(`/api/risk/${lat}/${lng}`);
export const getRiskGrid = () => fetchAPI<RiskGridResponse>("/api/risk/grid");
export const getRiskForecast = (lat: number, lng: number) =>
  fetchAPI<RiskForecast>(`/api/risk/forecast/${lat}/${lng}`);

export const getWeather = (lat: number, lng: number) =>
  fetchAPI<WeatherData>(`/api/weather/${lat}/${lng}`);

export const getAlerts = () => fetchAPI<Alert[]>("/api/alerts");
export const getAlertCounts = () =>
  fetchAPI<Record<string, number>>("/api/alerts/count");

export const getReports = () => fetchAPI<FieldReport[]>("/api/reports");
export const createReport = (report: {
  latitude: number;
  longitude: number;
  incident_type: IncidentType;
  description?: string;
  severity?: RiskLevel;
  district?: string;
}) =>
  fetchAPI<FieldReport>("/api/reports", {
    method: "POST",
    body: JSON.stringify(report),
  });

export const getLandslideHistory = (params?: {
  district?: string;
  state?: string;
  year?: number;
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.district) searchParams.set("district", params.district);
  if (params?.state) searchParams.set("state", params.state);
  if (params?.year) searchParams.set("year", String(params.year));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return fetchAPI<LandslideEvent[]>(`/api/landslides/history${qs ? `?${qs}` : ""}`);
};

export const getLandslideStats = () =>
  fetchAPI<{
    total: number;
    by_state: Record<string, number>;
    by_severity: Record<string, number>;
    by_year: Record<string, number>;
  }>("/api/landslides/stats");

export const getExposure = (lat: number, lng: number, radius?: number) =>
  fetchAPI<ExposureData>(
    `/api/exposure/${lat}/${lng}${radius ? `?radius_km=${radius}` : ""}`
  );

export const getDemoSteps = () =>
  fetchAPI<{ steps: DemoStep[]; total: number }>("/api/demo/steps");

export const executeDemoStep = (step: number) =>
  fetchAPI<{ step: number; title: string; description: string; status: string }>(
    `/api/demo/step/${step}`,
    { method: "POST" }
  );

export const resetDemo = () =>
  fetchAPI<{ status: string; message: string }>("/api/demo/reset", {
    method: "POST",
  });
