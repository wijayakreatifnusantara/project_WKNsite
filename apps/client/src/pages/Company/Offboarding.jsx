import React from 'react';
import { 
  IconLogout, 
  IconClipboardCheck, 
  IconTrash, 
  IconShieldLock,
  IconArrowRight,
  IconArchive
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Offboarding = () => {
  const pendingExit = [
    { id: 1, name: 'John Doe', role: 'DevOps Engineer', date: 'May 31, 2026', progress: 40 },
    { id: 2, name: 'Jane Smith', role: 'UX Researcher', date: 'June 15, 2026', progress: 10 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f0f2f5] custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              Exit <span className="text-[#E31E24]">Management</span>
            </h2>
            <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-[0.3em] opacity-70">Corporate Offboarding & Asset Retrieval</p>
          </div>
          <Button className="h-12 px-6 rounded-2xl bg-slate-800 text-white font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all flex gap-3 items-center">
            <IconLogout size={16} />
            Initiate Resignation
          </Button>
        </header>

        {/* Offboarding Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Pending Leavers" value="2" icon={<IconLogout size={24} />} color="amber" />
          <StatCard label="Assets Pending" value="8" icon={<IconArchive size={24} />} color="indigo" />
          <StatCard label="Clearance Complete" value="45" icon={<IconShieldLock size={24} />} color="emerald" />
        </div>

        {/* Exit Pipeline */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Resignation Pipeline</h3>
          <div className="grid grid-cols-1 gap-4">
            {pendingExit.map(ex => (
              <Card key={ex.id} className="border-white border-[3px] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] bg-[#f0f2f5] rounded-[2rem] p-6 flex flex-col gap-6 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 bg-[#f0f2f5] rounded-full shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] overflow-hidden p-1">
                      <img src={`https://i.pravatar.cc/150?u=${ex.id}`} alt={ex.name} className="h-full w-full object-cover rounded-full" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{ex.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{ex.role} • Exit Date: {ex.date}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="h-10 px-4 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:text-rose-500 hover:bg-rose-50 flex gap-2">
                    <IconClipboardCheck size={14} />
                    View Checklist
                  </Button>
                </div>

                <div className="space-y-2 px-2">
                  <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Offboarding Progress</span>
                    <span>{ex.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] rounded-full overflow-hidden">
                    <div className="h-full bg-[#E31E24] transition-all duration-1000" style={{ width: `${ex.progress}%` }}></div>
                  </div>
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
  <Card className="border-white border-[2px] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] bg-[#f0f2f5] rounded-[1.5rem] p-6">
    <div className="flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center
        ${color === 'emerald' ? 'text-emerald-500' : color === 'indigo' ? 'text-indigo-500' : 'text-amber-500'}`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-xl font-black text-slate-800 font-outfit">{value}</h3>
      </div>
    </div>
  </Card>
);

export default Offboarding;
