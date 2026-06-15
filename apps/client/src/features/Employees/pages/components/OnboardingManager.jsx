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
  IconConfetti
} from "@tabler/icons-react";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm  animate-in fade-in duration-200">
      <div 
        className="w-full max-w-6xl h-[85vh] bg-slate-50 shadow-sm rounded-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Mode Toggle */}
        <header className="h-20 bg-transparent border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              <button 
                onClick={() => setActiveMode('onboarding')}
                className={`px-5 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeMode === 'onboarding' 
                    ? 'bg-[#E31E24] text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <IconUserPlus size={14} />
                Onboarding
              </button>
              <button 
                onClick={() => setActiveMode('offboarding')}
                className={`px-5 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeMode === 'offboarding' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <IconUserMinus size={14} />
                Offboarding
              </button>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-850 font-outfit uppercase tracking-tight">Lifecycle Manager</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Alur Kerja Masuk & Keluar Karyawan</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center bg-transparent border border-slate-200 rounded-lg text-slate-450 hover:text-[#E31E24] hover:shadow-sm transition-all shadow-sm"
          >
            <IconX size={18} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Process Queue */}
          <div className="w-[360px] border-r border-slate-200 overflow-y-auto p-6 custom-scrollbar bg-slate-50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Proses Aktif ({currentQueue.length})</h3>
            <div className="space-y-3">
              {currentQueue.map((item) => (
                <div 
                  key={item.id} 
                  className="group bg-transparent border border-slate-200/80 hover:border-[#E31E24]/30 hover:shadow-sm transition-all p-4 rounded-xl cursor-pointer relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${activeMode === 'onboarding' ? 'bg-[#E31E24]' : 'bg-slate-800'}`}></div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight leading-tight">{item.name}</h4>
                      <p className="text-xs font-semibold text-slate-400 uppercase mt-0.5">{item.dept}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded">{item.id}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold uppercase">
                      <span className="text-slate-400">Progress</span>
                      <span className={activeMode === 'onboarding' ? 'text-[#E31E24]' : 'text-slate-800'}>{item.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${activeMode === 'onboarding' ? 'bg-[#E31E24]' : 'bg-slate-800'}`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Detailed Checklist */}
          <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar bg-transparent">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-white shadow-sm border-none rounded-xl flex items-center justify-center text-lg font-bold text-slate-700 uppercase tracking-tight">
                    SJ
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 font-outfit uppercase tracking-tight">Sarah Johnson</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal Target:</span>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-white shadow-sm border-none rounded-full">
                        <IconClock size={11} className="text-[#E31E24]" />
                        <span className="text-xs font-bold text-slate-650 uppercase tracking-wider">01 Jun 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="h-9 px-4 rounded-lg bg-transparent border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:text-[#E31E24] hover:shadow-sm transition-all flex items-center gap-1.5 shadow-sm">
                  Lihat Berkas Lengkap
                  <IconArrowRight size={12} />
                </button>
              </div>

              <div className="bg-transparent border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Daftar Tugas Alur Kerja</h3>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">2 dari 4 Selesai</span>
                </div>
                <div className="divide-y divide-white/50">
                  {onboardingQueue[0].tasks.map((task) => (
                    <div key={task.id} className="px-6 py-5 flex items-center justify-between hover:shadow-sm/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${
                          task.status === 'done' 
                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                            : 'text-slate-400 bg-slate-50 border-slate-200'
                        }`}>
                          {task.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-850 leading-tight uppercase tracking-tight">{task.title}</p>
                          <p className="text-xs font-semibold text-slate-400 uppercase mt-0.5">Dibutuhkan untuk kesiapan operasional</p>
                        </div>
                      </div>
                      <button className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                        task.status === 'done' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-transparent border border-slate-200 text-slate-300 hover:text-[#E31E24] hover:shadow-sm hover:border-[#E31E24]/30 shadow-sm'
                      }`}>
                        {task.status === 'done' ? <IconCircleCheck size={18} /> : <IconCircleDashed size={18} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="h-11 px-8 rounded-lg bg-[#E31E24] text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-[#C1181E] transition-all flex items-center gap-2">
                  Selesaikan Onboarding
                  <IconConfetti size={16} />
                </button>
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
