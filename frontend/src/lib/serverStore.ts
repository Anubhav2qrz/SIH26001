import { supabase, isSupabaseConfigured } from "./supabase";

export interface RiskCell {
  lat: number;
  lng: number;
  probability: number;
  risk_level: string;
}

export interface AlertItem {
  id: number;
  latitude: number | null;
  longitude: number | null;
  district: string | null;
  severity: "GREEN" | "YELLOW" | "ORANGE" | "RED";
  risk_level: string;
  message_en: string;
  message_hi: string;
  created_at: string;
  status: string;
  affected_villages: number;
  affected_roads: number;
  population_exposed: number;
}

export interface ReportItem {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  incident_type: string;
  description: string;
  severity: string;
  sync_status: string;
  verified: boolean;
  district: string;
  media_url?: string;
}

export interface LandslideHistoryItem {
  id: number;
  latitude: number;
  longitude: number;
  event_date: string;
  district: string;
  state: string;
  severity: string;
  rainfall_mm: number;
  affected_road?: string;
  affected_settlement?: string;
  fatalities: number;
  source: string;
}

const HISTORICAL_EVENTS: LandslideHistoryItem[] = [
  { id: 1, latitude: 25.27, longitude: 91.72, district: "East Khasi Hills", state: "Meghalaya", event_date: "2023-06-15T00:00:00Z", severity: "HIGH", rainfall_mm: 245, affected_road: "NH-6", affected_settlement: "Sohra", fatalities: 2, source: "GSI/ISRO" },
  { id: 2, latitude: 25.30, longitude: 91.68, district: "East Khasi Hills", state: "Meghalaya", event_date: "2022-07-20T00:00:00Z", severity: "CRITICAL", rainfall_mm: 310, affected_road: "NH-6", affected_settlement: "Mawsynram", fatalities: 5, source: "GSI/ISRO" },
  { id: 3, latitude: 25.22, longitude: 91.75, district: "East Khasi Hills", state: "Meghalaya", event_date: "2021-08-12T00:00:00Z", severity: "MODERATE", rainfall_mm: 180, affected_road: "SH-5", affected_settlement: "Laitlyngkot", fatalities: 0, source: "GSI/ISRO" },
  { id: 4, latitude: 25.35, longitude: 91.88, district: "East Khasi Hills", state: "Meghalaya", event_date: "2023-09-05T00:00:00Z", severity: "HIGH", rainfall_mm: 198, affected_road: "SH-5", affected_settlement: "Shillong", fatalities: 1, source: "GSI/ISRO" },
  { id: 5, latitude: 25.28, longitude: 91.70, district: "East Khasi Hills", state: "Meghalaya", event_date: "2020-07-03T00:00:00Z", severity: "CRITICAL", rainfall_mm: 352, affected_road: "NH-6", affected_settlement: "Sohra", fatalities: 8, source: "GSI/ISRO" },
  { id: 6, latitude: 25.68, longitude: 93.05, district: "Dima Hasao", state: "Assam", event_date: "2022-05-14T00:00:00Z", severity: "CRITICAL", rainfall_mm: 275, affected_road: "NH-54", affected_settlement: "Haflong", fatalities: 29, source: "GSI/ISRO" },
  { id: 7, latitude: 23.73, longitude: 92.72, district: "Aizawl", state: "Mizoram", event_date: "2023-06-12T00:00:00Z", severity: "CRITICAL", rainfall_mm: 268, affected_road: "NH-54", affected_settlement: "Aizawl", fatalities: 11, source: "GSI/ISRO" },
  { id: 8, latitude: 25.10, longitude: 94.20, district: "Senapati", state: "Manipur", event_date: "2023-07-15T00:00:00Z", severity: "CRITICAL", rainfall_mm: 245, affected_road: "NH-2", affected_settlement: "Mao", fatalities: 6, source: "GSI/ISRO" },
  { id: 9, latitude: 25.67, longitude: 94.12, district: "Kohima", state: "Nagaland", event_date: "2023-07-22T00:00:00Z", severity: "HIGH", rainfall_mm: 178, affected_road: "NH-29", affected_settlement: "Kohima", fatalities: 1, source: "GSI/ISRO" },
  { id: 10, latitude: 27.33, longitude: 88.62, district: "East Sikkim", state: "Sikkim", event_date: "2023-10-04T00:00:00Z", severity: "CRITICAL", rainfall_mm: 265, affected_road: "NH-10", affected_settlement: "Gangtok", fatalities: 42, source: "GSI/ISRO" },
  { id: 11, latitude: 27.10, longitude: 93.62, district: "Papum Pare", state: "Arunachal Pradesh", event_date: "2023-06-25T00:00:00Z", severity: "HIGH", rainfall_mm: 225, affected_road: "NH-415", affected_settlement: "Itanagar", fatalities: 3, source: "GSI/ISRO" },
  { id: 12, latitude: 23.84, longitude: 91.28, district: "West Tripura", state: "Tripura", event_date: "2023-08-08T00:00:00Z", severity: "MODERATE", rainfall_mm: 165, affected_road: "NH-44", affected_settlement: "Agartala", fatalities: 1, source: "GSI/ISRO" },
];

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 1,
    latitude: 25.30,
    longitude: 91.68,
    district: "East Khasi Hills",
    severity: "ORANGE",
    risk_level: "HIGH",
    message_en: "Elevated landslide risk near Mawsynram due to heavy rainfall. Monitor conditions closely.",
    message_hi: "भारी बारिश के कारण मॉसिनराम के पास भूस्खलन का खतरा बढ़ा। स्थिति पर करीबी नजर रखें।",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    status: "ACTIVE",
    affected_villages: 4,
    affected_roads: 2,
    population_exposed: 12000,
  },
  {
    id: 2,
    latitude: 25.68,
    longitude: 93.05,
    district: "Dima Hasao",
    severity: "YELLOW",
    risk_level: "MODERATE",
    message_en: "Moderate risk in Haflong corridor. Railway and NH-54 may be affected if rainfall continues.",
    message_hi: "हाफलोंग गलियारे में मध्यम खतरा। बारिश जारी रहने पर रेलवे और NH-54 प्रभावित हो सकते हैं।",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    status: "ACTIVE",
    affected_villages: 6,
    affected_roads: 2,
    population_exposed: 18000,
  },
  {
    id: 3,
    latitude: 23.73,
    longitude: 92.72,
    district: "Aizawl",
    severity: "YELLOW",
    risk_level: "MODERATE",
    message_en: "Moderate risk in Aizawl slopes. Citizens advised to avoid steep road sections.",
    message_hi: "आइजोल ढलानों में मध्यम खतरा। नागरिकों को खड़ी सड़क वर्गों से बचने की सलाह।",
    created_at: new Date(Date.now() - 14400000).toISOString(),
    status: "ACTIVE",
    affected_villages: 3,
    affected_roads: 1,
    population_exposed: 45000,
  },
];

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 1,
    latitude: 25.28,
    longitude: 91.71,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    incident_type: "CRACK",
    description: "Small tension cracks observed on slope shoulder near NH-6 km 42.",
    severity: "MODERATE",
    sync_status: "SYNCED",
    verified: true,
    district: "East Khasi Hills",
  },
  {
    id: 2,
    latitude: 25.31,
    longitude: 91.69,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    incident_type: "ROCKFALL",
    description: "Minor rockfall on road shoulder. Debris cleared.",
    severity: "LOW",
    sync_status: "SYNCED",
    verified: true,
    district: "East Khasi Hills",
  },
];

