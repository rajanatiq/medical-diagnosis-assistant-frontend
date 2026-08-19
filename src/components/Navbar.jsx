import React from "react";
import { Activity, Shield, MapPin, User, LogOut, HeartPulse, AlertCircle } from "lucide-react";

export function Navbar({
  activeTab,
  setActiveTab,
  isBackendConnected,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onPromptLogout,
}) {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 mb-6 backdrop-blur-xl bg-slate-950/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => setActiveTab("wizard")}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-0.5 shadow-lg shadow-sky-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                AegisMed
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold uppercase tracking-wider">
                Triage AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Clinical Decision Support & Remote Care Access
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/5">
          <button
            onClick={() => setActiveTab("wizard")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === "wizard"
                ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Symptom Triage</span>
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === "map"
                ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Find Nearby Care</span>
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === "privacy"
                ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy & Records</span>
          </button>
        </nav>

        {/* Backend Status & Auth */}
        <div className="flex items-center gap-3">
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isBackendConnected
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse"
            }`}
            title={isBackendConnected ? "FastAPI Server Online" : "FastAPI Server Offline"}
          >
            {isBackendConnected ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>FastAPI Active</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Connecting API...</span>
              </>
            )}
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2.5">
              {/* Clickable User Name & Profile Badge */}
              <div
                onClick={onOpenProfile}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-sky-500/50 hover:bg-sky-500/10 cursor-pointer transition-all shadow-sm"
                title="Click to view and edit your profile, age & sex"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold text-xs">
                  {currentUser.full_name ? currentUser.full_name[0].toUpperCase() : "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-200 group-hover:text-sky-300 transition-colors">
                    {currentUser.full_name || currentUser.email.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-sky-400">Edit Profile (Age & Sex)</p>
                </div>
              </div>

              {/* Logout Button with Confirmation */}
              <button
                onClick={onPromptLogout}
                className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-secondary text-xs py-2 px-3.5"
            >
              <User className="w-4 h-4 text-sky-400" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
