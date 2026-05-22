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
    if (path.includes('/employees')) return 'DATABASE KARYAWAN';
    if (path.includes('/attendance')) return 'ABSENSI KARYAWAN';
    if (path.includes('/admin')) return 'ADMINISTRASI SISTEM';
    return 'SYSTEM OVERVIEW';
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden font-inter animate-fade-in">
      {/* Premium Dark Slate Sidebar */}
      <aside className="w-72 bg-[#0f172a] flex flex-col hidden lg:flex shrink-0 relative z-20 shadow-[10px_0_30px_-10px_rgba(0,0,0,0.25)]">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0 gap-2.5">
          <img src="/assets/wkn_logo.png" alt="WKN" className="h-6 w-auto object-contain" />
          <div className="flex flex-col">
            <h1 className="font-outfit font-black text-base text-slate-100 tracking-tight leading-none">WKN<span className="text-[#E31E24]">site</span></h1>
            <span className="text-[7px] font-bold text-slate-500 tracking-widest uppercase mt-0.5">Corporate Management</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-6 custom-scrollbar scroll-smooth">
          {can(PERMISSIONS.VIEW_WORKFORCE) && (
            <NavItem icon={<Users size={18} />} label="Database Karyawan" to="/employees" />
          )}

          {can(PERMISSIONS.VIEW_WORKFORCE) && (
            <NavItem icon={<Clock size={18} />} label="Absensi Karyawan" to="/attendance" />
          )}

          {can(PERMISSIONS.ACCESS_ADMIN_PANEL) && (
            <NavItem icon={<Settings size={18} />} label="Administrasi Sistem" to="/admin" />
          )}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full h-12 flex items-center gap-3 px-5 rounded-xl bg-slate-800/40 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-[#E31E24] hover:bg-red-50/5 border border-slate-700/30 transition-all active:scale-95 group"
          >
            <IconPower size={18} className="text-slate-400 group-hover:text-[#E31E24] transition-colors" />
            Sign Out Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">{getPageTitle()}</h1>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full">
                <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wider">System Healthy</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{formatDate(currentTime)}</span>
              <span className="text-slate-300 text-[10px]">•</span>
              <span className="text-[10px] font-mono font-semibold text-[#E31E24]">{formatTime(currentTime)}</span>
            </div>
          </div>

          <div className="flex-1 flex justify-center px-10">
            <div className="w-full max-w-sm relative group">
              <IconSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E31E24] transition-colors" />
              <input 
                type="text" 
                placeholder="Global System Search..." 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200/80 rounded-xl text-[10px] font-semibold text-slate-700 focus:outline-none focus:border-[#E31E24]/30 focus:ring-1 focus:ring-[#E31E24]/20 transition-all placeholder:text-slate-400 uppercase tracking-wider"
              />
            </div>
          </div>

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
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-700 leading-tight">{user?.full_name || 'Administrator'}</span>
                <span className="text-[9px] font-bold text-[#E31E24] uppercase tracking-widest">{user?.role || 'Owner'}</span>
              </div>
              <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200/85 flex items-center justify-center text-xs font-bold text-slate-700">
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

const NavItem = ({ icon, label, to }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 group
      ${isActive 
        ? 'bg-gradient-to-r from-[#E31E24] to-[#ff4d5a] text-white shadow-[0_4px_12px_rgba(227,30,36,0.3)]' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
    `}
  >
    <span className="transition-transform group-hover:scale-110">{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default DashboardLayout;
