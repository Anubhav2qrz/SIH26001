import { NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function GET() {
  const events = store.getHistoricalEvents();
  const by_state: Record<string, number> = {};
  const by_severity: Record<string, number> = {};
  const by_year: Record<string, number> = {};

  for (const e of events) {
    by_state[e.state] = (by_state[e.state] || 0) + 1;
    by_severity[e.severity] = (by_severity[e.severity] || 0) + 1;
    const yr = e.event_date ? new Date(e.event_date).getFullYear().toString() : "2023";
    by_year[yr] = (by_year[yr] || 0) + 1;
  }

  return NextResponse.json({
    total: events.length,
    by_state,
    by_severity,
    by_year,
  });
}
