import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  IconServer, 
  IconDatabase, 
  IconActivity, 
  IconCpu,
  IconBug,
  IconClock,
  IconArrowUpRight,
  IconArrowDownRight
} from "@tabler/icons-react";

const OverviewDashboard = () => {
  const [metrics, setMetrics] = useState({
    cpu: 45,
    memory: 62,
    dbStorage: 34,
    uptime: '14d 2h 45m',
    errorRate: 0.12,
    activeConnections: 124
  });

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(10, Math.min(95, prev.cpu + (Math.random() * 10 - 5))),
        memory: Math.max(20, Math.min(90, prev.memory + (Math.random() * 4 - 2))),
        activeConnections: Math.max(50, Math.min(500, prev.activeConnections + Math.floor(Math.random() * 10 - 4)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ title, value, icon, color, suffix = '%', trend }) => (
    <Card className="border border-slate-200 bg-transparent shadow-sm rounded-2xl overflow-hidden hover:shadow-sm transition-all">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            {icon} {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-800 tracking-tighter">
              {typeof value === 'number' ? value.toFixed(0) : value}
              <span className="text-sm font-bold text-slate-400 ml-1">{suffix}</span>
            </h3>
            {trend && (
              <span className={`text-xs font-bold flex items-center ${trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {trend > 0 ? <IconArrowUpRight size={12} /> : <IconArrowDownRight size={12} />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
        <div className={`h-16 w-16 rounded-full bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center ${color}`}>
          <div className="text-current opacity-80 scale-150">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 h-full overflow-y-auto no-scrollbar bg-[#f8fafc] animate-fade-in">
      <div className="max-w-[1200px] mx-auto space-y-6 pb-20">
        
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-transparent shadow-sm rounded-xl flex items-center justify-center text-ios-primary border border-slate-200">
                <IconActivity size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight uppercase leading-none">System Telemetry</h1>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Real-time infrastructure health</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            System Operational
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard 
            data-tooltip="CPU Usage" 
            value={metrics.cpu} 
            icon={<IconCpu />} 
            color={metrics.cpu > 80 ? 'text-red-500' : 'text-ios-primary'} 
            trend={+2.4} 
          />
          <MetricCard 
            data-tooltip="Memory Load" 
            value={metrics.memory} 
            icon={<IconServer />} 
            color="text-blue-500" 
            trend={-1.2} 
          />
          <MetricCard 
            data-tooltip="DB Storage" 
            value={metrics.dbStorage} 
            icon={<IconDatabase />} 
            color="text-emerald-500" 
          />
          <MetricCard 
            data-tooltip="Active Conn." 
            value={metrics.activeConnections} 
            icon={<IconActivity />} 
            suffix="usr"
            color="text-orange-500" 
            trend={+12} 
          />
          <MetricCard 
            data-tooltip="System Uptime" 
            value={metrics.uptime} 
            icon={<IconClock />} 
            suffix=""
            color="text-indigo-500" 
          />
          <MetricCard 
            data-tooltip="Error Rate" 
            value={metrics.errorRate} 
            icon={<IconBug />} 
            color="text-rose-500" 
            trend={-0.05} 
          />
        </div>

        {/* RECENT ALERTS / LOGS MOCK */}
        <Card className="border border-slate-200 bg-transparent shadow-sm rounded-2xl overflow-hidden mt-6">
          <CardHeader className="border-b border-slate-200 bg-slate-50/50 px-5 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <IconBug size={14} className="text-ios-primary" />
              Recent Infrastructure Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto custom-scrollbar w-full">
<table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-200">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-semibold text-slate-600">
                <tr className="border-b border-slate-200 hover:bg-white/50 transition-colors">
                  <td className="px-5 py-3">10 mins ago</td>
                  <td className="px-5 py-3"><span className="text-[11px] px-2 py-1 bg-yellow-100 text-yellow-600 rounded uppercase tracking-widest">Warning</span></td>
                  <td className="px-5 py-3">High memory utilization on Worker Node 2</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-white/50 transition-colors">
                  <td className="px-5 py-3">2 hours ago</td>
                  <td className="px-5 py-3"><span className="text-[11px] px-2 py-1 bg-red-100 text-red-600 rounded uppercase tracking-widest">Critical</span></td>
                  <td className="px-5 py-3">Database connection timeout (recovered)</td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="px-5 py-3">Yesterday</td>
                  <td className="px-5 py-3"><span className="text-[11px] px-2 py-1 bg-blue-100 text-blue-600 rounded uppercase tracking-widest">Info</span></td>
                  <td className="px-5 py-3">Automated backup completed successfully</td>
                </tr>
              </tbody>
            </table>
</div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default OverviewDashboard;
