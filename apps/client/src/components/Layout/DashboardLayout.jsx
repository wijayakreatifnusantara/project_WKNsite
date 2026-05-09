import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from "react-router-dom";
import { 
  IconUsers, 
  IconClock, 
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
  IconClipboardList
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
  const [globalSearch, setGlobalSearch] = useState('');
  const user = profile || legacyUser;

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
    if (path.includes('/dashboard')) return 'STRATEGIC DASHBOARD';
    if (path.includes('/employees')) return 'WORKFORCE REGISTRY';
    if (path.includes('/payroll')) return 'TREASURY OPERATIONS';
    if (path.includes('/finance/invoices')) return 'REVENUE MANAGEMENT';
    if (path.includes('/crm/pipeline')) return 'SALES PIPELINE';
    if (path.includes('/crm/clients')) return 'CUSTOMER PORTFOLIO';
    if (path.includes('/crm/quotations')) return 'QUOTATION BUILDER';
    if (path.includes('/documents')) return 'DOCUMENT CENTER';
    if (path.includes('/assets')) return 'ASSET TRACKING';
    if (path.includes('/performance')) return 'PERFORMANCE KPI';
    if (path.includes('/academy')) return 'ACADEMY & TRAINING';
    if (path.includes('/recruitment')) return 'TALENT ACQUISITION';
    if (path.includes('/attendance')) return 'ATTENDANCE & TIME';
    if (path.includes('/leave')) return 'LEAVE MANAGEMENT';
    if (path.includes('/expenses')) return 'EXPENSE CLAIMS';
    if (path.includes('/org-chart')) return 'ORGANIZATION CHART';
    if (path.includes('/consumables')) return 'OFFICE CONSUMABLES';
    if (path.includes('/wiki')) return 'CORPORATE HANDBOOK';
    if (path.includes('/wellness')) return 'HEALTH & WELLNESS';
    if (path.includes('/surveys')) return 'VOICE OF PERSONNEL';
    if (path.includes('/timesheet')) return 'PROJECT TIMESHEETS';
    if (path.includes('/offboarding')) return 'EXIT MANAGEMENT';
    if (path.includes('/succession')) return 'SUCCESSION PLANNING';
    if (path.includes('/grievance')) return 'GRIEVANCE PORTAL';
    if (path.includes('/me/card')) return 'DIGITAL BUSINESS CARD';
    if (path.includes('/settings')) return 'SYSTEM SETTINGS';
    if (path.includes('/admin/users')) return 'USER MANAGEMENT';
    if (path.includes('/admin/rbac')) return 'ACCESS CONTROL (RBAC)';
    if (path.includes('/admin/audit-trail')) return 'SECURITY AUDIT TRAIL';
    return 'SYSTEM OVERVIEW';
  };

  const [openSections, setOpenSections] = useState({
    crm: true, hr: true, finance: true, admin: true, company: true, personal: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden font-inter animate-fade-in">
      {/* Neumorphic Sidebar */}
      <aside className="w-72 bg-[#f0f2f5] flex flex-col hidden lg:flex shrink-0 relative z-20 shadow-[10px_0_30px_-10px_rgba(0,0,0,0.05)]">
        <div className="h-24 flex flex-col justify-center items-center px-6 border-b border-white/30 shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <img src="/assets/wkn_logo.png" alt="WKN" className="h-7 w-auto object-contain" />
            <h1 className="font-outfit font-black text-xl text-slate-800 tracking-tight leading-none">WKN<span className="text-[#E31E24]">site</span></h1>
          </div>
          <p className="text-[8px] font-black text-slate-500 tracking-[0.2em] leading-none uppercase text-center">Corporate Management System</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-6 custom-scrollbar scroll-smooth">
          <NavItem icon={<IconSmartHome size={18} />} label="Strategic Dashboard" to="/dashboard" />
          
          {/* HRIS - HUMAN CAPITAL */}
          {can(PERMISSIONS.VIEW_WORKFORCE) && (
            <MenuSection label="Human Capital (HRIS)" isOpen={openSections.hr} onToggle={() => toggleSection('hr')}>
              <NavItem icon={<Users size={18} />} label="Workforce Registry" to="/employees" />
              <NavItem icon={<Clock size={18} />} label="Attendance & Time" to="/attendance" />
              <NavItem icon={<IconFileText size={18} />} label="Attendance Report" to="/attendance/report" />
              <NavItem icon={<IconClipboardList size={18} />} label="Attendance Recap" to="/attendance/recap" />
              <NavItem icon={<Calendar size={18} />} label="Leave Management" to="/leave" />
              <NavItem icon={<IconChartBar size={18} />} label="Performance KPI" to="/performance" />
              <NavItem icon={<IconUserPlus size={18} />} label="Recruitment (ATS)" to="/recruitment" />
              <NavItem icon={<IconSchool size={18} />} label="Academy & Training" to="/academy" />
              <NavItem icon={<IconFileDescription size={18} />} label="Document Center" to="/documents" />
              <NavItem icon={<IconQrcode size={18} />} label="Asset Tracking" to="/assets" />
              <NavItem icon={<IconBox size={18} />} label="Office Consumables" to="/consumables" />
              <NavItem icon={<IconTrophy size={18} />} label="Succession Planning" to="/succession" />
            </MenuSection>
          )}

          {/* CRM */}
          {can(PERMISSIONS.VIEW_CRM) && (
            <MenuSection label="Customer Intelligence" isOpen={openSections.crm} onToggle={() => toggleSection('crm')}>
              <NavItem icon={<IconTrendingUp size={18} />} label="Sales Pipeline" to="/crm/pipeline" />
              <NavItem icon={<IconUsers size={18} />} label="Customer Portfolio" to="/crm/clients" />
              <NavItem icon={<IconSignature size={18} />} label="Quotation Builder" to="/crm/quotations" />
            </MenuSection>
          )}

          <MenuSection label="Company Hub" isOpen={openSections.company} onToggle={() => toggleSection('company')}>
            <NavItem icon={<IconHierarchy2 size={18} />} label="Organization Chart" to="/org-chart" />
            <NavItem icon={<IconBook size={18} />} label="Employee Handbook (Wiki)" to="/wiki" />
            <NavItem icon={<IconHeartbeat size={18} />} label="Wellness & Health" to="/wellness" />
            <NavItem icon={<IconClipboardCheck size={18} />} label="Surveys & Feedback" to="/surveys" />
            <NavItem icon={<IconHistory size={18} />} label="Project Timesheets" to="/timesheet" />
            <NavItem icon={<IconShieldSearch size={18} />} label="Grievance Portal" to="/grievance" />
            <NavItem icon={<IconLogout size={18} />} label="Exit Management" to="/offboarding" />
          </MenuSection>

          {/* ESS / Personal */}
          <MenuSection label="Personal Portal" isOpen={openSections.personal} onToggle={() => toggleSection('personal')}>
             <NavItem icon={<IconId size={18} />} label="Digital Business Card" to="/me/card" />
          </MenuSection>

          {/* Finance */}
          {can(PERMISSIONS.VIEW_TREASURY) && (
            <MenuSection label="Treasury & Finance" isOpen={openSections.finance} onToggle={() => toggleSection('finance')}>
              <NavItem icon={<CreditCard size={18} />} label="Treasury Operations" to="/payroll" />
              <NavItem icon={<IconReceipt size={18} />} label="Expense Claims" to="/expenses" />
              <NavItem icon={<IconTrendingUp size={18} />} label="Revenue Management" to="/finance/invoices" />
            </MenuSection>
          )}

          {/* Admin */}
          {can(PERMISSIONS.ACCESS_ADMIN_PANEL) && (
            <MenuSection label="Administration" isOpen={openSections.admin} onToggle={() => toggleSection('admin')}>
              <NavItem icon={<Settings size={18} />} label="System Settings" to="/settings" />
              <NavItem icon={<IconUsers size={18} />} label="User Management" to="/admin/users" />
              <NavItem icon={<IconWorld size={18} />} label="Access Control (RBAC)" to="/admin/rbac" />
              <NavItem icon={<IconShieldLock size={18} />} label="Security Audit Trail" to="/admin/audit-trail" />
            </MenuSection>
          )}
        </nav>

        <div className="p-6 mt-auto border-t border-white/30">
          <button 
            onClick={onLogout}
            className="w-full h-12 flex items-center gap-3 px-5 rounded-xl bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:text-[#E31E24] hover:shadow-none transition-all active:scale-95 group"
          >
            <IconPower size={18} />
            Sign Out Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 bg-[#f0f2f5] flex items-center justify-between px-10 shrink-0 z-10 border-b border-white/30">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-sm font-black text-slate-800 uppercase tracking-widest">{getPageTitle()}</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] rounded-full">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">System Healthy</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(currentTime)}</span>
              <div className="h-1 w-1 rounded-full bg-slate-300"></div>
              <span className="text-[9px] font-bold text-[#E31E24] tracking-widest font-mono">{formatTime(currentTime)}</span>
            </div>
          </div>

          <div className="flex-1 flex justify-center px-12">
            <div className="w-full max-w-md relative group">
              <IconSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E31E24] transition-colors" />
              <input 
                type="text" 
                placeholder="Global System Search..." 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full h-11 pl-12 pr-6 bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] border-none rounded-2xl text-[10px] font-black text-slate-800 focus:outline-none placeholder:text-slate-300 uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] p-1.5 rounded-xl">
              <button 
                onClick={() => setIsDiagnosticsOpen(true)}
                className="h-9 w-9 flex items-center justify-center rounded-lg text-[#E31E24] hover:bg-red-50 transition-all relative group"
              >
                <IconBrain size={18} />
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-red-500 rounded-full border border-white"></span>
              </button>
              <button className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white/50 transition-all">
                <IconBell size={18} />
              </button>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200/50 mx-1"></div>
            
            <div className="flex items-center gap-3 pl-1">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-black text-slate-800 leading-tight">{user?.full_name || 'Administrator'}</span>
                <span className="text-[8px] font-black text-[#E31E24] uppercase tracking-widest opacity-80">{user?.role || 'Staff'}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-700">
                {user?.full_name?.split(' ').map(n => n[0]).join('') || 'A'}
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

const MenuSection = ({ label, isOpen, onToggle, children }) => (
  <div className="pt-4 pb-1">
    <button 
      onClick={onToggle}
      className="w-full px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 flex items-center justify-between group hover:text-slate-900 transition-all"
    >
      <div className="flex items-center gap-2">
        <div className="h-[1px] w-4 bg-slate-300"></div>
        {label}
      </div>
      <IconChevronRight size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
    </button>
    <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
      {children}
    </div>
  </div>
);

const NavItem = ({ icon, label, to }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 group
      ${isActive 
        ? 'bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] text-[#E31E24]' 
        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}
    `}
  >
    <span className="transition-transform group-hover:scale-110">{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default DashboardLayout;