class ServerStore {
  private alerts: AlertItem[] = [...INITIAL_ALERTS];
  private reports: ReportItem[] = [...INITIAL_REPORTS];
  private demoStep: number = 0;
  private demoOverrides: { lat: number; lng: number; prob: number; risk: string }[] = [];

  constructor() {}

  getAlerts(): AlertItem[] {
    return this.alerts;
  }

  addAlert(alert: Omit<AlertItem, "id">): AlertItem {
    const newAlert: AlertItem = { ...alert, id: Date.now() };
    this.alerts.unshift(newAlert);
    return newAlert;
  }

  getReports(): ReportItem[] {
    return this.reports;
  }

  addReport(report: Omit<ReportItem, "id" | "timestamp" | "sync_status" | "verified">): ReportItem {
    const newReport: ReportItem = {
      ...report,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      sync_status: "SYNCED",
      verified: false,
    };
    this.reports.unshift(newReport);
    return newReport;
  }

  getHistoricalEvents(): LandslideHistoryItem[] {
    return HISTORICAL_EVENTS;
  }

  getRiskGrid(): RiskCell[] {
    const cells: RiskCell[] = [];
    for (let latIdx = 0; latIdx < 20; latIdx++) {
      for (let lngIdx = 0; lngIdx < 20; lngIdx++) {
        const lat = +(25.10 + latIdx * 0.025).toFixed(4);
        const lng = +(91.50 + lngIdx * 0.025).toFixed(4);

        const override = this.demoOverrides.find(
          (o) => Math.abs(o.lat - lat) < 0.015 && Math.abs(o.lng - lng) < 0.015
        );

        if (override) {
          cells.push({
            lat,
            lng,
            probability: override.prob,
            risk_level: override.risk,
          });
        } else {
          const baseSlope = ((latIdx * 7 + lngIdx * 13) % 45) + 5;
          const prob = +(Math.min(0.85, Math.max(0.1, (baseSlope / 60) * 0.6 + 0.15))).toFixed(2);
          const risk_level =
            prob <= 0.25 ? "LOW" : prob <= 0.5 ? "MODERATE" : prob <= 0.75 ? "HIGH" : "CRITICAL";

          cells.push({ lat, lng, probability: prob, risk_level });
        }
      }
    }
    return cells;
  }

