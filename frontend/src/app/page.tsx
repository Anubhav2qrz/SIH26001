"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Shield,
  AlertTriangle,
  FileText,
  Mountain,
  Users,
  Truck,
  TrendingUp,
  Activity,
  Zap,
  Radio,
  Layers,
  MapPin,
  Camera,
  BarChart3,
  Map as MapIcon,
  Menu,
  X,
  Bot,
} from "lucide-react";
import {
  getDashboardKPIs as getKPIs,
  getAlerts,
  getReports,
  getRiskGrid,
  type DashboardKPIs as KPIData,
  type Alert,
  type FieldReport,
  type RiskGridCell,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import FieldReportModal from "@/components/reports/FieldReportModal";
import MultilingualAlertModal from "@/components/alerts/MultilingualAlertModal";
import HistoricalAnalyticsView from "@/components/analytics/HistoricalAnalyticsView";
import SitrepModal from "@/components/sitrep/SitrepModal";
import DisasterCopilot from "@/components/copilot/DisasterCopilot";

const RiskMap = dynamic(() => import("@/components/map/RiskMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0d1320]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Loading geospatial layers...</span>
      </div>
    </div>
  ),
});

const DemoController = dynamic(
  () => import("@/components/demo/DemoController"),
  { ssr: false }
);

