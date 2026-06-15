import React, { useState } from 'react';
import { IconAlertTriangle, IconRefresh, IconChevronDown, IconChevronRight, IconTerminal } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const ErrorFallback = ({ error, resetError }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleReload = () => {
    if (resetError) {
      resetError();
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-transparent rounded-3xl border border-white/20/80 shadow-neu p-8 space-y-6 text-center animate-fade-in">
        
        {/* Neumorphic Red Alert Icon Container */}
        <div className="mx-auto h-16 w-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-[#E31E24] shadow-neu">
          <IconAlertTriangle size={32} className="animate-pulse" />
        </div>

        {/* Text Headers */}
        <div className="space-y-2">
          <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">
            System Exception Intercepted
          </h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">
            Application Crash Isolated & Reported
          </p>
        </div>

        {/* Informational Message */}
        <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
          The WKNsite client ecosystem encountered an unhandled runtime error. Sentry real-time telemetry has captured the telemetry trace for administrative review.
        </p>

        {/* Error Message Box */}
        <div className="p-4 bg-slate-50 border border-white/20 rounded-2xl text-left font-mono text-xs font-bold text-slate-600 break-all select-all flex items-start gap-2.5">
          <IconTerminal size={14} className="text-[#E31E24] mt-0.5 shrink-0" />
          <span>{error?.message || "Unknown Application Exception"}</span>
        </div>

        {/* Control Button */}
        <Button
          onClick={handleReload}
          className="w-full h-11 bg-[#E31E24] hover:bg-[#C1181E] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-neu transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <IconRefresh size={14} />
          Reload Application
        </Button>

        {/* Collapsible Error Trace Details */}
        <div className="pt-2 border-t border-white/20">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-center gap-1.5 mx-auto text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
          >
            {showDetails ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
            {showDetails ? "Hide Exception Trace" : "Show Exception Trace"}
          </button>

          {showDetails && error?.stack && (
            <div className="mt-3 text-left p-3.5 bg-slate-900 border border-slate-800 rounded-xl max-h-48 overflow-y-auto custom-scrollbar shadow-inner animate-in slide-in-from-top-2 duration-200">
              <pre className="font-mono text-[11px] text-emerald-400/90 whitespace-pre-wrap leading-normal selection:bg-slate-700">
                {error.stack}
              </pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ErrorFallback;
