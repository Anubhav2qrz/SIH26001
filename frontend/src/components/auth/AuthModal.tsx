"use client";

import React, { useState } from "react";
import { X, Shield, User, Lock, Mail, Check, AlertCircle } from "lucide-react";
import { useAuth, AppRole } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { profile, switchDemoUser, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"switch_role" | "login" | "signup">("switch_role");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("FIELD_OFFICER");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleRoleSelect = (role: AppRole) => {
    switchDemoUser(role);
    setSuccessMsg(`Switched to ${role.replace("_", " ")} profile`);
    setTimeout(() => {
      onClose();
      setSuccessMsg("");
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (mode === "login") {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        setSuccessMsg("Logged in successfully");
        setTimeout(() => onClose(), 600);
      } else if (mode === "signup") {
        const { error } = await signUpWithEmail(email, password, name, selectedRole);
        if (error) throw error;
        setSuccessMsg("Account created and signed in");
        setTimeout(() => onClose(), 600);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-wide">
                LANDGUARD NER Authentication
              </h3>
              <p className="text-xs text-slate-400">
                Supabase Auth & RBAC
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

        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1">
          <button
            onClick={() => setMode("switch_role")}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              mode === "switch_role"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Quick Role Switcher
          </button>
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              mode === "login"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Supabase Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              mode === "signup"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === "switch_role" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Select User Persona
                </span>
                <span className="text-[10px] text-blue-400 font-medium">
                  One-Click
                </span>
              </div>

              {[
                {
                  role: "AUTHORITY" as AppRole,
                  title: "State Disaster Authority (SDMA)",
                  name: "Dr. T. Sangma",
                  desc: "Statewide surveillance, alert dispatch, AI explainability & priority matrix.",
                  badge: "bg-red-500/10 text-red-400 border-red-500/20",
                },
                {
                  role: "ADMIN" as AppRole,
                  title: "District Administration",
                  name: "DC East Khasi Hills",
                  desc: "District map, road closures, village evacuation orders & resource staging.",
                  badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                },
                {
                  role: "FIELD_OFFICER" as AppRole,
                  title: "Field Officer (Emergency Response)",
                  name: "Officer R. Khongwir",
                  desc: "Geo-tagged slope crack reporting, photo uploads & offline sync.",
                  badge: "bg-teal-500/10 text-teal-400 border-teal-500/20",
                },
                {
                  role: "CITIZEN" as AppRole,
                  title: "Local Community Member",
                  name: "Resident (Sohra / Cherrapunji)",
                  desc: "Multilingual early warnings, road safety guides & crowd incident alerts.",
                  badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                },
              ].map((item) => {
                const isActive = profile.role === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => handleRoleSelect(item.role)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between ${
                      isActive
                        ? "bg-blue-950/40 border-blue-500/60 ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                    }`}
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {item.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.badge}`}>
                          {item.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Officer name"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@sdma.gov.in"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as AppRole)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="AUTHORITY">SDMA State Authority</option>
                    <option value="ADMIN">District Administration</option>
                    <option value="FIELD_OFFICER">Field Officer</option>
                    <option value="CITIZEN">Citizen</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm text-white shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : mode === "login" ? (
                  "Sign In with Supabase"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
