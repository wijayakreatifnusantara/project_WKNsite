import React from 'react';
import { NavLink } from "react-router-dom";
import { 
  IconSmartHome, 
  IconClock, 
  IconCalendarEvent, 
  IconWallet, 
  IconUser,
  IconBell
} from "@tabler/icons-react";

const MobileLayout = ({ user, children }) => {
  return (
    <div className="flex flex-col h-screen bg-[#f0f2f5] overflow-hidden font-inter">
      {/* Mobile Top Header */}
      <header className="h-16 bg-[#f0f2f5] border-b border-white/30 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <img src="/assets/wkn_logo.png" alt="WKN" className="h-6 w-auto" />
          <h1 className="font-outfit font-black text-lg text-slate-800 tracking-tight">WKN<span className="text-[#E31E24]">site</span></h1>
        </div>
        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] text-slate-400">
          <IconBell size={20} />
        </button>
      </header>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-24">
        {children}
      </main>

      {/* Neumorphic Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#f0f2f5]/90 backdrop-blur-md border-t border-white/50 flex items-center justify-around px-4 z-[100] shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <MobileNavItem to="/dashboard" icon={<IconSmartHome size={22} />} label="Home" />
        <MobileNavItem to="/attendance" icon={<IconClock size={22} />} label="Time" />
        <MobileNavItem to="/leave" icon={<IconCalendarEvent size={22} />} label="Leave" />
        <MobileNavItem to="/payroll" icon={<IconWallet size={22} />} label="Salary" />
        <MobileNavItem to="/admin/users" icon={<IconUser size={22} />} label="Me" />
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
          ${isActive ? 'bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]' : ''}
        `}>
          {icon}
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </>
    )}
  </NavLink>
);


export default MobileLayout;
