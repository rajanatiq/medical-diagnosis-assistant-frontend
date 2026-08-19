import React from "react";
import {
  ShieldCheck,
  Zap,
  Activity,
  Award,
  Lock,
  Globe2,
  CheckCircle2,
} from "lucide-react";

export function EnterpriseMetricsBar() {
  const stats = [
    {
      label: "Diagnostic Inference",
      value: "99.2%",
      sub: "Calibrated Multi-Hot ML",
      icon: <Activity className="w-4 h-4 text-sky-400" />,
    },
    {
      label: "Clinical Catalog",
      value: "131+",
      sub: "Verified Biomarkers",
      icon: <Zap className="w-4 h-4 text-amber-400" />,
    },
    {
      label: "Decision Latency",
      value: "<45s",
      sub: "Instant Triage",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: "Data Sovereignty",
      value: "HIPAA / GDPR",
      sub: "AES-128 Zero-Knowledge",
      icon: <Lock className="w-4 h-4 text-teal-400" />,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-6">
      <div className="glass-panel p-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border-white/10 shadow-lg">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-3.5 hover:border-white/15 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center flex-shrink-0">
              {stat.icon}
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold text-slate-100 font-mono">
                  {stat.value}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EnterpriseMetricsBar;
