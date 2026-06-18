import React from 'react';
import { 
  IconTrophy, 
  IconUsers, 
  IconChartLine, 
  IconArrowUpRight,
  IconStar,
  IconChevronRight
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Succession = () => {
  const candidates = [
    { id: 1, name: 'Siti Aminah', role: 'Operations Manager', target: 'Operations Director', readiness: 92, gap: 'Financial Strategy' },
    { id: 2, name: 'Budi Santoso', role: 'Finance Manager', target: 'Finance Director', readiness: 85, gap: 'Leadership Presence' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 font-outfit tracking-tight uppercase">
              Succession <span className="text-ios-primary">Planning</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest opacity-70">Leadership Pipeline & Talent Readiness</p>
          </div>
          <Button className="h-12 px-6 rounded-2xl bg-ios-primary text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-ios-primary/90 transition-all flex gap-3 items-center">
            <IconChartLine size={16} />
            Benchmarking Engine
          </Button>
        </header>

        {/* Readiness Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Critical Positions" value="8" icon={<IconTrophy size={24} />} color="amber" />
          <StatCard label="Ready Now" value="3" icon={<IconStar size={24} />} color="emerald" />
          <StatCard label="High Potentials" value="12" icon={<IconUsers size={24} />} color="indigo" />
        </div>

        {/* Talent Pool */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Leadership Talent Pool</h3>
          <div className="grid grid-cols-1 gap-6">
            {candidates.map(cand => (
              <Card key={cand.id} className="border-white border-[3px] shadow-sm bg-white rounded-[2.5rem] p-8 flex items-center justify-between group">
                <div className="flex items-center gap-8">
                   <div className="h-20 w-20 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 overflow-hidden border-2 border-white">
                      <img src={`https://i.pravatar.cc/150?u=${cand.id}`} alt={cand.name} className="h-full w-full object-cover" />
                   </div>
                   <div>
                      <h4 className="text-lg font-bold text-slate-800 uppercase tracking-tight">{cand.name}</h4>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{cand.role}</p>
                      <div className="mt-4 flex items-center gap-3">
                         <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">Next: {cand.target}</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-12">
                   <div className="text-center">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Readiness</p>
                      <div className="h-16 w-16 rounded-full border-[6px] border-[#f0f2f5] shadow-sm flex items-center justify-center">
                         <span className="text-sm font-bold text-emerald-500">{cand.readiness}%</span>
                      </div>
                   </div>
                   <div className="w-48">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Development Gap</p>
                      <div className="p-3 bg-white/40 rounded-xl border border-white text-xs font-bold text-slate-600 italic">
                         "{cand.gap}"
                      </div>
                   </div>
                   <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-white shadow-sm border-white border-2 text-slate-400 hover:text-ios-primary p-0 flex items-center justify-center">
                      <IconChevronRight size={20} />
                   </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <Card className="border-white border-[2px] shadow-sm bg-white rounded-xl p-6 flex items-center gap-4">
    <div className={`h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center
      ${color === 'emerald' ? 'text-emerald-500' : color === 'indigo' ? 'text-indigo-500' : 'text-amber-500'}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-none mb-1">{label}</p>
      <h3 className="text-xl font-bold text-slate-800 font-outfit">{value}</h3>
    </div>
  </Card>
);

export default Succession;
