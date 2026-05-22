import React, { useState, useEffect } from 'react';
import { 
  IconArrowLeft,
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconPlus,
  IconUser,
  IconTrash,
  IconCheck,
  IconBuildingSkyscraper,
  IconHierarchy2,
  IconChevronDown
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import AttendanceEditModal from './components/AttendanceEditModal';

const AttendanceCalendar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  
  // Date State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Selection State
  const [selectedOrg, setSelectedOrg] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  // Data State
  const [attendanceData, setAttendanceData] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedDateForNew, setSelectedDateForNew] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendanceData();
    } else {
      setAttendanceData([]);
    }
    
    // Realtime subscription
    const channel = supabase
      .channel('attendance_calendar_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        if (selectedEmployee) fetchAttendanceData();
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [currentDate, selectedEmployee]);

  const fetchEmployees = async () => {
    const { data: empData } = await supabase.from('employees').select('id, name, is_resigned, organization_name, departments(name)').eq('is_resigned', false);
    const mapped = (empData || []).map(e => ({
       ...e,
       department_name: e.departments?.name || ''
    }));
    setEmployees(mapped);
    if (mapped && mapped.length > 0) {
      setSelectedEmployee(mapped[0].id);
    }
  };

  const uniqueOrgs = ['ALL', ...new Set(employees.map(e => e.organization_name).filter(Boolean))];
  const filteredForDept = selectedOrg === 'ALL' ? employees : employees.filter(e => e.organization_name === selectedOrg);
  const uniqueDepts = ['ALL', ...new Set(filteredForDept.map(e => e.department_name).filter(Boolean))];

  const filteredEmployees = employees.filter(e => {
    if (selectedOrg !== 'ALL' && e.organization_name !== selectedOrg) return false;
    if (selectedDept !== 'ALL' && e.department_name !== selectedDept) return false;
    return true;
  });

  // Auto-select first employee if current is filtered out
  useEffect(() => {
    if (filteredEmployees.length > 0 && !filteredEmployees.find(e => e.id === selectedEmployee)) {
      setSelectedEmployee(filteredEmployees[0].id);
    } else if (filteredEmployees.length === 0) {
      setSelectedEmployee('');
    }
  }, [selectedOrg, selectedDept, filteredEmployees, selectedEmployee]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      // Get first day of month and last day of month
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);
      
      const startDateStr = startOfMonth.toISOString().split('T')[0];
      const endDateStr = endOfMonth.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', selectedEmployee)
        .gte('date', startDateStr)
        .lte('date', endDateStr);
        
      if (error) throw error;
      setAttendanceData(data || []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calendar Helpers
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 is Sunday
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PRESENT': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'LATE': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'SICK': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LEAVE': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'ABSENT': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleDayClick = (day) => {
    if (!selectedEmployee) return;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const existingRecord = attendanceData.find(record => record.date === dateStr);
    
    if (existingRecord) {
      setSelectedRecord(existingRecord);
    } else {
      setSelectedRecord(null);
      setSelectedDateForNew(dateStr);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#f8fafc] overflow-hidden animate-fade-in">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col h-full gap-3">
        
        {/* PREMIUM HEADER */}
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
                  <IconCalendarEvent size={20} className="text-[#E31E24]" />
                </div>
                ATTENDANCE <span className="text-[#E31E24] font-black opacity-90">CALENDAR</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Organization Selector */}
             <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm focus-within:border-[#E31E24]/40 focus-within:ring-1 focus-within:ring-[#E31E24]/20 transition-all">
                <IconBuildingSkyscraper size={14} className="text-slate-400" />
                <select 
                  value={selectedOrg}
                  onChange={(e) => { setSelectedOrg(e.target.value); setSelectedDept('ALL'); }}
                  className="bg-transparent border-none text-slate-700 font-bold text-[10px] uppercase focus:outline-none cursor-pointer p-0 w-28 appearance-none"
                >
                  {uniqueOrgs.map(org => (
                    <option key={org} value={org}>{org === 'ALL' ? 'ALL ORGS' : org}</option>
                  ))}
                </select>
                <IconChevronDown size={12} className="text-slate-300 pointer-events-none" />
             </div>

             {/* Department Selector */}
             <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm focus-within:border-[#E31E24]/40 focus-within:ring-1 focus-within:ring-[#E31E24]/20 transition-all">
                <IconHierarchy2 size={14} className="text-slate-400" />
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-transparent border-none text-slate-700 font-bold text-[10px] uppercase focus:outline-none cursor-pointer p-0 w-32 appearance-none"
                >
                  {uniqueDepts.map(dept => (
                    <option key={dept} value={dept}>{dept === 'ALL' ? 'ALL DEPTS' : dept}</option>
                  ))}
                </select>
                <IconChevronDown size={12} className="text-slate-300 pointer-events-none" />
             </div>

             {/* Employee Selector */}
             <div className="flex items-center gap-2 bg-[#E31E24]/5 px-3 py-1.5 rounded-lg border border-[#E31E24]/20 shadow-sm focus-within:border-[#E31E24]/50 focus-within:ring-1 focus-within:ring-[#E31E24]/30 transition-all">
                <IconUser size={14} className="text-[#E31E24]" />
                <select 
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="bg-transparent border-none text-slate-800 font-black text-[10px] uppercase focus:outline-none cursor-pointer p-0 w-44 appearance-none"
                >
                  <option value="" disabled>SELECT PERSONNEL</option>
                  {filteredEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
                <IconChevronDown size={12} className="text-[#E31E24]/50 pointer-events-none" />
             </div>
          </div>
        </div>

        {/* CALENDAR VIEW */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col min-h-0">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              {loading && <IconClock className="animate-spin text-slate-300" size={18} />}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-10 w-10 rounded-xl border-slate-200 text-slate-500 hover:text-[#E31E24] hover:bg-[#E31E24]/5">
                <IconChevronLeft size={20} />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="h-10 px-6 rounded-xl border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:text-[#E31E24] hover:bg-[#E31E24]/5">
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-10 w-10 rounded-xl border-slate-200 text-slate-500 hover:text-[#E31E24] hover:bg-[#E31E24]/5">
                <IconChevronRight size={20} />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 grid grid-cols-7 grid-rows-[auto_repeat(6,minmax(0,1fr))] bg-slate-100 gap-[1px]">
            {/* Days Header */}
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="bg-white p-2 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</span>
              </div>
            ))}

            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-white/50 p-2 min-h-0" />
            ))}

            {/* Days slots */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const record = attendanceData.find(r => r.date === dateStr);
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div 
                  key={day} 
                  onClick={() => handleDayClick(day)}
                  className="bg-white p-1.5 min-h-0 h-full cursor-pointer hover:bg-slate-50 transition-colors group relative flex flex-col overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-1 shrink-0">
                    <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-[#E31E24] text-white shadow-md' : 'text-slate-600'}`}>
                      {day}
                    </span>
                    {!record && selectedEmployee && (
                      <IconPlus size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  {record && (
                    <div className={`mt-auto p-2 rounded-xl border flex flex-col gap-1 shadow-sm transition-transform group-hover:scale-[1.02] ${getStatusColor(record.status)}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-widest">{record.status}</span>
                        <IconCheck size={12} className="opacity-70" />
                      </div>
                      <div className="flex justify-between items-center bg-white/50 px-2 py-1 rounded-md">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black opacity-60 uppercase leading-none">IN</span>
                          <span className="text-[11px] font-bold tracking-tight leading-none mt-0.5">{record.clock_in || '--:--'}</span>
                        </div>
                        <div className="w-[1px] h-4 bg-black/10 mx-1"></div>
                        <div className="flex flex-col text-right">
                          <span className="text-[8px] font-black opacity-60 uppercase leading-none">OUT</span>
                          <span className="text-[11px] font-bold tracking-tight leading-none mt-0.5">{record.clock_out || '--:--'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty slots for end of month */}
            {Array.from({ length: 42 - (firstDayOfMonth + daysInMonth) }).map((_, index) => (
              <div key={`empty-end-${index}`} className="bg-white/50 p-2 min-h-0" />
            ))}
          </div>
        </div>
      </div>

      <AttendanceEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeeId={selectedEmployee}
        record={selectedRecord}
        defaultDate={selectedDateForNew}
        onSuccess={fetchAttendanceData}
      />
    </div>
  );
};

export default AttendanceCalendar;
