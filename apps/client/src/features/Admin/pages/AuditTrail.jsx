import React, { useState, useEffect } from 'react';
import { 
  IconShieldLock, 
  IconFilter, 
  IconSearch, 
  IconCalendar,
  IconArrowRight,
  IconClock,
  IconUserShield,
  IconBraces
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from '@/lib/apiClient';


const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('All');

  useEffect(() => {
    fetchLogs();
  }, [selectedModule]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // For presentation purposes, we load premium dummy data
      setTimeout(() => {
        const dummyData = [
          { id: 101, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), action: 'UPDATE', module: 'Payroll', entity_id: 'Approved Salary Q3 2026', profiles: { full_name: 'Adi Anto' } },
          { id: 102, created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), action: 'DELETE', module: 'Employees', entity_id: 'User ID: 8942 (Budi Santoso)', profiles: { full_name: 'Admin HR' } },
          { id: 103, created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), action: 'CREATE', module: 'Assets', entity_id: 'MacBook Pro M3 Max (Asset #401)', profiles: { full_name: 'IT Support' } },
          { id: 104, created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(), action: 'UPDATE', module: 'System', entity_id: 'Changed Global SMTP Settings', profiles: { full_name: 'System Admin' } },
          { id: 105, created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(), action: 'CREATE', module: 'Performance', entity_id: 'KPI Template Q4 Engineering', profiles: { full_name: 'Adi Anto' } },
          { id: 106, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), action: 'UPDATE', module: 'Employees', entity_id: 'Promoted Rina to Sr. Manager', profiles: { full_name: 'Adi Anto' } },
        ];
        
        let logData = dummyData;
        if (selectedModule !== 'All') {
          logData = logData.filter(log => log.module === selectedModule);
        }
        setLogs(logData);
        setLoading(false);
      }, 600); // Simulate network latency
      
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'CREATE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'UPDATE': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'DELETE': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc] custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase flex items-center gap-3">
              <IconShieldLock size={32} className="text-[#E31E24]" />
              System <span className="text-[#E31E24]">Audit Trail</span>
            </h2>
            <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-[0.3em] opacity-70">Security & Accountability Ledger</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={fetchLogs}
              className="h-10 px-6 rounded-lg bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex gap-2 items-center shadow-sm"
            >
              <IconClock size={16} />
              Refresh Logs
            </Button>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="flex gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
          {['All', 'Employees', 'Assets', 'Payroll', 'Performance', 'System'].map(mod => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${selectedModule === mod 
                  ? 'bg-[#E31E24] text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* Logs Table */}
        <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operator</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Action</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Module</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center opacity-40">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Syncing Ledger...</p>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-700">{new Date(log.created_at).toLocaleTimeString()}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(log.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[#E31E24]">
                          <IconUserShield size={16} />
                        </div>
                        <span className="text-[10px] font-black text-slate-700 uppercase">{log.profiles?.full_name || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.module}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-500 max-w-[200px] truncate">{log.entity_id}</span>
                        <button className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#E31E24] transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                          <IconBraces size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center opacity-30">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Security Events Recorded</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

export default AuditTrail;
