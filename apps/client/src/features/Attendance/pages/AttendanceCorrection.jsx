import React, { useState, useEffect } from 'react';
import { 
  IconEditCircle, 
  IconArrowLeft,
  IconCheck,
  IconX,
  IconClock,
  IconSearch,
  IconFilter,
  IconAlertCircle
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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
      const res = await apiClient.get('/api/attendance/corrections');
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
    <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc] custom-scrollbar animate-fade-in">
      <div className="w-full mx-auto space-y-4">
        
        {/* HEADER */}
        <div className="flex items-center justify-between bg-white p-3 px-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] backdrop-blur-md">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate('/attendance')}
              className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-[#E31E24] hover:border-[#E31E24]/20 hover:bg-white transition-all active:scale-95 shrink-0"
            >
              <IconArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-3 leading-none">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <IconEditCircle size={20} className="text-amber-600" />
                </div>
                KOREKSI <span className="text-amber-600 font-black opacity-90">ABSENSI</span>
              </h2>
            </div>
          </div>
        </div>

        {/* CONTROL CENTER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white/60 p-2.5 rounded-2xl border border-white shadow-sm backdrop-blur-sm">
            {/* Search Input */}
            <div className="md:col-span-8 flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm transition-all focus-within:border-amber-500/30 focus-within:shadow-md group">
                <IconSearch size={14} className="text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                <div className="flex flex-col flex-1">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Cari Pengajuan</span>
                  <input 
                      type="text" 
                      placeholder="NAMA ATAU ID KARYAWAN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-none w-full text-[10px] font-black text-slate-700 placeholder:text-slate-200 focus:outline-none uppercase tracking-widest p-0"
                  />
                </div>
            </div>

            {/* Legend / Information */}
            <div className="md:col-span-4 flex items-center justify-between px-5 py-2 rounded-xl bg-slate-50 border border-slate-100 shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Total Menunggu</span>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                    {corrections.filter(c => c.status === 'PENDING').length} Pengajuan
                  </p>
                </div>
                <IconAlertCircle size={16} className="text-amber-500" />
            </div>
        </div>

        {/* LIST VIEW */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="overflow-x-auto relative">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-md">
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Tanggal & Pegawai</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Jam Asli</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Jam Usulan</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Alasan Koreksi</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <IconClock className="animate-spin text-slate-200" size={32} />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] animate-pulse">Memuat data pengajuan...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-slate-300 uppercase font-black text-[10px] tracking-[0.2em]">Tidak ada pengajuan koreksi</td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-all group border-b border-transparent hover:border-slate-100">
                      <td className="px-6 py-3">
                        <div className="flex flex-col">
                           <span className="text-[11px] font-black text-slate-700 tracking-tight">{row.date}</span>
                           <p className="text-[11px] font-black text-slate-800 uppercase leading-none mt-1">{row.employees?.name}</p>
                           <p className="text-[9px] font-bold text-slate-400 tracking-widest">{row.employees?.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            In: <span className="font-black text-slate-700">{row.original_clock_in?.substring(0, 5) || '--:--'}</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Out: <span className="font-black text-slate-700">{row.original_clock_out?.substring(0, 5) || '--:--'}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col gap-1 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50 w-fit">
                          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                            In: <span className="font-black text-amber-700">{row.proposed_clock_in?.substring(0, 5) || '--:--'}</span>
                          </span>
                          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                            Out: <span className="font-black text-amber-700">{row.proposed_clock_out?.substring(0, 5) || '--:--'}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 max-w-[200px]">
                        <p className="text-[10px] font-bold text-slate-500 italic break-words">"{row.reason}"</p>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider border ${
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
                                className="h-8 px-3 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors font-black text-[9px] tracking-wider uppercase gap-1"
                              >
                                <IconCheck size={14} /> Setuju
                              </button>
                              <button 
                                onClick={() => handleProcess(row.id, 'REJECTED')}
                                className="h-8 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors font-black text-[9px] tracking-wider uppercase gap-1"
                              >
                                <IconX size={14} /> Tolak
                              </button>
                            </div>
                          ) : (
                            <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest">
                              Menunggu Review
                            </span>
                          )
                        )}
                        {row.status !== 'PENDING' && (
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
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
