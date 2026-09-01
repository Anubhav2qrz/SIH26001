import { NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function GET() {
  const cells = store.getRiskGrid();
  return NextResponse.json({
    cells,
    total: cells.length,
    timestamp: new Date().toISOString(),
  });
}
