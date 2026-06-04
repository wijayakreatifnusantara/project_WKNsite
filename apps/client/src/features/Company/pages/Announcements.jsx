import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

export default function Announcements() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('info');
  const [targetType, setTargetType] = useState('ALL'); // ALL, DEPARTMENT, POSITION
  const [targetValue, setTargetValue] = useState('');
  
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        apiClient.get('/api/organizations/departments'),
        apiClient.get('/api/employees')
      ]);

      if (deptRes.data && deptRes.data.data) setDepartments(deptRes.data.data);
      if (empRes.data && empRes.data.data) {
        // Extract unique job positions
        const uniquePositions = [...new Set(empRes.data.data.map(emp => emp.job_position).filter(Boolean))];
        setPositions(uniquePositions);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      toast.error('Judul dan isi pengumuman wajib diisi');
      return;
    }

    if (targetType !== 'ALL' && !targetValue) {
      toast.error('Silakan pilih target penerima spesifik');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        body,
        type,
        targetType,
        targetValue
      };

      const res = await apiClient.post('/api/company/announcements', payload);
      toast.success(res.data.message || 'Pengumuman berhasil dikirim!');
      
      // Reset form
      setTitle('');
      setBody('');
      setType('info');
      setTargetType('ALL');
      setTargetValue('');

    } catch (error) {
      console.error('Error sending announcement:', error);
      toast.error('Gagal mengirim pengumuman: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Kirim Pengumuman (Broadcast)</h2>
        <p className="text-sm text-slate-500 mt-1">
          Kirim notifikasi yang akan langsung muncul di HP karyawan via aplikasi WKN Mobile.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-wkn-500 focus:border-wkn-500 transition-all outline-none text-slate-800"
                  placeholder="Contoh: Perubahan Jam Kerja Selama Ramadhan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Isi Pengumuman</label>
                <textarea
                  required
                  rows="4"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-wkn-500 focus:border-wkn-500 transition-all outline-none text-slate-800 resize-none"
                  placeholder="Tuliskan isi pesan pengumuman dengan jelas..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Pesan (Warna Ikon)</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-wkn-500 outline-none"
                >
                  <option value="info">Informasi (Biru Ungu)</option>
                  <option value="system">Sistem (Oranye)</option>
                  <option value="hr">HR / Personalia (Biru Terang)</option>
                  <option value="alert">Peringatan Penting (Merah)</option>
                  <option value="payroll">Gaji & Keuangan (Hijau)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Penerima</label>
                <select
                  value={targetType}
                  onChange={e => {
                    setTargetType(e.target.value);
                    setTargetValue('');
                  }}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-wkn-500 outline-none"
                >
                  <option value="ALL">Semua Karyawan (Seluruh Perusahaan)</option>
                  <option value="DEPARTMENT">Berdasarkan Departemen</option>
                  <option value="POSITION">Berdasarkan Jabatan</option>
                </select>
              </div>

              {targetType === 'DEPARTMENT' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Departemen</label>
                  <select
                    value={targetValue}
                    onChange={e => setTargetValue(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-wkn-500 outline-none"
                  >
                    <option value="">-- Pilih Departemen --</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'POSITION' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Jabatan</label>
                  <select
                    value={targetValue}
                    onChange={e => setTargetValue(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-wkn-500 outline-none"
                  >
                    <option value="">-- Pilih Jabatan --</option>
                    {positions.map((pos, idx) => (
                      <option key={idx} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-wkn-500 text-white font-medium rounded-lg hover:bg-wkn-600 transition-colors shadow-sm disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <span>Sedang Mengirim...</span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Kirim Pengumuman
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
