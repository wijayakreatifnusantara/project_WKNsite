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
  IconSearch,
  IconTrendingUp,
  IconSmartHome,
  IconMoon,
  IconWorld,
  IconBrain,
  IconSchool,
  IconSignature,
  IconArrowUpRight,
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
  IconClockPlay
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Clock, Users, CreditCard, Settings, Calendar, Bell } from "lucide-react";
import AIDiagnosticCenter from '../AI/AIDiagnosticCenter';
import { useAuth } from '@/context/AuthContext';

const DashboardLayout = ({ user: legacyUser, onLogout, children }) => {
  const { profile, can, PERMISSIONS } = useAuth();
  const location = useLocation();
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const user = profile || legacyUser;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const isMobileViewport = window.innerWidth < 1024;
    if (isMobileViewport) return true;
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

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

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbMap = {
      '/overview': ['Dashboard', 'Overview'],
      
      // Data Master
      '/master/employees': ['Data Master', 'Database Karyawan'],
      '/master/divisions': ['Data Master', 'Divisi, Dept & Jabatan'],
      '/master/positions': ['Data Master', 'Jabatan & Golongan'],
      '/master/shifts': ['Data Master', 'Shift & Libur Nasional'],
      
      // Time & Attendance
      '/attendance/log': ['Time & Attendance', 'Log Kehadiran'],
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
    if (path.includes('/master/divisions')) return 'Divisi, Dept & Jabatan';
    if (path.includes('/master/positions')) return 'JABATAN & GOLONGAN';
    if (path.includes('/master/shifts')) return 'SHIFT & LIBUR NASIONAL';
    
    if (path.includes('/attendance/log')) return 'LOG KEHADIRAN';
    if (path.includes('/attendance/location')) return 'LOKASI KERJA';
    if (path.includes('/attendance/schedule')) return 'JADWAL & SHIFT';
    if (path.includes('/attendance/correction')) return 'KOREKSI ABSEN';
    if (path.includes('/attendance/reports')) return 'REKAP LAPORAN BULANAN';
    if (path.includes('/leave')) return 'CUTI & IZIN';
    if (path.includes('/overtime')) return 'MANAJEMEN LEMBUR';
    
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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter animate-fade-in text-[11px]">
      {/* Sidebar Backdrop on Mobile */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Clean White Sidebar */}
      <aside className={`bg-white flex flex-col shrink-0 border-r border-slate-200/80 transition-all duration-300 fixed lg:relative inset-y-0 left-0 z-50 shadow-2xl lg:shadow-none lg:translate-x-0 lg:flex ${
        isSidebarCollapsed 
          ? '-translate-x-full lg:w-20' 
          : 'translate-x-0 w-72'
      }`}>
        <div className={`h-16 flex items-center border-b border-slate-100 shrink-0 bg-white transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6 gap-2.5'}`}>
          <img src="/assets/wkn_logo.png" alt="WKN" className="h-6 w-auto object-contain" />
          {!isSidebarCollapsed && (
            <div className="flex flex-col animate-fade-in">
              <h1 className="font-outfit font-black text-base text-slate-800 tracking-tight leading-none">WKN<span className="text-[#E31E24]">site</span></h1>
              <span className="text-[7px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Corporate Management System</span>
            </div>
          )}
        </div>


        <nav className={`flex-1 space-y-1 overflow-y-auto py-6 custom-scrollbar scroll-smooth transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
          {/* Main/General Section */}
          <div className="space-y-1">
            <NavItem icon={<IconLayoutDashboard size={15} />} label="Overview" to="/overview" isCollapsed={isSidebarCollapsed} />
          </div>

          {/* Data Master Group */}
          <NavGroup label="Data Master" isCollapsed={isSidebarCollapsed}>
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconUsers size={15} />} label="Database Karyawan" to="/master/employees" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconBuildingSkyscraper size={15} />} label="Divisi, Dept & Jabatan" to="/master/divisions" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconCalendarEvent size={15} />} label="Shift & Libur Nasional" to="/master/shifts" />
            )}
          </NavGroup>

          {/* Time & Attendance Group */}
          <NavGroup label="Time & Attendance" isCollapsed={isSidebarCollapsed}>
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconClock size={15} />} label="Log Kehadiran" to="/attendance/log" />
            )}
            {can(PERMISSIONS.MANAGE_ATTENDANCE) && (
              <NavItem icon={<IconMapPin size={15} />} label="Lokasi Kerja" to="/attendance/location" />
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
              <NavItem icon={<IconClockPlay size={15} />} label="Manajemen Lembur" to="/overtime" />
            )}
            {can(PERMISSIONS.MANAGE_ATTENDANCE) && (
              <NavItem icon={<IconChartBar size={15} />} label="Rekap Laporan" to="/attendance/reports" />
            )}
          </NavGroup>

          {/* Core HR Group */}
          <NavGroup label="Core HR" isCollapsed={isSidebarCollapsed}>
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconUserPlus size={15} />} label="Onboarding Karyawan" to="/employees/onboarding" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconTrophy size={15} />} label="Kinerja Karyawan" to="/performance" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconFileText size={15} />} label="Dokumen Hub" to="/documents" />
            )}
          </NavGroup>

          {/* Finance & Payroll Group */}
          <NavGroup label="Finance & Payroll" isCollapsed={isSidebarCollapsed}>
            {can(PERMISSIONS.MANAGE_PAYROLL) && (
              <NavItem icon={<IconReceipt size={15} />} label="Data Gaji Karyawan" to="/finance/salary" />
            )}
            {can(PERMISSIONS.MANAGE_PAYROLL) && (
              <NavItem icon={<IconCreditCard size={15} />} label="Penggajian (Payroll)" to="/payroll" />
            )}
          </NavGroup>

          {/* Operations Group */}
          <NavGroup label="Operations" isCollapsed={isSidebarCollapsed}>
            {can(PERMISSIONS.VIEW_CRM) && (
              <NavItem icon={<IconTrendingUp size={15} />} label="CRM Sales" to="/crm" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconUserPlus size={15} />} label="Rekrutmen" to="/recruitment" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconSchool size={15} />} label="Akademi" to="/academy" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconBox size={15} />} label="Inventaris Aset" to="/assets" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconQrcode size={15} />} label="Consumables" to="/assets/consumables" />
            )}
          </NavGroup>

          {/* Hub Perusahaan */}
          <NavGroup label="Hub Perusahaan" isCollapsed={isSidebarCollapsed}>
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconHierarchy2 size={15} />} label="Struktur Org" to="/company/org-chart" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconBell size={15} />} label="Pengumuman / Broadcast" to="/company/announcements" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconHistory size={15} />} label="Timesheet" to="/company/timesheet" />
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
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconTrendingUp size={15} />} label="Suksesi Karir" to="/company/succession" />
            )}
            {can(PERMISSIONS.VIEW_WORKFORCE) && (
              <NavItem icon={<IconLogout size={15} />} label="Offboarding" to="/company/offboarding" />
            )}
          </NavGroup>

          {/* Administrasi Sistem */}
          {can(PERMISSIONS.ACCESS_ADMIN_PANEL) && (
            <div className={`pt-4 border-t border-slate-100 mt-4 space-y-1 transition-all duration-300 ${isSidebarCollapsed ? 'px-0' : ''}`}>
              <NavItem icon={<IconSettings size={15} />} label="Administrasi Sistem" to="/admin" isCollapsed={isSidebarCollapsed} />
            </div>
          )}
        </nav>

        <div className={`mt-auto border-t border-slate-100 bg-white transition-all duration-300 ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
          <button 
            onClick={onLogout}
            title={isSidebarCollapsed ? "Sign Out Session" : undefined}
            className={`flex items-center justify-center bg-slate-50 text-slate-500 font-bold uppercase tracking-wider hover:text-[#E31E24] hover:bg-red-50/50 border border-slate-200/60 transition-all active:scale-98 group ${
              isSidebarCollapsed 
                ? 'w-10 h-10 rounded-lg mx-auto' 
                : 'w-full h-11 gap-2.5 px-4 rounded-lg text-[9.5px]'
            }`}
          >
            <IconPower size={16} className="text-slate-400 group-hover:text-[#E31E24] transition-colors" />
            {!isSidebarCollapsed && <span>Sign Out Session</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 shrink-0 z-10">
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-3">
              {/* Toggle Sidebar Button */}
              <button 
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200/80 text-slate-500 hover:text-[#E31E24] hover:bg-slate-100 transition-all select-none active:scale-95 shrink-0"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <IconMenu2 size={16} />
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
                  <span className="text-slate-300">/</span>
                  {getBreadcrumbs().map((part, index, arr) => (
                    <React.Fragment key={index}>
                      <span className={index === arr.length - 1 ? 'text-slate-800 font-bold' : ''}>{part}</span>
                      {index < arr.length - 1 && <span className="text-slate-300">/</span>}
                    </React.Fragment>
                  ))}
                </div>
                {/* Clock directly under WKNsite */}
                <div className="flex items-center gap-1.5 pl-0.5 mt-0.5">
                  <span className="text-xs text-slate-500">{formatDate(currentTime)}</span>
                  <span className="text-slate-300 text-xs">•</span>
                  <span className="text-xs font-mono font-medium text-slate-600">{formatTime(currentTime)}</span>
                </div>
              </div>



              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full">
                <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-semibold text-emerald-700 uppercase tracking-wider">System Healthy</span>
              </div>
            </div>
          </div>

          <div className="flex-1"></div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 p-1 rounded-xl">
              <button 
                onClick={() => setIsDiagnosticsOpen(true)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-[#E31E24] hover:bg-red-50 transition-all relative group"
                title="AI Diagnostics"
              >
                <IconBrain size={16} />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-red-500 rounded-full border border-white"></span>
              </button>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-all" title="Notifications">
                <IconBell size={16} />
              </button>
            </div>
            
            <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
            
            <div className="flex items-center gap-2.5 pl-1">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-700 leading-tight">{user?.fullName || user?.full_name || 'Administrator'}</span>
                <span className="text-[9px] font-bold text-[#E31E24] uppercase tracking-widest">{user?.role || 'Owner'}</span>
              </div>
              <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200/85 flex items-center justify-center text-xs font-bold text-slate-700">
                {(user?.fullName || user?.full_name)?.split(' ').map(n => n[0]).join('') || 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0 relative">
          {children}
        </div>
      </main>

      <AIDiagnosticCenter isOpen={isDiagnosticsOpen} onClose={() => setIsDiagnosticsOpen(false)} />
    </div>
  );
};

const NavGroup = ({ label, isCollapsed, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Check if any of children exist (are visible based on permission checks)
  const hasVisibleChildren = React.Children.toArray(children).some(child => child !== null && child !== undefined && child !== false);

  if (!hasVisibleChildren) return null;

  if (isCollapsed) {
    return (
      <div className="py-2 border-t border-slate-100/80 my-2 first:border-t-0 space-y-1">
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
        className="px-4 py-2 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none cursor-pointer hover:text-slate-600 transition-colors group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{label}</span>
        <IconChevronRight size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} text-slate-300 group-hover:text-slate-500`} />
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
      relative flex items-center rounded-lg text-sm font-medium transition-all duration-200 group
      ${isCollapsed ? 'w-10 h-10 justify-center mx-auto' : 'w-full px-4 py-2 gap-3'}
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
        <span className={`transition-transform group-hover:scale-105 duration-200 ${isActive ? 'text-[#E31E24]' : 'text-slate-400 group-hover:text-[#E31E24]'}`}>
          {icon}
        </span>
        {!isCollapsed && <span className="animate-fade-in">{label}</span>}
      </>
    )}
  </NavLink>
);

export default DashboardLayout;
