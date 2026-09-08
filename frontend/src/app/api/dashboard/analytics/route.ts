import { NextResponse } from "next/server";
import gsiAnalytics from "@/data/gsi_analytics_summary.json";

export async function GET() {
  return NextResponse.json(gsiAnalytics);
}

