import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from "lucide-react";

const TrendsChart = ({ data, loading, height = 300 }) => {
  return (
    <div style={{ height }} className="w-full relative">
        {loading ? (
          <div className="h-full w-full flex flex-col items-center justify-center">
            <Loader2 size={24} className="text-[#E31E24] animate-spin opacity-20 mb-2" />
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Analyzing Vectors...</p>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E31E24" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#E31E24" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 8, fontWeight: 900, fill: '#cbd5e1' }}
                tickFormatter={(str) => (str && typeof str === 'string') ? str.split('-')[2] : ''}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 8, fontWeight: 900, fill: '#cbd5e1' }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #f1f5f9', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  fontSize: '9px',
                  fontWeight: '900',
                  textTransform: 'uppercase'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="present" 
                stroke="#E31E24" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPresent)" 
              />
              <Area 
                type="monotone" 
                dataKey="late" 
                stroke="#f59e0b" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorLate)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center opacity-40">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">No Intelligence Data</p>
          </div>
        )}
    </div>
  );
};

export default TrendsChart;
