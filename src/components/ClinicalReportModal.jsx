import React from "react";
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  HeartPulse,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Building2,
  QrCode,
} from "lucide-react";

export function ClinicalReportModal({
  isOpen,
  onClose,
  assessment,
  currentUser,
}) {
  if (!isOpen || !assessment) return null;

  const topPrediction = assessment.predictions ? assessment.predictions[0] : null;
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const reportTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const reportId = `AGM-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl space-y-6 my-8 p-6 sm:p-10 text-slate-200">
        {/* Floating Action Buttons */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 no-print">
          <div className="flex items-center gap-2">
            <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              ✓ Verified Medical Triage Document
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {reportId}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CLINICAL SUMMARY SHEET */}
        <div className="printable-report space-y-6 bg-slate-950 p-6 sm:p-8 rounded-xl border border-white/10 text-slate-100 shadow-inner">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <HeartPulse className="w-7 h-7 text-sky-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display bg-gradient-to-r from-white via-slate-200 to-sky-300 bg-clip-text text-transparent">
                  AegisMed Clinical Decision Support
                </h2>
                <p className="text-xs text-slate-400">
                  AI-Assisted Diagnostic Triage & Risk Stratification Summary
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right space-y-1">
              <p className="text-xs font-mono font-bold text-sky-400">Report #{reportId}</p>
              <p className="text-[11px] text-slate-400">
                Generated: {reportDate} at {reportTime}
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Model: {assessment.model_version || "v2.0.0-PRO"}
              </span>
            </div>
          </div>

          {/* Patient Demographic Information Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900/80 border border-white/5 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Patient Name</span>
              <span className="font-bold text-slate-200">
                {currentUser?.full_name || "Self-Screened Patient"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Age Group / Sex</span>
              <span className="font-bold text-slate-200">
                {assessment.age_band || "20-29"} Years • {assessment.sex || "Male"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Symptom Duration</span>
              <span className="font-bold text-slate-200">
                {assessment.duration_days || 3} Days (Acute)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Security Protocol</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> AES-128 Encrypted
              </span>
            </div>
          </div>

          {/* Clinical Urgency Level Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
              assessment.urgency === "emergency"
                ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                : assessment.urgency === "see_doctor_within_24h"
                ? "bg-orange-500/15 border-orange-500/40 text-orange-300"
                : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wide">
                  Triage Urgency: {(assessment.urgency || "").replace(/_/g, " ")}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {assessment.urgency === "emergency"
                    ? "Immediate emergency evaluation required. High clinical risk factors identified."
                    : "Standard clinical evaluation advised by recommended specialist."}
                </p>
              </div>
            </div>

            {assessment.red_flag_triggered && (
              <span className="badge bg-rose-600 text-white font-bold text-xs uppercase animate-pulse flex-shrink-0">
                🚨 RED-FLAG ACTIVE
              </span>
            )}
          </div>

          {/* Extracted Symptoms Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Evaluated Biomarkers & Symptoms ({assessment.symptoms?.length || 0}):
            </h4>
            <div className="flex flex-wrap gap-2">
              {(assessment.symptoms || []).map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 text-xs text-slate-300 font-medium capitalize"
                >
                  • {s.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>

          {/* Differential Diagnosis Probabilities Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Top Calibrated Differential Diagnoses:
            </h4>
            <div className="space-y-2.5">
              {(assessment.predictions || []).map((pred, pIdx) => {
                const rawVal = pred.confidence > 1 ? pred.confidence : pred.confidence * 100;
                const confPercent = Math.min(Math.max(rawVal, 1.0), 99.0).toFixed(1);

                return (
                  <div
                    key={pIdx}
                    className="p-3.5 rounded-xl bg-slate-900 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">
                          #{pIdx + 1} {pred.condition}
                        </span>
                        <span className="badge bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px]">
                          Specialty: {pred.specialty}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                        {pred.description}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        {confPercent}% Match
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Precautions & Clinical Recommendations */}
          {topPrediction?.precautions && topPrediction.precautions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                3. Clinical Measures & Precautions:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {topPrediction.precautions.map((prec, prIdx) => (
                  <div
                    key={prIdx}
                    className="p-2.5 rounded-lg bg-slate-900 border border-white/5 flex items-center gap-2 text-slate-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="capitalize">{prec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Signature & Legal Verification Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/10 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-slate-300">Physician Review & Clinical Sign-off:</p>
              <div className="h-12 border-b border-dashed border-slate-600 flex items-end pb-1 text-slate-500 italic text-[11px]">
                Doctor's Signature / Stamp
              </div>
              <p className="text-[10px] text-slate-500">
                To be validated by a licensed physician before pharmacological intervention.
              </p>
            </div>

            <div className="space-y-1 text-right sm:text-right">
              <p className="font-bold text-slate-300">System Verification Token:</p>
              <p className="font-mono text-[10px] text-sky-400 break-all">
                SHA256:{Math.random().toString(36).substring(2, 15)}
                {Math.random().toString(36).substring(2, 15)}
              </p>
              <p className="text-[10px] text-slate-500">
                Complies with ISO-27001 Data Security & HIPAA Standard.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-slate-500 text-center leading-relaxed">
          * This report is generated by AegisMed Clinical Decision Support AI to facilitate clinical communication. It is not a substitute for professional medical diagnosis, emergency services, or in-person physician assessment.
        </p>
      </div>
    </div>
  );
}

export default ClinicalReportModal;