function alertBorderClass(severity: string) {
  switch (severity) {
    case "GREEN":
      return "alert-green";
    case "YELLOW":
      return "alert-yellow";
    case "ORANGE":
      return "alert-orange";
    case "RED":
      return "alert-red";
    default:
      return "";
  }
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return "Just now";
  const normalized = dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : `${dateStr}Z`;
  const time = new Date(normalized).getTime();
  const diff = Math.max(0, Date.now() - time);
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "Just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function KPICard({
  icon: Icon,
  label,
  value,
  color = "text-blue-400",
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color?: string;
  delay?: number;
}) {
  return (
    <div
      className="glass-card-static p-3 relative overflow-hidden group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
          {label}
        </span>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="text-xl font-bold font-[family-name:var(--font-mono)] text-white tracking-tight">
        {value}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [riskGrid, setRiskGrid] = useState<RiskGridCell[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidePanel, setSidePanel] = useState<"kpi" | "alerts" | "reports">("kpi");
  const [mobileTab, setMobileTab] = useState<"map" | "kpi" | "alerts" | "reports">("map");
  const [isDemo, setIsDemo] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAlertDispatchOpen, setIsAlertDispatchOpen] = useState(false);
  const [isSitrepOpen, setIsSitrepOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [kpiData, alertData, reportData, gridData] = await Promise.all([
        getKPIs(),
        getAlerts(),
        getReports(),
        getRiskGrid(),
      ]);
      setKpis(kpiData);
      setAlerts(alertData);
      setReports(reportData);
      setRiskGrid(gridData.cells);
    } catch (err) {
      console.error("Dashboard refresh error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setMobileTab("map");
  };

  const renderSidebarContent = () => (
    <div className="p-4 space-y-3.5">
      {sidePanel === "kpi" && kpis && (
        <>
          <div className="grid grid-cols-2 gap-2.5">
            <KPICard
              icon={AlertTriangle}
              label="Active Alerts"
              value={kpis.active_alerts}
              color="text-red-400"
              delay={50}
            />
            <KPICard
              icon={Mountain}
              label="Critical Zones"
              value={kpis.critical_zones}
              color="text-red-400"
              delay={100}
            />
            <KPICard
              icon={Activity}
              label="High-Risk Zones"
              value={kpis.high_risk_zones}
              color="text-orange-400"
              delay={150}
            />
            <KPICard
              icon={Truck}
              label="Roads at Risk"
              value={kpis.roads_at_risk}
              color="text-amber-400"
              delay={200}
            />
            <KPICard
              icon={Users}
              label="Population Exposed"
              value={
                kpis.population_exposed > 1000
                  ? `${(kpis.population_exposed / 1000).toFixed(1)}K`
                  : kpis.population_exposed
              }
              color="text-purple-400"
              delay={250}
            />
            <KPICard
              icon={FileText}
              label="Field Reports"
              value={kpis.field_reports}
              color="text-teal-400"
              delay={300}
            />
            <KPICard
              icon={Radio}
              label="Sensors Online"
              value={kpis.sensors_online}
              color="text-blue-400"
              delay={350}
            />
            <KPICard
              icon={Layers}
              label="Data Sources"
              value={kpis.data_sources_online}
              color="text-indigo-400"
              delay={400}
            />
          </div>

          <div className="glass-card-static p-4 mt-2">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Response Prioritisation
              </h3>
              <span className="text-[10px] text-red-400 font-bold px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                RANK 1 ACTIVE
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>Zone: East Khasi Hills (NH-6)</span>
                <span className="text-red-400 font-mono">Score: 94/100</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Hazard (89%) × Exposure (5.2k Pop + NH-6) × Vulnerability (Steep Cut).
              </p>
              <div className="text-[10px] text-amber-400 flex items-center gap-1 font-medium pt-1">
                <span>Action:</span> Road closure & deployment of SDRF team.
              </div>
            </div>
          </div>

          <div className="glass-card-static p-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Geospatial Risk Spectrum
            </h3>
            <div className="space-y-2.5">
              {[
                { level: "CRITICAL", count: kpis.critical_zones, color: "bg-red-500", pct: 15 },
                { level: "HIGH", count: kpis.high_risk_zones, color: "bg-orange-500", pct: 25 },
                { level: "MODERATE", count: Math.floor(riskGrid.length * 0.3), color: "bg-amber-500", pct: 30 },
                { level: "LOW", count: Math.floor(riskGrid.length * 0.4), color: "bg-emerald-500", pct: 30 },
              ].map((item) => (
                <div key={item.level}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">{item.level}</span>
                    <span className="text-slate-300 font-mono">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {sidePanel === "alerts" && (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Dispatched Alerts ({alerts.length})
            </h3>
            <button
              onClick={() => setIsAlertDispatchOpen(true)}
              className="text-[10px] text-red-400 hover:text-red-300 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20"
            >
              + New Warning
            </button>
          </div>
          {alerts.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">
              No active alerts in monitored sector
            </p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`glass-card-static p-3 cursor-pointer hover:border-slate-600 transition-colors ${alertBorderClass(
                  alert.severity
                )}`}
                onClick={() => {
                  if (alert.latitude && alert.longitude)
                    handleMapClick(alert.latitude, alert.longitude);
                }}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        alert.severity === "RED"
                          ? "text-red-400"
                          : alert.severity === "ORANGE"
                          ? "text-orange-400"
                          : alert.severity === "YELLOW"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-200">
                      {alert.severity} EARLY WARNING
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {timeAgo(alert.created_at)}
                  </span>
                </div>
                {alert.district && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-1 font-medium">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    {alert.district}
                  </p>
                )}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {alert.message_en}
                </p>
                {(alert.affected_villages > 0 || alert.population_exposed > 0) && (
                  <div className="flex gap-3 mt-2 text-[10px] text-slate-500 font-mono">
                    <span>🏘️ {alert.affected_villages} villages</span>
                    <span>👥 {alert.population_exposed.toLocaleString()} people</span>
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {sidePanel === "reports" && (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Ground Field Reports ({reports.length})
            </h3>
            <button
              onClick={() => setIsReportOpen(true)}
              className="text-[10px] text-orange-400 hover:text-orange-300 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20"
            >
              + Add Report
            </button>
          </div>
          {reports.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">
              No field reports submitted yet.
            </p>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="glass-card-static p-3 cursor-pointer hover:border-slate-600 transition-colors"
                onClick={() => handleMapClick(report.latitude, report.longitude)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      report.severity === "CRITICAL"
                        ? "risk-critical"
                        : report.severity === "HIGH"
                        ? "risk-high"
                        : report.severity === "MODERATE"
                        ? "risk-moderate"
                        : "risk-low"
                    }`}
                  >
                    {report.incident_type.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {timeAgo(report.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {report.description}
                </p>
                {report.district && (
                  <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-blue-400" />
                    {report.district} ({report.latitude.toFixed(3)}°N, {report.longitude.toFixed(3)}°E)
                  </p>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0a0e1a]">
      {/* App Header */}
      <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-5 border-b border-slate-800/80 bg-[#0c1222]/95 backdrop-blur-xl z-40 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight flex items-center">
                <span className="text-blue-400">LAND</span>
                <span className="text-white">GUARD</span>
                <span className="text-slate-500 ml-1 sm:ml-1.5 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                  NER
                </span>
              </h1>
              <p className="hidden sm:block text-[10px] text-slate-400 font-medium">
                AI Landslide Early Warning System · SIH26001
              </p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 ml-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="status-dot active" />
            <span className="text-xs text-emerald-400 font-semibold">
              SUPABASE DB LIVE
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">
              GEMINI 1.5 + XGBOOST
            </span>
          </div>
        </div>

        {/* Desktop Header Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setIsSitrepOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 hover:bg-blue-500/20 transition-all flex items-center gap-1.5"
            title="Generate NDMA Situation Report with Gemini"
          >
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span>AI SITREP</span>
          </button>

          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-300 hover:bg-purple-500/20 transition-all flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>

          {(profile.role === "AUTHORITY" || profile.role === "ADMIN") && (
            <button
              onClick={() => setIsAlertDispatchOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>Broadcast Warning</span>
            </button>
          )}

          <button
            onClick={() => setIsReportOpen(true)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>+ Report Incident</span>
          </button>

          <button
            onClick={() => setIsDemo(!isDemo)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isDemo
                ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
                : "bg-slate-900 text-purple-400 border-slate-700"
            }`}
          >
            SIH Demo {isDemo ? "ON" : "OFF"}
          </button>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs">
              {profile.name[0]}
            </div>
            <div className="leading-tight">
              <span className="text-xs font-bold text-slate-200 block truncate max-w-[120px]">
                {profile.name}
              </span>
              <span className="text-[10px] text-blue-400 font-medium">
                {profile.role}
              </span>
            </div>
          </button>
        </div>

        {/* Mobile Header Actions */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsReportOpen(true)}
            className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md transition-all flex items-center gap-1"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>+ Report</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Top Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 p-4 space-y-3 z-50 animate-slide-in-up">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs">
                {profile.name[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{profile.name}</p>
                <p className="text-[10px] text-blue-400 font-medium">{profile.role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsAuthOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="text-xs bg-blue-600 px-2.5 py-1 rounded-lg text-white font-medium"
            >
              Switch Role
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setIsSitrepOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Bot className="w-4 h-4 text-blue-400" />
              AI SITREP
            </button>

            <button
              onClick={() => {
                setIsAnalyticsOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </button>
          </div>

          <button
            onClick={() => {
              setIsDemo(!isDemo);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
              isDemo
                ? "bg-purple-600 text-white border-purple-500"
                : "bg-slate-950 text-purple-400 border-slate-800"
            }`}
          >
            SIH Demo Mode: {isDemo ? "ACTIVE" : "OFF"}
          </button>

          {(profile.role === "AUTHORITY" || profile.role === "ADMIN") && (
            <button
              onClick={() => {
                setIsAlertDispatchOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Radio className="w-4 h-4 text-red-400" />
              Broadcast Emergency Warning
            </button>
          )}
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 lg:w-80 sidebar flex-col shrink-0 overflow-y-auto border-r border-slate-800">
          <div className="flex border-b border-slate-800 bg-slate-950/40">
            {(
              [
                { key: "kpi", icon: BarChart3, label: "Overview" },
                { key: "alerts", icon: AlertTriangle, label: `Alerts (${alerts.length})` },
                { key: "reports", icon: FileText, label: `Reports (${reports.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSidePanel(tab.key)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-all ${
                  sidePanel === tab.key
                    ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/5"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {renderSidebarContent()}
          </div>
        </aside>

        {/* Map / Primary Visualization Container */}
        <main className="flex-1 relative w-full h-full">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-[#0d1320]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Initializing LANDGUARD NER spatial GIS...</p>
              </div>
            </div>
          ) : (
            <RiskMap
              riskGrid={riskGrid}
              alerts={alerts}
              reports={reports}
              selectedLocation={selectedLocation}
              onMapClick={handleMapClick}
              onRefresh={fetchData}
            />
          )}
        </main>

        {/* Mobile Sliding Bottom Sheet for Overview / Alerts / Reports */}
        {mobileTab !== "map" && (
          <div className="md:hidden fixed inset-x-0 bottom-14 max-h-[70vh] bg-[#0d1320]/95 backdrop-blur-2xl border-t border-slate-700/80 rounded-t-2xl shadow-2xl overflow-y-auto z-40 animate-slide-in-up">
            <div className="sticky top-0 z-10 bg-[#0d1320]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between">
              <div className="w-10 h-1 bg-slate-700 rounded-full absolute left-1/2 -translate-x-1/2 top-1.5" />
              <span className="text-xs font-bold text-white uppercase tracking-wider mt-2">
                {mobileTab === "kpi"
                  ? "System Overview"
                  : mobileTab === "alerts"
                  ? `Active Alerts (${alerts.length})`
                  : `Ground Reports (${reports.length})`}
              </span>
              <button
                onClick={() => setMobileTab("map")}
                className="p-1 rounded-lg text-slate-400 hover:text-white mt-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderSidebarContent()}
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden h-14 bg-[#0c1222]/98 backdrop-blur-xl border-t border-slate-800/80 grid grid-cols-4 items-center z-40 shrink-0">
        {[
          { key: "map" as const, icon: MapIcon, label: "Map" },
          { key: "kpi" as const, icon: BarChart3, label: "Overview" },
          { key: "alerts" as const, icon: AlertTriangle, label: `Alerts (${alerts.length})` },
          { key: "reports" as const, icon: FileText, label: `Reports (${reports.length})` },
        ].map((item) => {
          const isActive = mobileTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                if (item.key !== "map") {
                  setSidePanel(item.key);
                }
                setMobileTab(item.key);
              }}
              className={`flex flex-col items-center justify-center gap-1 h-full transition-colors ${
                isActive ? "text-blue-400 bg-blue-500/10 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Modals & AI Copilot */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <FieldReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        defaultCoords={selectedLocation}
        onReportSubmitted={fetchData}
      />
      <HistoricalAnalyticsView
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />
      <MultilingualAlertModal
        isOpen={isAlertDispatchOpen}
        onClose={() => setIsAlertDispatchOpen(false)}
      />
      <SitrepModal
        isOpen={isSitrepOpen}
        onClose={() => setIsSitrepOpen(false)}
        kpis={kpis}
      />

      <DisasterCopilot
        district="East Khasi Hills"
        alertsCount={alerts.length}
        rainfall={185}
        highestRisk="CRITICAL"
      />

      {isDemo && <DemoController onDataChange={fetchData} />}
    </div>
  );
}
