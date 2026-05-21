import React, { useState, useEffect } from 'react';
import { 
  IconClipboardList, 
  IconUsers, 
  IconCalendar, 
  IconArrowLeft,
  IconDownload,
  IconSearch,
  IconChartBar,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconSettings,
  IconCalendarStats,
  IconBriefcase
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AttendanceRecap = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [recapData, setRecapData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Default to 21st of last month to 20th of current month (typical salary period)
  const getDefaultDates = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const start = new Date(currentYear, currentMonth - 1, 26);
    const end = new Date(currentYear, currentMonth, 25);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      start: formatDate(start),
      end: formatDate(end)
    };
  };

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [dateRange, setDateRange] = useState(getDefaultDates());
  const [manualHolidays, setManualHolidays] = useState(0);

  const handleMonthChange = (monthStr) => {
    setSelectedMonth(monthStr);
    const [year, month] = monthStr.split('-').map(Number);
    
    // Logic: 26th of PREVIOUS month to 25th of SELECTED month
    const start = new Date(year, month - 2, 26);
    const end = new Date(year, month - 1, 25);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setDateRange({
      start: formatDate(start),
      end: formatDate(end)
    });
  };

  // Helper to calculate weekdays in a custom range
  const calculateWorkingDays = (start, end, holidaysCount) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let count = 0;
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
    }
    return Math.max(0, count - Number(holidaysCount));
  };

  const workingDaysTarget = calculateWorkingDays(dateRange.start, dateRange.end, manualHolidays);

  const fetchRecap = async () => {
    try {
      setLoading(true);
      
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, name, organization_name, job_position')
        .eq('is_resigned', false);

      if (empError) throw empError;

      const { data: attendance, error: attError } = await supabase
        .from('attendance')
        .select('*')
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);

      if (attError) throw attError;

      const processed = employees.map(emp => {
        const logs = attendance.filter(a => a.employee_id === emp.id);
        return {
          id: emp.id,
          name: emp.name,
          organization: emp.organization_name,
          position: emp.job_position,
          present: logs.filter(l => l.status === 'Present').length,
          late: logs.filter(l => l.status === 'Late').length,
          sick: logs.filter(l => l.status === 'Sick').length,
          leave: logs.filter(l => l.status === 'Leave').length,
          absent: logs.filter(l => l.status === 'Absent').length,
          total_days: logs.length
        };
      });

      setRecapData(processed);
    } catch (err) {
      console.error("Error generating recap:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecap();

    // ⚡ AUTO SYNC: Realtime Subscription
    const channel = supabase
      .channel('attendance_recap_sync')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'attendance' 
      }, () => {
        console.log("⚡ Auto Sync: Data changed, recalculating performance recap...");
        fetchRecap();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateRange]);

  const filteredData = recapData.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ["Employee ID", "Name", "Department", "Target Days", "Present", "Late", "Sick", "Leave", "Absent", "Achievement %"];
    const rows = filteredData.map(d => {
        const achievement = workingDaysTarget > 0 ? Math.round((d.present / workingDaysTarget) * 100) : 0;
        return [
            d.id, d.name, d.organization, workingDaysTarget, d.present, d.late, d.sick, d.leave, d.absent, `${achievement}%`
        ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Recap_${dateRange.start}_to_${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc] custom-scrollbar animate-fade-in">
      <div className="max-w-[1400px] mx-auto space-y-4">
        
        {/* 🚀 ULTRA-COMPACT HEADER */}
        <div className="flex items-center justify-between bg-white p-3 px-5 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/attendance')}
              className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-[#E31E24] hover:border-[#E31E24]/20 hover:bg-white transition-all active:scale-95 shrink-0"
            >
              <IconArrowLeft size={16} />
            </button>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 leading-none">
              <IconClipboardList size={18} className="text-[#E31E24]" />
              Attendance <span className="text-[#E31E24]">Performance Index</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
               <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Cycle:</span>
               <input 
                  type="month" 
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="bg-transparent border-none text-slate-800 font-black text-[9px] uppercase focus:outline-none cursor-pointer"
               />
             </div>
             <div className="h-6 w-[1px] bg-slate-200"></div>
             <div className="flex items-center gap-2">
                <span className="text-[8px] font-black text-slate-400 uppercase">{dateRange.start}</span>
                <span className="text-slate-300">-</span>
                <span className="text-[8px] font-black text-slate-400 uppercase">{dateRange.end}</span>
             </div>
             <Button 
                onClick={handleExportCSV}
                className="h-8 px-4 rounded-lg bg-slate-800 text-white font-black text-[8px] uppercase tracking-widest hover:bg-slate-900 shadow-md flex gap-2 items-center"
              >
                <IconDownload size={12} />
                Export
              </Button>
          </div>
        </div>
        {/* 📊 COMPACT STATS BAR */}
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-white p-2 px-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="h-8 w-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-[#E31E24] shadow-sm">
                    <IconCalendarStats size={16} />
                </div>
                <div>
                    <h4 className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Base Target</h4>
                    <p className="text-xs font-black text-slate-800 leading-none">{calculateWorkingDays(dateRange.start, dateRange.end, 0)} <span className="text-[8px] text-slate-400">Days</span></p>
                </div>
            </div>

            <div className="flex-1 flex items-center gap-3 bg-white p-2 px-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="h-8 w-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-amber-500 shadow-sm">
                    <IconSettings size={16} />
                </div>
                <div>
                    <h4 className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Holidays</h4>
                    <input 
                        type="number" 
                        value={manualHolidays}
                        onChange={(e) => setManualHolidays(e.target.value)}
                        className="w-10 bg-transparent border-b border-amber-200 text-xs font-black text-slate-800 focus:outline-none leading-none"
                    />
                </div>
            </div>

            <div className="flex-1 flex items-center gap-3 bg-white p-2 px-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="h-8 w-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-emerald-500 shadow-sm">
                    <IconBriefcase size={16} />
                </div>
                <div>
                    <h4 className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Net Target</h4>
                    <p className="text-xs font-black text-slate-800 leading-none">{workingDaysTarget} <span className="text-[8px] text-slate-400">Days</span></p>
                </div>
            </div>

            <div className="flex-[2] flex items-center gap-3 bg-white p-2 px-4 rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:border-[#E31E24]/30 focus-within:shadow-md group">
                <IconSearch size={14} className="text-slate-300 group-focus-within:text-[#E31E24] transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search Personnel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none w-full text-[9px] font-black text-slate-700 placeholder:text-slate-300 focus:outline-none uppercase tracking-widest"
                />
            </div>
        </div>

        {/* 📜 HIGH DENSITY TABLE */}
        <div className="bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] rounded-3xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-md">
                  <th className="px-6 py-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                  <th className="px-6 py-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</th>
                  <th className="px-6 py-3 text-center text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Target</th>
                  <th className="px-6 py-3 text-center text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Present</th>
                  <th className="px-6 py-3 text-center text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Late</th>
                  <th className="px-6 py-3 text-center text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Sick/Leave</th>
                  <th className="px-6 py-3 text-center text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Absent</th>
                  <th className="px-6 py-3 text-right text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Achievement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Syncing Metrics...</td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">No matching records found</td>
                  </tr>
                ) : (
                  filteredData.map((emp) => {
                    const workingDaysTarget = calculateWorkingDays(dateRange.start, dateRange.end, manualHolidays);
                    const achievement = workingDaysTarget > 0 ? Math.round((emp.present / workingDaysTarget) * 100) : 0;
                    
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-all group border-b border-transparent hover:border-slate-100">
                        <td className="px-6 py-2">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-[#E31E24]/10 border border-[#E31E24]/5 flex items-center justify-center text-[10px] font-black text-[#E31E24]">
                              {emp.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight leading-none">{emp.name}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{emp.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{emp.organization}</span>
                        </td>
                        <td className="px-6 py-2 text-center text-[10px] font-black text-slate-400">{workingDaysTarget}</td>
                        <td className="px-6 py-2 text-center text-[10px] font-black text-emerald-600">{emp.present}</td>
                        <td className="px-6 py-2 text-center text-[10px] font-black text-amber-500">{emp.late}</td>
                        <td className="px-6 py-2 text-center text-[10px] font-black text-indigo-500">{emp.sick + emp.leave}</td>
                        <td className="px-6 py-2 text-center text-[10px] font-black text-rose-500">{emp.absent}</td>
                        <td className="px-6 py-2 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[10px] font-black ${achievement >= 95 ? 'text-emerald-600' : achievement >= 80 ? 'text-amber-500' : 'text-rose-500'}`}>
                              {achievement}%
                            </span>
                            <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${achievement >= 95 ? 'bg-emerald-500' : achievement >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(100, achievement)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRecap;
