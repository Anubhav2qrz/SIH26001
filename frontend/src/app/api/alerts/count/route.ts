import { NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function GET() {
  const alerts = store.getAlerts();
  const counts = { GREEN: 0, YELLOW: 0, ORANGE: 0, RED: 0, total: alerts.length };
  for (const a of alerts) {
    if (a.severity in counts) {
      counts[a.severity]++;
    }
  }
  return NextResponse.json(counts);
}
