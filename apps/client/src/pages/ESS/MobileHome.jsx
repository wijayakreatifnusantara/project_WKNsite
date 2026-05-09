import React from 'react';
import { 
  IconClock, 
  IconCalendar, 
  IconWallet, 
  IconArrowRight,
  IconFingerprint
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import CheckInCard from './components/CheckInCard';

const MobileHome = ({ user }) => {
  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <header>
        <h2 className="text-2xl font-black text-slate-800 font-outfit uppercase tracking-tight">
          Hello, <span className="text-[#E31E24]">{user?.full_name?.split(' ')[0] || 'Team'}</span>
        </h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational Readiness: Optimal</p>
      </header>

      {/* Main Action: Geofencing Check-in (T012) */}
      <CheckInCard employeeId={user?.employee_id} isFieldTeam={user?.is_field_team || false} />

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 gap-4">
        <QuickActionCard 
          label="My Payslips" 
          icon={<IconWallet size={24} />} 
          color="indigo"
          to="/payroll"
        />
        <QuickActionCard 
          label="Apply Leave" 
          icon={<IconCalendar size={24} />} 
          color="emerald"
          to="/leave"
        />
      </div>

      {/* Announcements / Recent Activity */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Upcoming Events</h4>
        <div className="space-y-3">
          <EventItem title="Corporate Townhall" date="May 15" type="Meeting" />
          <EventItem title="Vesak Day" date="May 23" type="Public Holiday" />
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ label, icon, color, to }) => (
  <Card className="bg-[#f0f2f5] border-white border-[3px] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] rounded-[2rem] p-5 flex flex-col gap-4">
    <div className={`h-10 w-10 rounded-xl bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center
      ${color === 'indigo' ? 'text-indigo-500' : 'text-emerald-500'}`}>
      {icon}
    </div>
    <div className="flex justify-between items-end">
      <span className="text-[9px] font-black text-slate-700 uppercase tracking-tight leading-tight w-2/3">{label}</span>
      <IconArrowRight size={14} className="text-slate-300" />
    </div>
  </Card>
);

const EventItem = ({ title, date, type }) => (
  <div className="p-4 rounded-2xl bg-white/40 border border-white flex justify-between items-center shadow-sm">
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center justify-center h-10 w-10 bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] rounded-lg">
        <span className="text-[8px] font-black text-slate-400 uppercase">{date.split(' ')[0]}</span>
        <span className="text-[10px] font-black text-slate-700">{date.split(' ')[1]}</span>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{title}</p>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{type}</p>
      </div>
    </div>
    <IconArrowRight size={14} className="text-slate-300" />
  </div>
);

export default MobileHome;
