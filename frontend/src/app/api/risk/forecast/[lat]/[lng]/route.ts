import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function GET(
  request: NextRequest,
  context?: { params?: Promise<{ lat: string; lng: string }> | { lat: string; lng: string } }
) {
  let latitude = 25.27;
  let longitude = 91.72;

  try {
    let latStr = "";
    let lngStr = "";

    if (context?.params) {
      try {
        const p = await context.params;
        latStr = p?.lat || "";
        lngStr = p?.lng || "";
      } catch {}
    }

    if (!latStr || !lngStr) {
      try {
        const url = new URL(request.url);
        latStr = url.searchParams.get("lat") || "";
        lngStr = url.searchParams.get("lng") || "";

        if (!latStr || !lngStr) {
          const segments = url.pathname.split("/").filter(Boolean);
          const fIdx = segments.indexOf("forecast");
          if (fIdx !== -1 && segments.length >= fIdx + 3) {
            latStr = segments[fIdx + 1];
            lngStr = segments[fIdx + 2];
          } else if (segments.length >= 2) {
            latStr = segments[segments.length - 2];
            lngStr = segments[segments.length - 1];
          }
        }
      } catch {}
    }

    latitude = parseFloat(latStr) || 25.27;
    longitude = parseFloat(lngStr) || 91.72;
  } catch {}

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
