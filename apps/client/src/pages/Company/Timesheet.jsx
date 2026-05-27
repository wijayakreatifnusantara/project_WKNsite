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

  // Calculate Weekly Summary (Dummy visualization for now, but can be derived from logs)
  const weeklyData = [32, 45, 12, 60, 40, 0, 0]; 

  const handleApprove = async (id) => {
    await updateStatus(id, 'APPROVED');
  };

  const handleReject = async (id) => {
    await updateStatus(id, 'REJECTED');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f0f2f5] custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              Project <span className="text-[#E31E24]">Timesheets</span>
            </h2>
            <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-[0.3em] opacity-70">Billable Hours & Resource Allocation</p>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] rounded-2xl p-1">
              <button 
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'pending' ? 'bg-[#E31E24] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Need Approval
              </button>
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-[#E31E24] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                All Logs
              </button>
            </div>
          </div>
        </header>

        {/* Weekly Progress Card (Visual Only) */}
        <Card className="bg-[#f0f2f5] border-white border-[4px] shadow-[12px_12px_24px_#d1d9e6,-12px_-10px_20px_#ffffff] rounded-[2.5rem] p-8 flex flex-col gap-6">
           <div className="flex justify-between items-center px-4">
             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Weekly Summary</h3>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dayjs().startOf('week').format('MMM DD')} - {dayjs().endOf('week').format('MMM DD')}</span>
           </div>
           
           <div className="flex items-end justify-around h-48 gap-4 px-4">
             {weeklyData.map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-3">
                 <div className="w-full bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] rounded-xl h-32 relative overflow-hidden flex items-end">
                   <div className="w-full bg-[#E31E24] transition-all duration-1000" style={{ height: `${h}%` }}></div>
                 </div>
                 <span className="text-[8px] font-black text-slate-400 uppercase">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</span>
               </div>
             ))}
           </div>
        </Card>

        {/* Recent Entries */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{filter === 'pending' ? 'Pending Approval' : 'Timesheet Logs'}</h3>
            <span className="text-[10px] font-bold text-slate-400">{logs.length} entries</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Logs...</div>
            ) : logs.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Timesheets Found</div>
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
  <Card className="border-white border-[3px] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] bg-[#f0f2f5] rounded-[1.5rem] p-6 flex flex-col md:flex-row md:items-center justify-between group gap-4">
    <div className="flex items-center gap-6">
      <div className="h-12 w-12 bg-[#f0f2f5] rounded-xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-[#E31E24]">
        <IconHistory size={24} />
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{log.employees?.name || 'Unknown Employee'}</h4>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
          <span className="text-[#E31E24]">{log.project_name}</span> • {dayjs(log.date).format('DD MMM YYYY')}
        </p>
        <p className="text-[10px] text-slate-600 mt-1">{log.task_description}</p>
      </div>
    </div>
    <div className="flex items-center gap-8 md:gap-12 justify-between md:justify-end">
      <div className="text-right">
        <p className="text-lg font-black text-slate-700 font-outfit">{log.duration_hours}h</p>
        <span className={`text-[8px] font-black uppercase tracking-widest
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
            className="h-10 w-10 rounded-xl bg-[#f0f2f5] shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] border-white border-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-0 flex items-center justify-center transition-all"
            title="Reject"
          >
            <IconX size={16} />
          </Button>
          <Button 
            onClick={onApprove}
            variant="ghost" 
            className="h-10 w-10 rounded-xl bg-[#f0f2f5] shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] border-white border-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 p-0 flex items-center justify-center transition-all"
            title="Approve"
          >
            <IconCheck size={16} />
          </Button>
        </div>
      )}
    </div>
  </Card>
);

export default Timesheet;
