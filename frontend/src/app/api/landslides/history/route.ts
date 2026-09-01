import { NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function GET() {
  const history = store.getHistoricalEvents();
  return NextResponse.json(history);
}
