import React, { useState, useEffect, useMemo } from 'react';
import { 
  IconUsers, 
  IconSearch, 
  IconPlus, 
  IconPrinter, 
  IconFilter, 
  IconChevronDown, 
  IconUserX, 
  IconUserCheck,
  IconCheck,
  IconDots,
  IconRotate,
  IconArrowRight,
  IconLoader2,
  IconEye,
  IconEdit,
  IconTrash,
  IconRefresh,
  IconX,
  IconUserPlus,
  IconId,
  IconSignature,
  IconHierarchy2,
  IconTable,
  IconBuildingSkyscraper,
  IconHistory,
  IconCalculator,
  IconSchool,
  IconBolt
} from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmployeeDossier from './components/EmployeeDossier';
import OnboardingManager from './components/OnboardingManager';
import IDCardGenerator from './components/IDCardGenerator';
import DigitalSignature from './components/DigitalSignature';
import OrgChart from './components/OrgChart';
import AuditTrail from './components/AuditTrail';
import SalarySimulator from './components/SalarySimulator';
import TrainingTracker from './components/TrainingTracker';
import AddEmployeeModal from './components/AddEmployeeModal';
import BulkUploadModal from './components/BulkUploadModal';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

const Employees = () => {
  const { profile, isOwner, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync viewMode with URL: /employees/neural or /employees/registry (default)
  const viewMode = location.pathname.includes('/neural') ? 'neural' : 'registry';
  const setViewMode = (mode) => navigate(`/employees/${mode}`);

  const [activeTab, setActiveTab] = useState('active');
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDept, setFilterDept] = useState('ALL DEPARTMENTS');
  const [filterPos, setFilterPos] = useState('ALL POSITIONS');
  const [filterLevel, setFilterLevel] = useState('ALL LEVELS');
  const [filterStatus, setFilterStatus] = useState('ALL STATUSES');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [idTargetEmployee, setIdTargetEmployee] = useState(null);
  const [isIDGeneratorOpen, setIsIDGeneratorOpen] = useState(false);
  const [eSignTargetEmployee, setESignTargetEmployee] = useState(null);
  const [isESignOpen, setIsESignOpen] = useState(false);
  const [auditTargetEmployee, setAuditTargetEmployee] = useState(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isSalarySimulatorOpen, setIsSalarySimulatorOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Handle Search Debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, pageSize, debouncedSearch, viewMode]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const fetchSize = viewMode === 'neural' ? 1000 : pageSize;
      const start = (currentPage - 1) * pageSize;
      const end = start + fetchSize - 1;

      let query = supabase
        .from('employees')
        .select('*', { count: 'exact' });

      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,id.ilike.%${debouncedSearch}%`);
      }

      const { data, count, error } = await query
        .order('id', { ascending: true })
        .range(start, end);

      if (error) throw error;

      const mappedData = data.map(e => ({
        ...e,
        "EMPLOYEE ID": e.id || "N/A",
        "EMPLOYEE NAME": e.name || "Unnamed",
        "EMAIL": e.email || "-",
        "Organization Name *": e.organization_name || "Unassigned",
        "Job Position *": e.job_position || "Staff",
        "Job Level *": e.job_level || "-",
        "Status *": e.status || "Contract",
        "Photo": e.photo || null
      }));

      setEmployees(mappedData);
      setTotalEmployees(count || 0);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    
    // Note: Search is now handled at API level via debouncedSearch
    return employees.filter(emp => {
      const statusRaw = String(emp["Status *"] || emp.status || "").toUpperCase();
      const isResigned = emp.is_resigned === true || statusRaw === 'RESIGNED' || !!emp.resign_date;
      
      const matchesTab = activeTab === 'active' ? !isResigned : isResigned;
      
      let match = matchesTab;

      if (filterDept !== 'ALL DEPARTMENTS') {
        match = match && emp["Organization Name *"] === filterDept;
      }
      if (filterPos !== 'ALL POSITIONS') {
        match = match && emp["Job Position *"] === filterPos;
      }
      if (filterLevel !== 'ALL LEVELS') {
        match = match && emp["Job Level *"] === filterLevel;
      }
      if (filterStatus !== 'ALL STATUSES' && activeTab === 'active') {
        match = match && statusRaw === filterStatus.toUpperCase();
      }

      return match;
    });
  }, [employees, activeTab, filterDept, filterPos, filterLevel, filterStatus]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredEmployees.map(emp => emp["EMPLOYEE ID"]);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleResignEmployee = async (id) => {
    const resignDate = new Date().toISOString().split('T')[0];
    if (window.confirm('MARK EMPLOYEE AS RESIGNED?')) {
      // OPTIMISTIC UPDATE: Update local state immediately for zero-latency feel
      const previousEmployees = [...employees];
      setEmployees(prev => prev.map(emp => {
        if (emp.id === id || emp["EMPLOYEE ID"] === id) {
          return { 
            ...emp, 
            status: 'RESIGNED', 
            "Status *": 'RESIGNED', // Update the specific column used for filtering
            is_resigned: true, 
            resign_date: resignDate 
          };
        }
        return emp;
      }));

      try {
        const updateData = { 
          status: 'RESIGNED',
          resign_date: resignDate,
          is_resigned: true
        };

        const { error } = await supabase
          .from('employees')
          .update(updateData)
          .eq('id', id);
          
        if (error) {
          const { error: error2 } = await supabase.from('employees').update(updateData).eq('employee_id', id);
          if (error2) throw error2;
        }
        
        fetchEmployees();
        alert('Employee marked as RESIGNED');
      } catch (error) {
        // Rollback on error
        setEmployees(previousEmployees);
        console.error('ERROR UPDATING RESIGN STATUS:', error);
        alert('Update failed: ' + error.message);
      }
    }
  };

  const handleBulkResign = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Mark ${selectedIds.size} employees as Resigned?`)) {
      const idArray = Array.from(selectedIds);
      const previousEmployees = [...employees];
      const resignDate = new Date().toISOString().split('T')[0];

      // Optimistic update
      setEmployees(prev => prev.map(emp => {
        if (idArray.includes(emp.id) || idArray.includes(emp["EMPLOYEE ID"])) {
          return { 
            ...emp, 
            status: 'RESIGNED', 
            "Status *": 'RESIGNED',
            is_resigned: true, 
            resign_date: resignDate 
          };
        }
        return emp;
      }));

      try {
        const updateData = { 
          status: 'RESIGNED',
          resign_date: resignDate,
          is_resigned: true
        };
        
        const { error } = await supabase
          .from('employees')
          .update(updateData)
          .in('id', idArray);
          
        if (error) {
          const { error: error2 } = await supabase.from('employees').update(updateData).in('employee_id', idArray);
          if (error2) throw error2;
        }

        setSelectedIds(new Set());
        fetchEmployees();
        alert('Bulk Resign completed');
      } catch (error) {
        setEmployees(previousEmployees);
        console.error('Error in bulk resign:', error);
        alert('Bulk update failed: ' + error.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`PERMANENTLY DELETE ${selectedIds.size} employees? This cannot be undone.`)) {
      const idArray = Array.from(selectedIds);
      const previousEmployees = [...employees];

      // Optimistic update: Remove them from local state
      setEmployees(prev => prev.filter(emp => !idArray.includes(emp.id) && !idArray.includes(emp["EMPLOYEE ID"])));

      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .in('id', idArray);

        if (error) {
          const { error: error2 } = await supabase.from('employees').delete().in('employee_id', idArray);
          if (error2) throw error2;
        }

        setSelectedIds(new Set());
        fetchEmployees();
      } catch (error) {
        setEmployees(previousEmployees);
        console.error('Error in bulk delete:', error);
        alert('Delete failed: ' + error.message);
      }
    }
  };

  const handleActivateEmployee = async (id) => {
    if (window.confirm('RESTORE EMPLOYEE TO ACTIVE STATUS?')) {
      const previousEmployees = [...employees];
      setEmployees(prev => prev.map(emp => {
        if (emp.id === id || emp["EMPLOYEE ID"] === id) {
          return { 
            ...emp, 
            status: 'Permanent', 
            "Status *": 'Permanent',
            is_resigned: false, 
            resign_date: null 
          };
        }
        return emp;
      }));

      try {
        const updateData = { 
          status: 'Permanent',
          is_resigned: false,
          resign_date: null
        };

        const { error } = await supabase
          .from('employees')
          .update(updateData)
          .eq('id', id);
          
        if (error) {
          const { error: error2 } = await supabase.from('employees').update(updateData).eq('employee_id', id);
          if (error2) throw error2;
        }
        
        fetchEmployees();
        alert('Employee restored to ACTIVE status');
      } catch (error) {
        setEmployees(previousEmployees);
        console.error('ERROR ACTIVATING EMPLOYEE:', error);
        alert('Activation failed: ' + error.message);
      }
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('PERMANENTLY DELETE THIS RECORD? This cannot be undone.')) {
      const previousEmployees = [...employees];
      setEmployees(prev => prev.filter(emp => emp.id !== id && emp["EMPLOYEE ID"] !== id));

      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', id);

        if (error) {
          const { error: error2 } = await supabase.from('employees').delete().eq('employee_id', id);
          if (error2) throw error2;
        }

        fetchEmployees();
        alert('Employee record deleted permanently');
      } catch (error) {
        setEmployees(previousEmployees);
        console.error('Error in delete:', error);
        alert('Delete failed: ' + error.message);
      }
    }
  };

  const resetFilters = () => {
    setFilterDept('ALL DEPARTMENTS');
    setFilterPos('ALL POSITIONS');
    setFilterLevel('ALL LEVELS');
    setFilterStatus('ALL STATUSES');
  };

  const isFilterActive = useMemo(() => {
    return filterDept !== 'ALL DEPARTMENTS' || 
           filterPos !== 'ALL POSITIONS' || 
           filterLevel !== 'ALL LEVELS' || 
           filterStatus !== 'ALL STATUSES';
  }, [filterDept, filterPos, filterLevel, filterStatus]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 animate-fade-in font-outfit relative">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #E31E24;
        }
      `}</style>
      
      {/* 🚀 FIXED PREMIUM COMMAND CENTER */}
      <div className="bg-white border-b border-slate-200 z-30 shadow-sm shrink-0">
        <div className="max-w-[1400px] mx-auto p-4 space-y-3">
          
          {/* HEADER ROW */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#E31E24]/10 rounded-xl flex items-center justify-center text-[#E31E24]">
                <IconUsers size={22} stroke={2} />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-800 tracking-tight leading-none">Database Karyawan</h1>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-1.5">Sistem Manajemen & Informasi Karyawan</p>
              </div>
              <div className="h-6 w-[1px] bg-slate-200 ml-3 hidden md:block"></div>
              <div className="hidden md:flex bg-slate-100 p-1 rounded-xl">
                <ViewToggle active={viewMode === 'registry'} onClick={() => setViewMode('registry')} label="TABEL" icon={<IconTable size={14} />} />
                <ViewToggle active={viewMode === 'neural'} onClick={() => setViewMode('neural')} label="STRUKTUR" icon={<IconHierarchy2 size={14} />} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => setIsOnboardingOpen(true)} className="h-9 px-3 bg-white text-slate-600 shadow-sm border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:text-[#E31E24] hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5">
                <IconBolt size={14} className="text-[#E31E24]" /> Lifecycle
              </Button>
              <Button onClick={() => setIsBulkModalOpen(true)} className="h-9 px-3 bg-white text-slate-600 shadow-sm border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:text-blue-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5">
                <IconTable size={14} className="text-blue-500" /> Impor Bulk
              </Button>
              {isAdmin() && (
                <Button onClick={() => { setEditingEmployee(null); setIsAddModalOpen(true); }} className="h-9 px-4 bg-[#E31E24] text-white shadow-sm rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#C1181E] transition-all flex items-center justify-center gap-1.5">
                  <IconPlus size={14} /> Tambah Karyawan
                </Button>
              )}
            </div>
          </div>

          {/* STATS & QUICK ACTIONS */}
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full md:w-[680px] shrink-0">
              <MiniStat label="Total Karyawan" value={employees.length} color="text-slate-800" icon={<IconUsers size={16} />} />
              <MiniStat label="Aktif" value={employees.filter(e => !(e.is_resigned === true || String(e.status || "").toUpperCase() === 'RESIGNED' || !!e.resign_date)).length} color="text-emerald-600" icon={<IconUserCheck size={16} />} />
              <MiniStat label="Resigned" value={employees.filter(e => e.is_resigned === true || String(e.status || "").toUpperCase() === 'RESIGNED' || !!e.resign_date).length} color="text-rose-500" icon={<IconUserX size={16} />} />
              <MiniStat label="Unit / Departemen" value={new Set(employees.map(e => e?.["Organization Name *"]).filter(Boolean)).size} color="text-blue-600" icon={<IconBuildingSkyscraper size={16} />} />
            </div>
            
            <div className="flex-1 w-full relative">
              <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari karyawan berdasarkan nama atau ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-11 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-750 focus:outline-none focus:bg-white focus:border-[#E31E24]/30 focus:ring-1 focus:ring-[#E31E24]/20 transition-all placeholder:text-slate-400"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#E31E24] transition-all p-1 hover:bg-slate-100 rounded-md"
                >
                  <IconX size={14} stroke={3} />
                </button>
              )}
            </div>

            <div className="flex p-1 bg-slate-100 border border-slate-200/60 rounded-lg shrink-0">
              <TabButton active={activeTab === 'active'} onClick={() => { setActiveTab('active'); setViewMode('registry'); }} label="AKTIF" />
              <TabButton active={activeTab === 'resigned'} onClick={() => { setActiveTab('resigned'); setViewMode('registry'); }} label="RESIGNED" />
            </div>
          </div>

          {/* FILTER DECK - ULTRA COMPACT */}
          <div className="flex items-end gap-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
              <FilterSelect 
                label="UNIT" 
                value={filterDept} 
                options={['ALL DEPARTMENTS', ...Array.from(new Set(employees.map(e => e["Organization Name *"])))]} 
                onChange={setFilterDept} 
              />
              <FilterSelect 
                label="JABATAN" 
                value={filterPos} 
                options={['ALL POSITIONS', ...Array.from(new Set(employees.map(e => e["Job Position *"])))]} 
                onChange={setFilterPos} 
              />
              <FilterSelect 
                label="LEVEL" 
                value={filterLevel} 
                options={['ALL LEVELS', ...Array.from(new Set(employees.map(e => e["Job Level *"])))]} 
                onChange={setFilterLevel} 
              />
              <FilterSelect 
                label="STATUS KEPEGAWAIAN" 
                value={filterStatus} 
                options={['ALL STATUSES', ...Array.from(new Set(employees.map(e => e["Status *"])))]} 
                onChange={setFilterStatus} 
              />
            </div>
            {isFilterActive && (
              <button 
                onClick={resetFilters}
                className="h-9 px-4 bg-white shadow-sm border border-slate-200 rounded-lg text-slate-500 hover:text-[#E31E24] hover:bg-red-50/50 transition-all flex items-center gap-1.5 group shrink-0"
                title="Reset All Filters"
              >
                <IconRefresh size={14} className="group-hover:rotate-180 transition-all duration-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar flex flex-col min-h-0">
        <div className="flex-1 p-6 max-w-[1400px] mx-auto w-full flex flex-col pb-0 min-h-0 min-w-[1000px]">
          {viewMode === 'registry' ? (
            <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
                {/* 📌 STATIONARY HEADER TABLE */}
                <table className="w-full text-left border-separate border-spacing-0 table-fixed shrink-0">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="w-[5%] pl-6 py-3.5 bg-slate-50">
                        <div 
                          onClick={() => {
                            const allIds = filteredEmployees.map(emp => emp["EMPLOYEE ID"]);
                            if (filteredEmployees.length > 0 && selectedIds.size === filteredEmployees.length) {
                              setSelectedIds(new Set());
                            } else {
                              setSelectedIds(new Set(allIds));
                            }
                          }}
                          className={`w-4 h-4 rounded border transition-all flex items-center justify-center cursor-pointer mx-auto ${
                            filteredEmployees.length > 0 && selectedIds.size === filteredEmployees.length
                            ? 'bg-[#E31E24] border-[#E31E24] shadow-sm' 
                            : 'bg-white border-slate-300 hover:border-[#E31E24]'
                          }`}
                        >
                          {filteredEmployees.length > 0 && selectedIds.size === filteredEmployees.length && <IconCheck size={10} className="text-white" stroke={4} />}
                        </div>
                      </th>
                      <TableHead label="ID KARYAWAN" width="12%" />
                      <TableHead label="NAMA LENGKAP" width="28%" />
                      <TableHead label="DEPARTEMEN" width="15%" />
                      <TableHead label="JABATAN" width="15%" />
                      <TableHead label="STATUS" center width="15%" />
                      <TableHead label="AKSI" right width="15%" />
                    </tr>
                  </thead>
                </table>

                {/* 📜 SCROLLABLE DATA BODY */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white min-h-0">
                  <table className="w-full text-left border-separate border-spacing-0 table-fixed">
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="py-24 text-center">
                            <IconLoader2 className="mx-auto animate-spin text-[#E31E24]" size={40} />
                          </td>
                        </tr>
                      ) : filteredEmployees.length > 0 ? (
                        filteredEmployees.map((emp, idx) => (
                          <tr key={idx} className={`group hover:bg-slate-50/50 transition-all duration-150 ${selectedIds.has(emp["EMPLOYEE ID"]) ? 'bg-blue-50/20' : ''}`}>
                            <td className="w-[5%] pl-6 py-2.5">
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectRow(emp["EMPLOYEE ID"]);
                                }}
                                className={`w-4 h-4 rounded border transition-all flex items-center justify-center cursor-pointer mx-auto ${
                                  selectedIds.has(emp["EMPLOYEE ID"]) 
                                  ? 'bg-[#E31E24] border-[#E31E24] shadow-sm' 
                                  : 'bg-white border-slate-300 hover:border-[#E31E24]'
                                }`}
                              >
                                {selectedIds.has(emp["EMPLOYEE ID"]) && <IconCheck size={10} className="text-white" stroke={4} />}
                              </div>
                            </td>
                            <td className="w-[12%] px-4 py-2.5">
                              <span className="text-xs font-semibold text-slate-500 font-mono tracking-tighter uppercase">{emp["EMPLOYEE ID"] || 'N/A'}</span>
                            </td>
                            <td className="w-[28%] px-4 py-2.5">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 overflow-hidden">
                                  {emp["Photo"] || emp.photo ? (
                                    <img src={emp["Photo"] || emp.photo} alt={emp["EMPLOYEE NAME"]} className="w-full h-full object-cover" />
                                  ) : (
                                    emp["EMPLOYEE NAME"]?.[0] || 'A'
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0 leading-none">
                                  <span className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate mb-1">{emp["EMPLOYEE NAME"]}</span>
                                  <span className="text-[10px] text-slate-400 truncate tracking-wide lowercase">{emp["EMAIL"]}</span>
                                </div>
                              </div>
                            </td>
                            <td className="w-[15%] px-4 py-2.5">
                              <span className="text-xs font-medium text-slate-600 uppercase tracking-tight truncate block">{emp["Organization Name *"]}</span>
                            </td>
                            <td className="w-[15%] px-4 py-2.5">
                              <span className="text-xs font-medium text-slate-600 uppercase tracking-tight truncate block">{emp["Job Position *"]}</span>
                            </td>
                            <td className="w-[15%] px-4 py-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${
                                emp["Status *"] === 'Permanent' 
                                  ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                  : emp["Status *"] === 'RESIGNED'
                                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                                  : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                {emp["Status *"]?.toUpperCase()}
                              </span>
                            </td>
                            <td className="w-[15%] px-4 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <ActionButton onClick={() => {setSelectedEmployee(emp); setIsDossierOpen(true);}} icon={<IconEye size={14} />} hover="hover:text-blue-600 hover:bg-blue-50" label="LIHAT" />
                                <ActionButton onClick={() => {setEditingEmployee(emp); setIsAddModalOpen(true);}} icon={<IconEdit size={14} />} hover="hover:text-green-600 hover:bg-green-50" label="EDIT" />
                                {isAdmin() && (
                                  <>
                                    {emp.is_resigned || String(emp["Status *"] || emp.status || "").toUpperCase() === 'RESIGNED' ? (
                                      <ActionButton onClick={() => handleActivateEmployee(emp.id || emp["EMPLOYEE ID"])} icon={<IconUserCheck size={14} />} hover="hover:text-emerald-600 hover:bg-emerald-50" label="AKTIFKAN" />
                                    ) : (
                                      <ActionButton onClick={() => handleResignEmployee(emp["EMPLOYEE ID"] || emp.id)} icon={<IconUserX size={14} />} hover="hover:text-rose-600 hover:bg-rose-50" label="RESIGN" />
                                    )}
                                    <ActionButton onClick={() => handleDeleteEmployee(emp.id || emp["EMPLOYEE ID"])} icon={<IconTrash size={14} />} hover="hover:text-slate-800 hover:bg-slate-100" label="HAPUS" />
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-32 text-center text-slate-350 font-bold text-[12px] uppercase tracking-widest">
                            Tidak Ada Data Karyawan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 📌 STRUCTURAL FOOTER */}
                <div className="h-11 bg-slate-50 border-t border-slate-200 px-6 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">System Operational</span>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-200"></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      Terpilih: <span className="text-[#E31E24]">{selectedIds.size}</span> item
                    </span>
                    
                    {/* PAGINATION CONTROLS */}
                    <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
                    <div className="flex items-center gap-1">
                      <button 
                        disabled={currentPage === 1 || loading}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="h-6 w-6 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 hover:text-[#E31E24] disabled:opacity-30 disabled:hover:text-slate-450 transition-all shadow-sm"
                      >
                        <IconChevronDown size={14} className="rotate-90" />
                      </button>
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider min-w-[70px] text-center">
                        HALAMAN {currentPage} / {Math.ceil(totalEmployees / pageSize) || 1}
                      </span>
                      <button 
                        disabled={currentPage >= Math.ceil(totalEmployees / pageSize) || loading}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="h-6 w-6 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 hover:text-[#E31E24] disabled:opacity-30 disabled:hover:text-slate-450 transition-all shadow-sm"
                      >
                        <IconChevronDown size={14} className="-rotate-90" />
                      </button>
                    </div>

                    {selectedIds.size > 0 && (
                      <div className="flex items-center gap-2 animate-slide-in-left">
                        <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
                        <button 
                          onClick={handleBulkResign}
                          className="px-2.5 py-1 bg-slate-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-md hover:bg-slate-700 transition-all flex items-center gap-1"
                        >
                          <IconUserX size={12} /> Bulk Resign
                        </button>
                        <button 
                          onClick={handleBulkDelete}
                          className="px-2.5 py-1 bg-[#E31E24] text-white text-[9px] font-bold uppercase tracking-wider rounded-md hover:bg-[#C1181E] transition-all flex items-center gap-1"
                        >
                          <IconTrash size={12} /> Bulk Hapus
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Total: {totalEmployees} Records</span>
                    <div className="h-4 w-[1px] bg-slate-200"></div>
                    <span className="text-[9px] font-bold text-slate-405 uppercase tracking-wider">WKNsite CMS v1.2</span>
                  </div>
                </div>
            </div>
          ) : (
            <div className="flex-1 bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
              <OrgChart employees={filteredEmployees} />
            </div>
          )}
        </div>
      </div>

      <EmployeeDossier 
        employee={selectedEmployee} 
        isOpen={isDossierOpen} 
        onClose={() => setIsDossierOpen(false)} 
        onEdit={(emp) => {
          setEditingEmployee(emp);
          setIsAddModalOpen(true);
        }}
      />
      <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditingEmployee(null); }} onRefresh={fetchEmployees} editData={editingEmployee} />
      <OnboardingManager isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} employees={employees} />
      <IDCardGenerator isOpen={isIDGeneratorOpen} onClose={() => setIsIDGeneratorOpen(false)} employee={idTargetEmployee} />
      <DigitalSignature isOpen={isESignOpen} onClose={() => setIsESignOpen(false)} employee={eSignTargetEmployee} />
      <AuditTrail isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} employee={auditTargetEmployee} />
      <SalarySimulator isOpen={isSalarySimulatorOpen} onClose={() => setIsSalarySimulatorOpen(false)} employees={employees} />
      <BulkUploadModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} onRefresh={fetchEmployees} />
    </div>
  );
};

// UI ATOMS
const ViewToggle = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
      active 
        ? 'bg-slate-900 text-white shadow-sm' 
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
    }`}
  >
    {icon} {label}
  </button>
);

