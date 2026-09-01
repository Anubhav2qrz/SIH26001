"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { askGeminiCopilot } from "@/lib/gemini";

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface DisasterCopilotProps {
  district?: string;
  alertsCount?: number;
  rainfall?: number;
  highestRisk?: string;
}

const PRESET_QUESTIONS = [
  "Is NH-6 corridor safe for travel tonight?",
  "What villages are in the critical risk zone?",
  "What emergency actions are recommended right now?",
];

export default function DisasterCopilot({
  district = "East Khasi Hills",
  alertsCount = 3,
  rainfall = 145,
  highestRisk = "CRITICAL",
}: DisasterCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: `Hello Officer, I am your **LANDGUARD AI Disaster Copilot** (Gemini 1.5). I am tracking ${district} with ${rainfall}mm rainfall and ${alertsCount} active warnings. How can I assist with your emergency response?`,
    },
  ]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const botReply = await askGeminiCopilot(textToSend, {
        district,
        alertsCount,
        rainfall,
        highestRisk,
      });
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I encountered a network issue contacting the Gemini model. Please check the alert dispatch status on the map.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 sm:bottom-6 right-3 sm:right-6 z-30 p-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl hover:scale-105 transition-all flex items-center gap-2 border border-blue-400/40"
        title="Open Gemini Disaster Copilot"
      >
        <Bot className="w-5 h-5" />
        <span className="text-xs font-bold hidden sm:inline">AI Copilot</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 w-[calc(100vw-24px)] sm:w-96 bg-[#0f172a]/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl z-40 flex flex-col h-[480px] max-h-[80vh] overflow-hidden animate-slide-in-up">
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              Gemini Disaster Copilot
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h4>
            <p className="text-[10px] text-slate-400">Real-Time Geotechnical AI</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-purple-600/20 border border-purple-500/30 text-purple-300"
              }`}
            >
              {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[82%] whitespace-pre-wrap ${
                m.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none font-sans"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Gemini thinking...</span>
          </div>
        )}
      </div>

      <div className="p-2 border-t border-slate-800 bg-slate-950/60 shrink-0 space-y-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[10px] bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about risks or roads..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
