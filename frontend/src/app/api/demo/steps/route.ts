import { NextResponse } from "next/server";

const DEMO_STEPS = [
  { step: 1, title: "Normal Conditions", description: "The region is under normal monitoring. Moderate rainfall, stable slopes. Risk is LOW at 24%." },
  { step: 2, title: "Heavy Rainfall Detected", description: "Rainfall intensity increases sharply. 85mm recorded in last 6 hours. Risk rises to 51% — HIGH." },
  { step: 3, title: "Soil Moisture Surge", description: "Soil sensors report moisture rising from 65% to 83%. Ground is becoming saturated. Risk jumps to 76%." },
  { step: 4, title: "AI Critical Warning", description: "The ML model detects convergence of all risk factors. CRITICAL ZONE identified at 89% probability." },
  { step: 5, title: "Exposure Analysis", description: "System identifies 3 villages, 1 major road (NH-6), 2 bridges, and ~5,000 people in the exposure zone." },
  { step: 6, title: "Response Prioritisation", description: "Priority Score calculated: CRITICAL. Recommended: inspect NH-6, alert settlements, prepare evacuation." },
  { step: 7, title: "Field Report Received", description: "A field officer uploads a slope crack photo with GPS coordinates. Report marked HIGH PRIORITY." },
  { step: 8, title: "Multilingual Alert Issued", description: "Platform generates alerts in English, Hindi, and Khasi. SMS and push notifications dispatched." },
];

export async function GET() {
  return NextResponse.json({ steps: DEMO_STEPS, total: DEMO_STEPS.length });
}
