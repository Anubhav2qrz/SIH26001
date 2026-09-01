"use client";

import {
  X,
  MapPin,
  CloudRain,
  Droplets,
  Mountain,
  History,
  Users,
  Truck,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import type {
  RiskDetail,
  ExposureData,
  RiskForecast,
  WeatherData,
} from "@/lib/api";

interface LocationDetailProps {
  data: {
    risk: RiskDetail;
    exposure: ExposureData;
    forecast: RiskForecast;
    weather: WeatherData;
  };
  onClose: () => void;
}

function riskBadgeClass(level: string) {
  switch (level) {
    case "LOW":
      return "risk-low";
    case "MODERATE":
      return "risk-moderate";
    case "HIGH":
      return "risk-high";
    case "CRITICAL":
      return "risk-critical";
    default:
      return "risk-low";
  }
}

function riskColor(level: string) {
  switch (level) {
    case "LOW":
      return "#22c55e";
    case "MODERATE":
      return "#f59e0b";
    case "HIGH":
      return "#f97316";
    case "CRITICAL":
      return "#ef4444";
    default:
      return "#6b7280";
  }
}

function contributionBarColor(level: string) {
  switch (level) {
    case "HIGH":
      return "bg-red-500";
    case "MEDIUM":
      return "bg-amber-500";
    case "LOW":
      return "bg-emerald-500";
    default:
      return "bg-gray-500";
  }
}

export default function LocationDetail({ data, onClose }: LocationDetailProps) {
  const { risk, exposure, forecast, weather } = data;

  return (
    <div className="absolute top-0 right-0 h-full w-[380px] z-30 animate-slide-in-right">
      <div className="h-full bg-[#0d1320]/95 backdrop-blur-xl border-l border-gray-800/60 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#0d1320]/95 backdrop-blur-xl border-b border-gray-800/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-gray-200">
                Location Analysis
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">
                {risk.district || `${risk.latitude.toFixed(4)}°N, ${risk.longitude.toFixed(4)}°E`}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="text-3xl font-bold font-[family-name:var(--font-mono)]"
                  style={{ color: riskColor(risk.risk_level) }}
                >
                  {(risk.probability * 100).toFixed(0)}%
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${riskBadgeClass(
                    risk.risk_level
                  )}`}
                >
                  {risk.risk_level}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500">Confidence</p>
              <p className="text-sm font-mono text-gray-300">
                {(risk.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
              Conditions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  icon: CloudRain,
                  label: "Rainfall 24h",
                  value: weather.rainfall_24h
                    ? `${weather.rainfall_24h.toFixed(0)} mm`
                    : "—",
                  color: "text-blue-400",
                },
                {
                  icon: Droplets,
                  label: "Soil Moisture",
                  value: risk.soil_moisture
                    ? `${risk.soil_moisture.toFixed(0)}%`
                    : "—",
                  color: "text-cyan-400",
                },
                {
                  icon: Mountain,
                  label: "Slope",
                  value: risk.slope
                    ? `${risk.slope.toFixed(1)}°`
                    : "—",
                  color: "text-amber-400",
                },
                {
                  icon: TrendingUp,
                  label: "Elevation",
                  value: risk.elevation
                    ? `${risk.elevation.toFixed(0)} m`
                    : "—",
                  color: "text-emerald-400",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="glass-card-static p-2.5 flex items-center gap-2.5"
                >
                  <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                  <div>
                    <p className="text-[10px] text-gray-500">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-200 font-[family-name:var(--font-mono)]">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card-static p-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Rainfall Accumulation
            </h3>
            <div className="space-y-1.5">
              {[
                { label: "1 hour", value: weather.rainfall_1h },
                { label: "24 hours", value: weather.rainfall_24h },
                { label: "3 days", value: weather.rainfall_3d },
                { label: "7 days", value: weather.rainfall_7d },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(
                            (item.value / 400) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-300 font-mono w-14 text-right">
                      {item.value.toFixed(1)} mm
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {weather.temperature && (
              <div className="flex gap-4 mt-2.5 pt-2.5 border-t border-gray-800/60 text-xs">
                <span className="text-gray-500">
                  🌡 {weather.temperature.toFixed(1)}°C
                </span>
                <span className="text-gray-500">
                  💧 {weather.humidity?.toFixed(0)}%
                </span>
                <span className="text-gray-500">
                  💨 {weather.wind_speed?.toFixed(0)} km/h
                </span>
              </div>
            )}
          </section>

          <section className="glass-card-static p-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              24-Hour Risk Forecast
            </h3>
            <div className="flex items-end gap-1 h-20">
              {forecast.forecast.map((point, i) => {
                const height = Math.max(point.probability * 100, 5);
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full rounded-t transition-all duration-500"
                      style={{
                        height: `${height}%`,
                        backgroundColor: riskColor(point.risk_level),
                        opacity: 0.8,
                      }}
                    />
                    <span className="text-[8px] text-gray-500">
                      {point.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {risk.explanation.length > 0 && (
            <section className="glass-card-static p-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                Contributing Risk Factors
              </h3>
              <div className="space-y-2">
                {risk.explanation.map((exp, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-300 flex-1 truncate">
                      {exp.feature}
                    </span>
                    <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${contributionBarColor(
                          exp.level
                        )} transition-all duration-700`}
                        style={{
                          width: `${Math.min(
                            Math.abs(exp.contribution) * 300,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        exp.level === "HIGH"
                          ? "text-red-400 bg-red-400/10"
                          : exp.level === "MEDIUM"
                          ? "text-amber-400 bg-amber-400/10"
                          : "text-emerald-400 bg-emerald-400/10"
                      }`}
                    >
                      {exp.level}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
              Exposure Analysis
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="glass-card-static p-2.5 text-center">
                <History className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-200 font-[family-name:var(--font-mono)]">
                  {risk.historical_events}
                </p>
                <p className="text-[9px] text-gray-500">Past Events</p>
              </div>
              <div className="glass-card-static p-2.5 text-center">
                <Users className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-200 font-[family-name:var(--font-mono)]">
                  {exposure.total_population > 1000
                    ? `${(exposure.total_population / 1000).toFixed(1)}K`
                    : exposure.total_population}
                </p>
                <p className="text-[9px] text-gray-500">Population</p>
              </div>
              <div className="glass-card-static p-2.5 text-center">
                <AlertTriangle className="w-4 h-4 text-red-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-200 font-[family-name:var(--font-mono)]">
                  {exposure.critical_infrastructure}
                </p>
                <p className="text-[9px] text-gray-500">Critical Infra</p>
              </div>
            </div>

            {exposure.villages.length > 0 && (
              <div className="glass-card-static p-3 mb-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                  Nearby Villages ({exposure.villages.length})
                </p>
                {exposure.villages.slice(0, 5).map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 border-b border-gray-800/40 last:border-0"
                  >
                    <div>
                      <span className="text-xs text-gray-300">{v.name}</span>
                      <span className="text-[10px] text-gray-500 ml-2">
                        {v.distance_km} km
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500">
                        👥 {v.population.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {exposure.roads.length > 0 && (
              <div className="glass-card-static p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                  Roads ({exposure.roads.length})
                </p>
                {exposure.roads.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 border-b border-gray-800/40 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-300">
                        {r.road_name}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${riskBadgeClass(
                        r.risk_level
                      )}`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="text-center text-[10px] text-gray-600 pt-2 pb-4">
            Model: {risk.model_version} · Confidence:{" "}
            {(risk.confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}
