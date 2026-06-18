import React from 'react';
import { IconAlertTriangle, IconCurrentLocation, IconDeviceMobile } from '@tabler/icons-react';

const AnomalyAlerts = () => {
  const alerts = [
    { id: 1, type: 'location', message: 'Clock-in 5km outside Geofence', user: 'Budi Santoso', time: '08:14' },
    { id: 2, type: 'device', message: 'Multiple accounts on same device', user: 'System', time: '07:45' }
  ];

  return (
    <div className="bg-transparent rounded-2xl border border-rose-200 p-4 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
          <IconAlertTriangle size={14} className="text-rose-500" />
          AI Fraud Alerts
        </h3>
        <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[11px] font-semibold rounded-full uppercase tracking-widest">
          {alerts.length} Detected
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
        {alerts.map(alert => (
          <div key={alert.id} className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/50 flex gap-3 group hover:bg-rose-50 transition-colors cursor-pointer">
            <div className="h-8 w-8 rounded-lg bg-transparent border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              {alert.type === 'location' ? <IconCurrentLocation size={16} /> : <IconDeviceMobile size={16} />}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate">{alert.message}</h4>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{alert.user}</span>
                <span className="text-[11px] font-semibold text-rose-400">{alert.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnomalyAlerts;
