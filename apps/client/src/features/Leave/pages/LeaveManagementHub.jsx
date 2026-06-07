import React, { useState, useEffect } from 'react';
import { 
  IconClipboardCheck, 
  IconUsers, 
  IconCalendarStats,
  IconCheck,
  IconX,
  IconPlus,
  IconFilter,
  IconFileText,
  IconChevronRight,
  IconClock,
  IconActivity,
  IconAlertCircle,
  IconUserCircle,
  IconArrowLeft
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LeaveRequestModal from './components/LeaveRequestModal';
import { toast } from 'sonner';

const LeaveManagementHub = () => {
  const navigate = useNavigate();
  const { profile, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Pending');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/leave/requests');
      // Assume the backend returns them in order, or we sort them here
      setRequests(response.data.data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)) || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async () => {
    try {
      const response = await apiClient.get('/api/leave/balances');
      setBalances(response.data.data || []);
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchBalances();

      const interval = setInterval(() => {
        fetchRequests();
        fetchBalances();
      }, 30000); // Polling every 30s instead of websockets for now

    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (request, status) => {
    try {
      setLoading(true);
      
      // 1. Send approval payload to backend
      // The backend handles PDF regeneration, attendance sync, and balance deduction!
      await apiClient.patch(`/api/leave/approve/${request.id}`, {
        status,
        admin_id: profile?.employee_id || profile?.id
      });

      toast.success(`Request ${status} successfully`);
      fetchRequests();
      fetchBalances();
    } catch (err) {
      console.error("Approval error:", err);
      toast.error("Failed to process request");
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

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#f8fafc] custom-scrollbar animate-fade-in text-[10px]">
      <div className="max-w-[1600px] mx-auto space-y-4">
        
        {/* 🚀 PREMIUM COMPACT HEADER */}
        <div className="flex items-center justify-between bg-white p-2 px-5 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => navigate('/attendance')}
               className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-[#E31E24] hover:border-[#E31E24]/20 hover:bg-white transition-all active:scale-95"
             >
               <IconArrowLeft size={16} />
             </button>
             <div className="h-8 w-8 bg-[#E31E24]/10 rounded-lg flex items-center justify-center text-[#E31E24]">
                <IconClipboardCheck size={18} />
             </div>
             <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">
                  Leave <span className="text-[#E31E24]">Management Hub</span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="h-1 w-1 bg-[#E31E24] rounded-full animate-pulse"></div>
                   <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Workflow & Balances Sync Active</span>
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
              <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="h-8 px-4 rounded-lg bg-[#E31E24] text-white font-black text-[8px] uppercase tracking-widest shadow-md hover:bg-[#C1181E] flex gap-2 items-center"
              >
                <IconPlus size={14} />
                New Request
              </Button>
          </div>
        </div>

        {/* 📊 KPI STRIP */}
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
             icon={<IconCheck size={16} />} 
             color="emerald"
           />
           <StatCard 
             title="Total On Leave (Today)" 
             value={requests.filter(r => {
                const now = new Date().toISOString().split('T')[0];
                return r.status === 'Approved' && now >= r.start_date && now <= r.end_date;
             }).length}
             icon={<IconUsers size={16} />} 
             color="indigo"
           />
           <StatCard 
             title="Total Requests Processed" 
             value={requests.filter(r => r.status !== 'Pending').length} 
             unit="Docs"
             icon={<IconFileText size={16} />} 
             color="rose"
           />
        </div>

        {/* 📜 HIGH DENSITY REQUESTS TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Type & Duration</th>
                  <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Period</th>
                  <th className="px-5 py-3 text-center text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3 text-right text-[8px] font-black text-slate-400 uppercase tracking-widest">Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading && requests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                       <IconActivity className="mx-auto animate-spin text-slate-200 mb-2" size={24} />
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Syncing request database...</p>
                    </td>
                  </tr>
                ) : requests.filter(r => filterStatus === 'All' || r.status === filterStatus).length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-300 uppercase font-black text-[9px] tracking-widest">No requests found in this category</td>
                  </tr>
                ) : (
                  requests.filter(r => filterStatus === 'All' || r.status === filterStatus).map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-5 py-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-[#E31E24]">
                            {row.employees?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-800 uppercase leading-none mb-1 group-hover:text-[#E31E24] transition-colors">{row.employees?.name}</p>
                            <p className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">{row.employees?.division_name || row.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">
                             {row.leave_type === 'Emergency' ? 'Izin Pulang Cepat' : row.leave_type}
                           </span>
                           {row.leave_type === 'Emergency' && row.start_time && row.end_time && (
                             <span className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                               Jam: {row.start_time} - {row.end_time}
                             </span>
                           )}
                           <span className="text-[8px] font-bold text-[#E31E24] uppercase mt-0.5">{row.days_count} Working Days</span>
                        </div>
                      </td>
                      <td className="px-5 py-2">
                         <div className="flex items-center gap-2 text-slate-500">
                            <span className="text-[10px] font-black">{row.start_date}</span>
                            <IconChevronRight size={10} className="text-slate-300" />
                            <span className="text-[10px] font-black">{row.end_date}</span>
                         </div>
                      </td>
                      <td className="px-5 py-2 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-2 text-right">
                        <div className="flex justify-end items-center gap-3">
                          {row.pdf_url && (
                            <a 
                              href={row.pdf_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-white transition-all active:scale-95 shrink-0"
                              title="Unduh PDF TTD Resmi"
                            >
                              <IconFileText size={14} className="text-[#E31E24]" />
                            </a>
                          )}
                          {row.status === 'Pending' && isAdmin() ? (
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                              <button 
                                onClick={() => handleApprove(row, 'Approved')}
                                className="h-7 px-3 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm"
                              >
                                <IconCheck size={12} />
                                Approve
                              </button>
                              <button 
                                onClick={() => handleApprove(row, 'Rejected')}
                                className="h-7 px-3 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm"
                              >
                                <IconX size={12} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                              {row.status !== 'Pending' ? `Processed by ${row.approved_by || 'System'}` : 'Waiting Approval'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LeaveRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
           fetchRequests();
           fetchBalances();
        }}
      />
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

export default LeaveManagementHub;
