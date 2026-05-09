import React, { useState, useEffect } from 'react';
import { 
  IconClock, 
  IconUsers, 
  IconAlertTriangle, 
  IconCalendarEvent,
  IconChartBar,
  IconDownload,
  IconFilter,
  IconPlus, 
  IconWorld, 
  IconCloudUpload,
  IconLayoutGrid,
  IconHistory,
  IconChartInfographic,
  IconMapPin
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAttendance } from './hooks/useAttendance';
import AttendanceKPI from './components/AttendanceKPI';
import TrendsChart from './components/TrendsChart';
import DeptLateChart from './components/DeptLateChart';
import LiveFeed from './components/LiveFeed';
import ManualAttendanceModal from './components/ManualAttendanceModal';
import BulkAttendanceUploadModal from './components/BulkAttendanceUploadModal';
import LocationManager from './components/LocationManager';
import { Card } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const AttendanceHub = () => {
  const navigate = useNavigate();
  const { todaySummary, trends, fetchTodaySummary, fetchTrends, loading } = useAttendance();
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'location'

  useEffect(() => {
    fetchTodaySummary();
    fetchTrends(selectedPeriod);

    const channel = supabase
      .channel('attendance_hub_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        fetchTodaySummary();
        fetchTrends(selectedPeriod);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedPeriod]);

  return (
    <div className="flex-1 overflow-y-auto p-3 bg-[#f8fafc] custom-scrollbar animate-fade-in">
      <div className="max-w-[1600px] mx-auto space-y-3">
        
        {/* 🚀 ULTRA-COMPACT HEADER & NAV BAR */}
        <div className="flex items-center justify-between bg-white p-2 px-5 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className="h-8 w-8 bg-[#E31E24]/10 rounded-lg flex items-center justify-center text-[#E31E24]">
                <IconClock size={18} />
             </div>
             <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">
                  Attendance <span className="text-[#E31E24]">Hub</span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">HQ Live Metrics</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2">
             {/* Period Selector */}
             <div className="h-8 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 transition-all focus-within:border-[#E31E24]/20">
                <IconCalendarEvent size={12} className="text-[#E31E24]" />
                <input 
                  type="month" 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-transparent border-none text-slate-800 font-black text-[9px] uppercase tracking-widest focus:outline-none w-24"
                />
              </div>

              <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

              {/* Module Navigators */}
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/attendance/report')}
                  className="h-8 px-3 rounded-lg text-slate-500 font-black text-[8px] uppercase tracking-widest hover:text-[#E31E24] hover:bg-[#E31E24]/5 flex gap-2 items-center"
                >
                  <IconHistory size={14} />
                  Logs
                </Button>
                <Button 
                   variant="ghost"
                  onClick={() => navigate('/attendance/recap')}
                  className="h-8 px-3 rounded-lg text-slate-500 font-black text-[8px] uppercase tracking-widest hover:text-[#E31E24] hover:bg-[#E31E24]/5 flex gap-2 items-center"
                >
                  <IconChartInfographic size={14} />
                  Performance
                </Button>
                {/* T019: Location Config Tab */}
                <Button 
                  variant="ghost"
                  onClick={() => setActiveView(v => v === 'location' ? 'dashboard' : 'location')}
                  className={`h-8 px-3 rounded-lg font-black text-[8px] uppercase tracking-widest flex gap-2 items-center transition-all ${
                    activeView === 'location'
                      ? 'text-[#E31E24] bg-[#E31E24]/10'
                      : 'text-slate-500 hover:text-[#E31E24] hover:bg-[#E31E24]/5'
                  }`}
                >
                  <IconMapPin size={14} />
                  Location
                </Button>
              </div>

              <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

              {/* Action Buttons */}
              <Button 
                onClick={() => setIsBulkModalOpen(true)}
                className="h-8 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 font-black text-[8px] uppercase tracking-widest hover:bg-slate-50 shadow-sm flex gap-2 items-center"
              >
                <IconCloudUpload size={14} className="text-[#E31E24]" />
                Bulk
              </Button>
              
              <Button 
                onClick={() => setIsManualModalOpen(true)}
                className="h-8 px-4 rounded-lg bg-[#E31E24] text-white font-black text-[8px] uppercase tracking-widest shadow-md hover:bg-[#C1181E] flex gap-2 items-center"
              >
                <IconPlus size={14} />
                Entry
              </Button>
          </div>
        </div>

        {/* 📊 KPI STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AttendanceKPI 
                title="Present" 
                value={todaySummary?.present || 0} 
                total={todaySummary?.total || 0}
                icon={<IconUsers size={16} />} 
                color="emerald"
                compact
              />
            <AttendanceKPI 
                title="Late" 
                value={todaySummary?.late || 0} 
                total={todaySummary?.total || 0}
                icon={<IconClock size={16} />} 
                color="amber"
                compact
              />
            <AttendanceKPI 
                title="Absent" 
                value={todaySummary?.absent || 0} 
                total={todaySummary?.total || 0}
                icon={<IconAlertTriangle size={16} />} 
                color="rose"
                compact
              />
            <AttendanceKPI 
                title="Compliance" 
                value={todaySummary?.total ? Math.round((todaySummary.present - todaySummary.late) / todaySummary.total * 100) : 0} 
                unit="%"
                icon={<IconChartBar size={16} />} 
                color="indigo"
                compact
              />
        </div>

        {/* T019: Location Config View OR Dashboard View */}
        {activeView === 'location' ? (
          <LocationManager />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main Visuals (Span 9) */}
          <div className="md:col-span-9 space-y-3">
             <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                     <IconChartBar size={14} className="text-[#E31E24]" />
                     Attendance Flow & Trends
                   </h3>
                </div>
                <TrendsChart data={trends} loading={loading} height={250} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                   <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <IconUsers size={14} className="text-amber-500" />
                     Delay Analysis by Department
                   </h3>
                   <DeptLateChart loading={loading} height={180} />
                </div>
                <div className="bg-[#1e293b] rounded-2xl p-4 shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden border border-slate-800">
                    <IconWorld className="absolute -right-8 -bottom-8 text-white opacity-5" size={160} />
                    <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white mb-3">
                       <IconWorld size={20} />
                    </div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-1">Global Dashboard</h4>
                    <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-4">Real-time HQ Connectivity</p>
                    <div className="flex gap-2">
                       <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-[12px] font-black text-white">100%</p>
                          <p className="text-[6px] text-slate-500 uppercase font-bold">Uptime</p>
                       </div>
                       <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-[12px] font-black text-emerald-400">Stable</p>
                          <p className="text-[6px] text-slate-500 uppercase font-bold">Sync</p>
                       </div>
                    </div>
                </div>
             </div>
          </div>

          {/* Real-time Feed (Span 3) */}
          <div className="md:col-span-3">
             <LiveFeed loading={loading} limit={12} />
          </div>
        </div>
        )}
      </div>

      <ManualAttendanceModal 
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={() => {
          fetchTodaySummary();
          fetchTrends(selectedPeriod);
        }}
      />

      <BulkAttendanceUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onRefresh={() => {
          fetchTodaySummary();
          fetchTrends(selectedPeriod);
        }}
      />
    </div>
  );
};

export default AttendanceHub;
