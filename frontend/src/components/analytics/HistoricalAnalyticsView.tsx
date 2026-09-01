"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  X,
  TrendingUp,
  CloudRain,
  Calendar,
  MapPin,
} from "lucide-react";
import { getAnalytics, AnalyticsData } from "@/lib/api";

interface HistoricalAnalyticsViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoricalAnalyticsView({
  isOpen,
  onClose,
}: HistoricalAnalyticsViewProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getAnalytics()
      .then((data) => setAnalytics(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-[#0f172a] border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-wide text-base">
                Historical Landslide Analytics (NER)
              </h3>
              <p className="text-xs text-slate-400">
                GSI Geological Survey of India & ISRO Inventory Analysis
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

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Aggregating geospatial analytics...</p>
            </div>
          ) : analytics ? (
            <>
              <div className="grid grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Catalogued Landslides</span>
                  <p className="text-2xl font-bold text-white mt-1 font-mono">{analytics.total_events}+</p>
                  <span className="text-[10px] text-emerald-400 mt-1 block">Geo-located in NER</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Peak Monsoon Risk</span>
                  <p className="text-2xl font-bold text-orange-400 mt-1">Jun – Aug</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">78% of cumulative failures</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Most Vulnerable Highway</span>
                  <p className="text-2xl font-bold text-red-400 mt-1">NH-6</p>
                  <span className="text-[10px] text-red-300 mt-1 block">Shillong – Sohra Corridor</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Average Trigger Threshold</span>
                  <p className="text-2xl font-bold text-blue-400 mt-1 font-mono">140 mm</p>
                  <span className="text-[10px] text-blue-300 mt-1 block">24h antecedent rainfall</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <CloudRain className="w-4 h-4 text-blue-400" />
                      Seasonal Distribution (Monsoon Breakdown)
                    </h4>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.monthly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      Multi-Year Historical Trend (2015 - 2024)
                    </h4>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.yearly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#a855f7"
                          strokeWidth={2.5}
                          dot={{ fill: "#a855f7", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  District Landslide Frequency & Hotspots
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {analytics.by_district.slice(0, 9).map((d, i) => (
                    <div
                      key={d.district}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-semibold text-slate-200">{d.district}</span>
                        <p className="text-[10px] text-slate-500">Rank #{i + 1} Hazard Zone</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-purple-400 font-mono">{d.count}</span>
                        <span className="text-[10px] text-slate-500 block">events</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-xs">No analytics data found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
