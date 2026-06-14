import React from 'react';
import { IconActivity, IconAlertTriangle } from "@tabler/icons-react";

const RiskGauge = ({ score, level, color }) => {
  const getStrokeColor = () => {
    switch(color) {
      case 'rose': return '#E31E24';
      case 'amber': return '#f59e0b';
      case 'emerald': return '#10b981';
      default: return '#E31E24';
    }
  };

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="relative h-40 w-40 flex items-center justify-center">
        {/* Neumorphic Outer Ring */}
        <div className="absolute inset-0 rounded-full shadow-neu border-4 border-white"></div>
        
        {/* Progress Circle */}
        <svg className="h-full w-full -rotate-90 transform overflow-visible">
          <circle
            cx="50%"
            cy="50%"
            r="45"
            fill="transparent"
            stroke="#f0f2f5"
            strokeWidth="12"
            className="shadow-neu"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45"
            fill="transparent"
            stroke={getStrokeColor()}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${getStrokeColor()}66)` }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-black text-slate-800 font-outfit">{score}%</span>
          <span className={`text-[8px] font-black uppercase tracking-widest ${level === 'High' ? 'text-rose-500' : 'text-slate-400'}`}>
            Risk Level
          </span>
        </div>
      </div>

      <div className={`px-4 py-1.5 rounded-xl border-2 border-white shadow-neu flex items-center gap-2
        ${level === 'High' ? 'bg-rose-50 text-rose-600' : level === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
        {level === 'High' ? <IconAlertTriangle size={14} /> : <IconActivity size={14} />}
        <span className="text-[10px] font-black uppercase tracking-widest">{level} Risk Detected</span>
      </div>
    </div>
  );
};

export default RiskGauge;
