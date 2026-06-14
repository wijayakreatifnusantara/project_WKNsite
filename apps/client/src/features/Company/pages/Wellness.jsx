import React from 'react';
import { 
  IconHeartbeat, 
  IconShieldCheck, 
  IconStethoscope, 
  IconActivity,
  IconFlame,
  IconGlassFull
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";

const Wellness = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              Health & <span className="text-[#E31E24]">Wellness</span>
            </h2>
            <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-[0.3em] opacity-70">Employee Vitality & Insurance Benefits</p>
          </div>
        </header>

        {/* Vital Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <WellnessMetric label="Daily Steps" value="8,432" icon={<IconActivity size={24} />} color="indigo" />
          <WellnessMetric label="Calories" value="1,240" icon={<IconFlame size={24} />} color="rose" />
          <WellnessMetric label="Hydration" value="1.8L" icon={<IconGlassFull size={24} />} color="sky" />
          <WellnessMetric label="Wellness Score" value="84%" icon={<IconHeartbeat size={24} />} color="emerald" />
        </div>

        {/* Health Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-white border-[4px] shadow-neu bg-[#f0f2f5] rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Medical Profile</h3>
               <div className="space-y-4">
                 <ProfileRow label="Blood Type" value="B+" />
                 <ProfileRow label="BPJS Kesehatan" value="000123456789" />
                 <ProfileRow label="Primary Insurance" value="Allianz - Corporate Gold" />
                 <ProfileRow label="Last Medical Checkup" value="Jan 12, 2026" />
                 <ProfileRow label="Known Allergies" value="Penicillin, Seafood" color="rose" />
               </div>
             </div>
             <IconStethoscope size={160} className="absolute -bottom-10 -right-10 text-slate-200 rotate-12 opacity-50" />
          </Card>

          <Card className="border-white border-[4px] shadow-neu bg-[#f0f2f5] rounded-[2.5rem] p-8">
             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Wellness Activity</h3>
             <div className="h-64 flex items-end justify-around gap-2 px-4 pb-4">
               {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-3">
                   <div className="w-full bg-[#f0f2f5] shadow-neu rounded-full h-48 relative overflow-hidden flex items-end">
                     <div className="w-full bg-[#E31E24] rounded-t-full transition-all duration-1000" style={{ height: `${h}%` }}></div>
                   </div>
                   <span className="text-[8px] font-black text-slate-400 uppercase">Day {i+1}</span>
                 </div>
               ))}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const WellnessMetric = ({ label, value, icon, color }) => (
  <Card className="border-white border-[2px] shadow-neu bg-[#f0f2f5] rounded-[1.5rem] p-6 flex flex-col items-center gap-3">
    <div className={`h-10 w-10 rounded-xl bg-[#f0f2f5] shadow-neu flex items-center justify-center
      ${color === 'indigo' ? 'text-indigo-500' : color === 'rose' ? 'text-rose-500' : color === 'sky' ? 'text-sky-500' : 'text-emerald-500'}`}>
      {icon}
    </div>
    <div className="text-center">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <h3 className="text-xl font-black text-slate-800 font-outfit leading-none">{value}</h3>
    </div>
  </Card>
);

const ProfileRow = ({ label, value, color }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/30 last:border-0">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{label}</span>
    <span className={`text-[10px] font-black ${color === 'rose' ? 'text-rose-500 font-black' : 'text-slate-700'}`}>{value}</span>
  </div>
);

export default Wellness;
