import React, { useState } from 'react';
import Settings from './Settings';
import UserManager from './UserManager';
import RBACManager from './RBACManager';
import AuditTrail from './AuditTrail';
import OverviewDashboard from './OverviewDashboard';
import DataImportCenter from './DataImportCenter';
import { 
  IconSettings, 
  IconUsers, 
  IconWorld, 
  IconShieldLock,
  IconShieldCheck,
  IconBuilding,
  IconActivity,
  IconDatabaseImport
} from "@tabler/icons-react";

const AdminHub = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <IconActivity size={18} />, component: <OverviewDashboard /> },
    { id: 'datahub', label: 'Data Hub', icon: <IconDatabaseImport size={18} />, component: <DataImportCenter /> },
    { id: 'settings', label: 'Konfigurasi Sistem', icon: <IconSettings size={18} />, component: <Settings /> },
    { id: 'users', label: 'Manajemen User', icon: <IconUsers size={18} />, component: <UserManager /> },
    { id: 'rbac', label: 'Hak Akses (RBAC)', icon: <IconWorld size={18} />, component: <RBACManager /> },
    { id: 'audit', label: 'Audit Keamanan', icon: <IconShieldLock size={18} />, component: <AuditTrail /> }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc] font-inter animate-fade-in">
      {/* 🚀 PREMIUM FLAT SUB-HEADER & TAB BAR */}
      <div className="bg-[#f8fafc]/95 backdrop-blur-xl border-b border-white/50 z-10 shrink-0">
        <div className="max-w-[1400px] mx-auto p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-transparent shadow-neu rounded-xl flex items-center justify-center text-[#E31E24] border border-white/50">
              <IconShieldCheck size={22} stroke={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tighter uppercase leading-none">Administrasi Sistem</h1>
              <p className="text-[7px] font-black text-[#E31E24] uppercase tracking-[0.2em] mt-0.5 opacity-80">Security & Core Configurations</p>
            </div>
          </div>

          {/* Premium Flat Tab Selector */}
          <div className="flex p-1 bg-slate-100/80 rounded-xl border border-white/50/60">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive 
                      ? 'bg-transparent shadow-neu border border-white/50/50 text-[#E31E24]' 
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
