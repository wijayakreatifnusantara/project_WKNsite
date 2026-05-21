import React, { useState } from 'react';
import Settings from './Settings';
import UserManager from './UserManager';
import RBACManager from './RBACManager';
import AuditTrail from './AuditTrail';
import { 
  IconSettings, 
  IconUsers, 
  IconWorld, 
  IconShieldLock,
  IconShieldCheck
} from "@tabler/icons-react";

const AdminHub = () => {
  const [activeTab, setActiveTab] = useState('settings');

  const tabs = [
    { id: 'settings', label: 'Konfigurasi Sistem', icon: <IconSettings size={18} />, component: <Settings /> },
    { id: 'users', label: 'Manajemen User', icon: <IconUsers size={18} />, component: <UserManager /> },
    { id: 'rbac', label: 'Hak Akses (RBAC)', icon: <IconWorld size={18} />, component: <RBACManager /> },
    { id: 'audit', label: 'Audit Keamanan', icon: <IconShieldLock size={18} />, component: <AuditTrail /> }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f0f2f5] font-inter">
      {/* 🚀 PREMIUM GLASSMORPHIC SUB-HEADER & TAB BAR */}
      <div className="bg-[#f0f2f5]/95 backdrop-blur-xl border-b border-white z-10 shrink-0">
        <div className="max-w-[1400px] mx-auto p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-[#E31E24] border border-white">
              <IconShieldCheck size={22} stroke={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tighter uppercase leading-none">Administrasi Sistem</h1>
              <p className="text-[7px] font-black text-[#E31E24] uppercase tracking-[0.2em] mt-0.5 opacity-80">Security & Core Configurations</p>
            </div>
          </div>

          {/* Premium Glassmorphic Tab Selector */}
          <div className="flex p-0.5 bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] rounded-xl border border-white/50">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive 
                      ? 'bg-white shadow-[2px_2px_6px_rgba(0,0,0,0.05)] text-[#E31E24]' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-[#E31E24]' : 'text-slate-400'}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📜 SCROLLABLE DATA BODY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 relative">
        <div className="w-full h-full">
          {tabs.find(t => t.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default AdminHub;