  computeRiskForCoord(lat: number, lng: number) {
    const override = this.demoOverrides.find(
      (o) => Math.abs(o.lat - lat) < 0.03 && Math.abs(o.lng - lng) < 0.03
    );

    const prob = override ? override.prob : +(0.2 + (Math.abs(Math.sin(lat * 10)) * 0.3)).toFixed(2);
    const risk_level =
      prob <= 0.25 ? "LOW" : prob <= 0.5 ? "MODERATE" : prob <= 0.75 ? "HIGH" : "CRITICAL";

    return {
      latitude: lat,
      longitude: lng,
      probability: prob,
      risk_level,
      confidence: 0.88,
      timestamp: new Date().toISOString(),
      model_version: "v1.0 (XGBoost)",
      district: lat < 25.5 ? "East Khasi Hills" : "Ri-Bhoi",
      explanation: [
        { feature: "24h Antecedent Rainfall", contribution: +(prob * 0.4).toFixed(2), level: prob > 0.6 ? "HIGH" : "MEDIUM" },
        { feature: "Slope Steepness (DEM)", contribution: 0.22, level: "HIGH" },
        { feature: "Soil Saturation Index", contribution: +(prob * 0.3).toFixed(2), level: prob > 0.5 ? "HIGH" : "LOW" },
        { feature: "Historical Inventory Count", contribution: 0.12, level: "MEDIUM" },
      ],
      rainfall_24h: +(prob * 140).toFixed(1),
      soil_moisture: +(prob * 90).toFixed(0),
      slope: 38.5,
      elevation: 1240,
      historical_events: 14,
      nearby_villages: 4,
      nearby_roads: 2,
      population_exposure: 5200,
    };
  }

  setDemoStep(step: number) {
    this.demoStep = step;
    if (step === 1) {
      this.demoOverrides = [{ lat: 25.27, lng: 91.72, prob: 0.24, risk: "LOW" }];
    } else if (step === 2) {
      this.demoOverrides = [{ lat: 25.27, lng: 91.72, prob: 0.51, risk: "HIGH" }];
    } else if (step === 3) {
      this.demoOverrides = [{ lat: 25.27, lng: 91.72, prob: 0.76, risk: "HIGH" }];
    } else if (step >= 4) {
      this.demoOverrides = [{ lat: 25.27, lng: 91.72, prob: 0.89, risk: "CRITICAL" }];
    }

    if (step === 8) {
      this.addAlert({
        latitude: 25.27,
        longitude: 91.72,
        district: "East Khasi Hills",
        severity: "RED",
        risk_level: "CRITICAL",
        message_en: "URGENT LANDSLIDE WARNING: East Khasi Hills (Sohra & Mawsynram). Extreme soil saturation & 89% slope failure probability. Move to safe high ground immediately. Avoid NH-6.",
        message_hi: "आपातकालीन भूस्खलन चेतावनी: पूर्वी खासी हिल्स (सोहरा एवं मॉसिनराम)। अत्यधिक मिट्टी संतृप्ति और 89% भूस्खलन की संभावना। तुरंत सुरक्षित ऊंचे स्थानों पर जाएं।",
        created_at: new Date().toISOString(),
        status: "ACTIVE",
        affected_villages: 3,
        affected_roads: 1,
        population_exposed: 5200,
      });
    }
  }

  resetDemo() {
    this.demoStep = 0;
    this.demoOverrides = [];
    this.alerts = [...INITIAL_ALERTS];
    this.reports = [...INITIAL_REPORTS];
  }
}

export const store = new ServerStore();
