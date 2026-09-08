"use client";

import React, { useState, useMemo } from "react";
import {
  MapPin,
  Compass,
  Shield,
  CheckCircle2,
  Navigation,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Building2,
  Layers,
} from "lucide-react";
import { NER_REGIONS, StateInfo, DistrictInfo } from "@/data/nerRegions";
import { AppRole, useAuth } from "@/context/AuthContext";

interface RegionOnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onRegionSelected: (state: string, district: string, coords: { lat: number; lng: number; zoom: number }) => void;
}

export default function RegionOnboardingModal({
  isOpen,
  onClose,
  onRegionSelected,
}: RegionOnboardingModalProps) {
  const { user, profile, updateRegion, setRole } = useAuth();

  // Default to Meghalaya -> East Khasi Hills (primary SIH demo region)
  const [selectedStateId, setSelectedStateId] = useState<string>("meghalaya");
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>("East Khasi Hills");
  const [selectedRole, setSelectedRole] = useState<AppRole>(profile?.role || "CITIZEN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentState: StateInfo = useMemo(() => {
    return NER_REGIONS.find((s) => s.id === selectedStateId) || NER_REGIONS[0];
  }, [selectedStateId]);

  const currentDistrict: DistrictInfo = useMemo(() => {
    return (
      currentState.districts.find((d) => d.name === selectedDistrictName) ||
      currentState.districts[0]
    );
  }, [currentState, selectedDistrictName]);

  const handleStateChange = (stateId: string) => {
    setSelectedStateId(stateId);
    const targetState = NER_REGIONS.find((s) => s.id === stateId) || NER_REGIONS[0];
    setSelectedDistrictName(targetState.districts[0].name);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (updateRegion) {
        await updateRegion(currentState.name, currentDistrict.name);
      }
      if (setRole && selectedRole !== profile?.role) {
        setRole(selectedRole);
      }

      setSavedSuccess(true);

      setTimeout(() => {
        onRegionSelected(currentState.name, currentDistrict.name, {
          lat: currentDistrict.lat,
          lng: currentDistrict.lng,
          zoom: currentDistrict.zoom,
        });
        setIsSubmitting(false);
        if (onClose) onClose();
      }, 700);
    } catch (err) {
      console.error("Failed to save region preferences:", err);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#0e1626] to-[#0a0f1d] border border-blue-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-blue-950/50 overflow-hidden text-slate-200">
        {/* Glow ambient background highlights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 pb-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Select Your Operational Region
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  NER GIS Focus
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user ? `Welcome, ${user.email?.split("@")[0] || "Officer"}! ` : "Personalize your GIS session. "}
                Specify your district to focus landslide telemetry, GSI records, and hazard alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Step 1: North Eastern States selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              1. Choose North Eastern State (8 States)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {NER_REGIONS.map((state) => {
                const isSelected = state.id === selectedStateId;
                return (
                  <button
                    key={state.id}
                    type="button"
                    onClick={() => handleStateChange(state.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-600/20 border-blue-500/60 shadow-lg shadow-blue-500/10 text-white"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {state.code}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-bold leading-tight truncate">{state.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{state.capital}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: District Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              2. Choose District / Jurisdiction ({currentState.name})
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {currentState.districts.map((d) => {
                const isSelected = d.name === selectedDistrictName;
                return (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => setSelectedDistrictName(d.name)}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm"
                        : "bg-slate-900/50 border-slate-800/80 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        isSelected ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{d.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {d.highways[0] || "Lifeline Route"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* District Spatial Brief Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span>{currentDistrict.name}, {currentState.name}</span>
              </div>
              <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {currentDistrict.lat.toFixed(4)}°N, {currentDistrict.lng.toFixed(4)}°E
              </span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <p>
                <strong className="text-slate-300">Monitored Corridors:</strong>{" "}
                <span className="text-amber-300">{currentDistrict.highways.join(" · ")}</span>
              </p>
              <p>
                <strong className="text-slate-300">Geological Setting:</strong>{" "}
                <span className="text-slate-300">{currentDistrict.terrain}</span>
              </p>
            </div>
          </div>

          {/* Step 3: Operational Role */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              3. Operational Role Designation
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { role: "CITIZEN" as AppRole, label: "Citizen / Resident", icon: MapPin },
                { role: "FIELD_OFFICER" as AppRole, label: "Field Responder", icon: Navigation },
                { role: "AUTHORITY" as AppRole, label: "SDMA Authority", icon: Building2 },
                { role: "ADMIN" as AppRole, label: "District Admin", icon: Shield },
              ].map((r) => {
                const isSelected = selectedRole === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => setSelectedRole(r.role)}
                    className={`p-2 rounded-xl text-center border text-xs transition-all ${
                      isSelected
                        ? "bg-purple-600/20 border-purple-500/60 text-purple-200 font-bold"
                        : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <p className="font-semibold text-[11px] truncate">{r.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Skip for Now
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || savedSuccess}
            className={`flex-1 sm:flex-initial sm:min-w-[240px] px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
              savedSuccess
                ? "bg-emerald-600 text-white shadow-emerald-600/25"
                : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-500/20 hover:shadow-blue-500/35 active:scale-[0.99]"
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Region Configured! Entering Map...</span>
              </>
            ) : isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Updating Profile & Telemetry...</span>
              </>
            ) : (
              <>
                <span>Set Region & Fly to District</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
