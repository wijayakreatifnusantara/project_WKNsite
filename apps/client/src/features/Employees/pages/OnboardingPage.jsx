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
  IconConfetti,
  IconCheck
} from "@tabler/icons-react";
import { toast } from 'sonner';

const IconShieldCheck = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const renderTaskIcon = (iconName) => {
  switch (iconName) {
    case 'laptop': return <IconDeviceLaptop size={16} />;
    case 'mail': return <IconMail size={16} />;
    case 'id': return <IconId size={16} />;
    case 'file': return <IconFileText size={16} />;
    case 'shield': return <IconShieldCheck size={16} />;
    case 'check': return <IconCircleCheck size={16} />;
    default: return <IconCircleDashed size={16} />;
  }
};

const OnboardingPage = () => {
  const [activeMode, setActiveMode] = useState('onboarding'); // 'onboarding' or 'offboarding'
  
  const [onboardingQueue, setOnboardingQueue] = useState([
    { id: 'WKN-001', name: 'Sarah Johnson', dept: 'Engineering', date: '2024-06-01', isCompleted: false, tasks: [
      { id: 1, title: 'Hardware Provisioning', status: 'done', icon: 'laptop' },
      { id: 2, title: 'Corporate Email Setup', status: 'done', icon: 'mail' },
      { id: 3, title: 'Identity Badge Print', status: 'pending', icon: 'id' },
      { id: 4, title: 'Compliance Documents', status: 'pending', icon: 'file' }
    ]},
    { id: 'WKN-002', name: 'Michael Chen', dept: 'Design', date: '2024-06-15', isCompleted: false, tasks: [
      { id: 1, title: 'Hardware Provisioning', status: 'done', icon: 'laptop' },
      { id: 2, title: 'Corporate Email Setup', status: 'pending', icon: 'mail' },
      { id: 3, title: 'Identity Badge Print', status: 'pending', icon: 'id' },
      { id: 4, title: 'Compliance Documents', status: 'pending', icon: 'file' }
    ]}
  ]);

  const [offboardingQueue, setOffboardingQueue] = useState([
    { id: 'WKN-098', name: 'James Wilson', dept: 'Sales', date: '2024-05-20', isCompleted: false, tasks: [
      { id: 1, title: 'Asset Recovery', status: 'done', icon: 'laptop' },
      { id: 2, title: 'Access Revocation', status: 'done', icon: 'shield' },
      { id: 3, title: 'Exit Interview', status: 'pending', icon: 'file' },
      { id: 4, title: 'Final Clearance', status: 'done', icon: 'check' }
    ]}
  ]);

  // Selected ID inside current active queue
  const [selectedOnboardingId, setSelectedOnboardingId] = useState('WKN-001');
  const [selectedOffboardingId, setSelectedOffboardingId] = useState('WKN-098');

  const selectedId = activeMode === 'onboarding' ? selectedOnboardingId : selectedOffboardingId;
  const setSelectedId = activeMode === 'onboarding' ? setSelectedOnboardingId : setSelectedOffboardingId;

  const currentQueue = activeMode === 'onboarding' ? onboardingQueue : offboardingQueue;
  const setCurrentQueue = activeMode === 'onboarding' ? setOnboardingQueue : setOffboardingQueue;

  const selectedEmployee = currentQueue.find(emp => emp.id === selectedId) || currentQueue[0];

  const handleToggleTask = (empId, taskId) => {
    setCurrentQueue(prevQueue => {
      return prevQueue.map(emp => {
        if (emp.id === empId) {
          const updatedTasks = emp.tasks.map(t => {
            if (t.id === taskId) {
              return { ...t, status: t.status === 'done' ? 'pending' : 'done' };
            }
            return t;
          });
          return { ...emp, tasks: updatedTasks };
        }
        return emp;
      });
    });
  };

  const handleCompleteLifecycle = (empId) => {
    setCurrentQueue(prevQueue => {
      return prevQueue.map(emp => {
        if (emp.id === empId) {
          return { ...emp, isCompleted: true };
        }
        return emp;
      });
    });
    toast.success(`${selectedEmployee.name}'s ${activeMode} process has been completed successfully!`);
  };

  const calculateProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'done').length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0 overflow-hidden animate-fade-in">
      
      {/* 🚀 FIXED PREMIUM COMMAND CENTER */}
      <div className="bg-transparent border-b border-white/50 z-10 shadow-neu shrink-0">
        <div className="max-w-[1400px] mx-auto p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* HEADER ROW */}
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white ${activeMode === 'onboarding' ? 'bg-[#E31E24]' : 'bg-slate-800'}`}>
              {activeMode === 'onboarding' ? <IconUserPlus size={22} stroke={2} /> : <IconUserMinus size={22} stroke={2} />}
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 tracking-tight leading-none">
                {activeMode === 'onboarding' ? 'Onboarding Karyawan' : 'Offboarding Karyawan'}
              </h1>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-1.5">
                {activeMode === 'onboarding' ? 'Alur Kerja Kesiapan & Masuk Karyawan Baru' : 'Alur Kerja Pemutusan & Keluar Karyawan'}
              </p>
            </div>
          </div>

          {/* TOGGLE BUTTONS */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-white/50/50 self-start sm:self-center">
            <button 
              onClick={() => setActiveMode('onboarding')}
              className={`px-5 py-2 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeMode === 'onboarding' 
                  ? 'bg-[#E31E24] text-white shadow-neu' 
                  : 'text-slate-500 hover:text-slate-850'
              }`}
            >
              <IconUserPlus size={14} />
              Onboarding
            </button>
            <button 
              onClick={() => setActiveMode('offboarding')}
              className={`px-5 py-2 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeMode === 'offboarding' 
                  ? 'bg-slate-800 text-white shadow-neu' 
                  : 'text-slate-500 hover:text-slate-850'
              }`}
            >
              <IconUserMinus size={14} />
              Offboarding
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row max-w-[1400px] w-full mx-auto">
        
        {/* Left: Process Queue List */}
        <div className="w-full md:w-[380px] border-r border-white/50 bg-transparent flex flex-col shrink-0">
          <div className="p-4 border-b border-white/50 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Proses Aktif ({currentQueue.filter(e => !e.isCompleted).length})
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {currentQueue.map((item) => {
              const progress = calculateProgress(item.tasks);
              const isSelected = selectedId === item.id;
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedId(item.id)}
                  className={`group bg-transparent border rounded-xl cursor-pointer relative overflow-hidden transition-all p-4 ${
                    isSelected 
                      ? 'border-white/20 shadow-neu ring-1 ring-slate-200' 
                      : 'border-white/50/80 hover:border-white/20 hover:shadow-xs'
                  }`}
                >
                  {/* Active Indicator Line */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    item.isCompleted 
                      ? 'bg-emerald-500' 
                      : activeMode === 'onboarding' 
                        ? 'bg-[#E31E24]' 
                        : 'bg-slate-850'
                  }`}></div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-850 uppercase tracking-tight leading-tight">
                          {item.name}
                        </h4>
                        {item.isCompleted && (
                          <span className="h-4 w-4 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                            <IconCheck size={10} stroke={3} />
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">{item.dept}</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-[#f0f2f5] shadow-neu-inset border-none/60 px-1.5 py-0.5 rounded">
                      {item.id}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                      <span className="text-slate-400">Progress</span>
                      <span className={item.isCompleted ? 'text-emerald-600' : activeMode === 'onboarding' ? 'text-[#E31E24]' : 'text-slate-850'}>
                        {progress}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.isCompleted 
                            ? 'bg-emerald-500' 
                            : activeMode === 'onboarding' 
                              ? 'bg-[#E31E24]' 
                              : 'bg-slate-850'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Checklist */}
        <div className="flex-1 bg-transparent overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {selectedEmployee ? (
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Employee Detail Card */}
              <div className="bg-transparent border border-white/50 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-[#f0f2f5] shadow-neu-inset border-none rounded-xl flex items-center justify-center text-lg font-bold text-slate-700 uppercase tracking-tight">
                    {selectedEmployee.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-800 font-outfit uppercase tracking-tight">
                        {selectedEmployee.name}
                      </h2>
                      {selectedEmployee.isCompleted && (
                        <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md">
                          Selesai
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {activeMode === 'onboarding' ? 'Tanggal Mulai:' : 'Tanggal Efektif:'}
                      </span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#f0f2f5] shadow-neu-inset border-none rounded-md">
                        <IconClock size={11} className={activeMode === 'onboarding' ? 'text-[#E31E24]' : 'text-slate-600'} />
                        <span className="text-[9px] font-bold text-slate-650 uppercase tracking-wider font-mono">
                          {selectedEmployee.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!selectedEmployee.isCompleted && (
                  <button 
                    onClick={() => handleCompleteLifecycle(selectedEmployee.id)}
                    disabled={calculateProgress(selectedEmployee.tasks) < 100}
                    className={`h-9 px-4 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs ${
                      calculateProgress(selectedEmployee.tasks) === 100
                        ? activeMode === 'onboarding' 
                          ? 'bg-[#E31E24] text-white hover:bg-[#C1181E]' 
                          : 'bg-slate-850 text-white hover:bg-slate-900'
                        : 'bg-slate-100 border border-white/50 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{activeMode === 'onboarding' ? 'Selesaikan Onboarding' : 'Selesaikan Offboarding'}</span>
                    <IconConfetti size={14} />
                  </button>
                )}
              </div>

              {/* Checklist Card */}
              <div className="bg-transparent border border-white/50 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-6 py-4 border-b border-white/50 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Daftar Tugas Alur Kerja
                  </h3>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    {selectedEmployee.tasks.filter(t => t.status === 'done').length} dari {selectedEmployee.tasks.length} Selesai
                  </span>
                </div>
                
                <div className="divide-y divide-slate-150/70">
                  {selectedEmployee.tasks.map((task) => {
                    const isDone = task.status === 'done';
                    return (
                      <div 
                        key={task.id} 
                        className={`px-6 py-4 flex items-center justify-between transition-colors ${
                          selectedEmployee.isCompleted ? 'opacity-85' : 'hover:shadow-neu-inset/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                            isDone 
                              ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                              : 'text-slate-450 bg-slate-50 border-white/50'
                          }`}>
                            {renderTaskIcon(task.icon)}
                          </div>
                          <div>
                            <p className={`text-xs font-bold leading-tight uppercase tracking-tight ${
                              isDone ? 'text-slate-500 line-through' : 'text-slate-800'
                            }`}>
                              {task.title}
                            </p>
                            <p className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">
                              Dibutuhkan untuk kesiapan operasional
                            </p>
                          </div>
                        </div>

                        {!selectedEmployee.isCompleted && (
                          <button 
                            onClick={() => handleToggleTask(selectedEmployee.id, task.id)}
                            className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                              isDone 
                                ? 'bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-xs' 
                                : 'bg-transparent border border-white/50 text-slate-350 hover:text-slate-800 hover:shadow-neu-inset shadow-xs active:scale-95'
                            }`}
                          >
                            {isDone ? <IconCircleCheck size={18} /> : <IconCircleDashed size={18} />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              <div className="text-center">
                <IconUserPlus size={48} className="mx-auto text-slate-300 stroke-1 mb-2 animate-pulse" />
                <p className="text-xs uppercase font-bold tracking-wider">Silakan pilih karyawan di sebelah kiri</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default OnboardingPage;
