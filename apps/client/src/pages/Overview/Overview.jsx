import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  IconUsers, 
  IconClock, 
  IconChartBar,
  IconDotsVertical,
  IconArrowUpRight,
  IconArrowDownRight
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import AnalyticsGrid from './components/AnalyticsGrid';
import { generateExecutiveReport } from './utils/exportReport';
import { toast } from 'sonner';

const Overview = () => {
  const { profile, isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/employees?size=500');
      // Data is already mapped by backend
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#f0f2f5] custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Simple Greeting */}
        <header className="flex justify-between items-end pb-2">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              Operational Status: <span className="text-[#E31E24]">{profile?.full_name?.split(' ')[0] || 'Administrator'}</span>
            </h2>
            <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-[0.3em] opacity-70">Strategic Intelligence & Resource Allocation</p>
          </div>
          {isAdmin() && (
            <div className="flex gap-4 animate-in slide-in-from-right-4 duration-500">
              <Button 
                variant="outline" 
                onClick={() => {
                  const success = generateExecutiveReport(employees);
                  if (success) toast.success("Executive Report successfully generated and downloaded.");
                  else toast.error("Failed to generate report.");
                }}
                className="h-12 px-6 rounded-2xl bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] border-white border-2 text-slate-600 font-black text-xs uppercase tracking-widest hover:shadow-none transition-all flex gap-3 items-center"
              >
                <IconChartBar size={16} />
                Export Intelligence
              </Button>
              <Button 
                onClick={fetchData}
                className="h-12 px-6 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-[5px_5px_15px_rgba(227,30,36,0.3)] hover:bg-[#C1181E] transition-all flex gap-3 items-center"
              >
                <Loader2 size={16} className={loading ? 'animate-spin' : 'hidden'} />
                Force Core Sync
              </Button>
            </div>
          )}
        </header>

        {/* Neumorphic Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Workforce" value={employees.length || "0"} icon={<IconUsers size={24} />} trend="+2.4%" positive={true} />
          <StatCard title="Avg Attendance" value="98.5%" icon={<IconClock size={24} />} trend="+0.5%" positive={true} />
          <StatCard title="Dept Coverage" value={`${new Set(employees.map(e => e.organization_name)).size || 0}`} icon={<Zap size={24} />} trend="Active" positive={true} />
          <StatCard title="System Integrity" value="Optimal" icon={<ShieldCheck size={24} />} trend="Secure" positive={true} />

          {/* Interactive Analytics Hub */}
          <div className="md:col-span-3 space-y-4">
            {loading ? (
              <div className="h-96 w-full flex flex-col items-center justify-center bg-[#f0f2f5] shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] rounded-[3rem] border-4 border-white">
                <Loader2 size={32} className="text-[#E31E24] animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generating Visual Intelligence...</p>
              </div>
            ) : (
              <AnalyticsGrid employees={employees} />
            )}
          </div>

          {/* Critical Alerts Card */}
          <Card className="md:col-span-1 border-white border-[4px] shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] bg-[#f0f2f5] rounded-[2rem] overflow-hidden flex flex-col transition-all">
            <CardHeader className="px-6 py-6 border-b border-white/50">
              <CardTitle className="text-lg font-black text-slate-800 font-outfit uppercase tracking-tight">System Alerts</CardTitle>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Priority Notifications</p>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="divide-y divide-white/30">
                <AlertItem title="Contract Expiry" desc="2 Records require immediate review" type="warning" />
                <AlertItem title="Core Sync" desc="Cloud backup completed successfully" type="success" />
                <AlertItem title="Payroll Engine" desc="Monthly cycle awaiting final approval" type="info" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, positive }) => (
  <Card className="border-white border-[2px] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] bg-[#f0f2f5] rounded-[1.5rem] p-5 transition-all hover:scale-[1.02] cursor-pointer group">
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="h-12 w-12 rounded-xl bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] text-[#E31E24] flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f0f2f5] shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] text-[10px] font-black ${positive ? 'text-green-500' : 'text-red-500'}`}>
          {trend}
          {positive ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-80">{title}</p>
        <h3 className="text-xl font-black text-slate-800 mt-1 font-outfit tracking-tight">{value}</h3>
      </div>
    </div>
  </Card>
);

const AlertItem = ({ title, desc, type }) => {
  const colorMap = {
    warning: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    success: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]",
    info: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
  };

  return (
    <div className="px-8 py-6 hover:bg-white/30 transition-all cursor-pointer group border-b border-white/20 last:border-0">
      <div className="flex items-start gap-4">
        <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${colorMap[type]}`}></div>
        <div>
          <h5 className="text-xs font-black text-slate-700 group-hover:text-[#E31E24] transition-colors uppercase tracking-wider">{title}</h5>
          <p className="text-[10px] text-slate-400 font-bold leading-relaxed mt-1 tracking-wide opacity-80">{desc}</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
