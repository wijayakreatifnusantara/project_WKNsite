import React from 'react';
import { 
  IconClock, 
  IconArrowRight,
  IconFingerprint
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import CheckInCard from './components/CheckInCard';

const MobileHome = ({ user: propUser }) => {
  const { profile } = useAuth();
  const user = propUser || profile;

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-slate-50 min-h-full">
      {/* Welcome Header */}
      <header>
        <h2 className="text-2xl font-black text-slate-800 font-outfit uppercase tracking-tight">
          Hello, <span className="text-[#E31E24]">{user?.fullName?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Team'}</span>
        </h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational Readiness: Optimal</p>
      </header>

      {/* Main Action: Geofencing Check-in (T012) */}
      <CheckInCard employeeId={user?.employee_id} isFieldTeam={user?.is_field_team || false} />

      {/* Announcements / Recent Activity */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Upcoming Events</h4>
        <div className="space-y-3">
          <EventItem title="Corporate Townhall" date="May 15" type="Meeting" />
          <EventItem title="Vesak Day" date="May 23" type="Public Holiday" />
        </div>
      </div>
    </div>
  );
};

const EventItem = ({ title, date, type }) => (
  <div className="p-4 rounded-2xl bg-white border border-slate-200 flex justify-between items-center shadow-sm">
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center justify-center h-10 w-10 bg-slate-50 border border-slate-200 rounded-lg">
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
