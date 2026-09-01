"use client";

import React, { useState } from "react";
import {
  X,
  Globe,
  Radio,
  Send,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

interface MultilingualAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDistrict?: string;
}

type Language = "en" | "hi" | "khasi" | "as";

interface AlertTemplate {
  title: string;
  en: string;
  hi: string;
  khasi: string;
  as: string;
  severity: "RED" | "ORANGE" | "YELLOW";
}

const TEMPLATES: Record<string, AlertTemplate> = {
  CRITICAL_EVACUATION: {
    title: "Critical Landslide Risk & Immediate Evacuation",
    severity: "RED",
    en: "⚠️ URGENT LANDSLIDE WARNING: East Khasi Hills (Sohra & Mawsynram). Extreme soil saturation & 89% slope failure probability. Move to safe high ground immediately. Avoid NH-6. Follow SDMA orders.",
    hi: "⚠️ आपातकालीन भूस्खलन चेतावनी: पूर्वी खासी हिल्स (सोहरा एवं मॉसिनराम)। अत्यधिक मिट्टी संतृप्ति और 89% भूस्खलन की संभावना। तुरंत सुरक्षित ऊंचे स्थानों पर जाएं। NH-6 मार्ग से बचें।",
    khasi: "⚠️ JINGPYNBNA LYNTI BNENG: East Khasi Hills (Sohra & Mawsynram). Ka jingktah jur ka khyndew bad ka risk 89%. Kiew sha ki jaka ba shngain kloi kloi. Kiad na NH-6.",
    as: "⚠️ জৰুৰী ভূমিস্খলন সতৰ্কবাৰ্তা: পূব খাচী পাহাৰ (চোহৰা আৰু মৌচিনৰাম)। চৰম মাটিৰ আৰ্দ্ৰতা আৰু ৮৯% ভূমিস্খলনৰ সম্ভাৱনা। অবিলম্বে সুৰক্ষিত স্থানলৈ যাওক।",
  },
  HIGHWAY_CLOSURE: {
    title: "National Highway NH-6 Blockage Alert",
    severity: "ORANGE",
    en: "🚧 TRAFFIC ADVISORY: NH-6 Shillong-Sohra Corridor at km 34 is closed due to tension cracks & slope debris. Emergency teams deployed. Use alternate state routes.",
    hi: "🚧 यातायात सलाह: NH-6 शिलांग-सोहरा गलियारा किमी 34 पर ढलान दरार और मलबे के कारण बंद है। आपातकालीन टीमें तैनात हैं। वैकल्पिक मार्गों का प्रयोग करें।",
    khasi: "🚧 JINGPYNBNA SUROK: NH-6 Shillong-Sohra km 34 la khang namar ba don ki jingpait khyndew. Ki kynhun pynbiang ki la poi. Pyndonkam da kiwei ki lynti.",
    as: "🚧 যান-বাহন নিৰ্দেশনা: ফাট আৰু ধ্বংসাৱশেষৰ বাবে এন এইচ-৬ শ্বিলং-চোহৰা কৰিডৰ বন্ধ কৰা হৈছে। বিকল্প পথ ব্যৱহাৰ কৰক।",
  },
  CITIZEN_ADVISORY: {
    title: "Elevated Rainfall Advisory for Communities",
    severity: "YELLOW",
    en: "🌧️ ADVISORY: Continuous heavy rainfall forecasted over next 24h. Residents near steep cut slopes are advised to stay vigilant and report water seepage immediately.",
    hi: "🌧️ मौसम सलाह: अगले 24 घंटों में लगातार भारी बारिश का अनुमान है। खड़ी ढलानों के पास रहने वाले निवासियों को सतर्क रहने और जल रिसाव की तुरंत सूचना देने की सलाह दी जाती है।",
    khasi: "🌧️ JINGPYNSÑIAW: Ka jingther u slap ha ki 24 kynta ban wan. Ki nongshong shnong ha ki jaka riat kin husiar bad pyntip kloi lada iohi jingpait khyndew.",
    as: "🌧️ নাগৰিক সতৰ্কতা: অহা ২৪ ঘন্টাত প্ৰবল বৰষুণৰ সম্ভাৱনা। থিয় ঢালৰ কাষত থকা লোকসকলক সতৰ্ক থাকিবলৈ অনুৰোধ জনোৱা হৈছে।",
  },
};

export default function MultilingualAlertModal({
  isOpen,
  onClose,
  defaultDistrict = "East Khasi Hills",
}: MultilingualAlertModalProps) {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("CRITICAL_EVACUATION");
  const [activeLang, setActiveLang] = useState<Language>("en");
  const [targetDistrict, setTargetDistrict] = useState(defaultDistrict);
  const [sending, setSending] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);

  if (!isOpen) return null;

  const currentTemplate = TEMPLATES[selectedTemplateKey];

  const handleBroadcast = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setBroadcastDone(true);
      setTimeout(() => {
        setBroadcastDone(false);
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-wide text-base">
                Multilingual Emergency Early Warning Dispatcher
              </h3>
              <p className="text-xs text-slate-400">
                CAP-compliant SMS, Push & Cell Broadcast
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

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {broadcastDone && (
            <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>
                Broadcast dispatched to mobile subscribers in {targetDistrict}.
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              SOP Warning Template
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {Object.entries(TEMPLATES).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedTemplateKey(key)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTemplateKey === key
                      ? "bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/50"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.severity === "RED"
                        ? "bg-red-500/20 text-red-400"
                        : t.severity === "ORANGE"
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {t.severity}
                  </span>
                  <p className="text-xs font-semibold text-white mt-1.5 line-clamp-2">
                    {t.title}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Target Zone
            </label>
            <select
              value={targetDistrict}
              onChange={(e) => setTargetDistrict(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="East Khasi Hills">East Khasi Hills (Sohra, Mawsynram, Shillong)</option>
              <option value="West Khasi Hills">West Khasi Hills (Nongstoin)</option>
              <option value="Dima Hasao">Dima Hasao (Haflong Corridor, Assam)</option>
              <option value="Aizawl">Aizawl Region (Mizoram)</option>
              <option value="Senapati">Senapati / NH-2 (Manipur)</option>
              <option value="East Sikkim">East Sikkim (Gangtok / NH-10)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Language Localization Preview
              </label>
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                {(
                  [
                    { key: "en", label: "English" },
                    { key: "hi", label: "हिंदी" },
                    { key: "khasi", label: "Khasi" },
                    { key: "as", label: "অসমীয়া" },
                  ] as const
                ).map((lang) => (
                  <button
                    key={lang.key}
                    type="button"
                    onClick={() => setActiveLang(lang.key)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                      activeLang === lang.key
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative">
              <div className="flex items-center gap-2 mb-2 text-slate-400 text-[11px]">
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                <span>Cell Broadcast / SMS Flash Alert</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium whitespace-pre-line">
                {currentTemplate[activeLang]}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBroadcast}
            disabled={sending}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Broadcast Warning to {targetDistrict}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
