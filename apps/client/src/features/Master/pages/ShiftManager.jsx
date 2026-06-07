import React, { useState, useEffect } from 'react';
import {
  IconClock,
  IconCalendarEvent,
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconCircleCheck,
  IconAlertCircle,
  IconLoader2,
  IconMoon,
  IconSun
} from '@tabler/icons-react';

const _rawApi = import.meta.env.VITE_API_URL;
const API_URL = _rawApi ? (_rawApi.endsWith('/api') ? _rawApi : _rawApi.replace(/\/$/, '') + '/api') : 'http://localhost:8000/api';

const ShiftManager = () => {
  const [activeTab, setActiveTab] = useState('shifts');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Data States
  const [shifts, setShifts] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [shiftForm, setShiftForm] = useState({
    code: '',
    name: '',
    time_in: '',
    time_out: '',
    grace_period: 15,
    break_start: '',
    break_end: '',
    is_cross_day: false,
    is_active: true
  });

  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    type: 'Libur Nasional',
    description: ''
  });

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'shifts') {
        const res = await fetch(`${API_URL}/master/shifts`);
        const data = await res.json();
        if (data.status === 'success') {
          setShifts(data.data || []);
        } else {
          // If endpoint doesn't exist yet, we catch it silently for now
          setShifts([]);
        }
      } else {
        const res = await fetch(`${API_URL}/master/holidays`);
        const data = await res.json();
        if (data.status === 'success') {
          setHolidays(data.data || []);
        } else {
          setHolidays([]);
        }
      }
    } catch (err) {
      console.log('Failed to fetch data, possibly endpoint not ready yet.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // SHIFT HANDLERS
  // -------------------------------------------------------------
  const handleOpenShiftModal = (shift = null) => {
    if (shift) {
      setSelectedShift(shift);
      setShiftForm({
        code: shift.code,
        name: shift.name,
        time_in: shift.time_in,
        time_out: shift.time_out,
        grace_period: shift.grace_period || 15,
        break_start: shift.break_start || '',
        break_end: shift.break_end || '',
        is_cross_day: shift.is_cross_day || false,
        is_active: shift.is_active ?? true
      });
    } else {
      setSelectedShift(null);
      setShiftForm({
        code: '', name: '', time_in: '08:00', time_out: '17:00', grace_period: 15, break_start: '12:00', break_end: '13:00', is_cross_day: false, is_active: true
      });
    }
    setIsShiftModalOpen(true);
  };

  const handleSubmitShift = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = selectedShift ? `${API_URL}/master/shifts/${selectedShift.id}` : `${API_URL}/master/shifts`;
      const method = selectedShift ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftForm)
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast('success', selectedShift ? 'Shift berhasil diupdate' : 'Shift ditambahkan');
        setIsShiftModalOpen(false);
        fetchData();
      } else {
        showToast('error', data.detail || 'Gagal menyimpan shift');
      }
    } catch (err) {
      showToast('error', 'API Endpoint belum siap. Mock UI hanya.');
      setIsShiftModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // HOLIDAY HANDLERS
  // -------------------------------------------------------------
  const handleOpenHolidayModal = (holiday = null) => {
    if (holiday) {
      setSelectedHoliday(holiday);
      setHolidayForm({
        name: holiday.name,
        start_date: holiday.start_date,
        end_date: holiday.end_date || holiday.start_date,
        type: holiday.type || 'Libur Nasional',
        description: holiday.description || ''
      });
    } else {
      setSelectedHoliday(null);
      setHolidayForm({ name: '', start_date: '', end_date: '', type: 'Libur Nasional', description: '' });
    }
    setIsHolidayModalOpen(true);
  };

  const handleSubmitHoliday = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = selectedHoliday ? `${API_URL}/master/holidays/${selectedHoliday.id}` : `${API_URL}/master/holidays`;
      const method = selectedHoliday ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holidayForm)
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast('success', selectedHoliday ? 'Hari Libur diupdate' : 'Hari Libur ditambahkan');
        setIsHolidayModalOpen(false);
        fetchData();
      } else {
        showToast('error', data.detail || 'Gagal menyimpan hari libur');
      }
    } catch (err) {
      showToast('error', 'API Endpoint belum siap. Mock UI hanya.');
      setIsHolidayModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc] font-inter animate-fade-in">
      {/* HEADER SECTION */}
      <div className="bg-[#f8fafc]/95 backdrop-blur-xl border-b border-slate-200 z-10 shrink-0">
        <div className="w-full mx-auto p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-[#E31E24] border border-slate-200">
              <IconClock size={22} stroke={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tighter uppercase leading-none">Shift & Libur Nasional</h1>
              <p className="text-[7px] font-black text-[#E31E24] uppercase tracking-[0.2em] mt-0.5 opacity-80">Konfigurasi Waktu & Kehadiran</p>
            </div>
          </div>

          <div className="flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('shifts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === 'shifts' ? 'bg-white shadow-sm border border-slate-200/50 text-[#E31E24] scale-100' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <IconClock size={16} className={activeTab === 'shifts' ? 'text-[#E31E24]' : 'text-slate-400'} />
              <span>Master Shift</span>
            </button>
            <button
              onClick={() => setActiveTab('holidays')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === 'holidays' ? 'bg-white shadow-sm border border-slate-200/50 text-[#E31E24] scale-100' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <IconCalendarEvent size={16} className={activeTab === 'holidays' ? 'text-[#E31E24]' : 'text-slate-400'} />
              <span>Libur Nasional</span>
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {message.text && (
        <div className="px-4 pt-4 w-full mx-auto">
          <div className={`p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {message.type === 'success' ? <IconCircleCheck size={16} /> : <IconAlertCircle size={16} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="w-full mx-auto">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <IconLoader2 className="animate-spin text-[#E31E24]" size={32} />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Loading data...</p>
            </div>
          ) : activeTab === 'shifts' ? (
            // TAB: SHIFTS
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => handleOpenShiftModal()}
                  className="h-10 px-5 bg-[#E31E24] hover:bg-[#C1181E] text-white font-black text-[9px] uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <IconPlus size={14} /> Tambah Shift
                </button>
              </div>

              {shifts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-xs">
                  <IconClock size={48} className="mx-auto text-slate-200 mb-4" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">Belum ada Master Shift</h3>
                  <p className="text-xs text-slate-400">Silakan tambahkan shift kerja pertama Anda.</p>
                </div>
              ) : (
                <div className="overflow-hidden bg-white rounded-2xl border border-slate-200/60 shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/60">
                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Kode & Nama Shift</th>
                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Jam Kerja</th>
                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Info Tambahan</th>
                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                      {shifts.map(shift => (
                        <tr key={shift.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <span className="bg-[#E31E24]/10 text-[#E31E24] font-bold text-[9px] uppercase tracking-wider px-2 py-1 rounded-lg border border-[#E31E24]/15">
                                {shift.code}
                              </span>
                              <span className="font-bold text-slate-800 uppercase tracking-tight">{shift.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-semibold text-slate-700">
                            {shift.time_in?.substring(0, 5)} - {shift.time_out?.substring(0, 5)}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {shift.is_cross_day && (
                                <div className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100">
                                  <IconMoon size={10} />
                                  <span className="text-[8px] font-bold uppercase tracking-wider">Lintas Hari</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-100">
                                <IconSun size={10} />
                                <span className="text-[8px] font-bold uppercase tracking-wider">Toleransi {shift.grace_period}m</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-[8px] font-black px-2 py-1 rounded uppercase tracking-wider border ${shift.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                              {shift.is_active ? 'Aktif' : 'Non-aktif'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenShiftModal(shift)} className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#E31E24] hover:bg-red-50 flex items-center justify-center transition-colors">
                                <IconEdit size={14} />
                              </button>
                              <button className="h-7 w-7 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors">
                                <IconTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            // TAB: HOLIDAYS
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => handleOpenHolidayModal()}
                  className="h-10 px-5 bg-[#E31E24] hover:bg-[#C1181E] text-white font-black text-[9px] uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <IconPlus size={14} /> Tambah Libur Nasional
                </button>
              </div>

              {holidays.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-xs">
                  <IconCalendarEvent size={48} className="mx-auto text-slate-200 mb-4" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">Belum ada Hari Libur</h3>
                  <p className="text-xs text-slate-400">Silakan tambahkan data hari libur nasional atau cuti bersama.</p>
                </div>
              ) : (
                <div className="overflow-hidden bg-white rounded-2xl border border-slate-200/60 shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/60">
                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Nama Libur</th>
                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipe</th>
                        <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                      {holidays.map(hol => (
                        <tr key={hol.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 font-semibold text-slate-700">
                            {hol.start_date} {hol.end_date && hol.end_date !== hol.start_date ? ` s/d ${hol.end_date}` : ''}
                          </td>
                          <td className="px-5 py-3 font-bold text-slate-800">
                            {hol.name}
                            {hol.description && <span className="block font-normal text-slate-400 text-[10px] mt-0.5">{hol.description}</span>}
                          </td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-bold tracking-wider">
                              {hol.type}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenHolidayModal(hol)} className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors">
                                <IconEdit size={14} />
                              </button>
                              <button className="h-7 w-7 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors">
                                <IconTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SHIFT MODAL */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <IconClock className="text-[#E31E24]" size={18} />
                {selectedShift ? 'Edit Master Shift' : 'Tambah Master Shift'}
              </h3>
              <button onClick={() => setIsShiftModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitShift} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Kode Shift</label>
                  <input
                    required
                    type="text"
                    value={shiftForm.code}
                    onChange={e => setShiftForm({...shiftForm, code: e.target.value})}
                    placeholder="Contoh: NS"
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs focus:ring-1 focus:ring-[#E31E24]/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Nama Shift</label>
                  <input
                    required
                    type="text"
                    value={shiftForm.name}
                    onChange={e => setShiftForm({...shiftForm, name: e.target.value})}
                    placeholder="Contoh: Night Shift"
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs focus:ring-1 focus:ring-[#E31E24]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Jam Masuk</label>
                  <input
                    required
                    type="time"
                    value={shiftForm.time_in}
                    onChange={e => setShiftForm({...shiftForm, time_in: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Jam Keluar</label>
                  <input
                    required
                    type="time"
                    value={shiftForm.time_out}
                    onChange={e => setShiftForm({...shiftForm, time_out: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Toleransi (Menit)</label>
                  <input
                    required
                    type="number"
                    value={shiftForm.grace_period}
                    onChange={e => setShiftForm({...shiftForm, grace_period: parseInt(e.target.value)})}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs"
                  />
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Shift Lintas Hari (Cross-day)</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Aktifkan jika jam pulang melewati tengah malam (hari berikutnya).</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShiftForm({...shiftForm, is_cross_day: !shiftForm.is_cross_day})}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${shiftForm.is_cross_day ? 'bg-[#E31E24]' : 'bg-slate-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${shiftForm.is_cross_day ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsShiftModalOpen(false)} className="h-10 px-5 bg-white text-slate-600 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="h-10 px-5 bg-[#E31E24] text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-[#C1181E] transition-colors flex items-center gap-2">
                  {isSubmitting ? <IconLoader2 size={14} className="animate-spin" /> : 'Simpan Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HOLIDAY MODAL */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <IconCalendarEvent className="text-[#E31E24]" size={18} />
                {selectedHoliday ? 'Edit Hari Libur' : 'Tambah Hari Libur'}
              </h3>
              <button onClick={() => setIsHolidayModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitHoliday} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Nama Libur</label>
                <input
                  required
                  type="text"
                  value={holidayForm.name}
                  onChange={e => setHolidayForm({...holidayForm, name: e.target.value})}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Mulai</label>
                  <input
                    required
                    type="date"
                    value={holidayForm.start_date}
                    onChange={e => setHolidayForm({...holidayForm, start_date: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Selesai (Opsional)</label>
                  <input
                    type="date"
                    value={holidayForm.end_date}
                    onChange={e => setHolidayForm({...holidayForm, end_date: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Tipe Libur</label>
                <select
                  value={holidayForm.type}
                  onChange={e => setHolidayForm({...holidayForm, type: e.target.value})}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs"
                >
                  <option value="Libur Nasional">Libur Nasional</option>
                  <option value="Cuti Bersama">Cuti Bersama</option>
                  <option value="Libur Perusahaan">Libur Perusahaan</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsHolidayModalOpen(false)} className="h-10 px-5 bg-white text-slate-600 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="h-10 px-5 bg-[#E31E24] text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-[#C1181E] transition-colors flex items-center gap-2">
                  {isSubmitting ? <IconLoader2 size={14} className="animate-spin" /> : 'Simpan Libur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManager;
