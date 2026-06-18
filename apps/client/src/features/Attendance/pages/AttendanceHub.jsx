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
  IconChartPie,
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
import GeolocationRadar from './components/GeolocationRadar';
import AnomalyAlerts from './components/AnomalyAlerts';
import { exportDailyAttendance } from './utils/exportAttendance';
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AttendanceHub = () => {
  const navigate = useNavigate();
  const { can, PERMISSIONS } = useAuth();
  const { todaySummary, trends, fetchTodaySummary, fetchTrends, loading } = useAttendance();
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [pendingTasks, setPendingTasks] = useState({ overtime: 0, corrections: 0 });

  const fetchPendingTasks = async () => {
    try {
      const { apiClient } = await import('@/lib/apiClient');
      const res = await apiClient.get('/attendance/pending-tasks');
      if (res.status === 'success') {
        setPendingTasks(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch pending tasks', e);
    }
  };

  useEffect(() => {
    fetchTodaySummary();
    fetchTrends(selectedPeriod);
    fetchPendingTasks();

    // Polling every 10 seconds for real-time dashboard updates
    const interval = setInterval(() => {
      fetchTodaySummary();
      fetchTrends(selectedPeriod);
      fetchPendingTasks();
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const totalPending = pendingTasks.overtime + pendingTasks.corrections;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-transparent custom-scrollbar animate-fade-in">
      <div className="w-full mx-auto space-y-6">
        
        {/* 🚀 ULTRA-COMPACT HEADER & NAV BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 ios-card p-5 px-8">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 bg-ios-primary/10 rounded-lg flex items-center justify-center text-ios-primary">
                <IconClock size={18} />
             </div>
             <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight leading-none">
                  Attendance <span className="text-ios-primary">Hub</span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">HQ Live Metrics</span>
                </div>
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
             {totalPending > 0 && (
               <div 
                 onClick={() => navigate('/attendance/correction')}
                 className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors shadow-sm animate-pulse"
                 data-tooltip="Terdapat pengajuan menunggu persetujuan"
               >
                 <IconAlertTriangle size={14} className="text-amber-500" />
                 <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                   Pending Approvals: <span className="text-amber-600 text-sm">{totalPending}</span>
                 </span>
               </div>
             )}

             {/* Period Selector */}
              <div className="h-10 px-4 rounded-xl bg-white shadow-sm border-none flex items-center gap-2 transition-all focus-within:border-ios-primary focus-within:ring-2 focus-within:ring-ios-primary/20">
                 <IconCalendarEvent size={12} className="text-ios-primary" />
                 <input 
                  type="month" 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-transparent border-none text-slate-800 font-bold text-sm uppercase tracking-widest focus:outline-none w-24"
                />
              </div>

              <div className="hidden sm:block h-6 w-[1px] bg-slate-200 mx-1"></div>

              {/* Module Navigators */}
              <div className="flex flex-wrap items-center gap-1">
                {can(PERMISSIONS.VIEW_ATTENDANCE_REPORTS) && (
                  <>
                    <Button 
                      variant="ghost"
                      onClick={() => navigate('/attendance/report')}
                      className="h-10 px-4 rounded-lg text-slate-500 font-semibold text-xs tracking-wide hover:text-ios-primary hover:bg-ios-primary/5 flex gap-2 items-center"
                    >
                      <IconHistory size={14} />
                      Logs
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => navigate('/attendance/recap')}
                      className="h-10 px-4 rounded-lg text-slate-500 font-semibold text-xs tracking-wide hover:text-ios-primary hover:bg-ios-primary/5 flex gap-2 items-center"
                    >
                      <IconChartPie size={14} />
                      Performance
                    </Button>

                    <Button 
                      variant="ghost"
                      onClick={() => navigate('/attendance/calendar')}
                      className="h-10 px-4 rounded-lg text-slate-500 font-semibold text-xs tracking-wide hover:text-ios-primary hover:bg-ios-primary/5 flex gap-2 items-center"
                    >
                      <IconCalendarEvent size={14} />
                      Calendar
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => navigate('/attendance/overtime')}
                      className="h-10 px-4 rounded-lg text-slate-500 font-semibold text-xs tracking-wide hover:text-ios-primary hover:bg-ios-primary/5 flex gap-2 items-center"
                    >
                      <IconClock size={14} />
                      Overtime
                    </Button>

                  </>
                )}
                
                {can(PERMISSIONS.MANAGE_ATTENDANCE) && (
                  <Button 
                    variant="ghost"
                    onClick={() => navigate('/attendance/location')}
                    className="h-10 px-4 rounded-lg text-slate-500 hover:text-ios-primary hover:bg-ios-primary/5 font-semibold text-xs tracking-wide flex gap-2 items-center transition-all"
                  >
                    <IconMapPin size={14} />
                    Location
                  </Button>
                )}
              </div>

              <div className="hidden sm:block h-6 w-[1px] bg-slate-200 mx-1"></div>

              {/* Action Buttons */}
              {can(PERMISSIONS.MANAGE_ATTENDANCE) && (
                <div className="flex items-center gap-1.5">
                  <Button 
                    onClick={async () => {
                      const success = await exportDailyAttendance();
                      if (success) toast.success("Daily report downloaded.");
                    }}
                    className="ios-btn h-10 px-6 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs tracking-wide hover:shadow-sm shadow-sm flex gap-2 items-center"
                  >
                    <IconDownload size={14} className="text-slate-500" />
                    Export
                  </Button>
                  <Button 
                    onClick={() => setIsBulkModalOpen(true)}
                    className="ios-btn h-10 px-6 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs tracking-wide hover:shadow-sm shadow-sm flex gap-2 items-center"
                  >
                    <IconCloudUpload size={14} className="text-ios-primary" />
                    Bulk
                  </Button>
                  
                  <Button 
                    onClick={() => setIsManualModalOpen(true)}
                    className="ios-btn h-10 px-6 rounded-xl bg-ios-primary text-white font-semibold text-xs tracking-wide shadow-sm flex gap-2 items-center"
                  >
                    <IconPlus size={14} />
                    Entry
                  </Button>
                </div>
              )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AttendanceKPI 
                data-tooltip="Present" 
                value={todaySummary?.present || 0} 
                total={todaySummary?.total || 0}
                icon={<IconUsers size={16} />} 
                color="emerald"
                compact
              />
            <AttendanceKPI 
                data-tooltip="Late" 
                value={todaySummary?.late || 0} 
                total={todaySummary?.total || 0}
                icon={<IconClock size={16} />} 
                color="amber"
                compact
              />
            <AttendanceKPI 
                data-tooltip="Absent" 
                value={todaySummary?.absent || 0} 
                total={todaySummary?.total || 0}
                icon={<IconAlertTriangle size={16} />} 
                color="rose"
                compact
              />
            <AttendanceKPI 
                data-tooltip="Compliance" 
                value={todaySummary?.total ? Math.round((todaySummary.present - todaySummary.late) / todaySummary.total * 100) : 0} 
                unit="%"
                icon={<IconChartBar size={16} />} 
                color="indigo"
                compact
              />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-9 space-y-6">
             <div className="ios-card p-4">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2">
                     <IconChartBar size={14} className="text-ios-primary" />
                     Attendance Flow & Trends
                   </h3>
                </div>
                <TrendsChart data={trends} loading={loading} height={250} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-transparent rounded-2xl border border-slate-200 p-4 shadow-sm">
                   <h3 className="text-sm font-bold text-slate-800 tracking-wide mb-4 flex items-center gap-2">
                     <IconUsers size={14} className="text-amber-500" />
                     Delay Analysis by Department
                   </h3>
                   <DeptLateChart loading={loading} height={180} />
                </div>
                <div className="grid grid-cols-2 gap-6 h-full">
                   <GeolocationRadar />
                   <AnomalyAlerts />
                </div>
             </div>
          </div>
          <div className="md:col-span-3">
             <LiveFeed loading={loading} limit={12} />
          </div>
        </div>
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

