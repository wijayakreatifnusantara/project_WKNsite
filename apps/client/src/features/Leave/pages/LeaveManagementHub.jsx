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
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
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
      const response = await apiClient.get('/leave/requests');
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
      const response = await apiClient.get('/leave/balances');
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
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Period</th>
                  <th className="px-5 py-3 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading && requests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                       <IconActivity className="mx-auto animate-spin text-slate-200 mb-2" size={24} />
                       <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Syncing request database...</p>
                    </td>
                  </tr>
                ) : requests.filter(r => filterStatus === 'All' || (filterStatus === 'Pending' ? r.status?.startsWith('Pending') : r.status === filterStatus)).length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-300 uppercase font-bold text-xs tracking-widest">No requests found in this category</td>
                  </tr>
                ) : (
                  requests.filter(r => filterStatus === 'All' || (filterStatus === 'Pending' ? r.status?.startsWith('Pending') : r.status === filterStatus)).map((row) => (
                    <tr key={row.id} className="transition-all group hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-5 py-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-ios-primary">
                            {row.employees?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 uppercase leading-none mb-1 group-hover:text-ios-primary transition-colors">{row.employees?.name}</p>
                            <p className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase">{row.employees?.division_name || row.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2">
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                             {row.leave_type === 'Emergency' ? 'Izin Pulang Cepat' : row.leave_type}
                           </span>
                           {row.leave_type === 'Emergency' && row.start_time && row.end_time && (
                             <span className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">
                               Jam: {row.start_time} - {row.end_time}
                             </span>
                           )}
                           <span className="text-[11px] font-semibold text-ios-primary uppercase mt-0.5">{row.days_count} Working Days</span>
                        </div>
                      </td>
                      <td className="px-5 py-2">
                         <div className="flex items-center gap-2 text-slate-500">
                            <span className="text-xs font-bold">{row.start_date}</span>
                            <IconChevronRight size={10} className="text-slate-300" />
                            <span className="text-xs font-bold">{row.end_date}</span>
                         </div>
                      </td>
                      <td className="px-5 py-2 text-center">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-5 py-2 text-right">
                        <div className="flex justify-end items-center gap-3">
                          {row.pdf_url && (
                            <a 
                              href={row.pdf_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="h-7 w-7 rounded-lg bg-white shadow-sm border-none shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-transparent transition-all active:scale-95 shrink-0"
                              data-tooltip="Unduh PDF TTD Resmi"
                            >
                              <IconFileText size={14} className="text-ios-primary" />
                            </a>
                          )}
                          {row.status?.startsWith('Pending') && isAdmin() ? (
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                              <button 
                                onClick={() => handleApprove(row, 'Approved')}
                                className="h-7 px-3 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all text-[11px] font-semibold uppercase tracking-widest flex items-center gap-1.5 shadow-sm"
                              >
                                <IconCheck size={12} />
                                Approve
                              </button>
                              <button 
                                onClick={() => handleApprove(row, 'Rejected')}
                                className="h-7 px-3 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all text-[11px] font-semibold uppercase tracking-widest flex items-center gap-1.5 shadow-sm"
                              >
                                <IconX size={12} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">
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
    <Card className="ios-card p-3 flex items-center gap-3 transition-all hover:-translate-y-0.5 cursor-pointer">
      <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-sm font-bold text-slate-800 leading-none">{value}</h3>
          {unit && <span className="text-[11px] font-semibold text-slate-400 uppercase">{unit}</span>}
        </div>
      </div>
    </Card>
  );
};

export default LeaveManagementHub;
