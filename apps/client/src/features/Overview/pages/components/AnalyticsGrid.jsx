import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area,
  RadialBarChart, RadialBar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconChartPie, IconChartBar, IconChartAreaLine, IconChartDonut } from "@tabler/icons-react";

const COLORS = ['#E31E24', '#0EA5E9', '#F59E0B', '#10B981', '#6366F1', '#8B5CF6', '#EC4899'];

const AnalyticsGrid = ({ employees }) => {
  
  const deptData = useMemo(() => {
    if (!employees.length) return [];
    const counts = {};
    employees.forEach(emp => {
      const dept = emp["Division Name *"] || 'Other';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [employees]);

  const statusData = useMemo(() => {
    if (!employees.length) return [];
    const counts = {};
    employees.forEach(emp => {
      const status = emp["Status *"] || 'Other';
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const trendData = [
    { name: 'Jan', hired: 45, left: 12 },
    { name: 'Feb', hired: 52, left: 8 },
    { name: 'Mar', hired: 38, left: 15 },
    { name: 'Apr', hired: 65, left: 10 },
    { name: 'May', hired: 48, left: 22 },
    { name: 'Jun', hired: 59, left: 5 },
  ];

  return (
    <div className="grid grid-cols-12 gap-4">
      
      {/* 1. Headcount Distribution by Department */}
      <Card className="col-span-12 md:col-span-4 border-white border-[4px] shadow-neu bg-[#f0f2f5] rounded-[2rem] overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-white/50 flex flex-row items-center gap-3">
          <div className="h-10 w-10 bg-[#f0f2f5] shadow-neu rounded-xl flex items-center justify-center text-[#E31E24]">
            <IconChartPie size={20} />
          </div>
          <div>
            <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-widest">Division Distribution</CardTitle>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Top 5 Departments</p>
          </div>
        </CardHeader>
        <CardContent className="p-4 h-64 flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deptData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
              >
                {deptData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f0f2f5', 
                  borderRadius: '16px', 
                  border: '4px solid white',
                  boxShadow: '4px 4px 10px rgba(0,0,0,0.1)',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 2. Workforce Mutation Trends */}
      <Card className="col-span-12 md:col-span-8 border-white border-[4px] shadow-neu bg-[#f0f2f5] rounded-[2rem] overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-white/50 flex flex-row items-center gap-3">
          <div className="h-10 w-10 bg-[#f0f2f5] shadow-neu rounded-xl flex items-center justify-center text-[#E31E24]">
            <IconChartAreaLine size={20} />
          </div>
          <div>
            <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-widest">Workforce Mutation Trends</CardTitle>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Monthly Hired vs Resigned</p>
          </div>
        </CardHeader>
        <CardContent className="p-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E31E24" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#E31E24" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLeft" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f0f2f5', 
                  borderRadius: '16px', 
                  border: '4px solid white',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              />
              <Area type="monotone" dataKey="hired" stroke="#E31E24" strokeWidth={4} fillOpacity={1} fill="url(#colorHired)" />
              <Area type="monotone" dataKey="left" stroke="#64748b" strokeWidth={4} fillOpacity={1} fill="url(#colorLeft)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. Employment Status Bar Chart */}
      <Card className="col-span-12 border-white border-[4px] shadow-neu bg-[#f0f2f5] rounded-[2rem] overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-white/50 flex flex-row items-center gap-3">
          <div className="h-10 w-10 bg-[#f0f2f5] shadow-neu rounded-xl flex items-center justify-center text-[#E31E24]">
            <IconChartBar size={20} />
          </div>
          <div>
            <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-widest">Workforce Status Distribution</CardTitle>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aggregated by Contract Type</p>
          </div>
        </CardHeader>
        <CardContent className="p-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} layout="vertical" margin={{ left: 50, right: 30 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'black', fill: '#475569' }} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.2)' }}
                contentStyle={{ 
                  backgroundColor: '#f0f2f5', 
                  borderRadius: '16px', 
                  border: '4px solid white',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#E31E24" 
                radius={[0, 10, 10, 0]} 
                barSize={40} 
                className="shadow-neu"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
};

export default AnalyticsGrid;
