import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lat: string; lng: string }> }
) {
  const { lat, lng } = await params;
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  const detail = store.computeRiskForCoord(latitude, longitude);
  return NextResponse.json(detail);
}
