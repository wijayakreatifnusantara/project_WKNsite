import React, { useState } from 'react';
import { 
  IconUserPlus, 
  IconUserMinus, 
  IconCircleCheck, 
  IconCircleDashed, 
  IconDeviceLaptop, 
  IconMail, 
  IconId, 
  IconFileText,
  IconClock,
  IconArrowRight,
  IconX,
  IconChevronRight,
  IconConfetti
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const OnboardingManager = ({ isOpen, onClose, employees }) => {
  const [activeMode, setActiveMode] = useState('onboarding'); // 'onboarding' or 'offboarding'
  
  if (!isOpen) return null;

  // Sample data for onboarding/offboarding processes
  const onboardingQueue = [
    { id: 'WKN-001', name: 'Sarah Johnson', dept: 'Engineering', date: '2024-06-01', progress: 65, tasks: [
      { id: 1, title: 'Hardware Provisioning', status: 'done', icon: <IconDeviceLaptop size={16} /> },
      { id: 2, title: 'Corporate Email Setup', status: 'done', icon: <IconMail size={16} /> },
      { id: 3, title: 'Identity Badge Print', status: 'pending', icon: <IconId size={16} /> },
      { id: 4, title: 'Compliance Documents', status: 'pending', icon: <IconFileText size={16} /> }
    ]},
    { id: 'WKN-002', name: 'Michael Chen', dept: 'Design', date: '2024-06-15', progress: 25, tasks: [
      { id: 1, title: 'Hardware Provisioning', status: 'done', icon: <IconDeviceLaptop size={16} /> },
      { id: 2, title: 'Corporate Email Setup', status: 'pending', icon: <IconMail size={16} /> },
      { id: 3, title: 'Identity Badge Print', status: 'pending', icon: <IconId size={16} /> },
      { id: 4, title: 'Compliance Documents', status: 'pending', icon: <IconFileText size={16} /> }
    ]}
  ];

  const offboardingQueue = [
    { id: 'WKN-098', name: 'James Wilson', dept: 'Sales', date: '2024-05-20', progress: 80, tasks: [
      { id: 1, title: 'Asset Recovery', status: 'done', icon: <IconDeviceLaptop size={16} /> },
      { id: 2, title: 'Access Revocation', status: 'done', icon: <IconShieldCheck size={16} /> },
      { id: 3, title: 'Exit Interview', status: 'pending', icon: <IconFileText size={16} /> },
      { id: 4, title: 'Final Clearance', status: 'done', icon: <IconCircleCheck size={16} /> }
    ]}
  ];

  const currentQueue = activeMode === 'onboarding' ? onboardingQueue : offboardingQueue;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-6xl h-[85vh] bg-[#f0f2f5] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] rounded-[3rem] overflow-hidden flex flex-col border-[8px] border-white animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Mode Toggle */}
        <header className="h-24 bg-[#f0f2f5] border-b-2 border-white flex items-center justify-between px-12 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] p-1.5 rounded-2xl">
              <button 
                onClick={() => setActiveMode('onboarding')}
                className={`px-6 py-2.5 rounded-xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${activeMode === 'onboarding' ? 'bg-[#E31E24] text-white shadow-[4px_4px_10px_rgba(227,30,36,0.2)]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <IconUserPlus size={18} />
                Onboarding
              </button>
              <button 
                onClick={() => setActiveMode('offboarding')}
                className={`px-6 py-2.5 rounded-xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${activeMode === 'offboarding' ? 'bg-slate-800 text-white shadow-[4px_4px_10px_rgba(0,0,0,0.2)]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <IconUserMinus size={18} />
                Offboarding
              </button>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 font-outfit uppercase tracking-tight">Lifecycle Manager</h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-70">Employee entry & exit workflows</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-12 w-12 flex items-center justify-center bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] rounded-2xl text-slate-400 hover:text-[#E31E24] transition-all"
          >
            <IconX size={24} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Process Queue */}
          <div className="w-[400px] border-r-2 border-white/50 overflow-y-auto p-8 custom-scrollbar bg-[#f0f2f5]/50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 pl-2">Active Processes ({currentQueue.length})</h3>
            <div className="space-y-6">
              {currentQueue.map((item) => (
                <div 
                  key={item.id} 
                  className="group bg-[#f0f2f5] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-none transition-all p-6 rounded-[2rem] border-2 border-white cursor-pointer relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${activeMode === 'onboarding' ? 'bg-[#E31E24]' : 'bg-slate-800'}`}></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-800 leading-tight">{item.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{item.dept}</p>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 bg-white/50 px-2 py-1 rounded-md">{item.id}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase">
                      <span className="text-slate-400">Progress</span>
                      <span className={activeMode === 'onboarding' ? 'text-[#E31E24]' : 'text-slate-800'}>{item.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-white shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${activeMode === 'onboarding' ? 'bg-[#E31E24]' : 'bg-slate-800'}`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Detailed Checklist */}
          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 bg-[#f0f2f5] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] rounded-3xl border-4 border-white flex items-center justify-center text-2xl font-black text-[#E31E24]">
                    SJ
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 font-outfit uppercase tracking-tight">Sarah Johnson</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Date:</span>
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] rounded-full">
                        <IconClock size={12} className="text-[#E31E24]" />
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">01 Jun 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="h-12 px-6 rounded-2xl bg-white shadow-[4px_4px_8px_#d1d9e6] text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-[#E31E24] hover:text-white transition-all flex gap-3">
                  View Full Dossier
                  <IconArrowRight size={16} />
                </Button>
              </div>

              <div className="bg-[#f0f2f5] shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] rounded-[3rem] border-4 border-white overflow-hidden">
                <div className="px-8 py-6 border-b-2 border-white bg-[#f0f2f5]/50 flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Process Checklist</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2 of 4 Completed</span>
                </div>
                <div className="divide-y-2 divide-white/50">
                  {onboardingQueue[0].tasks.map((task) => (
                    <div key={task.id} className="p-8 flex items-center justify-between hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] ${task.status === 'done' ? 'text-green-500 bg-green-50' : 'text-slate-400 bg-[#f0f2f5]'}`}>
                          {task.icon}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-tight">{task.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Required for Operational Readiness</p>
                        </div>
                      </div>
                      <button className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${task.status === 'done' ? 'bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] text-green-500' : 'bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] text-slate-300 hover:text-[#E31E24]'}`}>
                        {task.status === 'done' ? <IconCircleCheck size={24} /> : <IconCircleDashed size={24} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button className="h-14 px-10 rounded-[2rem] bg-[#E31E24] text-white font-black text-xs uppercase tracking-[0.2em] shadow-[8px_8px_20px_rgba(227,30,36,0.3)] hover:bg-[#C1181E] hover:translate-y-[-2px] transition-all flex gap-3">
                  Finalize Onboarding
                  <IconConfetti size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const IconShieldCheck = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default OnboardingManager;
