import { NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function GET() {
  const alerts = store.getAlerts();
  const reports = store.getReports();
  const grid = store.getRiskGrid();

  const critical = grid.filter((c) => c.risk_level === "CRITICAL").length;
  const high = grid.filter((c) => c.risk_level === "HIGH").length;

  return NextResponse.json({
    active_alerts: alerts.length,
    critical_zones: critical,
    high_risk_zones: high,
    roads_at_risk: 4,
    villages_at_risk: 8,
    population_exposed: 14200,
    field_reports: reports.length,
    sensors_online: 12,
    data_sources_online: 4,
    system_status: "ACTIVE",
    last_updated: new Date().toISOString(),
  });
}
