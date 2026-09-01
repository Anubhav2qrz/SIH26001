import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lat: string; lng: string }> }
) {
  const { lat, lng } = await params;
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

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
