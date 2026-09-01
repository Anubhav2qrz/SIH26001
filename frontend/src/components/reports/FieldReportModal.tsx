"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  WifiOff,
  RefreshCw,
  Send,
} from "lucide-react";
import { createReport, IncidentType, RiskLevel } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface FieldReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCoords?: { lat: number; lng: number } | null;
  onReportSubmitted: () => void;
}

const OFFLINE_STORAGE_KEY = "landguard_offline_reports";

export default function FieldReportModal({
  isOpen,
  onClose,
  defaultCoords,
  onReportSubmitted,
}: FieldReportModalProps) {
  const { profile } = useAuth();
  const [lat, setLat] = useState<number>(defaultCoords?.lat || 25.27);
  const [lng, setLng] = useState<number>(defaultCoords?.lng || 91.72);
  const [incidentType, setIncidentType] = useState<IncidentType>("CRACK");
  const [severity, setSeverity] = useState<RiskLevel>("HIGH");
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState("East Khasi Hills");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "offline"; text: string } | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (defaultCoords) {
      setLat(defaultCoords.lat);
      setLng(defaultCoords.lng);
    }
  }, [defaultCoords]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (stored) {
        try {
          const list = JSON.parse(stored);
          setPendingCount(list.length || 0);
        } catch {}
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusMsg({ type: "error", text: "Geolocation is not supported by your browser." });
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(parseFloat(pos.coords.latitude.toFixed(5)));
        setLng(parseFloat(pos.coords.longitude.toFixed(5)));
        setIsGettingLocation(false);
        setStatusMsg({ type: "success", text: "GPS location captured." });
      },
      (err) => {
        setIsGettingLocation(false);
        setStatusMsg({ type: "error", text: `GPS error: ${err.message}. Using manual coordinates.` });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    const reportPayload = {
      latitude: Number(lat),
      longitude: Number(lng),
      incident_type: incidentType,
      severity,
      description: description || `Field observation by ${profile.name}`,
      district,
    };

    try {
      await createReport(reportPayload);
      setStatusMsg({ type: "success", text: "Field report submitted to SDMA dashboard." });
      setTimeout(() => {
        onReportSubmitted();
        onClose();
        setDescription("");
        setMediaPreview(null);
      }, 1200);
    } catch {
      const existing = JSON.parse(localStorage.getItem(OFFLINE_STORAGE_KEY) || "[]");
      existing.push({ ...reportPayload, timestamp: new Date().toISOString() });
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(existing));
      setPendingCount(existing.length);

      setStatusMsg({
        type: "offline",
        text: `Report saved in offline queue (${existing.length} pending). Will sync when online.`,
      });
      setTimeout(() => {
        onReportSubmitted();
        onClose();
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-wide">
                Submit Geo-Tagged Field Report
              </h3>
              <p className="text-xs text-slate-400">
                Reporting as: <span className="text-orange-300 font-medium">{profile.name}</span> ({profile.role})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {statusMsg && (
            <div
              className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-xs leading-relaxed ${
                statusMsg.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : statusMsg.type === "offline"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {statusMsg.type === "offline" ? (
                <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
              ) : statusMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> GPS Coordinates
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isGettingLocation ? "animate-spin" : ""}`} />
                {isGettingLocation ? "Locating..." : "Auto-Capture"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 uppercase">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                Incident Classification
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="CRACK">Slope Crack / Tension Fracture</option>
                <option value="SLOPE_MOVEMENT">Slope Creep / Soil Movement</option>
                <option value="ROCKFALL">Rockfall / Debris Falling</option>
                <option value="LANDSLIDE">Active Landslide</option>
                <option value="MUD_MOVEMENT">Mudflow / Slurry</option>
                <option value="BLOCKED_ROAD">Road Blockage</option>
                <option value="FLOODING">Flash Flood</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                Estimated Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as RiskLevel)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">
              District / Region
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="East Khasi Hills">East Khasi Hills (Sohra, Shillong)</option>
              <option value="West Khasi Hills">West Khasi Hills (Nongstoin)</option>
              <option value="Ri-Bhoi">Ri-Bhoi (Nongpoh)</option>
              <option value="West Jaintia Hills">West Jaintia Hills (Jowai)</option>
              <option value="Dima Hasao">Dima Hasao (Haflong, Assam)</option>
              <option value="Aizawl">Aizawl (Mizoram)</option>
              <option value="Senapati">Senapati (Manipur)</option>
              <option value="Kohima">Kohima (Nagaland)</option>
              <option value="East Sikkim">East Sikkim (Gangtok)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">
              Observations & Immediate Threat
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe crack length, water seepage, slope displacement, nearby road or village exposure..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">
              Ground Evidence Photo
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-600 transition-colors">
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-300 font-medium">
                  {mediaPreview ? "Change Photo" : "Upload Photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
            {mediaPreview && (
              <div className="mt-2.5 relative rounded-xl overflow-hidden border border-slate-700 w-full h-32 bg-black/40">
                <img
                  src={mediaPreview}
                  alt="Ground evidence preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setMediaPreview(null)}
                  className="absolute top-2 right-2 p-1 rounded-lg bg-black/70 text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Broadcast Field Report
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
