import React, { useState } from "react";
import {
  Sparkles,
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  User,
  Clock,
  Flame,
  Stethoscope,
  Activity,
  Layers,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { parsePatientInput } from "../services/api";

const SAMPLE_PROMPTS = [
  {
    title: "🫁 Acute Breathlessness (English)",
    text: "My age is 29 years and I am suffering from breathlessness for 1 day",
  },
  {
    title: "🌡️ High Fever & Cough (Urdu)",
    text: "Meri umar 24 saal hai aur 3 din se tez bukhar aur khansi hai",
  },
  {
    title: "⚡ Severe Chest Pain & Sweating (Emergency)",
    text: "Patient is a 45 yo female with severe chest pain, vomiting and sweating for 2 days",
  },
  {
    title: "🍔 Stomach Pain & Acidity",
    text: "Male 35 years old with severe stomach pain, acidity and vomiting for 2 days",
  },
];

export function SmartInputModal({
  isOpen,
  onClose,
  onApplyExtractedData,
}) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extractedResult, setExtractedResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleParse = async (textToParse) => {
    const text = textToParse || inputText;
    if (!text || text.trim().length < 2) {
      setErrorMessage("Please enter some medical details or pick a quick example.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await parsePatientInput(text);
      setExtractedResult(data);
    } catch (err) {
      setErrorMessage(err.message || "Failed to analyze text. Please check backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!extractedResult) return;

    onApplyExtractedData({
      symptoms: extractedResult.symptoms || [],
      durationDays: extractedResult.duration_days || 3,
      ageBand: extractedResult.age_band || "20-29",
      exactAge: extractedResult.age ? String(extractedResult.age) : "29",
      sex: extractedResult.gender || "Male",
      severity: extractedResult.severity || "moderate",
    });

    onClose();
  };

  const handleReset = () => {
    setInputText("");
    setExtractedResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel p-6 sm:p-8 border border-sky-500/30 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 p-0.5 shadow-lg shadow-sky-500/25 flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-sky-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100 font-display">
                  Smart AI Patient Input Parser
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                  English & Urdu NLP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Describe your condition naturally — our NLP engine automatically extracts age, gender, symptoms & duration.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Example Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <span>💡 Try Quick Sample Prompts:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(sample.text);
                  handleParse(sample.text);
                }}
                className="text-left p-2.5 rounded-xl bg-slate-900/80 border border-white/5 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all text-xs group"
              >
                <p className="font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">
                  {sample.title}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  "{sample.text}"
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
            <span>Your Free-Text Medical Description</span>
            {inputText && (
              <button
                onClick={handleReset}
                className="text-slate-400 hover:text-rose-400 text-[11px] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. My age is 29 years and I'm suffering from breathlessness for 1 day... (or in Urdu: Meri umar 24 saal hai aur 2 din se tez bukhar aur gala kharab hai)"
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed shadow-inner"
            />
          </div>

          <button
            type="button"
            onClick={() => handleParse()}
            disabled={isLoading || !inputText.trim()}
            className="btn btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-sky-200" />
                <span>Extracting Medical Entities...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Auto-Extract Patient Parameters</span>
              </>
            )}
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Extracted Data Preview Card */}
        {extractedResult && (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-sky-500/40 space-y-4 shadow-xl">
            {/* Top Confidence Meter */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    Extraction Successful
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Structured entities parsed from your input
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-sky-400">
                  {extractedResult.confidence_score}% Match Confidence
                </span>
                <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full"
                    style={{ width: `${extractedResult.confidence_score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Extracted Parameter Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {/* Age */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase font-semibold">
                  <User className="w-3 h-3 text-sky-400" />
                  <span>Age</span>
                </span>
                <p className="text-sm font-bold text-slate-100">
                  {extractedResult.age ? `${extractedResult.age} Years` : "29 (Default)"}
                </p>
                <span className="text-[10px] text-sky-400 font-mono">
                  Band: {extractedResult.age_band}
                </span>
              </div>

              {/* Gender */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase font-semibold">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>Gender</span>
                </span>
                <p className="text-sm font-bold text-slate-100">
                  {extractedResult.gender || "Male"}
                </p>
                <span className="text-[10px] text-slate-400">Biological Sex</span>
              </div>

              {/* Duration */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase font-semibold">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Duration</span>
                </span>
                <p className="text-sm font-bold text-slate-100">
                  {extractedResult.duration}
                </p>
                <span className="text-[10px] text-amber-400 font-mono">
                  {extractedResult.duration_days} Days
                </span>
              </div>

              {/* Severity */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase font-semibold">
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>Severity</span>
                </span>
                <p
                  className={`text-sm font-bold capitalize ${
                    extractedResult.severity === "severe"
                      ? "text-rose-400"
                      : extractedResult.severity === "mild"
                      ? "text-emerald-400"
                      : "text-sky-400"
                  }`}
                >
                  {extractedResult.severity}
                </p>
                <span className="text-[10px] text-slate-400">Clinical Impact</span>
              </div>
            </div>

            {/* Extracted Symptoms Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-sky-400" />
                <span>Extracted Symptoms ({extractedResult.symptoms.length}):</span>
              </span>

              <div className="flex flex-wrap gap-2">
                {extractedResult.symptom_labels && extractedResult.symptom_labels.length > 0 ? (
                  extractedResult.symptom_labels.map((label, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-200 border border-sky-500/40 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <span>✓</span>
                      <span>{label}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                    No specific symptoms identified. You can pick symptoms on the next screen.
                  </span>
                )}
              </div>
            </div>

            {/* Clinical Warnings */}
            {extractedResult.warnings && extractedResult.warnings.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950/90 border border-white/10 space-y-1 text-[11px]">
                {extractedResult.warnings.map((warn, wIdx) => (
                  <p key={wIdx} className="text-amber-300 flex items-center gap-1.5">
                    <span>•</span>
                    <span>{warn}</span>
                  </p>
                ))}
              </div>
            )}

            {/* Confirm & Auto-Fill Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleApply}
                className="btn btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500"
              >
                <span>Confirm & Auto-Fill Triage Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SmartInputModal;
