import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ step: string }> }
) {
  const { step } = await params;
  const stepNum = parseInt(step, 10);
  store.setDemoStep(stepNum);

  return NextResponse.json({
    step: stepNum,
    title: `Step ${stepNum}`,
    description: `Demo step ${stepNum} applied successfully`,
    status: "applied",
  });
}
