import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Trash2,
  AlertTriangle,
  History,
  User,
  KeyRound,
  FileCheck,
} from "lucide-react";
import {
  deleteAllHealthData,
  fetchAssessmentHistory,
} from "../services/api";

export function PrivacyCenter({ currentUser, onOpenAuth }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const histData = await fetchAssessmentHistory().catch(() => []);
      setHistory(histData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleDeleteAll = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      await deleteAllHealthData();
      setDeleteSuccess(true);
      setDeleteConfirm(false);
      setHistory([]);
      setTimeout(() => setDeleteSuccess(false), 4000);
    } catch (err) {
      alert(err.message || "Failed to erase data");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto glass-panel p-10 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto text-sky-400">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 font-display">
          Privacy & Encrypted Health Records
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Sign in or create an account to view your past assessment timeline and exercise your GDPR/HIPAA Right to Deletion.
        </p>
        <button onClick={onOpenAuth} className="btn btn-primary px-6 py-2.5 text-xs">
          <User className="w-4 h-4" />
          <span>Sign In / Create Account</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Architecture Badges */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 font-display">
              Privacy-First Security & Data Sovereignty
            </h2>
            <p className="text-xs text-slate-400">
              Zero-knowledge application layer encryption for all Protected Health Information (PHI).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <KeyRound className="w-4 h-4" />
              <span>Fernet AES-128-CBC</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Medical assessments and clinical profiles are encrypted at rest.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold">
              <Shield className="w-4 h-4" />
              <span>Salted SHA-256 IP Hash</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Audit trails never store raw IP addresses, preserving anonymity.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-teal-400 text-xs font-semibold">
              <FileCheck className="w-4 h-4" />
              <span>Right to Erasure</span>
            </div>
            <p className="text-[11px] text-slate-400">
              One-click permanent data wipe complies with GDPR Article 17.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Historical Triage Assessments */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-display">
          <History className="w-4 h-4 text-sky-400" />
          <span>Your Triage Assessment Timeline ({history.length})</span>
        </h3>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {history.map((item) => {
            const rawVal = item.top_confidence > 1 ? item.top_confidence : item.top_confidence * 100;
            const matchPercent = Math.min(Math.max(rawVal, 1.0), 99.0).toFixed(0);

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{item.top_condition}</span>
                    <span className="text-slate-400 font-mono">
                      ({matchPercent}% match)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {new Date(item.created_at).toLocaleDateString()} at{" "}
                    {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
                    {item.symptoms_count} symptoms evaluated
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`badge ${
                      item.urgency === "emergency"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : item.urgency === "see_doctor_within_24h"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    } text-[10px]`}
                  >
                    {(item.urgency || "").replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            );
          })}

          {history.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-6">
              No previous assessment records found.
            </p>
          )}
        </div>
      </div>

      {/* 3. Danger Zone: Right to Erasure */}
      <div className="glass-panel p-6 border-rose-500/30 bg-rose-500/5 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-300">
              GDPR & HIPAA Right to Erasure (Delete All Health Data)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Permanently purges all your past triage records, condition assessments, and encrypted patient history from our systems. This action cannot be undone.
            </p>
          </div>
        </div>

        {deleteSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            ✓ All health data and assessments have been permanently erased from database.
          </div>
        )}

        <div className="pt-2">
          {deleteConfirm ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 space-y-3">
              <p className="text-xs font-bold text-rose-400">
                Are you absolutely sure? All past medical assessments will be destroyed immediately.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteAll}
                  disabled={isLoading}
                  className="btn btn-emergency text-xs py-2 px-4"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Permanently Delete Everything</span>
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="btn btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="btn btn-secondary border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Erase All My Health Records</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrivacyCenter;
