import React, { useState, useMemo } from 'react';
import { 
  IconSchool, 
  IconX, 
  IconCertificate, 
  IconCalendarEvent, 
  IconAlertTriangle,
  IconCheck,
  IconPlus,
  IconFileCertificate,
  IconTrophy
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const TrainingTracker = ({ isOpen, onClose, employee }) => {
  const [activeView, setActiveView] = useState('active'); // 'active' or 'history'

  // Mock data for certifications
  const certifications = useMemo(() => [
    {
      id: 1,
      title: "Health & Safety Executive (HSE) Level 3",
      provider: "IOSH International",
      issueDate: "2023-01-15",
      expiryDate: "2026-01-15",
      status: "Valid",
      type: "Mandatory"
    },
    {
      id: 2,
      title: "Project Management Professional (PMP)",
      provider: "PMI Global",
      issueDate: "2021-06-10",
      expiryDate: "2024-06-10",
      status: "Expiring Soon",
      type: "Professional"
    },
    {
      id: 3,
      title: "ISO 9001:2015 Lead Auditor",
      provider: "SGS Academy",
      issueDate: "2020-03-20",
      expiryDate: "2023-03-20",
      status: "Expired",
      type: "Internal Audit"
    }
  ], []);

  if (!isOpen || !employee) return null;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Valid': return 'bg-green-500 text-white shadow-green-200';
      case 'Expiring Soon': return 'bg-orange-500 text-white shadow-orange-200';
      case 'Expired': return 'bg-red-500 text-white shadow-red-200';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-4xl h-[80vh] bg-[#f0f2f5] shadow-[20px_20px_60px_#1e293b,-20px_-20px_60px_#ffffff] rounded-[3rem] overflow-hidden flex flex-col border-[8px] border-white animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="h-20 bg-[#f0f2f5] border-b-2 border-white flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] rounded-xl flex items-center justify-center text-[#E31E24]">
              <IconSchool size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 font-outfit uppercase tracking-tight">Professional Academy</h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-70">Training & Certification Tracker for {employee["EMPLOYEE NAME"]}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-11 w-11 flex items-center justify-center bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] rounded-xl text-slate-400 hover:text-red-500 transition-all"
          >
            <IconX size={20} />
          </button>
        </header>

        {/* View Switcher */}
        <div className="px-10 py-6 bg-[#f0f2f5] border-b border-white flex justify-between items-center">
          <div className="flex bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] p-1 rounded-xl">
            <button 
              onClick={() => setActiveView('active')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'active' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Current Credentials
            </button>
            <button 
              onClick={() => setActiveView('history')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Training History
            </button>
          </div>
          <Button className="h-10 px-5 rounded-xl bg-[#E31E24] text-white font-black text-[9px] uppercase tracking-widest shadow-[4px_4px_10px_rgba(227,30,36,0.2)] hover:bg-[#C1181E] transition-all flex gap-2">
            <IconPlus size={14} />
            Add Record
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications.map(cert => (
              <div key={cert.id} className="bg-white/40 border-2 border-white rounded-[2.5rem] p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.02)] group hover:bg-white/60 transition-all duration-300 relative overflow-hidden">
                {/* Status Badge */}
                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg ${getStatusStyle(cert.status)}`}>
                  {cert.status}
                </div>

                <div className="flex items-start gap-6">
                  <div className="h-16 w-16 bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-[#E31E24] transition-colors shrink-0">
                    <IconFileCertificate size={32} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-[#E31E24] uppercase tracking-widest mb-1">{cert.type}</p>
                    <h3 className="text-sm font-black text-slate-800 leading-snug mb-2 pr-20">{cert.title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{cert.provider}</p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] rounded-2xl p-4">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <IconCalendarEvent size={10} />
                      Issued Date
                    </p>
                    <p className="text-[10px] font-black text-slate-700">{cert.issueDate}</p>
                  </div>
                  <div className="bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] rounded-2xl p-4">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <IconAlertTriangle size={10} />
                      Expiry Date
                    </p>
                    <p className={`text-[10px] font-black ${cert.status === 'Expired' ? 'text-red-500' : 'text-slate-700'}`}>{cert.expiryDate}</p>
                  </div>
                </div>

                {/* Progress Bar for Expiry */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Validity Progress</span>
                    <span className="text-[8px] font-black text-slate-600 uppercase">80% Remaining</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full w-[80%]"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Summary Section */}
          <div className="bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] rounded-[3rem] p-10 border-2 border-white flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 bg-white shadow-lg rounded-2xl flex items-center justify-center text-[#E31E24]">
                <IconTrophy size={28} />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-800 font-outfit uppercase tracking-tight">Competency Score</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Top 15% in Department Cluster</p>
              </div>
            </div>
            <div className="flex gap-10">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-800">12</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Courses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-green-500">5</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Certs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-orange-500">1</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Renewal Required</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingTracker;
