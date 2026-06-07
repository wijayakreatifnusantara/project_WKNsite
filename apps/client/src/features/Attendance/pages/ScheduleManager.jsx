import React, { useState, useEffect } from 'react';
import { 
  IconCalendarTime, 
  IconArrowLeft,
  IconDownload,
  IconSearch,
  IconFilter,
  IconClock,
  IconCalendarStats,
  IconChevronDown,
  IconEdit,
  IconWand
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { apiClient } from '@/lib/apiClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ScheduleManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDefaultDates = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 1, 0);
    return {
      start: formatDate(start),
      end: formatDate(end)
    };
  };

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [startDate, setStartDate] = useState(getDefaultDates().start);
  const [endDate, setEndDate] = useState(getDefaultDates().end);

  const handleMonthChange = (monthStr) => {
    setSelectedMonth(monthStr);
    const [year, month] = monthStr.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  };

  // Generate array of dates for the grid
  const getDatesInRange = (start, end) => {
    const dates = [];
    let currDate = new Date(start);
    const lastDate = new Date(end);
    while (currDate <= lastDate) {
      dates.push(new Date(currDate));
      currDate.setDate(currDate.getDate() + 1);
    }
    return dates;
  };

  const dateList = getDatesInRange(startDate, endDate);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch employees
      const empRes = await apiClient.get('/api/employees?size=500');
      const empData = empRes.data?.data || (Array.isArray(empRes.data) ? empRes.data : []);
      setEmployees(empData.filter(e => !e.is_resigned));

      // Fetch active shifts
      const shiftRes = await apiClient.get('/api/master/shifts?active_only=true');
      setShifts(shiftRes.data?.data || []);

      // Fetch schedules
      const schedRes = await apiClient.get(`/api/master/schedules?start_date=${startDate}&end_date=${endDate}`);
      setSchedules(schedRes.data?.data || []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error("Gagal memuat data jadwal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const filteredEmployees = employees.filter(emp => 
    emp['EMPLOYEE NAME']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp['EMPLOYEE ID']?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Map schedules for quick lookup: scheduleMap[employee_id][date_string] = schedule_object
  const scheduleMap = {};
  schedules.forEach(s => {
    if (!scheduleMap[s.employee_id]) scheduleMap[s.employee_id] = {};
    scheduleMap[s.employee_id][s.date] = s;
  });

  const getShiftColor = (shiftCode) => {
    // Generate a consistent soft color based on shift code string
    let hash = 0;
    for (let i = 0; i < shiftCode.length; i++) {
      hash = shiftCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 90%)`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc] custom-scrollbar animate-fade-in">
      <div className="w-full mx-auto space-y-4">
        
        {/* HEADER */}
        <div className="flex items-center justify-between bg-white p-3 px-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] backdrop-blur-md">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate('/attendance')}
              className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-[#E31E24] hover:border-[#E31E24]/20 hover:bg-white transition-all active:scale-95 shrink-0"
            >
              <IconArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-3 leading-none">
                <div className="h-8 w-8 rounded-lg bg-[#E31E24]/10 flex items-center justify-center">
                  <IconCalendarTime size={20} className="text-[#E31E24]" />
                </div>
                JADWAL & <span className="text-[#E31E24] font-black opacity-90">SHIFT KERJA</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button 
                onClick={() => toast.info("Fitur Bulk Assign akan segera hadir!")}
                className="h-10 px-6 rounded-xl bg-[#E31E24] text-white font-bold text-[10px] uppercase tracking-widest hover:bg-[#C1181E] shadow-lg shadow-[#E31E24]/20 flex gap-3 items-center transition-all hover:translate-y-[-1px]"
              >
                <IconWand size={14} />
                BULK ASSIGN
              </Button>
          </div>
        </div>

        {/* CONTROL CENTER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white/60 p-2.5 rounded-2xl border border-white shadow-sm backdrop-blur-sm">
            {/* Month Selector */}
            <div className="md:col-span-3 flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm transition-all focus-within:border-[#E31E24]/30 relative group">
               <IconCalendarStats size={14} className="text-[#E31E24]" />
               <div className="flex flex-col flex-1">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Pilih Bulan</span>
                  <div className="relative flex items-center">
                    <input 
                      type="month" 
                      value={selectedMonth}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      className="bg-transparent border-none text-slate-800 font-black text-[10px] uppercase focus:outline-none cursor-pointer p-0 w-full appearance-none pr-6 z-10"
                    />
                    <IconChevronDown size={12} className="absolute right-0 text-slate-300 pointer-events-none group-focus-within:text-[#E31E24] transition-all" />
                  </div>
               </div>
            </div>

            {/* Search Input */}
            <div className="md:col-span-5 flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm transition-all focus-within:border-[#E31E24]/30 focus-within:shadow-md group">
                <IconSearch size={14} className="text-slate-300 group-focus-within:text-[#E31E24] transition-colors" />
                <div className="flex flex-col flex-1">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Cari Karyawan</span>
                  <input 
                      type="text" 
                      placeholder="NAMA, ID KARYAWAN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-none w-full text-[10px] font-black text-slate-700 placeholder:text-slate-200 focus:outline-none uppercase tracking-widest p-0"
                  />
                </div>
            </div>

            {/* Legend / Information */}
            <div className="md:col-span-4 flex items-center justify-between px-5 py-2 rounded-xl bg-slate-50 border border-slate-100 shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Informasi Total</span>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                    {filteredEmployees.length} Karyawan Aktif
                  </p>
                </div>
                <IconFilter size={16} className="text-slate-200" />
            </div>
        </div>

        {/* SCHEDULE GRID */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="overflow-x-auto relative">
            {loading ? (
              <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                <IconClock className="animate-spin text-slate-300" size={32} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Memuat jadwal...</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/60 backdrop-blur-md">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] sticky left-0 z-10 bg-slate-50/90 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-200/60">
                      Karyawan
                    </th>
                    {dateList.map((d, i) => (
                      <th key={i} className="px-3 py-4 text-center border-r border-slate-100 min-w-[50px]">
                        <div className="flex flex-col items-center">
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${d.getDay() === 0 || d.getDay() === 6 ? 'text-red-400' : 'text-slate-400'}`}>
                            {d.toLocaleDateString('id-ID', { weekday: 'short' })}
                          </span>
                          <span className={`text-[11px] font-black ${d.getDay() === 0 || d.getDay() === 6 ? 'text-red-500' : 'text-slate-700'}`}>
                            {d.getDate()}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={dateList.length + 1} className="py-20 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        Tidak ada data karyawan
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp['EMPLOYEE ID']} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-3 sticky left-0 z-10 bg-white group-hover:bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate w-56">{emp['EMPLOYEE NAME']}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{emp['EMPLOYEE ID']} &bull; {emp['JOB POSITION']}</span>
                          </div>
                        </td>
                        {dateList.map((d, i) => {
                          const dateStr = formatDate(d);
                          const schedule = scheduleMap[emp['EMPLOYEE ID']]?.[dateStr];
                          const shift = schedule?.shifts;
                          const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                          return (
                            <td key={i} className={`p-1 border-r border-slate-50 text-center relative ${isWeekend ? 'bg-red-50/30' : ''}`}>
                              {shift ? (
                                <div 
                                  className="mx-auto w-[40px] h-[30px] rounded flex items-center justify-center border shadow-xs cursor-pointer hover:scale-105 transition-transform"
                                  style={{ 
                                    backgroundColor: getShiftColor(shift.code),
                                    borderColor: 'rgba(0,0,0,0.05)'
                                  }}
                                  title={`${shift.name} (${shift.time_in?.substring(0,5)} - ${shift.time_out?.substring(0,5)})`}
                                >
                                  <span className="text-[9px] font-black text-slate-800">{shift.code}</span>
                                </div>
                              ) : (
                                <div className="mx-auto w-[40px] h-[30px] rounded flex items-center justify-center border border-dashed border-slate-200 text-slate-300 hover:border-[#E31E24]/40 hover:text-[#E31E24] cursor-pointer transition-colors bg-white">
                                  <IconEdit size={12} />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScheduleManager;
