import React, { useState, useEffect } from 'react';
import { 
  IconFileText, 
  IconFilter, 
  IconDownload, 
  IconSearch, 
  IconCalendar,
  IconArrowLeft,
  IconUsers,
  IconClock,
  IconCircleCheck,
  IconAlertTriangle,
  IconUser,
  IconCalendarStats,
  IconChevronDown,
  IconMapPin
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiClient } from '@/lib/apiClient';
import { useNavigate } from 'react-router-dom';
import MiniMapModal from './components/MiniMapModal';

const AttendanceReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  
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
    const start = new Date(currentYear, currentMonth - 1, 26);
    const end = new Date(currentYear, currentMonth, 25);
    return {
      start: formatDate(start),
      end: formatDate(end)
    };
  };

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [startDate, setStartDate] = useState(getDefaultDates().start);
  const [endDate, setEndDate] = useState(getDefaultDates().end);
  const [selectedEmployee, setSelectedEmployee] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedMapData, setSelectedMapData] = useState(null);

  const handleMonthChange = (monthStr) => {
    setSelectedMonth(monthStr);
    const [year, month] = monthStr.split('-').map(Number);
    const start = new Date(year, month - 2, 26);
    const end = new Date(year, month - 1, 25);
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  };

  const fetchEmployees = async () => {
    try {
      const response = await apiClient.get('/employees?size=500');
      const empData = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setEmployees(empData.map(e => ({ id: e['EMPLOYEE ID'], name: e['EMPLOYEE NAME'] })));
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      let url = `/api/attendance/report?start_date=${startDate}&end_date=${endDate}`;
      if (selectedEmployee !== 'ALL') {
        url += `&employee_id=${selectedEmployee}`;
      }
      const response = await apiClient.get(url);
      if (response.status !== 'success') throw new Error('Failed to fetch report');
      setData(response.data || []);
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchReport();
    const interval = setInterval(() => fetchReport(), 15000);
    return () => clearInterval(interval);
  }, [startDate, endDate, selectedEmployee]);

  const filteredData = data.filter(item => 
    item.employees?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.employees?.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'PRESENT': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'LATE': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'SICK': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'LEAVE': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'ABSENT': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  const handleExport = () => {
    const headers = ["Date", "Employee ID", "Name", "Clock In", "Clock Out", "Status", "Location", "Distance", "Notes"];
    const rows = filteredData.map(row => [row.date, row.employees?.id, row.employees?.name, row.clock_in, row.clock_out, row.status, row.target_name || "HQ", row.distance_meters != null ? `${row.distance_meters}m` : "-", row.notes || ""]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Attendance_Master_Report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-transparent custom-scrollbar animate-fade-in">
      <div className="w-full mx-auto space-y-4">
        
        {/* Premium Header removed as per Phase 2 Audit (redundant with breadcrumb) */}
        {/* 🔍 SLEEK CONTROL CENTER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-2.5 rounded-2xl border border-white shadow-sm ">
            {/* Month Selector */}
            <div className="md:col-span-2 flex items-center gap-3 bg-transparent px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all focus-within:border-[#E31E24] relative group focus-within:ring-2 focus-within:ring-[#E31E24]/20">
               <IconCalendarStats size={14} className="text-[#E31E24]" />
               <div className="flex flex-col flex-1">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Cycle</span>
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

            {/* Personnel Filter */}
            <div className="md:col-span-3 flex items-center gap-3 bg-transparent px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all focus-within:border-[#E31E24] relative group focus-within:ring-2 focus-within:ring-[#E31E24]/20">
               <IconUser size={14} className="text-slate-400 group-focus-within:text-[#E31E24] transition-colors" />
               <div className="flex flex-col flex-1">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Personnel</span>
                  <div className="relative flex items-center">
                    <select 
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="bg-transparent border-none text-slate-800 font-black text-xs uppercase focus:outline-none cursor-pointer w-full p-0 appearance-none z-10 pr-6"
                    >
                      <option value="ALL">ALL PERSONNEL</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                    <IconChevronDown size={12} className="absolute right-0 text-slate-300 pointer-events-none group-focus-within:text-[#E31E24] transition-all" />
                  </div>
               </div>
            </div>

            {/* Search Input */}
            <div className="md:col-span-4 flex items-center gap-3 bg-transparent px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all focus-within:border-[#E31E24]  group focus-within:ring-2 focus-within:ring-[#E31E24]/20">
                <IconSearch size={14} className="text-slate-300 group-focus-within:text-[#E31E24] transition-colors" />
                <div className="flex flex-col flex-1">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Quick Search</span>
                  <input 
                      type="text" 
                      placeholder="NAME, DEPT, OR ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-none w-full text-xs font-black text-slate-700 placeholder:text-slate-400 focus:outline-none uppercase tracking-widest p-0"
                  />
                </div>
            </div>

            {/* Period & Actions */}
            <div className="md:col-span-3 flex gap-2">
                <div className="flex-1 flex flex-col justify-center px-4 py-2 rounded-xl bg-white shadow-sm border-none">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Period</span>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-tighter truncate">
                    {startDate.substring(5)} <span className="text-slate-300 mx-0.5">/</span> {endDate.substring(5)}
                  </p>
                </div>
                <Button 
                  onClick={handleExport}
                  className="h-full px-4 rounded-xl bg-[#1e293b] text-white hover:bg-[#0f172a] shadow-sm flex justify-center items-center gap-2 transition-all active:scale-95 shrink-0"
                  data-tooltip="Export to CSV"
                >
                  <IconDownload size={14} />
                  <span className="text-xs font-bold tracking-widest uppercase">CSV</span>
                </Button>
            </div>
        </div>

        {/* 📜 PROFESSIONAL LOG TABLE */}
        <div className="bg-transparent rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 ">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider w-32">Date</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Personnel Information</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Department & Position</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-wider w-24">In</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-wider w-24">Out</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-wider w-32">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-wider w-24">Distance</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse border-b border-slate-100">
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                           <div className="h-4 bg-slate-200 rounded w-32"></div>
                           <div className="h-3 bg-slate-100 rounded w-24"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20 mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    </tr>
                  ))
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-24">
                       <EmptyState 
                          icon={IconFileText}
                          data-tooltip="Belum Ada Data"
                          description="Tidak ada catatan kehadiran yang sesuai dengan filter saat ini."
                       />
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.id} className="transition-all group border-b border-transparent hover:border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-6 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                           <div className="h-7 w-7 rounded-lg bg-white shadow-sm border-none flex items-center justify-center text-slate-400 group-hover:text-[#E31E24] transition-colors">
                            <IconCalendar size={14} />
                           </div>
                           <span className="text-[11px] font-black text-slate-700 tracking-tight">{row.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-2">
                        <div className="flex flex-col">
                           <p className="text-[11px] font-black text-slate-800 uppercase leading-none mb-1 group-hover:text-[#E31E24] transition-colors">{row.employees?.name}</p>
                           <p className="text-xs font-bold text-slate-400 tracking-widest">{row.employees?.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-2">
                        <div className="flex flex-col">
                           <p className="text-xs font-black text-slate-600 uppercase leading-none mb-1 tracking-tight">{row.employees?.division_name}</p>
                           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80">{row.employees?.job_position}</p>
                        </div>
                      </td>
                      <td className="px-6 py-2 text-center">
                        <span className="text-[11px] font-black text-slate-600 tracking-tighter">{row.clock_in || '--:--'}</span>
                      </td>
                      <td className="px-6 py-2 text-center">
                        <span className="text-[11px] font-black text-slate-600 tracking-tighter">{row.clock_out || '--:--'}</span>
                      </td>
                      <td className="px-6 py-2 text-center">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-6 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-600 uppercase truncate max-w-[100px]">
                            {row.target_name || "HQ"}
                          </span>
                          {(row.location_lat && row.location_lng) && (
                            <button 
                              onClick={() => {
                                setSelectedMapData(row);
                                setIsMapOpen(true);
                              }}
                              className="text-slate-400 hover:text-[#E31E24] transition-colors p-1"
                              data-tooltip="View Map"
                            >
                              <IconMapPin size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-2 text-center">
                        {row.distance_meters != null ? (
                          <span className={`text-xs font-black tracking-tight ${row.distance_meters > 100 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {row.distance_meters}m
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-2 max-w-[180px] truncate">
                        <span className="text-xs font-medium text-slate-400 italic">
                          {row.notes || '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <MiniMapModal 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        data={selectedMapData} 
      />
    </div>
  );
};

export default AttendanceReport;