const MiniStat = ({ label, value, color, icon }) => (
  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between w-full">
    <div className="space-y-1 min-w-0">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
      <p className={`text-xl font-bold leading-none ${color}`}>{value}</p>
    </div>
    <div className="h-8 w-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
      {icon}
    </div>
  </div>
);

const TabButton = ({ active, onClick, label }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
      active 
        ? 'bg-white text-[#E31E24] shadow-sm border border-slate-200/40' 
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/30'
    }`}
  >
    {label}
  </button>
);

const FilterSelect = ({ label, value, options, onChange }) => (
  <div className="flex flex-col gap-1 flex-1 min-w-0">
    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">{label}</label>
    <div className="relative">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full appearance-none h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#E31E24]/30 focus:ring-1 focus:ring-[#E31E24]/20 transition-all hover:bg-slate-50 cursor-pointer uppercase tracking-wide"
      >
        {options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
      <IconChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

const TableHead = ({ label, center, right, width }) => (
  <th 
    style={{ width }} 
    className={`px-4 py-3 bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-wider ${
      center ? 'text-center' : ''
    } ${right ? 'text-right' : ''}`}
  >
    {label}
  </th>
);

const ActionButton = ({ onClick, icon, hover, label }) => (
  <div className="group/tip relative flex items-center justify-center">
    <button 
      onClick={onClick} 
      className={`h-7 w-7 flex items-center justify-center text-slate-400 hover:text-slate-750 hover:bg-slate-100 rounded-md border border-transparent hover:border-slate-200 transition-all`}
    >
      {icon}
    </button>
    <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] font-bold uppercase tracking-wider rounded shadow-md opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
      {label}
    </div>
  </div>
);

export default Employees;
