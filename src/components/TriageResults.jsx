import React, { useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle,
  PhoneCall,
  MapPin,
  RefreshCw,
  Printer,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  Info,
  FileText,
  Video,
  ExternalLink,
} from "lucide-react";
import { ClinicalReportModal } from "./ClinicalReportModal";

export function TriageResults({
  assessment,
  onRetake,
  onFindSpecialist,
  currentUser,
}) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  if (!assessment) return null;

  const isEmergency = assessment.urgency === "emergency";

  const urgencyConfig = {
    emergency: {
      bg: "bg-rose-500/15",
      border: "border-rose-500/50",
      text: "text-rose-400",
      badgeBg: "bg-rose-500",
      icon: <AlertOctagon className="w-8 h-8 text-rose-400 animate-bounce" />,
      title: "Seek Emergency Care Immediately",
      recommendation: "Proceed to the nearest Emergency Department or call an ambulance immediately.",
    },
    see_doctor_within_24h: {
      bg: "bg-orange-500/15",
      border: "border-orange-500/50",
      text: "text-orange-400",
      badgeBg: "bg-orange-500",
      icon: <AlertTriangle className="w-8 h-8 text-orange-400" />,
      title: "Consult a Doctor Within 24 Hours",
      recommendation: "Your symptoms warrant clinical evaluation within 24 hours to prevent complications.",
    },
    see_doctor_soon: {
      bg: "bg-amber-500/15",
      border: "border-amber-500/50",
      text: "text-amber-400",
      badgeBg: "bg-amber-500",
      icon: <Clock className="w-8 h-8 text-amber-400" />,
      title: "Schedule a Healthcare Visit Soon",
      recommendation: "Book an appointment with a general physician or specialist in the coming days.",
    },
    self_care: {
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/50",
      text: "text-emerald-400",
      badgeBg: "bg-emerald-500",
      icon: <CheckCircle className="w-8 h-8 text-emerald-400" />,
      title: "Self-Care & Home Monitoring",
      recommendation: "Symptoms appear mild. Practice home care, rest, hydration, and monitor for changes.",
    },
  }[assessment.urgency] || {
    bg: "bg-sky-500/15",
    border: "border-sky-500/50",
    text: "text-sky-400",
    badgeBg: "bg-sky-500",
    icon: <Sparkles className="w-8 h-8 text-sky-400" />,
    title: assessment.urgency_display || "Clinical Assessment Result",
    recommendation: "Consult with a healthcare provider for personalized medical evaluation.",
  };

  const topPrediction = assessment.predictions ? assessment.predictions[0] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. TOP URGENCY BANNER */}
      <div
        className={`glass-panel p-6 border-2 ${urgencyConfig.border} ${urgencyConfig.bg} relative overflow-hidden`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 flex-shrink-0">
              {urgencyConfig.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`badge ${urgencyConfig.badgeBg} text-white font-bold text-[11px]`}
                >
                  Urgency Level: {(assessment.urgency || "").replace(/_/g, " ")}
                </span>
                {assessment.red_flag_triggered && (
                  <span className="badge bg-rose-600 text-white font-bold text-[10px] animate-pulse">
                    ⚠️ Safety Red-Flag Triggered
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-100 font-display">
                {urgencyConfig.title}
              </h2>
              <p className="text-sm text-slate-300">
                {urgencyConfig.recommendation}
              </p>
              {assessment.red_flag_reason && (
                <p className="text-xs text-rose-300 font-medium pt-1">
                  Reason: {assessment.red_flag_reason}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto flex-shrink-0">
            {isEmergency ? (
              <a
                href="tel:911"
                className="btn btn-emergency w-full px-6 py-3.5 text-sm flex items-center justify-center gap-2 font-bold shadow-xl"
              >
                <PhoneCall className="w-5 h-5 animate-bounce" />
                <span>Call Emergency (911 / 112)</span>
              </a>
            ) : (
              <button
                onClick={() => onFindSpecialist(topPrediction?.specialty || "General Practice")}
                className="btn btn-primary w-full text-xs py-2.5 px-4 flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Find Nearby {topPrediction?.specialty || "Care"}</span>
              </button>
            )}

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="btn btn-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2 border-sky-500/30 text-sky-300 hover:bg-sky-500/10"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Official Clinical Report (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TELEHEALTH ON-CALL DOCTOR COMMERCIAL BRIDGE */}
      <div className="glass-panel p-5 bg-gradient-to-r from-sky-950/60 via-indigo-950/40 to-slate-900/70 border border-sky-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Instant Telehealth Physician Consultation</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                Available 24/7
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect with board-certified general physicians for second opinion, prescription verification & video consultation.
            </p>
          </div>
        </div>

        <button
          onClick={() => alert("Telehealth Consultation Gateway: Connecting with on-call licensed physician network...")}
          className="btn btn-primary text-xs py-2.5 px-4 flex items-center gap-2 flex-shrink-0 bg-sky-600 hover:bg-sky-500 shadow-md"
        >
          <span>Connect with Doctor</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. TOP PREDICTED CONDITIONS SECTION */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-display">
              <Stethoscope className="w-5 h-5 text-sky-400" />
              <span>Calibrated Condition Probabilities (Top 3)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated using calibrated statistical inference + multi-hot symptom vector analysis.
            </p>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              Model: {assessment.model_version || "v2.0.0"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {(assessment.predictions || []).map((pred, idx) => {
            const rawVal = pred.confidence > 1 ? pred.confidence : pred.confidence * 100;
            const normalizedConfidence = Math.min(Math.max(rawVal, 1.0), 99.0);
            const confidencePercent = normalizedConfidence.toFixed(1);
            const isRank1 = idx === 0;

            return (
              <div
                key={pred.condition}
                className={`p-5 rounded-2xl border transition-all ${
                  isRank1
                    ? "bg-slate-900/90 border-sky-500/40 shadow-lg shadow-sky-500/5"
                    : "bg-slate-900/50 border-white/5"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isRank1
                          ? "bg-sky-500 text-white"
                          : "bg-slate-800 text-slate-400 border border-white/10"
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-100">
                        {pred.condition}
                      </h4>
                      <span className="text-xs text-sky-400 font-medium">
                        Recommended Specialty: {pred.specialty}
                      </span>
                    </div>
                  </div>

                  {/* Confidence Bar & Percentage */}
                  <div className="sm:text-right min-w-[140px]">
                    <div className="flex items-center sm:justify-end gap-2">
                      <span className="text-sm font-bold text-slate-200 font-mono">
                        {confidencePercent}%
                      </span>
                      <span className="text-[10px] text-slate-400">confidence</span>
                    </div>
                    <div className="w-full sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isRank1
                            ? "bg-gradient-to-r from-sky-500 to-emerald-400"
                            : "bg-slate-500"
                        }`}
                        style={{ width: `${normalizedConfidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-white/5 mb-3">
                  {pred.description}
                </p>

                {/* Actionable Precautions Checklist */}
                {pred.precautions && pred.precautions.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Recommended Care Measures & Precautions:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pred.precautions.map((prec, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/30 px-2.5 py-1.5 rounded-lg border border-white/5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="capitalize">{prec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ACTION TOOLBAR */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onRetake}
          className="btn btn-secondary text-xs flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retake Assessment</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="btn btn-secondary text-xs flex items-center gap-2 border-sky-500/30 text-sky-300 hover:bg-sky-500/10"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Clinical PDF</span>
          </button>

          <button
            onClick={() => onFindSpecialist(topPrediction?.specialty || "General Practice")}
            className="btn btn-primary text-xs flex items-center gap-2"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Find Nearby Specialists</span>
          </button>
        </div>
      </div>

      {/* 5. MANDATORY MEDICAL DISCLAIMER */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">
            Mandatory Non-Diagnostic Disclaimer
          </p>
          <p className="leading-relaxed">{assessment.disclaimer}</p>
        </div>
      </div>

      {/* Clinical PDF Report Modal */}
      <ClinicalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        assessment={assessment}
        currentUser={currentUser}
      />
    </div>
  );
}

export default TriageResults;
