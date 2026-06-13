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
import * as XLSX from 'xlsx';
import { IconDownload } from "@tabler/icons-react";


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
      
      let query = supabase
        .from('audit_logs')
        .select(`
          id,
          created_at,
          action,
          table_name,
          record_id,
          user_id
        `)
        .order('created_at', { ascending: false });
        
      if (selectedModule !== 'All') {
        query = query.eq('table_name', selectedModule.toLowerCase());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const mappedLogs = data.map(log => ({
        id: log.id,
        created_at: log.created_at,
        action: log.action,
        module: log.table_name,
        entity_id: log.record_id,
        profiles: { full_name: log.user_id ? `User: ${log.user_id.substring(0,8)}` : 'System' }
      }));
      
      setLogs(mappedLogs);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (logs.length === 0) return;
    
    try {
      // Record the download action into audit_logs
      await supabase.from('audit_logs').insert([{
        table_name: 'system_export',
        record_id: `Audit_Logs_${new Date().toISOString().split('T')[0]}.xlsx`,
        action: 'DOWNLOAD',
        old_data: null,
        new_data: { format: 'Excel', total_records: logs.length },
        user_id: null // Can be populated if frontend has the user's UUID
      }]);
    } catch (err) {
      console.error("Gagal mencatat log download:", err);
    }

    const exportData = logs.map(log => ({
      'Timestamp': new Date(log.created_at).toLocaleString(),
      'Operator': log.profiles?.full_name || 'System',
      'Action': log.action,
      'Module': log.module,
      'Entity ID': log.entity_id
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AuditLogs");
    XLSX.writeFile(workbook, `Audit_Logs_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    // Refresh logs to show the newly added download action
    fetchLogs();
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'CREATE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'UPDATE': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'DELETE': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'DOWNLOAD': return 'bg-blue-50 text-blue-600 border-blue-100';
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
              onClick={exportToExcel}
              className="h-10 px-6 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all flex gap-2 items-center shadow-sm"
            >
              <IconDownload size={16} />
              Export Excel
            </Button>
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
          {['All', 'shifts', 'national_holidays', 'employees'].map(mod => (
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
