import React, { useState, useEffect, useMemo } from 'react';
import { 
  IconClock, 
  IconCalendar, 
  IconPlayerPlay, 
  IconCheck,
  IconX,
  IconHistory,
  IconArrowRight,
  IconFilter
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimesheets } from './hooks/useTimesheets';
import dayjs from 'dayjs';

const Timesheet = () => {
  const { logs, loading, fetchTimesheets, updateStatus } = useTimesheets();
  const [filter, setFilter] = useState('pending'); // 'all' or 'pending'

  useEffect(() => {
    fetchTimesheets(filter);
  }, [fetchTimesheets, filter]);

  // Calculate Weekly Summary based on actual logs
  const weeklyData = useMemo(() => {
    const data = [0, 0, 0, 0, 0, 0, 0];
    const startOfWeek = dayjs().startOf('week');
    const endOfWeek = dayjs().endOf('week');

    logs.forEach(log => {
      const logDate = dayjs(log.date);
      // Check if log is within current week
      if (logDate.isAfter(startOfWeek.subtract(1, 'day')) && logDate.isBefore(endOfWeek.add(1, 'day'))) {
        const dayIndex = logDate.day(); // 0 (Sun) to 6 (Sat)
        data[dayIndex] += (log.duration_hours || 0);
      }
    });

    // Scale hours to percentage for the chart (max 10 hours = 100%)
    return data.map(hours => Math.min(hours * 10, 100)); 
  }, [logs]);

  const handleApprove = async (id) => {
    await updateStatus(id, 'APPROVED');
  };

  const handleReject = async (id) => {
    await updateStatus(id, 'REJECTED');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              Project <span className="text-[#E31E24]">Timesheets</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-black uppercase tracking-[0.3em] opacity-70">Billable Hours & Resource Allocation</p>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-white shadow-sm rounded-2xl p-1">
              <button 
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'pending' ? 'bg-[#E31E24] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Need Approval
              </button>
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-[#E31E24] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                All Logs
              </button>
            </div>
          </div>
        </header>

        {/* Weekly Progress Card (Visual Only) */}
        <Card className="bg-white border-white border-[4px] shadow-sm rounded-[2.5rem] p-8 flex flex-col gap-6">
           <div className="flex justify-between items-center px-4">
             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Weekly Summary</h3>
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{dayjs().startOf('week').format('MMM DD')} - {dayjs().endOf('week').format('MMM DD')}</span>
           </div>
           
           <div className="flex items-end justify-around h-48 gap-4 px-4">
             {weeklyData.map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-3">
                 <div className="w-full bg-white shadow-sm rounded-xl h-32 relative overflow-hidden flex items-end">
                   <div className="w-full bg-[#E31E24] transition-all duration-1000" style={{ height: `${h}%` }}></div>
                 </div>
                 <span className="text-[11px] font-black text-slate-400 uppercase">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</span>
               </div>
             ))}
           </div>
        </Card>

        {/* Recent Entries */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">{filter === 'pending' ? 'Pending Approval' : 'Timesheet Logs'}</h3>
            <span className="text-xs font-bold text-slate-400">{logs.length} entries</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Logs...</div>
            ) : logs.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No Timesheets Found</div>
            ) : (
              logs.map(log => (
                <TimesheetLog 
                  key={log.id} 
                  log={log} 
                  onApprove={() => handleApprove(log.id)}
                  onReject={() => handleReject(log.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TimesheetLog = ({ log, onApprove, onReject }) => (
  <Card className="border-white border-[3px] shadow-sm bg-white rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between group gap-4">
    <div className="flex items-center gap-6">
      <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#E31E24]">
        <IconHistory size={24} />
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{log.employees?.name || 'Unknown Employee'}</h4>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
          <span className="text-[#E31E24]">{log.project_name}</span> • {dayjs(log.date).format('DD MMM YYYY')}
        </p>
        <p className="text-xs text-slate-600 mt-1">{log.task_description}</p>
      </div>
    </div>
    <div className="flex items-center gap-8 md:gap-12 justify-between md:justify-end">
      <div className="text-right">
        <p className="text-lg font-black text-slate-700 font-outfit">{log.duration_hours}h</p>
        <span className={`text-[11px] font-black uppercase tracking-widest
          ${log.status === 'APPROVED' ? 'text-emerald-500' : 
            log.status === 'REJECTED' ? 'text-rose-500' : 'text-amber-500'}`}>
          {log.status || 'PENDING'}
        </span>
      </div>
      
      {(log.status === 'PENDING' || !log.status) && (
        <div className="flex gap-2">
          <Button 
            onClick={onReject}
            variant="ghost" 
            className="h-10 w-10 rounded-xl bg-white shadow-sm border-white border-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-0 flex items-center justify-center transition-all"
            data-tooltip="Reject"
          >
            <IconX size={16} />
          </Button>
          <Button 
            onClick={onApprove}
            variant="ghost" 
            className="h-10 w-10 rounded-xl bg-white shadow-sm border-white border-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 p-0 flex items-center justify-center transition-all"
            data-tooltip="Approve"
          >
            <IconCheck size={16} />
          </Button>
        </div>
      )}
    </div>
  </Card>
);

export default Timesheet;
