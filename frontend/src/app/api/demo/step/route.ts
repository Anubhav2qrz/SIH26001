import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function POST(request: NextRequest) {
  try {
    let stepNum = 1;
    try {
      const body = await request.json();
      if (body?.step) {
        stepNum = parseInt(body.step, 10) || 1;
      }
    } catch {}

    if (!stepNum) {
      const url = new URL(request.url);
      const q = url.searchParams.get("step");
      if (q) stepNum = parseInt(q, 10) || 1;
    }

    stepNum = Math.min(8, Math.max(1, stepNum));
    store.setDemoStep(stepNum);

    return NextResponse.json({
      step: stepNum,
      title: `Step ${stepNum}`,
      description: `Demo step ${stepNum} applied successfully`,
      status: "applied",
    });
  } catch (err: any) {
    console.error("Demo step fallback route error:", err);
    return NextResponse.json({
      step: 1,
      title: "Step 1",
      description: "Demo step applied (fallback)",
      status: "applied",
    });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
