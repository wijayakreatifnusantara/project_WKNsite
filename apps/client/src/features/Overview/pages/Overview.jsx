import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  IconUsers, 
  IconClock, 
  IconChartBar,
  IconDotsVertical,
  IconArrowUpRight,
  IconArrowDownRight,
  IconRefresh
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Skeleton } from "@/components/ui/Skeleton";
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
      // Fix: The new backend returns { data: [...], total: ... } instead of a direct array
      const employeeData = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setEmployees(employeeData);
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
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Operational Status, <span className="text-[#E31E24]">{profile?.full_name?.split(' ')[0] || 'Administrator'}</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">Strategic Intelligence & Resource Allocation</p>
          </div>
          {isAdmin() && (
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  const success = generateExecutiveReport(employees);
                  if (success) toast.success("Executive Report successfully generated.");
                  else toast.error("Failed to generate report.");
                }}
                className="h-10 px-4 rounded-lg bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all flex gap-2 items-center"
              >
                <IconChartBar size={16} />
                Export Report
              </Button>
              <Button 
                onClick={fetchData}
                disabled={loading}
                className="h-10 px-4 rounded-lg bg-[#E31E24] text-white hover:bg-[#C1181E] shadow-sm transition-all flex gap-2 items-center"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <IconRefresh size={16} />}
                Refresh Data
              </Button>
            </div>
          )}
        </header>

        {/* Neumorphic Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Workforce" value={employees.length || "0"} icon={<IconUsers size={24} />} trend="+2.4%" positive={true} />
          <StatCard title="Avg Attendance" value="98.5%" icon={<IconClock size={24} />} trend="+0.5%" positive={true} />
          <StatCard title="Dept Coverage" value={`${new Set(employees.map(e => e.division_name)).size || 0}`} icon={<Zap size={24} />} trend="Active" positive={true} />
          <StatCard title="System Integrity" value="Optimal" icon={<ShieldCheck size={24} />} trend="Secure" positive={true} />

          {/* Interactive Analytics Hub */}
          <div className="md:col-span-3 space-y-4">
            {loading ? (
              <div className="h-96 w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-[280px] w-full rounded-xl" />
              </div>
            ) : (
              <AnalyticsGrid employees={employees} />
            )}
          </div>

          {/* Critical Alerts Card */}
          <Card className="md:col-span-1 bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
            <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold text-slate-800">System Alerts</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Priority Notifications</p>
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
  <Card className="bg-white border-slate-200 shadow-sm rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer group">
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-lg bg-red-50 text-[#E31E24] flex items-center justify-center group-hover:bg-[#E31E24] group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend}
          {positive ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">{value}</h3>
      </div>
    </div>
  </Card>
);

const AlertItem = ({ title, desc, type }) => {
  const colorMap = {
    warning: "bg-amber-500",
    success: "bg-green-500",
    info: "bg-blue-500"
  };

  return (
    <div className="px-6 py-4 hover:bg-slate-50 transition-all cursor-pointer group border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-3">
        <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${colorMap[type]}`}></div>
        <div>
          <h5 className="text-sm font-semibold text-slate-700 group-hover:text-[#E31E24] transition-colors">{title}</h5>
          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
