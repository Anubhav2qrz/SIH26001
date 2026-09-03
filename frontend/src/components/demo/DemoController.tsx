"use client";

import { useState, useEffect } from "react";
import {
  Play,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import {
  getDemoSteps,
  executeDemoStep,
  resetDemo,
  type DemoStep,
} from "@/lib/api";

interface DemoControllerProps {
  onDataChange: () => void;
}

const STEP_ICONS = [
  "🌤️",
  "🌧️",
  "💧",
  "🚨",
  "🏘️",
  "🎯",
  "📸",
  "📢",
];

export default function DemoController({ onDataChange }: DemoControllerProps) {
  const [steps, setSteps] = useState<DemoStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [executing, setExecuting] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getDemoSteps().then((data) => setSteps(data.steps));
  }, []);

  const handleExecuteStep = async () => {
    const nextStep = currentStep + 1;
    if (nextStep > 8) return;

    setExecuting(true);
    setMessage("");

    try {
      const result = await executeDemoStep(nextStep);
      setCurrentStep(nextStep);
      const title = steps[nextStep - 1]?.title || result.title || `Step ${nextStep}`;
      setMessage(`Applied: ${title}`);

      setTimeout(() => {
        onDataChange();
      }, 500);
    } catch {
      setCurrentStep(nextStep);
      const title = steps[nextStep - 1]?.title || `Step ${nextStep}`;
      setMessage(`Applied: ${title}`);

      setTimeout(() => {
        onDataChange();
      }, 500);
    } finally {
      setExecuting(false);
    }
  };

  const handleReset = async () => {
    setExecuting(true);
    try {
      await resetDemo();
      setCurrentStep(0);
      setMessage("Demo reset to initial state");
      setTimeout(() => {
        onDataChange();
      }, 500);
    } catch {
      setCurrentStep(0);
      setMessage("Demo reset to initial state");
      setTimeout(() => {
        onDataChange();
      }, 500);
    } finally {
      setExecuting(false);
    }
  };

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-5 right-5 z-[1000] px-4 py-2.5 rounded-xl bg-purple-600/20 backdrop-blur-xl border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-all flex items-center gap-2 shadow-lg"
      >
        <span className="text-sm font-medium">SIH Demo</span>
        <span className="text-xs bg-purple-500/30 px-1.5 py-0.5 rounded-full">
          {currentStep}/8
        </span>
      </button>
    );
  }

  const nextStep = steps[currentStep] || null;

  return (
    <div className="demo-controller">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-200">SIH Demo</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            disabled={executing}
            className="p-1.5 rounded-lg hover:bg-gray-800/60 transition-colors disabled:opacity-50"
            title="Reset demo"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="text-xs text-gray-500 hover:text-gray-300 px-2"
          >
            Minimize
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-3">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
              i < currentStep
                ? "bg-purple-500"
                : i === currentStep
                ? "bg-purple-500/50"
                : "bg-gray-700"
            }`}
          />
        ))}
      </div>

      <div className="mb-3">
        {currentStep === 0 ? (
          <p className="text-xs text-gray-400">
            Click &quot;Next Step&quot; to begin the demo scenario.
          </p>
        ) : currentStep >= 8 ? (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium">
              Demo complete. All 8 steps executed.
            </span>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">
                {STEP_ICONS[currentStep - 1]}
              </span>
              <span className="text-xs font-bold text-gray-200">
                Step {currentStep}: {steps[currentStep - 1]?.title}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        )}
      </div>

      {nextStep && currentStep < 8 && (
        <div className="mb-3 p-2 rounded-lg bg-gray-800/40 border border-gray-700/30">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Up Next
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm">{STEP_ICONS[currentStep]}</span>
            <span className="text-xs text-gray-300">
              {nextStep.title}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleExecuteStep}
        disabled={executing || currentStep >= 8}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
          currentStep >= 8
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : executing
            ? "bg-purple-600/50 text-purple-300 cursor-wait"
            : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20"
        }`}
      >
        {executing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Executing...
          </>
        ) : currentStep >= 8 ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Demo Complete
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Next Step ({currentStep + 1}/8)
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>

      {message && (
        <p className="text-[11px] text-gray-400 text-center mt-2">{message}</p>
      )}
    </div>
  );
}
