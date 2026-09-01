import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function GET() {
  const reports = store.getReports();
  return NextResponse.json(reports);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const newReport = store.addReport({
    latitude: body.latitude,
    longitude: body.longitude,
    incident_type: body.incident_type,
    description: body.description || "",
    severity: body.severity || "LOW",
    district: body.district || "East Khasi Hills",
    media_url: body.media_url,
  });
  return NextResponse.json(newReport, { status: 201 });
}
