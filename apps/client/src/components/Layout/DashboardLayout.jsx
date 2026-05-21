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
        <div className="h-24 flex flex-col justify-center items-center px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <img src="/assets/wkn_logo.png" alt="WKN" className="h-7 w-auto object-contain" />
            <h1 className="font-outfit font-black text-xl text-slate-100 tracking-tight leading-none">WKN<span className="text-[#E31E24]">site</span></h1>
          </div>
          <p className="text-[8px] font-black text-slate-400 tracking-[0.2em] leading-none uppercase text-center">Corporate Management System</p>
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
            className="w-full h-12 flex items-center gap-3 px-5 rounded-xl bg-slate-800/40 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-[#E31E24] hover:bg-red-500/10 border border-slate-700/30 transition-all active:scale-95 group"
          >
            <IconPower size={18} className="text-slate-400 group-hover:text-[#E31E24] transition-colors" />
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
