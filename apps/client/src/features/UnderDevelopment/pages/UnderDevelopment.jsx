import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IconBrain, 
  IconArrowLeft, 
  IconSettingsAutomation,
  IconCpu,
  IconShieldLock
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const UnderDevelopment = ({ moduleName }) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center p-10 bg-[#f0f2f5] animate-fade-in">
      <div className="relative">
        {/* Animated Radar Effect */}
        <div className="absolute inset-0 bg-[#E31E24]/5 rounded-full animate-ping" style={{ animationDuration: '3000ms' }}></div>
        <div className="absolute inset-[-20px] bg-[#E31E24]/3 rounded-full animate-ping" style={{ animationDuration: '4000ms' }}></div>
        
        {/* Core Icon Container */}
        <div className="relative h-40 w-40 bg-[#f0f2f5] shadow-[15px_15px_30px_#d1d9e6,-15px_-15px_30px_#ffffff] rounded-[3rem] flex items-center justify-center border-4 border-white group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#E31E24]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <IconBrain size={64} className="text-[#E31E24] animate-pulse" />
        </div>
      </div>

      <div className="mt-16 text-center space-y-6 max-w-lg">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Module Status: Initializing</p>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase font-outfit">
            Development <span className="text-[#E31E24]">In Progress</span>
          </h2>
        </div>
        
        <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-wider px-4">
          WKN AI Engine sedang melakukan kalibrasi data dan integrasi infrastruktur untuk modul <span className="text-slate-600 font-black">{moduleName || 'Strategis'}</span> ini.
        </p>

        <div className="grid grid-cols-3 gap-6 pt-8">
          <StatusIndicator icon={<IconCpu size={18} />} label="AI Engine" status="Optimal" />
          <StatusIndicator icon={<IconSettingsAutomation size={18} />} label="Logic Sync" status="94%" />
          <StatusIndicator icon={<IconShieldLock size={18} />} label="Security" status="Active" />
        </div>

        <div className="pt-12">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="h-14 px-10 rounded-2xl bg-[#f0f2f5] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] text-slate-600 font-black text-xs uppercase tracking-widest hover:text-[#E31E24] hover:shadow-none transition-all active:scale-95 flex gap-4"
          >
            <IconArrowLeft size={18} />
            Return to Strategic Hub
          </Button>
        </div>
      </div>
    </div>
  );
};

const StatusIndicator = ({ icon, label, status }) => (
  <div className="flex flex-col items-center gap-3">
    <div className="h-12 w-12 bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] rounded-xl flex items-center justify-center text-slate-400">
      {icon}
    </div>
    <div className="flex flex-col items-center">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-[9px] font-black text-[#E31E24] uppercase tracking-tighter mt-0.5">{status}</span>
    </div>
  </div>
);

export default UnderDevelopment;
