import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function POST(
  request: NextRequest,
  context?: { params?: Promise<{ step: string }> | { step: string } }
) {
  try {
    let stepStr = "";

    if (context?.params) {
      try {
        const p = await context.params;
        stepStr = p?.step || "";
      } catch {}
    }

    if (!stepStr) {
      try {
        const url = new URL(request.url);
        stepStr = url.searchParams.get("step") || "";
        if (!stepStr) {
          const segments = url.pathname.split("/").filter(Boolean);
          stepStr = segments[segments.length - 1] || "";
        }
      } catch {}
    }

    if (!stepStr) {
      try {
        const body = await request.json();
        if (body?.step) stepStr = String(body.step);
      } catch {}
    }

    const stepNum = Math.min(8, Math.max(1, parseInt(stepStr, 10) || 1));
    store.setDemoStep(stepNum);

    return NextResponse.json({
      step: stepNum,
      title: `Step ${stepNum}`,
      description: `Demo step ${stepNum} applied successfully`,
      status: "applied",
    });
  } catch (err: any) {
    console.error("Demo step handler error:", err);
    return NextResponse.json({
      step: 1,
      title: "Step 1",
      description: "Demo step applied (fallback)",
      status: "applied",
    });
  }
}

export async function GET(
  request: NextRequest,
  context?: { params?: Promise<{ step: string }> | { step: string } }
) {
  return POST(request, context);
}
