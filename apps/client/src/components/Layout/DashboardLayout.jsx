import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from "react-router-dom";
import { 
  IconUsers, 
  IconClock, 
  IconMapPin, 
  IconCreditCard, 
  IconLayoutDashboard, 
  IconPower, 
  IconSettings, 
  IconBell, 
  IconBrandWhatsapp,
  IconSearch,
  IconTrendingUp,
  IconSmartHome,
  IconMoon,
  IconWorld,
  IconBrain,
  IconSchool,
  IconSignature,
  IconArrowUpRight,
  IconRadar,
  IconArrowDownRight,
  IconRefresh,
  IconChartBar,
  IconShieldCheck,
  IconChevronRight,
  IconFileDescription,
  IconQrcode,
  IconShieldLock,
  IconLock,
  IconUserPlus,
  IconHierarchy2,
  IconFileExport,
  IconReceipt,
  IconBox,
  IconHeartbeat,
  IconClipboardCheck,
  IconLogout,
  IconHistory,
  IconBook,
  IconTrophy,
  IconId,
  IconShieldSearch,
  IconFileText,
  IconClipboardList,
  IconBuildingSkyscraper,
  IconMenu2,
  IconCalendarEvent,
  IconCalendarTime,
  IconEditCircle,
  IconClockPlay,
  IconPlus,
  IconDatabase,
  IconStar
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Clock, Users, CreditCard, Settings, Calendar, Bell } from "lucide-react";
import AIDiagnosticCenter from '../AI/AIDiagnosticCenter';
import CommandPalette from '../CommandPalette';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const DashboardLayout = ({ user: legacyUser, onLogout, children }) => {
  const { profile, can, PERMISSIONS } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const user = profile || legacyUser;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const isMobileViewport = window.innerWidth < 1024;
    if (isMobileViewport) return true;
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const [activeNavGroup, setActiveNavGroup] = useState(null);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/master/')) setActiveNavGroup('Data Master');
    else if (path.includes('/attendance/') || path.includes('/leave') || path.includes('/overtime')) setActiveNavGroup('Time & Attendance');
    else if (path.includes('/employees/') || path.includes('/performance') || path.includes('/academy') || path.includes('/documents')) setActiveNavGroup('Core HR');
    else if (path.includes('/finance') || path.includes('/payroll')) setActiveNavGroup('Finance & Payroll');
    else if (path.includes('/assets') || path.includes('/crm') || path.includes('/recruitment')) setActiveNavGroup('Operations');
    else if (path.includes('/company/announcements') || path.includes('/company/surveys') || path.includes('/company/wellness') || path.includes('/company/wiki')) setActiveNavGroup('Engagement & Komunikasi');
    else if (path.includes('/company/')) setActiveNavGroup('Pengembangan Organisasi');
    else if (path.includes('/reports/')) setActiveNavGroup('Data & Analytics');
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      if (window.innerWidth >= 1024) {
        localStorage.setItem('sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarCollapsed(true);
    }
  }, [location.pathname]);

  // Command Palette global listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close Notification Dropdown on Click Outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isNotificationOpen && !e.target.closest('#notification-container')) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationOpen]);

  // Close Profile Dropdown on Click Outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isProfileOpen && !e.target.closest('#profile-container')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/notifications', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        });
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifs();
  }, []);

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbMap = {
      '/overview': ['Dashboard', 'Overview'],
      
      // Data Master
      '/master/employees': ['Data Master', 'Database Karyawan'],
      '/master/dictionary': ['Data Master', 'Data Dictionary (Unified)'],
      
      // Time & Attendance
      '/attendance/report': ['Time & Attendance', 'Log Kehadiran'],
      '/attendance/location': ['Time & Attendance', 'Lokasi Kerja'],
      '/attendance/schedule': ['Time & Attendance', 'Jadwal & Shift'],
      '/attendance/correction': ['Time & Attendance', 'Koreksi Absen'],
      '/leave': ['Time & Attendance', 'Cuti & Izin'],
      '/overtime': ['Time & Attendance', 'Manajemen Lembur'],
      '/attendance/reports': ['Time & Attendance', 'Rekap Laporan Bulanan'],
      
      // Core HR
      '/employees/onboarding': ['Core HR', 'Onboarding Karyawan'],
      '/performance': ['Core HR', 'Kinerja Karyawan'],
      '/documents': ['Core HR', 'Dokumen Hub'],
      
      // Finance
      '/finance/salary': ['Finance & Payroll', 'Data Gaji Karyawan'],
      '/payroll': ['Finance & Payroll', 'Penggajian (Payroll)'],
      
      // Operations & Hub
      '/crm': ['Operations', 'CRM Sales'],
      '/recruitment': ['Operations', 'Rekrutmen'],
      '/academy': ['Operations', 'Akademi'],
      '/assets': ['Operations', 'Inventaris Aset'],
      '/assets/consumables': ['Operations', 'Consumables'],
      '/company/org-chart': ['Hub Perusahaan', 'Struktur Org'],
      '/company/announcements': ['Hub Perusahaan', 'Pengumuman / Broadcast'],
      '/company/timesheet': ['Hub Perusahaan', 'Timesheet'],
      '/company/wellness': ['Hub Perusahaan', 'Wellness & Sehat'],
      '/company/surveys': ['Hub Perusahaan', 'Survei Feedback'],
      '/company/grievance': ['Hub Perusahaan', 'Grievance Portal'],
      '/company/wiki': ['Hub Perusahaan', 'Wiki Kebijakan'],
      '/company/succession': ['Hub Perusahaan', 'Suksesi Karir'],
      '/company/offboarding': ['Hub Perusahaan', 'Offboarding'],
      '/admin': ['System', 'Administrasi Sistem']
    };

    const matched = Object.keys(breadcrumbMap)
      .sort((a, b) => b.length - a.length)
      .find(p => path === p || path.startsWith(p + '/'));
    return breadcrumbMap[matched] || ['Dashboard', 'Overview'];
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/overview')) return 'SYSTEM OVERVIEW';
    if (path.includes('/master/employees')) return 'DATABASE KARYAWAN';
    if (path.includes('/master/dictionary')) return 'DATA DICTIONARY';
    
    if (path.includes('/attendance/report')) return 'LOG KEHADIRAN';
    if (path.includes('/attendance/location')) return 'LOKASI KERJA';
    if (path.includes('/attendance/schedule')) return 'JADWAL & SHIFT';
    if (path.includes('/attendance/correction')) return 'KOREKSI ABSEN';
    if (path.includes('/attendance/recap')) return 'REKAP LAPORAN BULANAN';
    if (path.includes('/leave')) return 'CUTI & IZIN';
    if (path.includes('/attendance/overtime')) return 'MANAJEMEN LEMBUR';
    
    if (path.includes('/employees/onboarding')) return 'ONBOARDING KARYAWAN';
    if (path.includes('/performance')) return 'KINERJA KARYAWAN (KPI)';
    if (path.includes('/documents')) return 'DOKUMEN HUB';
    
    if (path.includes('/finance/salary')) return 'DATA GAJI KARYAWAN';
    if (path.includes('/payroll')) return 'PENGGAJIAN (PAYROLL)';
    
    if (path.includes('/assets/consumables')) return 'MANAGEMENT CONSUMABLES';
    if (path.includes('/assets')) return 'INVENTARIS ASET';
    if (path.includes('/crm')) return 'CRM & SALES QUOTATION';
    if (path.includes('/recruitment')) return 'REKRUTMEN KARYAWAN';
    if (path.includes('/academy')) return 'AKADEMI PEMBELAJARAN';
    if (path.includes('/company/org-chart')) return 'STRUKTUR ORGANISASI';
    if (path.includes('/company/timesheet')) return 'TIMESHEET KARYAWAN';
    if (path.includes('/company/wellness')) return 'WELLNESS & KESEHATAN';
    if (path.includes('/company/surveys')) return 'SURVEI & FEEDBACK';
    if (path.includes('/company/grievance')) return 'PORTAL GRIEVANCE';
    if (path.includes('/company/wiki')) return 'WIKI & KEBIJAKAN';
    if (path.includes('/company/succession')) return 'MANAJEMEN SUKSESI';
    if (path.includes('/company/offboarding')) return 'OFFBOARDING KARYAWAN';
    if (path.includes('/admin')) return 'ADMINISTRASI SISTEM';
    return 'SYSTEM OVERVIEW';
  };

  return (
    <div className="admin-dashboard-layout flex h-screen bg-background overflow-hidden font-inter animate-fade-in text-[13px]">
      {/* Sidebar Backdrop on Mobile */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Clean Modern Flat Sidebar */}
      <aside className={`bg-white flex flex-col shrink-0 border-r border-slate-200 transition-all duration-300 fixed lg:relative inset-y-0 left-0 z-50 lg:translate-x-0 lg:flex ${
        isSidebarCollapsed 
          ? '-translate-x-full lg:w-20' 
          : 'translate-x-0 w-[260px]'
      }`}>
        <div className={`h-16 flex items-center border-b border-slate-100 shrink-0 bg-white transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6 gap-3'}`}>
          <img src="/assets/wkn_logo.png" alt="WKN" className="h-6 w-auto object-contain" />
          {!isSidebarCollapsed && (
            <div className="flex flex-col animate-fade-in min-w-0">
              <h1 className="font-outfit font-black text-lg text-slate-800 tracking-tight leading-none">WKN<span className="text-[#E31E24]">site</span></h1>
              <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-0.5 truncate">Corporate Management System</span>
            </div>
          )}
        </div>


        <nav className={`flex-1 space-y-1 overflow-y-auto py-6 custom-scrollbar scroll-smooth transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
          {/* Main/General Section */}
          <div className="space-y-1">
            <NavItem icon={<IconLayoutDashboard size={15} />} label="Overview" to="/overview" isCollapsed={isSidebarCollapsed} />
          </div>

          {/* Quick Access / Favorites */}
          <div className={`py-3 space-y-1 transition-all duration-300 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
             <div className="px-4 mb-1.5 flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest">
               <IconStar size={12} className="text-amber-400 fill-amber-400" />
               <span>Quick Access</span>
             </div>
             {can(PERMISSIONS.VIEW_WORKFORCE) && (
               <NavItem icon={<IconClock size={15} />} label="Log Kehadiran" to="/attendance/report" isCollapsed={isSidebarCollapsed} />
             )}
             {can(PERMISSIONS.MANAGE_ATTENDANCE) && (
               <NavItem icon={<IconClipboardCheck size={15} />} label="Cuti & Izin" to="/leave" isCollapsed={isSidebarCollapsed} />
             )}
             {can(PERMISSIONS.VIEW_WORKFORCE) && (
               <NavItem icon={<IconUsers size={15} />} label="Data Karyawan" to="/master/employees" isCollapsed={isSidebarCollapsed} />
             )}
          </div>

          <div className="h-px bg-slate-100 mx-4 my-2"></div>

          {/* Data Master Group */}
          <NavGroup 
            label="Data Master" 
            isCollapsed={isSidebarCollapsed}
            isExpanded={activeNavGroup === 'Data Master'}
            onToggle={() => setActiveNavGroup(activeNavGroup === 'Data Master' ? null : 'Data Master')}
          >
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconUsers size={15} />} label="Database Karyawan" to="/master/employees" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconDatabase size={15} />} label="Data Dictionary" to="/master/dictionary" />
            )}
          </NavGroup>

          {/* Time & Attendance Group */}
          <NavGroup 
            label="Time & Attendance" 
            isCollapsed={isSidebarCollapsed}
            isExpanded={activeNavGroup === 'Time & Attendance'}
            onToggle={() => setActiveNavGroup(activeNavGroup === 'Time & Attendance' ? null : 'Time & Attendance')}
          >
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconClock size={15} />} label="Log Kehadiran" to="/attendance/report" />
            )}
            {can(PERMISSIONS.MANAGE_ATTENDANCE) && (
              <NavItem icon={<IconMapPin size={15} />} label="Lokasi Kerja" to="/attendance/location" />
            )}
            {can(PERMISSIONS.MANAGE_ATTENDANCE) && (
              <NavItem icon={<IconRadar size={15} />} label="Live Tracking" to="/attendance/tracking" />
            )}
            {can(PERMISSIONS.MANAGE_ATTENDANCE) && (
              <NavItem icon={<IconCalendarTime size={15} />} label="Jadwal & Shift" to="/attendance/schedule" />
            )}
            {can(PERMISSIONS.MANAGE_ATTENDANCE) && (
              <NavItem icon={<IconEditCircle size={15} />} label="Koreksi Absen" to="/attendance/correction" />
            )}
            {can(PERMISSIONS.MANAGE_ATTENDANCE) && (
              <NavItem icon={<IconClipboardCheck size={15} />} label="Cuti & Izin" to="/leave" />
            )}
            {can(PERMISSIONS.MANAGE_ATTENDANCE) && (
              <NavItem icon={<IconClockPlay size={15} />} label="Manajemen Lembur" to="/attendance/overtime" />
            )}
            {can(PERMISSIONS.MANAGE_ATTENDANCE) && (
              <NavItem icon={<IconChartBar size={15} />} label="Rekap Laporan" to="/attendance/recap" />
            )}
          </NavGroup>

          {/* Core HR Group */}
          <NavGroup 
            label="Core HR" 
            isCollapsed={isSidebarCollapsed}
            isExpanded={activeNavGroup === 'Core HR'}
            onToggle={() => setActiveNavGroup(activeNavGroup === 'Core HR' ? null : 'Core HR')}
          >
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconUserPlus size={15} />} label="Onboarding Karyawan" to="/employees/onboarding" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconTrophy size={15} />} label="Kinerja Karyawan" to="/performance" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconSchool size={15} />} label="Akademi" to="/academy" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconTrophy size={15} />} label="Gamifikasi & Hadiah" to="/gamification" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconFileText size={15} />} label="Dokumen Hub" to="/documents" />
            )}
          </NavGroup>

          {/* Finance & Payroll Group */}
          <NavGroup 
            label="Finance & Payroll" 
            isCollapsed={isSidebarCollapsed}
            isExpanded={activeNavGroup === 'Finance & Payroll'}
            onToggle={() => setActiveNavGroup(activeNavGroup === 'Finance & Payroll' ? null : 'Finance & Payroll')}
          >
            {can(PERMISSIONS.MANAGE_PAYROLL) && (
              <NavItem icon={<IconReceipt size={15} />} label="Data Gaji Karyawan" to="/finance/salary" />
            )}
            {can(PERMISSIONS.MANAGE_PAYROLL) && (
              <NavItem icon={<IconCreditCard size={15} />} label="Penggajian (Payroll)" to="/payroll" />
            )}
          </NavGroup>

          {/* Operations Group */}
          <NavGroup 
            label="Operations" 
            isCollapsed={isSidebarCollapsed}
            isExpanded={activeNavGroup === 'Operations'}
            onToggle={() => setActiveNavGroup(activeNavGroup === 'Operations' ? null : 'Operations')}
          >
            {can(PERMISSIONS.VIEW_CRM) && (
              <NavItem icon={<IconTrendingUp size={15} />} label="CRM Sales" to="/crm" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconUserPlus size={15} />} label="Rekrutmen" to="/recruitment" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconBox size={15} />} label="Inventaris Aset" to="/assets" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconQrcode size={15} />} label="Consumables" to="/assets/consumables" />
            )}
          </NavGroup>

          {/* Komunikasi & Engagement */}
          <NavGroup 
            label="Engagement & Komunikasi" 
            isCollapsed={isSidebarCollapsed}
            isExpanded={activeNavGroup === 'Engagement & Komunikasi'}
            onToggle={() => setActiveNavGroup(activeNavGroup === 'Engagement & Komunikasi' ? null : 'Engagement & Komunikasi')}
          >
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconBell size={15} />} label="Pengumuman (News)" to="/company/announcements" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconBrandWhatsapp size={15} />} label="WA Broadcast" to="/company/broadcast" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconHeartbeat size={15} />} label="Wellness & Sehat" to="/company/wellness" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconClipboardList size={15} />} label="Survei Feedback" to="/company/surveys" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconShieldSearch size={15} />} label="Grievance Portal" to="/company/grievance" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconBook size={15} />} label="Wiki Kebijakan" to="/company/wiki" />
            )}
          </NavGroup>

          {/* Pengembangan Organisasi */}
          <NavGroup 
            label="Pengembangan Organisasi" 
            isCollapsed={isSidebarCollapsed}
            isExpanded={activeNavGroup === 'Pengembangan Organisasi'}
            onToggle={() => setActiveNavGroup(activeNavGroup === 'Pengembangan Organisasi' ? null : 'Pengembangan Organisasi')}
          >
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconHierarchy2 size={15} />} label="Struktur Org" to="/company/org-chart" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconHistory size={15} />} label="Timesheet" to="/company/timesheet" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconTrendingUp size={15} />} label="Suksesi Karir" to="/company/succession" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconLogout size={15} />} label="Offboarding" to="/company/offboarding" />
            )}
          </NavGroup>

          {/* Data & Analytics */}
          <NavGroup 
            label="Data & Analytics" 
            isCollapsed={isSidebarCollapsed}
            isExpanded={activeNavGroup === 'Data & Analytics'}
            onToggle={() => setActiveNavGroup(activeNavGroup === 'Data & Analytics' ? null : 'Data & Analytics')}
          >
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconFileExport size={15} />} label="Report Builder" to="/reports/builder" />
            )}
          </NavGroup>

          {/* Administrasi Sistem */}
          {can(PERMISSIONS.ACCESS_ADMIN_PANEL) && (
            <div className={`pt-4 border-t border-white/20 mt-4 space-y-1 transition-all duration-300 ${isSidebarCollapsed ? 'px-0' : ''}`}>
              <NavItem icon={<IconSettings size={15} />} label="Administrasi Sistem" to="/admin" isCollapsed={isSidebarCollapsed} />
            </div>
          )}
        </nav>

        <div className={`mt-auto border-t border-slate-100 bg-white transition-all duration-300 p-4`}>
          <button 
            onClick={onLogout}
            title={isSidebarCollapsed ? "Sign Out Session" : undefined}
            className={`flex items-center justify-center bg-slate-50 text-slate-600 font-semibold hover:bg-red-50 hover:text-[#E31E24] active:scale-[0.96] transition-all duration-200 group ${
              isSidebarCollapsed 
                ? 'w-10 h-10 rounded-lg mx-auto' 
                : 'w-full h-11 gap-3 px-4 rounded-lg text-sm'
            }`}
          >
            <IconPower size={18} className="text-slate-500 group-hover:text-[#E31E24] transition-colors" />
            {!isSidebarCollapsed && <span>Sign Out Session</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 shadow-sm">
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-4">
              {/* Toggle Sidebar Button */}
              <button 
                onClick={toggleSidebar}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-[#E31E24] active:scale-[0.92] transition-all duration-200 select-none shrink-0"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <IconMenu2 size={18} />
              </button>

              {/* On mobile, show current page title. On desktop, show breadcrumbs */}
              <div className="md:hidden flex items-center min-w-0">
                <span className="text-sm font-semibold text-slate-800 truncate">{getPageTitle()}</span>
              </div>

              <div className="hidden md:block h-3 w-[1px] bg-slate-200 shrink-0"></div>

              {/* Breadcrumb & Clock Container */}
              <div className="hidden md:flex flex-col gap-1">
                {/* Minimalist Breadcrumbs */}
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <span className="hover:text-[#E31E24] cursor-pointer transition-colors text-slate-700">WKNsite</span>
                  <span className="text-slate-400">/</span>
                  {getBreadcrumbs().map((part, index, arr) => (
                    <React.Fragment key={index}>
                      <span className={index === arr.length - 1 ? 'text-slate-800 font-bold' : ''}>{part}</span>
                      {index < arr.length - 1 && <span className="text-slate-400">/</span>}
                    </React.Fragment>
                  ))}
                </div>
                {/* Clock directly under WKNsite */}
                <div className="flex items-center gap-1.5 pl-0.5 mt-0.5">
                  <span className="text-xs text-slate-500">{formatDate(currentTime)}</span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-xs font-mono font-medium text-slate-600">{formatTime(currentTime)}</span>
                </div>
              </div>



              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full">
                <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">System Healthy</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-center px-4">
            {/* Visual Trigger for Command Palette */}
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden lg:flex items-center w-full max-w-sm bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all duration-200 rounded-lg px-4 py-2 text-slate-500 group"
            >
              <IconSearch size={16} className="text-slate-500 group-hover:text-slate-500 mr-2" />
              <span className="text-sm font-medium mr-auto text-slate-500">Cari menu, halaman, dsb...</span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 font-mono text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-md">
                <span>Ctrl</span>K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-transparent p-1 relative" id="notification-container">
              <button 
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#E31E24] hover:bg-[#C1181E] text-white rounded-lg active:scale-[0.96] hover:shadow-md transition-all duration-200 text-sm font-semibold shadow-sm"
                title="Tindakan Cepat"
              >
                <IconPlus size={16} />
                <span>Quick Add</span>
              </button>
              
              <button 
                onClick={() => setIsDiagnosticsOpen(true)}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 text-[#E31E24] active:scale-[0.92] transition-all duration-200 relative group"
                title="AI Diagnostics"
              >
                <IconBrain size={18} />
              </button>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`h-10 w-10 flex items-center justify-center rounded-lg active:scale-[0.92] transition-all duration-200 relative ${
                  isNotificationOpen ? 'bg-slate-200 text-[#E31E24]' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
                title="Notifications"
              >
                <IconBell size={18} />
                <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute top-14 right-0 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in-down z-50">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Notifikasi</h3>
                    <button className="text-xs font-bold text-slate-500 hover:text-[#E31E24]">Tandai Dibaca</button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-red-50/20' : ''}`}>
                        <div className="flex gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                            notif.type === 'overtime' ? 'bg-blue-100 text-blue-600' :
                            notif.type === 'correction' ? 'bg-amber-100 text-amber-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {notif.type === 'overtime' ? <IconClockPlay size={14} /> : 
                             notif.type === 'correction' ? <IconEditCircle size={14} /> : 
                             <IconBell size={14} />}
                          </div>
                          <div>
                            <h4 className={`text-[11px] font-bold ${!notif.isRead ? 'text-slate-800' : 'text-slate-600'}`}>{notif.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{notif.desc}</p>
                            <span className="text-xs font-semibold text-slate-500 mt-1 block">{notif.time}</span>
                          </div>
                          {!notif.isRead && (
                            <div className="h-2 w-2 bg-[#E31E24] rounded-full shrink-0 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 bg-slate-50 border-t border-white/20 text-center">
                    <button className="text-xs font-bold text-[#E31E24] uppercase tracking-widest w-full py-1.5 hover:bg-[#E31E24]/10 rounded-lg transition-colors">
                      Lihat Semua
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
            
            <div className="relative" id="profile-container">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 rounded-full active:scale-[0.98] transition-all duration-200 hover:bg-slate-100 border border-transparent hover:border-slate-200"
              >
                <div className="hidden md:flex flex-col items-end pl-2">
                  <span className="text-sm font-semibold text-slate-800 leading-tight">{user?.fullName || user?.full_name || 'Administrator'}</span>
                  <span className="text-xs font-medium text-[#E31E24] capitalize">{user?.role || 'Owner'}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-700">
                  {(user?.fullName || user?.full_name)?.split(' ').map(n => n[0]).join('') || 'A'}
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute top-16 right-0 w-64 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in-down z-50">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <p className="text-sm font-bold text-slate-800">{user?.fullName || user?.full_name || 'Administrator'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'admin@wijayakn.com'}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                      <IconId size={16} className="text-slate-500" />
                      My Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                      <IconSettings size={16} className="text-slate-500" />
                      Preferences
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTheme();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <IconMoon size={16} className="text-slate-500" />
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                      <span className="ml-auto text-xs font-bold bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded uppercase">New</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-white/20">
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold text-[#E31E24] hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <IconLogout size={16} />
                      Log Out Securely
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0 relative">
          {children}
        </div>
      </main>

      <AIDiagnosticCenter isOpen={isDiagnosticsOpen} onClose={() => setIsDiagnosticsOpen(false)} />
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </div>
  );
};

const NavGroup = ({ label, isCollapsed, isExpanded, onToggle, children }) => {
  // Check if any of children exist (are visible based on permission checks)
  const hasVisibleChildren = React.Children.toArray(children).some(child => child !== null && child !== undefined && child !== false);

  if (!hasVisibleChildren) return null;

  if (isCollapsed) {
    return (
      <div className="py-2 border-t border-slate-100 my-2 first:border-t-0 space-y-1">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { isCollapsed: true });
          }
          return child;
        })}
      </div>
    );
  }

  return (
    <div className="mb-2">
      <div 
        className={`px-4 py-2 flex items-center justify-between text-[11px] font-bold tracking-wider select-none cursor-pointer transition-colors group ${isExpanded ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
        onClick={onToggle}
      >
        <span>{label}</span>
        <IconChevronRight size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-slate-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
      </div>
      <div className={`space-y-0.5 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, to, isCollapsed, end = true }) => (
  <NavLink 
    to={to}
    end={end}
    title={isCollapsed ? label : undefined}
    className={({ isActive }) => `
      relative flex items-center rounded-lg text-[13px] font-medium transition-all duration-200 group
      ${isCollapsed ? 'w-10 h-10 justify-center mx-auto' : 'w-full px-4 py-2.5 gap-3'}
      ${isActive 
        ? 'bg-red-50 text-[#E31E24]' 
        : 'text-slate-600 hover:text-[#E31E24] hover:bg-slate-50'}
    `}
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <span className={`absolute bg-[#E31E24] rounded-r transition-all ${isCollapsed ? 'left-0 top-2 bottom-2 w-[3px]' : 'left-0 top-1.5 bottom-1.5 w-[3px]'}`} />
        )}
        <span className={`transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 ${isActive ? 'text-[#E31E24]' : 'text-slate-500 group-hover:text-[#E31E24]'}`}>
          {icon}
        </span>
        {!isCollapsed && <span className="animate-fade-in transition-transform duration-300 ease-out group-hover:translate-x-1">{label}</span>}
      </>
    )}
  </NavLink>
);

export default DashboardLayout;
