import React from 'react';
import { 
  IconClock, 
  IconCalendar, 
  IconPlayerPlay, 
  IconCheck,
  IconHistory,
  IconArrowRight
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Timesheet = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f0f2f5] custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              Project <span className="text-[#E31E24]">Timesheets</span>
            </h2>
            <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-[0.3em] opacity-70">Billable Hours & Resource Allocation</p>
          </div>
          <Button className="h-12 px-6 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-[5px_5px_15px_rgba(227,30,36,0.3)] hover:bg-[#C1181E] transition-all flex gap-3 items-center">
            <IconPlayerPlay size={16} />
            Start New Timer
          </Button>
        </header>

        {/* Weekly Progress Card */}
        <Card className="bg-[#f0f2f5] border-white border-[4px] shadow-[12px_12px_24px_#d1d9e6,-12px_-10px_20px_#ffffff] rounded-[2.5rem] p-8 flex flex-col gap-6">
           <div className="flex justify-between items-center px-4">
             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Weekly Summary</h3>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">May 01 - May 07</span>
           </div>
           
           <div className="flex items-end justify-around h-48 gap-4 px-4">
             {[32, 45, 12, 60, 40, 0, 0].map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-3">
                 <div className="w-full bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] rounded-xl h-32 relative overflow-hidden flex items-end">
                   <div className="w-full bg-[#E31E24] transition-all duration-1000" style={{ height: `${h}%` }}></div>
                 </div>
                 <span className="text-[8px] font-black text-slate-400 uppercase">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
               </div>
             ))}
           </div>
        </Card>

        {/* Recent Entries */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Recent Logs</h3>
          <div className="grid grid-cols-1 gap-4">
            <TimesheetLog project="WKNsite Frontend" task="Neumorphic Components" time="4h 30m" date="Today" />
            <TimesheetLog project="Internal HRIS" task="Database Schema Audit" time="2h 15m" date="Yesterday" />
          </div>
        </div>
      </div>
    </div>
  );
};

const TimesheetLog = ({ project, task, time, date }) => (
  <Card className="border-white border-[3px] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] bg-[#f0f2f5] rounded-[1.5rem] p-6 flex items-center justify-between group">
    <div className="flex items-center gap-6">
      <div className="h-12 w-12 bg-[#f0f2f5] rounded-xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-[#E31E24]">
        <IconHistory size={24} />
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{project}</h4>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task} • {date}</p>
      </div>
    </div>
    <div className="flex items-center gap-12">
      <div className="text-right">
        <p className="text-lg font-black text-slate-700 font-outfit">{time}</p>
        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Submitted</span>
      </div>
      <Button variant="ghost" className="h-10 w-10 rounded-xl bg-[#f0f2f5] shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] border-white border-2 text-slate-300 hover:text-[#E31E24] p-0 flex items-center justify-center">
        <IconArrowRight size={16} />
      </Button>
    </div>
  </Card>
);

export default Timesheet;
