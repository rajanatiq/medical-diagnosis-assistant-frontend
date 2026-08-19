import React, { useState, useMemo } from "react";
import {
  Search,
  AlertTriangle,
  Clock,
  User,
  ShieldAlert,
  Sparkles,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Info,
  Wand2,
} from "lucide-react";
import { SmartInputMode } from "./SmartInputMode";

const CATEGORIES = [
  { id: "all", label: "All Symptoms" },
  { id: "critical", label: "⚠️ High Severity" },
  { id: "chest_respiratory", label: "🫁 Chest & Breathing" },
  { id: "digestive", label: "🍔 Digestive & Stomach" },
  { id: "neuro_head", label: "🧠 Head & Nervous" },
  { id: "skin", label: "🌿 Skin & Rashes" },
  { id: "general", label: "🌡️ Fever & General" },
];

const COMMON_QUICK_PICKS = [
  "high_fever",
  "cough",
  "fatigue",
  "headache",
  "chest_pain",
  "breathlessness",
  "vomiting",
  "skin_rash",
  "joint_pain",
  "abdominal_pain",
];

export function IntakeWizard({
  symptomsList,
  onSubmitAssessment,
  isLoading,
}) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [durationDays, setDurationDays] = useState(3);
  const [ageBand, setAgeBand] = useState("30-39");
  const [sex, setSex] = useState("Female");
  const [showSmartInput, setShowSmartInput] = useState(false);

  const filteredSymptoms = useMemo(() => {
    return (symptomsList || []).filter((s) => {
      const matchesSearch =
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === "all") return true;
      if (selectedCategory === "critical") return s.weight >= 6 || s.is_critical;
      if (selectedCategory === "chest_respiratory")
        return ["cough", "breathlessness", "chest_pain", "phlegm", "throat_irritation", "congestion"].some((k) =>
          s.id.includes(k)
        );
      if (selectedCategory === "digestive")
        return ["vomiting", "stomach", "abdominal", "acidity", "diarrhoea", "nausea", "indigestion"].some((k) =>
          s.id.includes(k)
        );
      if (selectedCategory === "neuro_head")
        return ["headache", "dizziness", "altered_sensorium", "visual_disturbances", "loss_of_balance"].some((k) =>
          s.id.includes(k)
        );
      if (selectedCategory === "skin")
        return ["rash", "itching", "skin", "spots", "blister", "eruption"].some((k) => s.id.includes(k));
      if (selectedCategory === "general")
        return ["fever", "fatigue", "chills", "sweating", "weight_loss", "malaise"].some((k) =>
          s.id.includes(k)
        );
      return true;
    });
  }, [symptomsList, searchQuery, selectedCategory]);

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const clearAll = () => {
    setSelectedSymptoms([]);
  };

  const handleNextStep = () => {
    if (step === 1 && selectedSymptoms.length === 0) {
      alert("Please select at least one symptom to proceed.");
      return;
    }
    setStep((prev) => (prev + 1));
  };

  const handlePrevStep = () => {
    setStep((prev) => (prev - 1));
  };

  const handleFinalSubmit = () => {
    if (selectedSymptoms.length === 0) {
      alert("Please select at least one symptom.");
      return;
    }

    onSubmitAssessment({
      symptoms: selectedSymptoms,
      duration_days: durationDays,
      age_band: ageBand,
      sex: sex,
    });
  };

  const handleSmartInputPrefill = (extractedData) => {
    if (extractedData.symptoms && extractedData.symptoms.length > 0) {
      // Normalize symptoms with existing catalog
      const matchedIds = extractedData.symptoms.map((s) => {
        const clean = s.replace(/\s+/g, "_");
        // Check if catalog has it
        const exists = (symptomsList || []).some((item) => item.id === clean || item.id === s);
        return exists ? clean : s;
      });
      setSelectedSymptoms(matchedIds);
    }
    if (extractedData.durationDays) {
      setDurationDays(extractedData.durationDays);
    } else if (extractedData.duration?.value) {
      setDurationDays(extractedData.duration.value);
    }
    if (extractedData.ageBand) {
      setAgeBand(extractedData.ageBand);
    }
    if (extractedData.gender) {
      setSex(extractedData.gender);
    }

    // Scroll to review step
    setStep(3);
  };

  const criticalSelected = selectedSymptoms.filter((id) => {
    const s = (symptomsList || []).find((item) => item.id === id);
    return s ? s.weight >= 6 || s.is_critical : false;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Indicator Header */}
      <div className="glass-panel p-4 flex items-center justify-between">
        {[
          { num: 1, label: "Select Symptoms", desc: `${selectedSymptoms.length} selected` },
          { num: 2, label: "Duration & Age", desc: `${durationDays}d • ${ageBand}` },
          { num: 3, label: "Safety & Confirm", desc: "Run Triage Analysis" },
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                  step === s.num
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105"
                    : step > s.num
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-slate-900 border border-white/10 text-slate-500"
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <div className="hidden sm:block text-left">
                <p
                  className={`text-xs font-bold ${
                    step === s.num ? "text-slate-100" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </p>
                <p className="text-[10px] text-slate-500">{s.desc}</p>
              </div>
            </div>
            {idx < 2 && <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:block" />}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1: SYMPTOM SELECTION */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Smart NLP Free-Text Input Banner */}
          <div className="glass-panel p-4.5 bg-gradient-to-r from-sky-950/70 via-indigo-950/60 to-slate-900/80 border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-sky-500/5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 p-0.5 flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-sky-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-100 font-display">
                    Smart AI Text Input
                  </h4>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold uppercase tracking-wider">
                    Fuzzy Match NLP
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Write in English or Urdu (e.g. <em>"khasi aur bukhar 3 din se"</em>) — auto-fills form with fuzzy matching!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSmartInput(true)}
              className="btn btn-primary text-xs py-2.5 px-4.5 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-200" />
              <span>Use Smart Input Mode</span>
            </button>
          </div>

          {/* Quick Picks Banner */}
          <div className="glass-panel p-4 space-y-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Or Choose Common Quick Picks:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {COMMON_QUICK_PICKS.map((qid) => {
                const item = (symptomsList || []).find((s) => s.id === qid);
                if (!item) return null;
                const isSelected = selectedSymptoms.includes(qid);
                return (
                  <button
                    key={qid}
                    type="button"
                    onClick={() => toggleSymptom(qid)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-sky-500 border-sky-400 text-white font-semibold shadow-sm"
                        : "bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/25 hover:bg-slate-850"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected ? <Check className="w-3 h-3" /> : <span className="text-slate-500">+</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Categories */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search 131 symptoms (e.g. fever, headache, chest pain, rash)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {selectedSymptoms.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-2 rounded-lg hover:bg-rose-500/10 transition-colors self-end sm:self-center"
                >
                  Clear ({selectedSymptoms.length})
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-sky-500 text-white shadow-sm"
                      : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Symptoms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredSymptoms.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom.id);
                const isHighSev = symptom.weight >= 6 || symptom.is_critical;

                return (
                  <div
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-sky-500/15 border-sky-500 text-sky-200 shadow-md shadow-sky-500/10"
                        : "bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-850 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-sky-500 border-sky-400 text-white"
                            : "border-white/20 bg-slate-950"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-xs font-medium truncate">{symptom.label}</span>
                    </div>

                    {isHighSev && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30 flex-shrink-0">
                        Sev {symptom.weight}
                      </span>
                    )}
                  </div>
                );
              })}

              {filteredSymptoms.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 space-y-2">
                  <AlertTriangle className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-sm">No symptoms matched your query "{searchQuery}"</p>
                  <p className="text-xs">Try a simpler term or clear the category filter.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: DURATION & AGE BAND */}
      {step === 2 && (
        <div className="glass-panel p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100 font-display">
              Clinical Context: Duration & Patient Demographics
            </h3>
            <p className="text-xs text-slate-400">
              Helps calibrate urgency evaluation and risk stratification rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Symptom Duration Slider */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Symptom Duration</span>
                </span>
                <span className="text-sm font-bold text-sky-400 font-mono">
                  {durationDays} {durationDays === 1 ? "Day" : "Days"}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="30"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />

              <div className="flex justify-between text-[11px] text-slate-500">
                <span>1 Day (Acute)</span>
                <span>7 Days (Subacute)</span>
                <span>30+ Days (Chronic)</span>
              </div>

              {durationDays >= 14 && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Symptoms lasting &gt;2 weeks indicate chronic risk factors.</span>
                </div>
              )}
            </div>

            {/* Age Band & Biological Sex */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-sky-400" />
                  <span>Age Band</span>
                </label>
                <select
                  value={ageBand}
                  onChange={(e) => setAgeBand(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60+"].map((band) => (
                    <option key={band} value={band}>
                      {band} years
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Biological Sex</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Female", "Male", "Other"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSex(s)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                        sex === s
                          ? "bg-sky-500/20 border-sky-500 text-sky-300"
                          : "bg-slate-950 border-white/10 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: RED-FLAG SAFETY SCREEN & CONFIRM */}
      {step === 3 && (
        <div className="glass-panel p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100 font-display">
              Review Selected Symptoms & Safety Protocol
            </h3>
            <p className="text-xs text-slate-400">
              Confirm your clinical intake details before running the calibrated diagnosis engine.
            </p>
          </div>

          {/* Critical Symptoms Alert if Any Selected */}
          {criticalSelected.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>High-Severity Symptoms Selected</span>
              </div>
              <p className="text-xs text-rose-300 leading-relaxed">
                You have selected symptoms flagged for potential urgent clinical risk (e.g.{" "}
                <strong>{criticalSelected.join(", ")}</strong>). If you are experiencing sudden severe
                chest pain, stroke signs, or severe breathing distress, seek immediate emergency care.
              </p>
            </div>
          )}

          {/* Selected Symptoms Summary Chips */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                Selected Symptoms ({selectedSymptoms.length}):
              </span>
              <button
                onClick={() => setStep(1)}
                className="text-sky-400 hover:underline text-[11px]"
              >
                Edit Symptoms
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((id) => {
                const s = (symptomsList || []).find((item) => item.id === id);
                return (
                  <span
                    key={id}
                    className="text-xs px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 font-medium flex items-center gap-1.5"
                  >
                    <span>{s ? s.label : id.replace(/_/g, " ")}</span>
                    <button
                      onClick={() => toggleSymptom(id)}
                      className="text-sky-400 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Intake Parameters Summary Card */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-slate-500 block text-[10px] uppercase">Duration</span>
              <span className="font-bold text-slate-200">{durationDays} Days</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-slate-500 block text-[10px] uppercase">Age Band</span>
              <span className="font-bold text-slate-200">{ageBand}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-slate-500 block text-[10px] uppercase">Sex</span>
              <span className="font-bold text-slate-200">{sex}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer Toolbar */}
      <div className="glass-panel p-4 flex items-center justify-between gap-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={handlePrevStep}
            className="btn btn-secondary text-xs flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>
        ) : (
          <span className="text-xs text-slate-500">
            {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? "s" : ""} selected
          </span>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNextStep}
            disabled={selectedSymptoms.length === 0}
            className="btn btn-primary text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Next: {step === 1 ? "Duration & Age" : "Review & Safety"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isLoading || selectedSymptoms.length === 0}
            className="btn btn-primary text-xs px-6 py-3 flex items-center gap-2 shadow-lg shadow-sky-500/25"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Running ML Diagnostic Inference...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze My Symptoms</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Smart Patient Input Modal */}
      {showSmartInput && (
        <SmartInputMode
          onFormPrefill={handleSmartInputPrefill}
          onClose={() => setShowSmartInput(false)}
        />
      )}
    </div>
  );
}

export default IntakeWizard;
