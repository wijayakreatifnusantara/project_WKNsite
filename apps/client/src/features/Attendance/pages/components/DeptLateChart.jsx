import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2 } from "lucide-react";

const DeptLateChart = ({ loading, height = 200 }) => {
  const data = [
    { dept: "Engineering", minutes: 450 },
    { dept: "Finance", minutes: 120 },
    { dept: "Sales", minutes: 340 },
    { dept: "HR", minutes: 80 },
    { dept: "Operations", minutes: 560 },
  ];

  const COLORS = ['#E31E24', '#f59e0b', '#3b82f6', '#10b981', '#6366f1'];

  return (
    <div style={{ height }} className="w-full relative">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 size={20} className="text-ios-primary animate-spin opacity-20" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="dept" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 8, fontWeight: 900, fill: '#cbd5e1' }}
                width={60}
              />
              <Tooltip 
                cursor={{fill: 'transparent'}}
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
              <Bar dataKey="minutes" radius={[0, 4, 4, 0]} barSize={12}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
    </div>
  );
};

export default DeptLateChart;
