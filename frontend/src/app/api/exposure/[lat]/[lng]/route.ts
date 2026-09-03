import { NextRequest, NextResponse } from "next/server";

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
          const expIdx = segments.indexOf("exposure");
          if (expIdx !== -1 && segments.length >= expIdx + 3) {
            latStr = segments[expIdx + 1];
            lngStr = segments[expIdx + 2];
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

  return NextResponse.json({
    latitude,
    longitude,
    radius_km: 10.0,
    villages: [
      { name: "Sohra Village", latitude: latitude + 0.01, longitude: longitude - 0.01, population: 11000, distance_km: 1.8, risk_level: "HIGH" },
      { name: "Mawkdok", latitude: latitude - 0.02, longitude: longitude + 0.01, population: 4200, distance_km: 3.4, risk_level: "MODERATE" },
      { name: "Laitkynsew", latitude: latitude + 0.03, longitude: longitude + 0.02, population: 2800, distance_km: 4.9, risk_level: "HIGH" },
    ],
    roads: [
      { road_name: "NH-6 Corridor", status: "AT_RISK", risk_level: "CRITICAL", exposure_km: 12.4, nearby_villages: 5 },
      { road_name: "SH-5 State Highway", status: "OPEN", risk_level: "MODERATE", exposure_km: 6.2, nearby_villages: 3 },
    ],
    total_population: 18000,
    critical_infrastructure: 3,
  });
}
