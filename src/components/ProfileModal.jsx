import React, { useState, useEffect } from "react";
import { User, X, Save, CheckCircle2, Shield, Calendar, Heart, AlertCircle } from "lucide-react";
import { fetchPatientProfile, updatePatientProfile } from "../services/api";

export function getAgeBandFromAge(ageNum) {
  if (isNaN(ageNum) || ageNum <= 0) return "20-29";
  if (ageNum < 10) return "0-9";
  if (ageNum < 20) return "10-19";
  if (ageNum < 30) return "20-29";
  if (ageNum < 40) return "30-39";
  if (ageNum < 50) return "40-49";
  if (ageNum < 60) return "50-59";
  return "60+";
}

export function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) {
  const [exactAge, setExactAge] = useState("21");
  const [computedBand, setComputedBand] = useState("20-29");
  const [sex, setSex] = useState("Male");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load existing profile from SQL Server when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      fetchPatientProfile()
        .then((profile) => {
          if (profile) {
            if (profile.sex) setSex(profile.sex);
            if (profile.age_band) {
              setComputedBand(profile.age_band);
              if (profile.age_band === "0-9") setExactAge("7");
              else if (profile.age_band === "10-19") setExactAge("16");
              else if (profile.age_band === "20-29") setExactAge("21");
              else if (profile.age_band === "30-39") setExactAge("34");
              else if (profile.age_band === "40-49") setExactAge("45");
              else if (profile.age_band === "50-59") setExactAge("55");
              else if (profile.age_band === "60+") setExactAge("65");
            }
            if (profile.medical_history) setMedicalHistory(profile.medical_history);
            if (profile.allergies) setAllergies(profile.allergies);
            if (profile.current_medications) setMedications(profile.current_medications);
          }
        })
        .catch((err) => console.warn("Failed to load profile:", err));
    }
  }, [isOpen, currentUser]);

  const handleAgeChange = (val) => {
    setExactAge(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      const band = getAgeBandFromAge(num);
      setComputedBand(band);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const bandToSave = computedBand || getAgeBandFromAge(parseInt(exactAge, 10));

    try {
      await updatePatientProfile({
        age_band: bandToSave,
        sex: sex,
        medical_history: medicalHistory,
        allergies: allergies,
        current_medications: medications,
      });

      setSuccessMessage(`Profile updated! Age ${exactAge} saved to "${bandToSave}" age-band in database.`);
      if (onProfileUpdated) onProfileUpdated();

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1800);
    } catch (err) {
      setErrorMessage(err.message || "Failed to save profile to database");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-display">
                {currentUser?.full_name || "Patient Profile"}
              </h3>
              <p className="text-xs text-slate-400">
                {currentUser?.email} • Database ID #{currentUser?.user_id}
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

        {/* Alerts */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>Your Exact Age (Years)</span>
              </label>
              <input
                type="number"
                min="1"
                max="120"
                required
                value={exactAge}
                onChange={(e) => handleAgeChange(e.target.value)}
                placeholder="e.g. 21"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500 font-semibold"
              />
              <p className="text-[11px] text-slate-400">Enter your age (e.g. 21)</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Auto Database Age-Band
              </label>
              <div className="w-full bg-slate-900/50 border border-sky-500/30 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <span className="text-sm font-bold text-sky-400">{computedBand} years</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                  Auto-Mapped
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Saved to SQL Server schema</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Biological Sex</label>
            <div className="grid grid-cols-3 gap-2">
              {["Male", "Female", "Other"].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setSex(option)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    sex === option
                      ? "bg-sky-500/20 border-sky-500 text-sky-300 shadow-md shadow-sky-500/10"
                      : "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Chronic Medical Conditions (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Asthma, Hypertension, Diabetes..."
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Known Drug Allergies (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Penicillin, Aspirin..."
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-xs py-2.5 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving to Database..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
