import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lat: string; lng: string }> }
) {
  const { lat, lng } = await params;
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  const baseRisk = store.computeRiskForCoord(latitude, longitude);
  const baseProb = baseRisk.probability;

  const hours = [0, 3, 6, 9, 12, 15, 18, 21, 24];
  const forecast = hours.map((h) => {
    const prob = +(Math.max(0.1, Math.min(0.95, baseProb + Math.sin(h / 3) * 0.12 + (h * 0.005)))).toFixed(2);
    const risk_level =
      prob <= 0.25 ? "LOW" : prob <= 0.5 ? "MODERATE" : prob <= 0.75 ? "HIGH" : "CRITICAL";

    return {
      time: `+${h}h`,
      probability: prob,
      risk_level,
    };
  });

  return NextResponse.json({
    latitude,
    longitude,
    district: baseRisk.district,
    forecast,
  });
}
