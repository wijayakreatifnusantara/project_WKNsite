import React, { useState } from 'react';
import DivisionManager from './DivisionManager';
import ShiftManager from './ShiftManager';
import { 
  IconDatabase, 
  IconBuildingSkyscraper, 
  IconCalendarEvent, 
  IconBriefcase,
  IconCalendarCancel
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";

// Placeholder for Job Titles / Positions
const PositionsPlaceholder = () => (
  <div className="p-6 h-full flex items-center justify-center animate-fade-in">
    <Card className="max-w-md w-full border border-slate-200 bg-slate-50/50 shadow-sm rounded-2xl text-center p-8">
      <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4 shadow-sm">
        <IconBriefcase size={32} />
      </div>
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-2">Manajemen Jabatan</h2>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
        Modul ini sedang dalam tahap pengembangan. Nantinya Anda dapat mengatur tingkatan jabatan, eselon, dan benefit per jabatan dari halaman ini.
      </p>
    </Card>
  </div>
);

// Placeholder for Leave Types
const LeaveTypesPlaceholder = () => (
  <div className="p-6 h-full flex items-center justify-center animate-fade-in">
    <Card className="max-w-md w-full border border-slate-200 bg-slate-50/50 shadow-sm rounded-2xl text-center p-8">
      <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4 shadow-sm">
        <IconCalendarCancel size={32} />
      </div>
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-2">Tipe Cuti & Izin</h2>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
        Modul ini sedang dalam tahap pengembangan. Nantinya Anda dapat menambah dan mengonfigurasi jenis cuti, jatah tahunan, dan aturan carry-over.
      </p>
    </Card>
  </div>
);

const MasterDataHub = () => {
  const [activeTab, setActiveTab] = useState('divisions');

  const tabs = [
    { id: 'divisions', label: 'Divisi & Unit', icon: <IconBuildingSkyscraper size={18} />, component: <DivisionManager /> },
    { id: 'shifts', label: 'Shift & Libur', icon: <IconCalendarEvent size={18} />, component: <ShiftManager /> },
    { id: 'positions', label: 'Jabatan & Golongan', icon: <IconBriefcase size={18} />, component: <PositionsPlaceholder /> },
    { id: 'leaves', label: 'Tipe Cuti', icon: <IconCalendarCancel size={18} />, component: <LeaveTypesPlaceholder /> }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc] font-outfit animate-fade-in">
      {/* PREMIUM FLAT SUB-HEADER & TAB BAR */}
      <div className="bg-[#f8fafc]/95 backdrop-blur-xl border-b border-slate-200 z-10 shrink-0 shadow-sm">
        <div className="max-w-[1400px] mx-auto p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-transparent shadow-sm rounded-xl flex items-center justify-center text-ios-primary border border-slate-200">
              <IconDatabase size={22} stroke={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tighter uppercase leading-none">Data Dictionary</h1>
              <p className="text-[11px] font-semibold text-ios-primary uppercase tracking-wider mt-0.5 opacity-80">Unified Master Data</p>
            </div>
          </div>

          {/* Premium Flat Tab Selector */}
          <div className="flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                    isActive 
                      ? 'bg-transparent shadow-sm border border-slate-200/50 text-ios-primary' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-ios-primary' : 'text-slate-400'}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SCROLLABLE DATA BODY */}
      <div className="flex-1 overflow-hidden relative bg-slate-50/50">
        <div className="w-full h-full [&>div]:h-full [&>div]:!bg-transparent [&>div>div:first-child]:hidden">
           {/* Note: [&>div>div:first-child]:hidden is a CSS hack to hide the internal header row of DivisionManager and ShiftManager if they have one so it doesn't double-render headers. Alternatively we just render as is. */}
          {tabs.find(t => t.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default MasterDataHub;
