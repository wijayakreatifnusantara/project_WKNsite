import React, { useState, useEffect } from 'react';
import { 
  IconEditCircle, 
  IconArrowLeft,
  IconCheck,
  IconX,
  IconClock,
  IconSearch,
  IconFilter,
  IconAlertCircle,
  IconFileText
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiClient } from '@/lib/apiClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const AttendanceCorrection = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [corrections, setCorrections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchCorrections = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/attendance/corrections');
      setCorrections(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching corrections:', err);
      toast.error("Gagal memuat data koreksi absensi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrections();
  }, []);

  const handleProcess = async (id, status) => {
    try {
      toast.loading(`Memproses pengajuan...`, { id: 'process' });
      await apiClient.put(`/api/attendance/corrections/${id}`, {
        status: status,
        reviewed_by: user?.username || 'Admin'
      });
      toast.success(`Koreksi berhasil di-${status.toLowerCase()}`, { id: 'process' });
      fetchCorrections();
    } catch (error) {
      toast.error(`Gagal memproses koreksi`, { id: 'process' });
    }
  };

  const filteredData = corrections.filter(item => 
    item.employees?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.employees?.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-transparent custom-scrollbar animate-fade-in">
      <div className="w-full mx-auto space-y-4">
        
        {/* Header removed as per Phase 2 Audit (redundant with breadcrumb) */}

        {/* CONTROL CENTER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-2.5 rounded-2xl border border-white shadow-sm ">
            {/* Search Input */}
            <div className="md:col-span-8 flex items-center gap-3 bg-transparent px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all focus-within:border-ios-primary  group focus-within:ring-2 focus-within:ring-ios-primary/20">
                <IconSearch size={14} className="text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                <div className="flex flex-col flex-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Cari Pengajuan</span>
                  <input 
                      type="text" 
                      placeholder="NAMA ATAU ID KARYAWAN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-none w-full text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none uppercase tracking-widest p-0"
                  />
                </div>
            </div>

            {/* Legend / Information */}
            <div className="md:col-span-4 flex items-center justify-between px-5 py-2 rounded-xl bg-white shadow-sm border-none shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Total Menunggu</span>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-tighter">
                    {corrections.filter(c => c.status === 'PENDING').length} Pengajuan
                  </p>
                </div>
                <IconAlertCircle size={16} className="text-amber-500" />
            </div>
        </div>

        {/* LIST VIEW */}
        <div className="bg-transparent rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto relative">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 ">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal & Pegawai</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Jam Asli</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Jam Usulan</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Alasan Koreksi</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse border-b border-slate-100">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                           <div className="h-4 bg-slate-200 rounded w-24"></div>
                           <div className="h-4 bg-slate-200 rounded w-32"></div>
                           <div className="h-3 bg-slate-100 rounded w-20"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                           <div className="h-3 bg-slate-200 rounded w-16"></div>
                           <div className="h-3 bg-slate-200 rounded w-16"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                           <div className="h-3 bg-slate-200 rounded w-16"></div>
                           <div className="h-3 bg-slate-200 rounded w-16"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-24 mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-20 mx-auto"></div></td>
                    </tr>
                  ))
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-24">
                       <EmptyState 
                          icon={IconFileText}
                          data-tooltip="Tidak Ada Pengajuan"
                          description="Belum ada pengajuan koreksi absen untuk saat ini."
                       />
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.id} className="transition-all group border-b border-transparent hover:border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-6 py-3">
                        <div className="flex flex-col">
                           <span className="text-[11px] font-semibold text-slate-700 tracking-tight">{row.date}</span>
                           <p className="text-[11px] font-semibold text-slate-800 uppercase leading-none mt-1">{row.employees?.name}</p>
                           <p className="text-xs font-bold text-slate-400 tracking-widest">{row.employees?.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            In: <span className="font-bold text-slate-700">{row.original_clock_in?.substring(0, 5) || '--:--'}</span>
                          </span>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Out: <span className="font-bold text-slate-700">{row.original_clock_out?.substring(0, 5) || '--:--'}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col gap-1 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50 w-fit">
                          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                            In: <span className="font-bold text-amber-700">{row.proposed_clock_in?.substring(0, 5) || '--:--'}</span>
                          </span>
                          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                            Out: <span className="font-bold text-amber-700">{row.proposed_clock_out?.substring(0, 5) || '--:--'}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 max-w-[200px]">
                        <p className="text-xs font-bold text-slate-500 italic break-words">"{row.reason}"</p>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 rounded text-[11px] font-semibold uppercase tracking-wider border ${
                          row.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          row.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {row.status === 'PENDING' && (
                          isAdmin ? (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleProcess(row.id, 'APPROVED')}
                                className="h-8 px-3 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors font-bold text-xs tracking-wider uppercase gap-1"
                              >
                                <IconCheck size={14} /> Setuju
                              </button>
                              <button 
                                onClick={() => handleProcess(row.id, 'REJECTED')}
                                className="h-8 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors font-bold text-xs tracking-wider uppercase gap-1"
                              >
                                <IconX size={14} /> Tolak
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-widest">
                              Menunggu Review
                            </span>
                          )
                        )}
                        {row.status !== 'PENDING' && (
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                            {row.status === 'APPROVED' ? 'Selesai' : 'Ditolak'} oleh {row.reviewed_by}
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

export default AttendanceCorrection;
