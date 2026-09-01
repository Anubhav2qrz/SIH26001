import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function GET() {
  const alerts = store.getAlerts();
  return NextResponse.json(alerts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const newAlert = store.addAlert(body);
  return NextResponse.json(newAlert, { status: 201 });
}
