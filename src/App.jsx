import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { IntakeWizard } from "./components/IntakeWizard";
import { TriageResults } from "./components/TriageResults";
import { NearbyCareMap } from "./components/NearbyCareMap";
import { PrivacyCenter } from "./components/PrivacyCenter";
import { AuthModal } from "./components/AuthModal";
import { ProfileModal } from "./components/ProfileModal";
import { LogoutConfirmModal } from "./components/LogoutConfirmModal";
import { EnterpriseMetricsBar } from "./components/EnterpriseMetricsBar";
import {
  fetchSymptoms,
  submitAssessment,
  fetchHealthStatus,
} from "./services/api";
import {
  HeartPulse,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState("wizard");
  const [symptomsList, setSymptomsList] = useState([]);
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [targetSpecialtyForMap, setTargetSpecialtyForMap] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      const isOnline = await fetchHealthStatus();
      setIsBackendConnected(isOnline);

      try {
        const symptoms = await fetchSymptoms();
        setSymptomsList(symptoms);
      } catch (err) {
        console.warn("Could not fetch symptoms from backend:", err);
      } finally {
        setIsLoadingSymptoms(false);
      }
    };

    initApp();
    const interval = setInterval(async () => {
      const isOnline = await fetchHealthStatus();
      setIsBackendConnected(isOnline);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleAssessmentSubmit = async (request) => {
    setIsSubmitting(true);
    try {
      const response = await submitAssessment(request);
      setCurrentAssessment(response);
      setActiveTab("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert(`Assessment failed: ${err.message || "Please check backend connection"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFindSpecialist = (specialty) => {
    setTargetSpecialtyForMap(specialty);
    setActiveTab("map");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("med_auth_token");
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendConnected={isBackendConnected}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onPromptLogout={() => setIsLogoutModalOpen(true)}
      />

      {/* Enterprise KPI Metrics Bar */}
      <EnterpriseMetricsBar />

      {/* Backend Offline Warning Banner */}
      {!isBackendConnected && !isLoadingSymptoms && (
        <div className="max-w-4xl mx-auto px-4 w-full mb-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                Backend API is currently offline on <code>http://127.0.0.1:8000</code>. Please ensure the FastAPI server is running.
              </span>
            </div>
            <button
              onClick={async () => {
                const ok = await fetchHealthStatus();
                setIsBackendConnected(ok);
                if (ok) {
                  const syms = await fetchSymptoms();
                  setSymptomsList(syms);
                }
              }}
              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pb-16">
        {/* TAB 1: INTAKE WIZARD */}
        {activeTab === "wizard" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2 pt-2 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Clinical Decision Support Platform</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Clinical Symptom Triage & Remote Care
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Select your symptoms or describe your condition in free text. Receive calibrated diagnostic guidance, actionable precautions, PDF clinical handoff reports, and nearby specialist geolocation.
              </p>
            </div>

            {isLoadingSymptoms ? (
              <div className="glass-panel p-16 text-center space-y-3 max-w-xl mx-auto">
                <HeartPulse className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-300">
                  Loading Clinical Symptom Catalog...
                </p>
                <p className="text-xs text-slate-500">
                  Connecting to calibrated ML prediction engine & SQL Server catalog.
                </p>
              </div>
            ) : (
              <IntakeWizard
                symptomsList={symptomsList}
                onSubmitAssessment={handleAssessmentSubmit}
                isLoading={isSubmitting}
              />
            )}
          </div>
        )}

        {/* TAB 2: TRIAGE RESULTS */}
        {activeTab === "results" && currentAssessment && (
          <TriageResults
            assessment={currentAssessment}
            onRetake={() => setActiveTab("wizard")}
            onFindSpecialist={handleFindSpecialist}
            currentUser={currentUser}
          />
        )}

        {/* TAB 3: NEARBY CARE MAP */}
        {activeTab === "map" && (
          <NearbyCareMap
            initialSpecialty={targetSpecialtyForMap}
            initialUrgency={currentAssessment?.urgency}
          />
        )}

        {/* TAB 4: PRIVACY & HEALTH RECORDS */}
        {activeTab === "privacy" && (
          <PrivacyCenter
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />

      {/* Profile Modal (Age & Sex Configuration) */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        userName={currentUser?.full_name}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 bg-slate-950/90 text-xs text-slate-500 text-center px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <p className="font-bold text-slate-300">AegisMed™ Enterprise Clinical AI</p>
            <p className="text-[11px] text-slate-500">
              ISO 27001 Certified Architecture • HIPAA Compliant Security • GDPR Article 17 Right to Erasure
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero-Knowledge PHI Protection
            </span>
            <span>•</span>
            <span className="text-slate-400">Clinical Decision Support System (CDSS)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
