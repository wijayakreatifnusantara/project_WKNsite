import React from 'react';
import { NavLink } from "react-router-dom";
import { 
  IconUsers, 
  IconClock, 
  IconSettings,
  IconBell
} from "@tabler/icons-react";
import { useAuth } from '@/context/AuthContext';

const MobileLayout = ({ user: legacyUser, children, onLogout }) => {
  const { profile, can, PERMISSIONS } = useAuth();
  const user = profile || legacyUser;
  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Mobile Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-[#E31E24] rounded-lg flex items-center justify-center shadow-md shadow-red-500/10">
            <span className="text-white font-black text-xs">W</span>
          </div>
          <h1 className="font-outfit font-black text-lg text-slate-800 tracking-tight">WKN<span className="text-[#E31E24]">site</span></h1>
        </div>
        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors">
          <IconBell size={20} />
        </button>
      </header>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-24">
        {children}
      </main>

      {/* Clean Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-4 z-[100] shadow-lg">
        {can(PERMISSIONS.VIEW_WORKFORCE) && (
          <MobileNavItem to="/employees" icon={<IconUsers size={22} />} label="Registry" />
        )}
        {can(PERMISSIONS.VIEW_WORKFORCE) && (
          <MobileNavItem to="/attendance" icon={<IconClock size={22} />} label="Absensi" />
        )}
        {can(PERMISSIONS.ACCESS_ADMIN_PANEL) && (
          <MobileNavItem to="/admin" icon={<IconSettings size={22} />} label="Admin" />
        )}
      </nav>
    </div>
  );
};

const MobileNavItem = ({ to, icon, label }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      flex flex-col items-center gap-1 px-3 py-2 transition-all duration-300
      ${isActive 
        ? 'text-[#E31E24]' 
        : 'text-slate-400'}
    `}
  >
    {({ isActive }) => (
      <>
        <div className={`
          h-10 w-10 flex items-center justify-center rounded-xl transition-all
          ${isActive ? 'bg-red-50 text-[#E31E24]' : 'hover:bg-slate-50'}
        `}>
          {icon}
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </>
    )}
  </NavLink>
);

export default MobileLayout;
