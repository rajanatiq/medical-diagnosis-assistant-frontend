import React from "react";
import { LogOut, X } from "lucide-react";

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel p-6 border border-white/10 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
            <LogOut className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100 font-display">
              Confirm Sign Out
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {userName ? `${userName}, are` : "Are"} you sure you want to sign out of your session? You will need to sign in again to access your encrypted assessment history.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary text-xs py-2 px-4"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="btn btn-emergency text-xs py-2 px-4 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Yes, Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirmModal;
