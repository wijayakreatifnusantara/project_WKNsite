import React from 'react';
import { Card } from "@/components/ui/card";

const AttendanceKPI = ({ title, value, total, unit = "", icon, color, compact = false }) => {
  const colorConfig = {
    emerald: "text-emerald-500 bg-emerald-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    rose: "text-rose-500 bg-rose-500/10",
    indigo: "text-indigo-500 bg-indigo-500/10",
  };

  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  if (compact) {
    return (
      <Card className="border-white border-2 shadow-neu bg-transparent rounded-2xl p-3 flex items-center gap-3 transition-all hover:translate-y-[-2px] cursor-pointer">
        <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${colorConfig[color]}`}>
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-sm font-black text-slate-800 leading-none">{value}{unit}</h3>
            {total > 0 && unit !== "%" && (
              <span className="text-[7px] font-bold text-slate-300 uppercase">/ {percentage}%</span>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-white/50 border bg-transparent shadow-neu rounded-2xl p-5 transition-all hover:translate-y-[-2px] cursor-pointer group">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${colorConfig[color]}`}>
            {icon}
          </div>
          {total > 0 && unit !== "%" && (
            <div className="px-3 py-1 rounded-lg bg-[#f0f2f5] shadow-neu-inset border-none text-[9px] font-black uppercase tracking-widest text-slate-400">
              {percentage}% OF TOTAL
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-80">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3 className="text-2xl font-black text-slate-800 font-outfit tracking-tight">{value}</h3>
            {unit && <span className="text-sm font-black text-slate-400 uppercase">{unit}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AttendanceKPI;
