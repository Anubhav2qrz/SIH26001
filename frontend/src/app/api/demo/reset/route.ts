import { NextResponse } from "next/server";
import { store } from "@/lib/serverStore";

export async function POST() {
  store.resetDemo();
  return NextResponse.json({ status: "reset", message: "Demo reset to initial state" });
}
