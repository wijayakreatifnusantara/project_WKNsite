import React, { useState, useEffect } from 'react';
import { 
  IconClock, 
  IconCheck, 
  IconX, 
  IconArrowLeft,
  IconUsers,
  IconChartBar,
  IconCalendarEvent,
  IconAlertCircle,
  IconUserCheck
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const OvertimeManagementPage = () => {
  const navigate = useNavigate();
  const { profile, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Pending');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('overtime_requests')
        .select(`
          *,
          employees (
            name,
            employee_id,
            organization_name,
            job_position
          )
        `)
        .order('date', { ascending: false });

      if (!isAdmin()) {
        query = query.eq('employee_id', profile?.employee_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error("Error fetching overtime requests:", err);
      toast.error("Gagal memuat data pengajuan lembur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('overtime_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'overtime_requests' }, () => fetchRequests())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleApprove = async (request, status) => {
    try {
      setLoading(true);
      
      const { error: updateError } = await supabase
        .from('overtime_requests')
        .update({ 
          status, 
          approved_by: profile?.employee_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast.success(`Pengajuan lembur ${status === 'Approved' ? 'disetujui' : 'ditolak'} sukses`);
      fetchRequests();
    } catch (err) {
      console.error("Overtime approval error:", err);
      toast.error("Gagal memproses persetujuan lembur");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'REJECTED': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-amber-600 bg-amber-50 border-amber-100';
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  const totalApprovedHours = requests
    .filter(r => r.status === 'Approved')
    .reduce((sum, r) => sum + parseFloat(r.duration_hours || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#f8fafc] custom-scrollbar animate-fade-in text-[10px]">
      <div className="max-w-[1600px] mx-auto space-y-4">
        
        {/* 🚀 HEADER & FILTER BAR */}
        <div className="flex items-center justify-between bg-white p-2 px-5 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => navigate('/attendance')}
               className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-[#E31E24] hover:border-[#E31E24]/20 hover:bg-white transition-all active:scale-95"
             >
               <IconArrowLeft size={16} />
             </button>
             <div className="h-8 w-8 bg-[#E31E24]/10 rounded-lg flex items-center justify-center text-[#E31E24]">
                <IconClock size={18} />
             </div>
             <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">
                  Overtime <span className="text-[#E31E24]">Management</span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="h-1 w-1 bg-[#E31E24] rounded-full animate-pulse"></div>
                   <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Overtime requests sync active</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {['Pending', 'Approved', 'Rejected', 'All'].map((s) => (
                    <button 
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-white shadow-sm text-[#E31E24]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {s}
                    </button>
                  ))}
              </div>
          </div>
        </div>

        {/* 📊 KPI SUMMARY STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
           <StatCard 
             title="Pending Reviews" 
             value={requests.filter(r => r.status === 'Pending').length} 
             icon={<IconClock size={16} />} 
             color="amber"
           />
           <StatCard 
             title="Approved Requests" 
             value={requests.filter(r => r.status === 'Approved').length} 
             icon={<IconUserCheck size={16} />} 
             color="emerald"
           />
           <StatCard 
             title="Total Approved Hours" 
             value={totalApprovedHours.toFixed(1)} 
             unit="Hours"
             icon={<IconChartBar size={16} />} 
             color="indigo"
           />
           <StatCard 
             title="Total Requests Submitted" 
             value={requests.length} 
             icon={<IconUsers size={16} />} 
             color="rose"
           />
        </div>

        {/* 📜 TABLE VIEW OF OVERTIME REQUESTS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Karyawan</th>
                  <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Tanggal Lembur</th>
                  <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Jam & Durasi</th>
                  <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Alasan Lembur</th>
                  <th className="px-5 py-3 text-center text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3 text-right text-[8px] font-black text-slate-400 uppercase tracking-widest">Otorisasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading && requests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                       <div className="h-6 w-6 border-2 border-t-transparent border-[#E31E24] rounded-full animate-spin mx-auto mb-2" />
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Syncing overtime requests...</p>
                    </td>
                  </tr>
                ) : requests.filter(r => filterStatus === 'All' || r.status === filterStatus).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-300 uppercase font-black text-[9px] tracking-widest">Tidak ada pengajuan lembur di kategori ini</td>
                  </tr>
                ) : (
                  requests.filter(r => filterStatus === 'All' || r.status === filterStatus).map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-5 py-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-[#E31E24]">
                            {row.employees?.name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-800 uppercase leading-none mb-1 group-hover:text-[#E31E24] transition-colors">{row.employees?.name || 'Karyawan'}</p>
                            <p className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">{row.employees?.organization_name || 'Staff'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2">
                         <span className="text-[10px] font-black text-slate-600">
                           {new Date(row.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                         </span>
                      </td>
                      <td className="px-5 py-2">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">
                             {formatTime(row.start_time)} - {formatTime(row.end_time)}
                           </span>
                           <span className="text-[8px] font-bold text-[#E31E24] uppercase mt-0.5">{row.duration_hours} Jam Kerja</span>
                        </div>
                      </td>
                      <td className="px-5 py-2">
                         <p className="text-[9px] text-slate-600 font-semibold max-w-sm truncate" title={row.reason}>
                           {row.reason}
                         </p>
                      </td>
                      <td className="px-5 py-2 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-2 text-right">
                        {row.status === 'Pending' && isAdmin() ? (
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => handleApprove(row, 'Approved')}
                              className="h-7 px-3 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm"
                            >
                              <IconCheck size={12} />
                              Setujui
                            </button>
                            <button 
                              onClick={() => handleApprove(row, 'Rejected')}
                              className="h-7 px-3 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm"
                            >
                              <IconX size={12} />
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                            {row.status !== 'Pending' ? `Diproses oleh ${row.approved_by || 'HR Admin'}` : 'Menunggu Persetujuan'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, unit = "", icon, color }) => {
  const colorMap = {
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100"
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-sm p-3 flex items-center gap-3 transition-all hover:translate-y-[-2px] cursor-pointer">
      <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-sm font-black text-slate-800 leading-none">{value}</h3>
          {unit && <span className="text-[8px] font-black text-slate-400 uppercase">{unit}</span>}
        </div>
      </div>
    </Card>
  );
};

export default OvertimeManagementPage;
