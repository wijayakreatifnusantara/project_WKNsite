import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { IconCircleCheck, IconClock, IconAlertTriangle, IconActivity } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';

const LiveFeed = ({ loading: parentLoading }) => {
  const [activities, setActivities] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);

  const fetchActivities = async () => {
    try {
      setLocalLoading(true);
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          employees (
            name,
            id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const mapped = (data || []).map(item => ({
        name: item.employees?.name || 'Unknown',
        id: item.employees?.id || '-',
        time: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
        status: item.status,
        raw_date: item.created_at
      }));

      setActivities(mapped);
    } catch (err) {
      console.error("Error fetching live feed:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const channel = supabase
      .channel('live_feed_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => fetchActivities())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const isLoading = parentLoading || localLoading;

  return (
    <Card className="h-full bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <IconActivity size={14} className="text-[#E31E24]" />
            Live Status
          </h3>
          <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real-time Check-in Feed</p>
        </div>
        <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
      </div>
      <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar min-h-[300px]">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center p-8">
            <Loader2 size={20} className="text-[#E31E24] animate-spin opacity-20" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">No activity recorded</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50" style={{ contentVisibility: 'auto' }}>
            {activities.map((item, idx) => (
              <div key={idx} className="px-4 py-2 hover:bg-slate-50 transition-all cursor-pointer group flex items-center justify-between" style={{ contentVisibility: 'auto' }}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-black text-[9px] group-hover:bg-white group-hover:text-[#E31E24] transition-all border border-transparent group-hover:border-slate-100">
                    {item.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[10px] font-black text-slate-700 group-hover:text-[#E31E24] transition-colors uppercase truncate tracking-tight leading-none mb-1">{item.name}</h5>
                    <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest leading-none">{item.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 justify-end text-[8px] font-black uppercase ${item.status === 'Present' ? 'text-emerald-500' : item.status === 'Late' ? 'text-amber-500' : 'text-rose-500'}`}>
                    {item.status}
                  </div>
                  <p className="text-[7px] text-slate-300 font-black mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveFeed;
