"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Copy,
  Check,
  Download,
  RefreshCw,
  Bot,
  Printer,
} from "lucide-react";
import { generateSitrepWithGemini } from "@/lib/gemini";
import type { DashboardKPIs } from "@/lib/api";

interface SitrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpis: DashboardKPIs | null;
  selectedDistrict?: string;
}

export default function SitrepModal({
  isOpen,
  onClose,
  kpis,
  selectedDistrict = "East Khasi Hills",
}: SitrepModalProps) {
  const [reportMarkdown, setReportMarkdown] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const md = await generateSitrepWithGemini({
        district: selectedDistrict,
        activeAlerts: kpis?.active_alerts || 3,
        criticalZones: kpis?.critical_zones || 4,
        roadsAtRisk: kpis?.roads_at_risk || 2,
        populationExposed: kpis?.population_exposed || 14200,
        rainfall24h: 185.0,
      });
      setReportMarkdown(md);
    } catch {
      setReportMarkdown("Failed to generate SITREP.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [isOpen, selectedDistrict]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SITREP_${selectedDistrict.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0f172a] border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-wide text-sm sm:text-base flex items-center gap-2">
                NDMA Executive Situation Report (SITREP)
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30 hidden sm:inline">
                  Gemini 1.5 Powered
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automated Incident Command Briefing for {selectedDistrict}
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

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950/40">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">
                Google Gemini synthesising meteorological and geotechnical telemetry...
              </p>
            </div>
          ) : (
            <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
              {reportMarkdown}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/70 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Regenerate</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Briefing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
