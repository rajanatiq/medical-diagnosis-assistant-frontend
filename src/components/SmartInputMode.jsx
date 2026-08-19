import React, { useState } from "react";
import {
  AlertCircle,
  Loader,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  X,
  User,
  Clock,
  Flame,
  Stethoscope,
  Activity,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { parsePatientInput } from "../services/api";

const SAMPLE_PROMPTS = [
  {
    title: "🫁 Breathlessness (English)",
    text: "I am 29 years old and have severe breathlessness for 2 days",
  },
  {
    title: "🇵🇰 Urdu Script (اردو)",
    text: "میری عمر 35 سال ہے اور مجھے سانس لینے میں شدید مشکل ہے",
  },
  {
    title: "🌡️ Mixed Spelling / Roman Urdu",
    text: "khasi aur bukhar 3 din se",
  },
  {
    title: "⚡ Typo Handling",
    text: "kasii ho gayi",
  },
];

export const SmartInputMode = ({ onFormPrefill, onClose }) => {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("input"); // "input", "review", "prefilled"

  // ============ HANDLE AUTO EXTRACT ============
  const handleAutoExtract = async (overrideText) => {
    const textToAnalyze = overrideText || inputText;
    if (textToAnalyze.trim().length < 3) {
      setError("Please write at least 3 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await parsePatientInput(textToAnalyze);
      setParseResult(data);
      setStep("review");
    } catch (err) {
      setError(
        err.message || "Failed to parse input. Please check backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============ HANDLE CONFIRM & PREFILL ============
  const handleConfirmAndPrefill = () => {
    if (parseResult && (parseResult.confidence_score > 0.3 || parseResult.symptoms.length > 0)) {
      onFormPrefill({
        age: parseResult.age,
        ageBand: parseResult.age_band,
        gender: parseResult.gender,
        symptoms: parseResult.symptoms,
        duration: parseResult.duration,
        durationDays: parseResult.duration?.value || 3,
        severity: parseResult.severity,
      });
      setStep("prefilled");
    } else {
      setError("Confidence score too low. Please review extracted data.");
    }
  };

  // ============ HANDLE EDIT & RETRY ============
  const handleEditAndRetry = () => {
    setParseResult(null);
    setStep("input");
  };

  // ============ HANDLE KEY PRESS ============
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleAutoExtract();
    }
  };

  // ============ RENDER STEP 1: INPUT ============
  const renderInputStep = () => (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 p-0.5 shadow-lg shadow-sky-500/25 flex items-center justify-center mx-auto mb-2">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-sky-400 animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-100 font-display">
          📝 Smart Patient Symptom Input
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Write naturally in English, Roman Urdu, or Urdu script. Database fuzzy matching automatically extracts your symptoms even with typos (e.g. <em>khasi, khansi, kasi</em>).
        </p>
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
                handleAutoExtract(sample.text);
              }}
              className="text-left p-2.5 rounded-xl bg-slate-900/80 border border-white/5 hover:border-sky-500/40 hover:bg-sky-500/10 transition-all text-xs group"
            >
              <p className="font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">
                {sample.title}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                "{sample.text}"
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
          <span>Your Free-Text Medical Description</span>
          {inputText && (
            <button
              onClick={() => setInputText("")}
              className="text-slate-400 hover:text-rose-400 text-[11px] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Examples:
- My age is 29 years and I've had breathlessness for 1 day
- میری عمر 35 سال ہے اور مجھے سانس لینے میں شدید مشکل ہے
- khasi aur bukhar 3 din se
- kasii ho gayi"
          className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed shadow-inner"
          rows={6}
          spellCheck="true"
        />
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleAutoExtract()}
          disabled={loading || inputText.trim().length < 3}
          className="btn btn-primary flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin text-sky-200" />
              <span>Matching with Database Symptoms...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>🤖 Auto Extract Parameters</span>
            </>
          )}
        </button>
        <button onClick={onClose} className="btn btn-secondary py-3 px-5 text-xs font-semibold">
          Cancel
        </button>
      </div>

      <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 space-y-1">
        <p>
          💡 <strong>Fuzzy NLP Tip:</strong> Handles typos & spelling variations in English, Urdu script, and Roman Urdu.
        </p>
        <p>⌨️ Shortcut: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300 font-mono text-[10px]">Ctrl + Enter</kbd> to analyze instantly.</p>
      </div>
    </div>
  );

  // ============ RENDER STEP 2: REVIEW ============
  const renderReviewStep = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-slate-100 font-display flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>Review Extracted Information</span>
          </h3>
          <p className="text-xs text-slate-400">
            Fuzzy matched against SQL Server symptoms catalog
          </p>
        </div>

        <div className="text-right">
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
              parseResult.confidence_score >= 0.8
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : parseResult.confidence_score >= 0.5
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : "bg-rose-500/20 text-rose-400 border-rose-500/30"
            }`}
          >
            {Math.round(parseResult.confidence_score * 100)}% Confidence
          </span>
        </div>
      </div>

      {/* EXTRACTED DATA CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
          <div className="text-[10px] text-sky-400 font-semibold uppercase flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>Age</span>
          </div>
          <div className="text-sm font-bold text-slate-100">
            {parseResult.age ? `${parseResult.age} years` : "20-29 (Default)"}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
          <div className="text-[10px] text-emerald-400 font-semibold uppercase flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>Gender</span>
          </div>
          <div className="text-sm font-bold text-slate-100 capitalize">
            {parseResult.gender || "Male"}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
          <div className="text-[10px] text-amber-400 font-semibold uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Duration</span>
          </div>
          <div className="text-sm font-bold text-slate-100">
            {parseResult.duration
              ? `${parseResult.duration.value} ${parseResult.duration.unit}`
              : "3 days"}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
          <div className="text-[10px] text-rose-400 font-semibold uppercase flex items-center gap-1">
            <Flame className="w-3 h-3" />
            <span>Severity</span>
          </div>
          <div
            className={`text-sm font-bold capitalize ${
              parseResult.severity === "severe"
                ? "text-rose-400"
                : parseResult.severity === "mild"
                ? "text-emerald-400"
                : "text-sky-400"
            }`}
          >
            {parseResult.severity}
          </div>
        </div>
      </div>

      {/* SYMPTOMS TAGS */}
      {parseResult.symptoms.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-sky-400" />
            <span>Detected Database Symptoms ({parseResult.symptoms.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {parseResult.symptoms.map((symptom, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-200 border border-sky-500/40 text-xs font-semibold flex items-center gap-1.5 shadow-sm capitalize"
              >
                <span>✓</span>
                <span>{symptom.replace(/_/g, " ")}</span>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          No specific symptoms recognized. You can pick symptoms on the manual checklist.
        </div>
      )}

      {/* WARNINGS */}
      {parseResult.warnings && parseResult.warnings.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-1.5">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Clinical Notes:</span>
          </div>
          {parseResult.warnings.map((warning, idx) => (
            <div key={idx} className="text-[11px] text-amber-300/90 flex items-start gap-2">
              <span>•</span>
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleConfirmAndPrefill} className="btn btn-primary flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 shadow-lg shadow-sky-500/25">
          <CheckCircle className="w-4 h-4" />
          <span>Confirm & Auto-Fill Form</span>
        </button>
        <button onClick={handleEditAndRetry} className="btn btn-secondary py-3 px-5 text-xs font-semibold">
          ✏️ Edit & Retry
        </button>
      </div>
    </div>
  );

  // ============ RENDER STEP 3: SUCCESS ============
  const renderSuccessStep = () => (
    <div className="text-center py-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
        ✓
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-100 font-display">
          Form Auto-Filled Successfully!
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Your symptom intake form has been populated with the extracted parameters.
        </p>
      </div>
      <p className="text-xs text-emerald-400 font-medium p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 max-w-sm mx-auto">
        Please review your symptoms and proceed to diagnostic analysis.
      </p>
      <button onClick={onClose} className="btn btn-primary px-8 py-2.5 text-xs font-bold shadow-lg shadow-sky-500/20">
        Continue to Triage Review
      </button>
    </div>
  );

  // ============ MAIN RENDER ============
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel p-6 sm:p-8 border border-sky-500/30 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {step === "input" && renderInputStep()}
        {step === "review" && renderReviewStep()}
        {step === "prefilled" && renderSuccessStep()}
      </div>
    </div>
  );
};

export default SmartInputMode;
