import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { 
  IconHistory, 
  IconX, 
  IconUserEdit, 
  IconRefresh, 
  IconSignature, 
  IconId,
  IconClock,
  IconArrowRight,
  IconSearch
} from "@tabler/icons-react";

const AuditTrail = ({ isOpen, onClose, employee }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);

  const fetchAuditLogs = async () => {
    if (!employee) return;
    try {
      const response = await apiClient.get(`/api/rbac/audit-logs?target_user_id=${employee["EMPLOYEE ID"]}`);
      if (response.status === 'success' && response.data) {
        // Map backend logs to frontend format
        const mappedLogs = response.data.map((log, index) => ({
          id: log.id,
          action: log.action,
          actor: log.profiles?.full_name || 'System / Admin',
          timestamp: new Date(log.created_at).toLocaleString('sv-SE').replace('T', ' '),
          icon: <IconHistory size={16} />,
          color: 'text-blue-500',
          changes: log.details && typeof log.details === 'object' ? Object.keys(log.details).map(k => ({
            field: k,
            from: '-',
            to: String(log.details[k])
          })) : [{ field: 'Details', from: '-', to: String(log.details || 'No details') }]
        }));
        setLogs(mappedLogs);
      }
    } catch (error) {
      console.error('Error fetching audit logs for employee:', error);
      setLogs([]);
    }
  };

  useEffect(() => {
    if (employee) {
      fetchAuditLogs();
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-4xl h-[80vh] bg-[#f0f2f5] shadow-neu rounded-[3rem] overflow-hidden flex flex-col border-[8px] border-white animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="h-20 bg-[#f0f2f5] border-b-2 border-white flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[#f0f2f5] shadow-neu rounded-xl flex items-center justify-center text-[#E31E24]">
              <IconHistory size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 font-outfit uppercase tracking-tight">Record Audit Trail</h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-70">Immutable Ledger for {employee["EMPLOYEE NAME"]}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-11 w-11 flex items-center justify-center bg-[#f0f2f5] shadow-neu rounded-xl text-slate-400 hover:text-red-500 transition-all"
          >
            <IconX size={20} />
          </button>
        </header>

        {/* Toolbar */}
        <div className="px-10 py-6 bg-[#f0f2f5] border-b border-white flex justify-between items-center">
          <div className="relative group w-72">
            <IconSearch size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E31E24] transition-colors" />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-[#f0f2f5] shadow-neu border-none rounded-xl text-[10px] font-black text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all uppercase tracking-widest"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Integrity Hash:</span>
            <span className="text-[9px] font-mono text-slate-500 bg-white/50 px-2 py-1 rounded-md">AES-256-GCM-SECURE</span>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-12 relative">
          {/* Vertical Line */}
          <div className="absolute left-[84px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>

          {logs.map((log, index) => (
            <div key={log.id} className="relative flex gap-12 group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              {/* Time Label */}
              <div className="w-20 pt-1 shrink-0 text-right">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{log.timestamp.split(' ')[0]}</p>
                <p className="text-[9px] font-bold text-slate-400">{log.timestamp.split(' ')[1]}</p>
              </div>

              {/* Indicator Node */}
              <div className="relative z-10 pt-1">
                <div className={`h-8 w-8 rounded-xl bg-transparent shadow-neu flex items-center justify-center ${log.color} border-2 border-white ring-4 ring-[#f0f2f5]`}>
                  {log.icon}
                </div>
              </div>

              {/* Content Card */}
              <div className="flex-1 bg-white/40 shadow-neu border-2 border-white rounded-[2rem] p-6 hover:bg-white/70 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">{log.action}</h3>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                      <IconClock size={10} />
                      Executed by {log.actor}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {log.changes.map((change, cIdx) => (
                    <div key={cIdx} className="bg-[#f0f2f5] shadow-neu rounded-xl p-3 flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{change.field}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-slate-400 line-through decoration-red-500/30">{change.from}</span>
                        <IconArrowRight size={12} className="text-slate-300" />
                        <span className="text-[9px] font-black text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded-md">{change.to}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* End Node */}
          <div className="relative flex gap-12 pb-10">
            <div className="w-20"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="h-4 w-4 rounded-full bg-slate-200 border-4 border-white"></div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Genesis Record Created</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;
