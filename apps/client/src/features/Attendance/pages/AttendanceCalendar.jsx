import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  IconChevronDown,
  IconX
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { apiClient } from '@/lib/apiClient';
import { useNavigate } from 'react-router-dom';
import AttendanceEditModal from './components/AttendanceEditModal';

const CustomDropdown = ({ value, onChange, options, placeholder, icon: Icon, disabled, activeColorClass, activeBorderClass, activeRingClass, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative flex-1 max-w-[240px] min-w-[120px] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm transition-all cursor-pointer ${disabled ? 'bg-slate-50 border-slate-200' : `${activeColorClass} ${activeBorderClass} ${isOpen ? activeRingClass : ''}`}`}
      >
        <Icon size={16} className={`shrink-0 ${disabled ? 'text-slate-400' : (value ? (activeColorClass.includes('white') ? 'text-ios-primary' : 'text-slate-600') : 'text-slate-500')}`} />
        <span className={`font-bold text-xs lg:text-[11px] uppercase truncate flex-1 ${disabled ? 'text-slate-500' : (value ? 'text-slate-800' : 'text-slate-600')}`}>
          {value ? (options.find(o => o.value === value)?.label || value) : placeholder}
        </span>
        {value && onClear ? (
          <div 
            onClick={(e) => { e.stopPropagation(); onClear(); setIsOpen(false); }}
            className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-ios-primary transition-colors flex items-center justify-center shrink-0"
          >
            <IconX size={14} />
          </div>
        ) : (
          <IconChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-transparent border border-slate-200 rounded-xl shadow-sm z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-1 flex flex-col gap-0.5">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-3 py-2.5 rounded-lg text-xs lg:text-[11px] font-semibold uppercase cursor-pointer transition-colors ${value === opt.value ? 'bg-ios-primary/10 text-ios-primary' : 'text-slate-600 hover:shadow-sm hover:text-slate-900'}`}
              >
                {opt.label}
              </div>
            ))}
            {options.length === 0 && (
              <div className="px-3 py-3 text-center text-xs text-slate-400 font-bold uppercase">No Options</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AttendanceCalendar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  
  // Date State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Selection State
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
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
    
    // Polling instead of Realtime
    const interval = setInterval(() => {
      if (selectedEmployee) fetchAttendanceData();
    }, 15000);
      
    return () => clearInterval(interval);
  }, [currentDate, selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await apiClient.get('/employees?size=500');
      const rawData = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      
      const empData = rawData.map(e => ({
        id: e['EMPLOYEE ID'],
        name: e['EMPLOYEE NAME'],
        is_resigned: e.is_resigned,
        division_name: e['Division Name *'],
        organization_id: e.organization_id,
        department_id: e.department_id,
        departments: e.departments
      }));

      const uniqueOrgIds = [...new Set(empData.map(e => e.organization_id).filter(Boolean))];
      const deptMap = {};
      const _rawApi = import.meta.env.VITE_API_URL;
      const apiUrl = _rawApi ? (_rawApi.endsWith('/api') ? _rawApi : _rawApi.replace(/\/$/, '') + '/api') : 'http://localhost:8000/api';
      
      await Promise.all(uniqueOrgIds.map(async (orgId) => {
          try {
              const res = await fetch(`${apiUrl}/organizations/${orgId}/departments?active_only=true`);
              const json = await res.json();
              if (json.status === 'success' && json.data) {
                  json.data.forEach(d => {
                      deptMap[d.id] = d.name;
                  });
              }
          } catch (err) {
              console.error('Failed to fetch depts for org', orgId, err);
          }
      }));

      const mapped = empData.map(e => ({
         ...e,
         department_name: deptMap[e.department_id] || e.departments?.name
      }));
      setEmployees(mapped);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const uniqueOrgs = [...new Set(employees.map(e => e.division_name))].filter(Boolean).sort();
  const filteredForDept = employees.filter(e => e.division_name === selectedOrg);
  const uniqueDepts = [...new Set(filteredForDept.map(e => e.department_name))].filter(Boolean).sort();

  const filteredEmployees = employees.filter(e => {
    if (!selectedOrg || e.division_name !== selectedOrg) return false;
    if (!selectedDept || e.department_name !== selectedDept) return false;
    return true;
  });

  // Auto-reset employee if it's filtered out
  useEffect(() => {
    if (filteredEmployees.length === 0 || !filteredEmployees.find(e => e.id === selectedEmployee)) {
      setSelectedEmployee('');
    }
  }, [selectedOrg, selectedDept, filteredEmployees]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);
      
      const startDateStr = startOfMonth.toISOString().split('T')[0];
      const endDateStr = endOfMonth.toISOString().split('T')[0];
      
      const response = await apiClient.get(`/api/attendance/calendar?employee_id=${selectedEmployee}&start_date=${startDateStr}&end_date=${endDateStr}`);
      if (response.status !== 'success') throw new Error('Failed');
      setAttendanceData(response.data || []);
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
      <div className="w-full mx-auto flex flex-col h-full gap-3">
        
        {/* CONTROL CENTER */}
        <div className="flex items-center gap-2 lg:gap-3 w-full bg-white p-2.5 rounded-2xl border border-white shadow-sm ">
             {/* Organization Selector */}
             <CustomDropdown
               value={selectedOrg}
               onChange={(val) => { setSelectedOrg(val); setSelectedDept(''); }}
               onClear={() => { setSelectedOrg(''); setSelectedDept(''); setSelectedEmployee(''); }}
               options={uniqueOrgs.map(o => ({ value: o, label: o }))}
               placeholder="SELECT ORG"
               icon={IconBuildingSkyscraper}
               disabled={false}
               activeColorClass="bg-slate-50"
               activeBorderClass="border-slate-200"
               activeRingClass="border-slate-200 ring-2 ring-slate-100"
             />

             {/* Department Selector */}
             <CustomDropdown
               value={selectedDept}
               onChange={(val) => setSelectedDept(val)}
               onClear={() => { setSelectedDept(''); setSelectedEmployee(''); }}
               options={uniqueDepts.map(d => ({ value: d, label: d }))}
               placeholder="SELECT DEPT"
               icon={IconHierarchy2}
               disabled={!selectedOrg}
               activeColorClass="bg-slate-50"
               activeBorderClass="border-slate-200"
               activeRingClass="border-slate-200 ring-2 ring-slate-100"
             />

             {/* Employee Selector */}
             <CustomDropdown
               value={selectedEmployee}
               onChange={(val) => setSelectedEmployee(val)}
               onClear={() => setSelectedEmployee('')}
               options={filteredEmployees.map(e => ({ value: e.id, label: e.name }))}
               placeholder="SELECT PERSONNEL"
               icon={IconUser}
               disabled={!selectedDept}
               activeColorClass="bg-transparent"
               activeBorderClass="border-ios-primary/30"
               activeRingClass="border-ios-primary ring-2 ring-ios-primary/10"
             />
        </div>

        {/* CALENDAR VIEW */}
        <div className="flex-1 bg-transparent rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight flex items-center gap-3">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              {loading && <IconClock className="animate-spin text-slate-300" size={18} />}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-10 w-10 rounded-xl border-slate-200 text-slate-500 hover:text-ios-primary hover:bg-ios-primary/5">
                <IconChevronLeft size={20} />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="h-10 px-6 rounded-xl border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:text-ios-primary hover:bg-ios-primary/5">
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-10 w-10 rounded-xl border-slate-200 text-slate-500 hover:text-ios-primary hover:bg-ios-primary/5">
                <IconChevronRight size={20} />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-slate-100">
            <div className="min-h-full grid grid-cols-7 grid-rows-[auto_repeat(6,minmax(85px,1fr))] bg-slate-100 gap-[1px]">
            {/* Days Header */}
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="bg-transparent p-2 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</span>
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
              const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              return (
                <div 
                  key={day} 
                  onClick={() => handleDayClick(day)}
                  className="bg-transparent p-1.5 min-h-0 h-full cursor-pointer hover:shadow-sm transition-colors group relative flex flex-col"
                >
                  <div className="flex justify-between items-start mb-1 shrink-0">
                    <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-ios-primary text-white shadow-sm' : (isWeekend ? 'text-ios-primary' : 'text-slate-600')}`}>
                      {day}
                    </span>
                    {!record && selectedEmployee && (
                      <IconPlus size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  {record && (
                    <div className={`mt-auto p-1.5 rounded-lg border flex flex-col shadow-sm transition-transform group-hover:scale-[1.02] ${getStatusColor(record.status)}`}>
                      <div className="flex justify-between items-center px-0.5 mb-1">
                        <span className="text-[8.5px] font-bold uppercase tracking-wider">{record.status}</span>
                        <IconCheck size={10} className="opacity-70" />
                      </div>
                      <div className="flex justify-between items-center bg-white px-1.5 py-1 rounded w-full">
                        <div className="flex flex-col">
                          <span className="text-[6.5px] font-bold opacity-50 uppercase leading-none mb-[2px]">IN</span>
                          <span className="text-[9.5px] font-bold tracking-tight leading-none">{record.clock_in ? record.clock_in.substring(0, 5) : '--:--'}</span>
                        </div>
                        <div className="w-[1px] h-4 bg-black/10 mx-0.5"></div>
                        <div className="flex flex-col text-right">
                          <span className="text-[6.5px] font-bold opacity-50 uppercase leading-none mb-[2px]">OUT</span>
                          <span className="text-[9.5px] font-bold tracking-tight leading-none">{record.clock_out ? record.clock_out.substring(0, 5) : '--:--'}</span>
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
