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
import { supabase } from '@/lib/supabaseClient';


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
      let query = supabase.from('audit_logs').select('*, profiles(full_name)').order('created_at', { ascending: false });
      
      if (selectedModule !== 'All') {
        query = query.eq('module', selectedModule);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
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
    <div className="flex-1 overflow-y-auto p-8 bg-[#f0f2f5] custom-scrollbar animate-fade-in">
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
              className="h-12 px-6 rounded-2xl bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] border-white border-2 text-slate-600 font-black text-xs uppercase tracking-widest hover:shadow-none transition-all flex gap-3 items-center"
            >
              <IconClock size={16} />
              Refresh Logs
            </Button>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="flex gap-4 p-4 rounded-[2rem] bg-white/40 border border-white/50 shadow-sm overflow-x-auto no-scrollbar">
          {['All', 'Employees', 'Assets', 'Payroll', 'Performance', 'Documents'].map(mod => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${selectedModule === mod 
                  ? 'bg-[#E31E24] text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]' 
                  : 'text-slate-400 hover:text-slate-600'}`}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* Logs Table */}
        <Card className="border-white border-[3px] shadow-[12px_12px_24px_#d1d9e6,-12px_-10px_20px_#ffffff] bg-[#f0f2f5] rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operator</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Module</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Details</th>
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
                  <tr key={log.id} className="border-b border-white/30 hover:bg-white/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-700">{new Date(log.created_at).toLocaleTimeString()}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(log.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-[#E31E24]">
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
                        <button className="h-8 w-8 rounded-lg bg-[#f0f2f5] shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] flex items-center justify-center text-slate-400 hover:text-[#E31E24] transition-all opacity-0 group-hover:opacity-100">
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
