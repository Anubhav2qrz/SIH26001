import { NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function GET() {
  const events = store.getHistoricalEvents();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return NextResponse.json({
    total_events: 118,
    monthly: [
      { month: "Jan", count: 2 },
      { month: "Feb", count: 1 },
      { month: "Mar", count: 4 },
      { month: "Apr", count: 6 },
      { month: "May", count: 15 },
      { month: "Jun", count: 32 },
      { month: "Jul", count: 38 },
      { month: "Aug", count: 28 },
      { month: "Sep", count: 18 },
      { month: "Oct", count: 7 },
      { month: "Nov", count: 2 },
      { month: "Dec", count: 1 },
    ],
    yearly: [
      { year: 2018, count: 14 },
      { year: 2019, count: 18 },
      { year: 2020, count: 22 },
      { year: 2021, count: 19 },
      { year: 2022, count: 31 },
      { year: 2023, count: 36 },
      { year: 2024, count: 28 },
    ],
    by_district: [
      { district: "East Khasi Hills", count: 34 },
      { district: "Dima Hasao", count: 29 },
      { district: "Aizawl", count: 21 },
      { district: "Senapati", count: 18 },
      { district: "East Sikkim", count: 16 },
      { district: "West Kameng", count: 12 },
      { district: "Kohima", count: 11 },
      { district: "Papum Pare", count: 9 },
    ],
    by_severity: {
      CRITICAL: 28,
      HIGH: 45,
      MODERATE: 32,
      LOW: 13,
    },
  });
}
