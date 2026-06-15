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
  IconWand,
  IconFileText
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
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
      const empRes = await apiClient.get('/employees?size=500');
      const empData = empRes.data?.data || (Array.isArray(empRes.data) ? empRes.data : []);
      setEmployees(empData.filter(e => !e.is_resigned));

      // Fetch active shifts
      const shiftRes = await apiClient.get('/master/shifts?active_only=true');
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
    <div className="flex-1 overflow-y-auto p-6 bg-transparent custom-scrollbar animate-fade-in">
      <div className="w-full mx-auto space-y-4">
        
        {/* Header removed as per Phase 2 Audit (redundant with breadcrumb) */}

        {/* CONTROL CENTER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-2.5 rounded-2xl border border-white shadow-sm ">
            {/* Month Selector */}
            <div className="md:col-span-3 flex items-center gap-3 bg-transparent px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all focus-within:border-[#E31E24] relative group focus-within:ring-2 focus-within:ring-[#E31E24]/20">
               <IconCalendarStats size={14} className="text-[#E31E24]" />
               <div className="flex flex-col flex-1">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Pilih Bulan</span>
                  <div className="relative flex items-center">
                    <input 
                      type="month" 
                      value={selectedMonth}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      className="bg-transparent border-none text-slate-800 font-black text-xs uppercase focus:outline-none cursor-pointer p-0 w-full appearance-none pr-6 z-10"
                    />
                    <IconChevronDown size={12} className="absolute right-0 text-slate-300 pointer-events-none group-focus-within:text-[#E31E24] transition-all" />
                  </div>
               </div>
            </div>

            {/* Search Input */}
            <div className="md:col-span-5 flex items-center gap-3 bg-transparent px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all focus-within:border-[#E31E24]  group focus-within:ring-2 focus-within:ring-[#E31E24]/20">
                <IconSearch size={14} className="text-slate-300 group-focus-within:text-[#E31E24] transition-colors" />
                <div className="flex flex-col flex-1">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Cari Karyawan</span>
                  <input 
                      type="text" 
                      placeholder="NAMA, ID KARYAWAN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-none w-full text-xs font-black text-slate-700 placeholder:text-slate-400 focus:outline-none uppercase tracking-widest p-0"
                  />
                </div>
            </div>

            {/* Legend & Actions */}
            <div className="md:col-span-4 flex gap-2">
                <div className="flex-1 flex flex-col justify-center px-4 py-2 rounded-xl bg-white shadow-sm border-none">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Informasi Total</span>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-tighter truncate">
                    {filteredEmployees.length} Karyawan Aktif
                  </p>
                </div>
                <Button 
                  onClick={() => toast.info("Fitur Bulk Assign akan segera hadir!")}
                  className="h-full px-4 rounded-xl bg-[#E31E24] text-white hover:bg-[#C1181E] shadow-sm flex flex-col justify-center items-center gap-1 transition-all active:scale-95 shrink-0"
                  data-tooltip="Bulk Assign"
                >
                  <IconWand size={14} />
                  <span className="text-[11px] font-bold tracking-widest uppercase">Assign</span>
                </Button>
            </div>
        </div>

        {/* SCHEDULE GRID */}
        <div className="bg-transparent rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto relative">
            {loading ? (
              <div className="p-10">
                <div className="animate-pulse flex flex-col gap-4">
                  {Array(5).fill(0).map((_, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="h-10 bg-slate-200 rounded w-48"></div>
                      <div className="flex-1 flex gap-2">
                        {Array(7).fill(0).map((_, i) => (
                          <div key={i} className="h-10 bg-slate-100 rounded flex-1"></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar w-full">
<table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/60 ">
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider sticky left-0 z-10 bg-slate-50/90 w-64 shadow-sm border-r border-slate-200/60">
                      Karyawan
                    </th>
                    {dateList.map((d, i) => (
                      <th key={i} className="px-3 py-4 text-center border-r border-slate-200 min-w-[50px]">
                        <div className="flex flex-col items-center">
                          <span className={`text-[11px] font-bold uppercase tracking-widest ${d.getDay() === 0 || d.getDay() === 6 ? 'text-red-400' : 'text-slate-400'}`}>
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
                      <td colSpan={dateList.length + 1} className="py-24">
                         <EmptyState 
                            icon={IconFileText}
                            data-tooltip="Tidak Ada Data"
                            description="Silakan sesuaikan filter pencarian Anda."
                         />
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp['EMPLOYEE ID']} className="transition-colors group hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="px-6 py-3 sticky left-0 z-10 bg-transparent group-hover:shadow-sm shadow-sm border-r border-slate-200">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate w-56">{emp['EMPLOYEE NAME']}</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{emp['EMPLOYEE ID']} &bull; {emp['JOB POSITION']}</span>
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
                                  <span className="text-xs font-black text-slate-800">{shift.code}</span>
                                </div>
                              ) : (
                                <div className="mx-auto w-[40px] h-[30px] rounded flex items-center justify-center border border-dashed border-slate-200 text-slate-300 hover:border-[#E31E24]/40 hover:text-[#E31E24] cursor-pointer transition-colors bg-transparent">
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
</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScheduleManager;
