import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function GET(
  request: NextRequest,
  context?: { params?: Promise<{ lat: string; lng: string }> | { lat: string; lng: string } }
) {
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
          const riskIdx = segments.indexOf("risk");
          if (riskIdx !== -1 && segments.length >= riskIdx + 3) {
            latStr = segments[riskIdx + 1];
            lngStr = segments[riskIdx + 2];
          } else if (segments.length >= 2) {
            latStr = segments[segments.length - 2];
            lngStr = segments[segments.length - 1];
          }
        }
      } catch {}
    }

    const latitude = parseFloat(latStr) || 25.27;
    const longitude = parseFloat(lngStr) || 91.72;

    const detail = store.computeRiskForCoord(latitude, longitude);
    return NextResponse.json(detail);
  } catch (err: any) {
    console.error("Risk coordinate calculation error:", err);
    const detail = store.computeRiskForCoord(25.27, 91.72);
    return NextResponse.json(detail);
  }
}
