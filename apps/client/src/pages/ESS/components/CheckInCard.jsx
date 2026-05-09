import React, { useState, useEffect, useCallback } from 'react';
import {
  IconMapPin, IconFingerprint, IconLoader2, IconCircleCheck,
  IconAlertCircle, IconClockExclamation, IconClock,
  IconBuildingSkyscraper, IconHardHat, IconRefresh
} from '@tabler/icons-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const STATUS_CONFIG = {
  idle: {
    bg: 'bg-[#f0f2f5]', shadow: 'shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff]',
    icon: <IconFingerprint size={48} className="text-slate-400" />,
    label: 'SIAP ABSEN', sublabel: 'Ketuk tombol untuk check-in', color: 'text-slate-500',
  },
  loading: {
    bg: 'bg-[#f0f2f5]', shadow: 'shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff]',
    icon: <IconLoader2 size={48} className="text-[#E31E24] animate-spin" />,
    label: 'MEMPROSES...', sublabel: 'Mendeteksi lokasi Anda', color: 'text-slate-400',
  },
  success_present: {
    bg: 'bg-emerald-50', shadow: 'shadow-[inset_4px_4px_8px_#bbf7d0,inset_-4px_-4px_8px_#ffffff]',
    icon: <IconCircleCheck size={48} className="text-emerald-500" />,
    label: 'TEPAT WAKTU', sublabel: 'Check-in berhasil dicatat', color: 'text-emerald-600',
  },
  success_late: {
    bg: 'bg-amber-50', shadow: 'shadow-[inset_4px_4px_8px_#fde68a,inset_-4px_-4px_8px_#ffffff]',
    icon: <IconClockExclamation size={48} className="text-amber-500" />,
    label: 'TERLAMBAT', sublabel: 'Check-in tercatat dengan keterlambatan', color: 'text-amber-600',
  },
  out_of_range: {
    bg: 'bg-rose-50', shadow: 'shadow-[inset_4px_4px_8px_#fecaca,inset_-4px_-4px_8px_#ffffff]',
    icon: <IconMapPin size={48} className="text-rose-500" />,
    label: 'DILUAR JANGKAUAN', sublabel: 'Anda terlalu jauh dari lokasi kantor', color: 'text-rose-500',
  },
  already_checked_in: {
    bg: 'bg-indigo-50', shadow: 'shadow-[inset_4px_4px_8px_#c7d2fe,inset_-4px_-4px_8px_#ffffff]',
    icon: <IconCircleCheck size={48} className="text-indigo-500" />,
    label: 'SUDAH ABSEN', sublabel: 'Anda sudah melakukan check-in hari ini', color: 'text-indigo-500',
  },
  error: {
    bg: 'bg-slate-50', shadow: 'shadow-[inset_4px_4px_8px_#e2e8f0,inset_-4px_-4px_8px_#ffffff]',
    icon: <IconAlertCircle size={48} className="text-slate-400" />,
    label: 'GAGAL', sublabel: 'Terjadi kesalahan. Coba lagi.', color: 'text-slate-400',
  },
};

/**
 * T011, T015: CheckInCard — ESS check-in dengan geofencing
 * Props: employeeId (string), isFieldTeam (bool)
 */
const CheckInCard = ({ employeeId, isFieldTeam = false }) => {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [settings, setSettings] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/attendance/settings`)
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setSettings(d.data); })
      .catch(() => setSettings({ hq_location: { name: 'WKN HQ', radius: 100 } }));
  }, []);

  const handleCheckIn = useCallback(async () => {
    if (!employeeId) { alert('Employee ID tidak ditemukan.'); return; }
    if (!navigator.geolocation) {
      setStatus('error'); setResult({ message: 'Browser tidak mendukung GPS.' }); return;
    }
    setStatus('loading'); setResult(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`${API_BASE}/attendance/check-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employee_id: employeeId, latitude, longitude }),
          });
          const data = await res.json();
          setResult(data.data);
          if (data.status === 'success')
            setStatus(data.data?.check_in_status === 'Late' ? 'success_late' : 'success_present');
          else if (data.status === 'out_of_range') setStatus('out_of_range');
          else if (data.status === 'already_checked_in') setStatus('already_checked_in');
          else setStatus('error');
        } catch {
          setStatus('error'); setResult({ message: 'Tidak dapat terhubung ke server.' });
        }
      },
      (err) => {
        setStatus('error');
        const msgs = { 1: 'Izin lokasi ditolak. Aktifkan GPS.', 2: 'GPS tidak tersedia.', 3: 'Timeout GPS. Coba lagi.' };
        setResult({ message: msgs[err.code] || 'Gagal mendapatkan lokasi.' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [employeeId]);

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const hqName = settings?.hq_location?.name || 'WKN HQ';
  const hqRadius = settings?.hq_location?.radius || 100;
  const canCheckIn = ['idle', 'error', 'out_of_range'].includes(status);

  const fmtTime = d => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Jakarta' });
  const fmtDate = d => d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });

  return (
    <div className="space-y-4">
      <div className="bg-[#f0f2f5] border-white border-[4px] shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_20px_#ffffff] rounded-[2.5rem] p-6 flex flex-col items-center gap-5 transition-all duration-500">
        {/* Clock */}
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live</span>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-slate-800 tabular-nums tracking-tight leading-none">{fmtTime(currentTime)}</p>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{fmtDate(currentTime)}</p>
          </div>
          <div className="w-10" />
        </div>

        {/* Field Badge */}
        {isFieldTeam && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
            <IconHardHat size={12} className="text-amber-600" />
            <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest">Field Team</span>
          </div>
        )}

        {/* Icon Circle */}
        <div className={`h-24 w-24 rounded-full ${cfg.bg} ${cfg.shadow} flex items-center justify-center transition-all duration-500`}>
          {cfg.icon}
        </div>

        {/* Labels */}
        <div className="text-center">
          <h3 className={`text-base font-black uppercase tracking-tight ${cfg.color} transition-all duration-300`}>{cfg.label}</h3>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{cfg.sublabel}</p>
        </div>

        {/* Result Details */}
        {result && (
          <div className="w-full bg-white/60 rounded-2xl p-4 space-y-2 border border-white shadow-inner">
            {result.message && <p className="text-[10px] font-bold text-slate-600 text-center leading-relaxed">{result.message}</p>}
            {result.distance_meters !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Jarak</span>
                <span className="text-[10px] font-black text-slate-700">{result.distance_meters}m dari {result.target_name || hqName}</span>
              </div>
            )}
            {result.late_minutes > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Keterlambatan</span>
                <span className="text-[10px] font-black text-amber-600">{result.late_minutes} menit</span>
              </div>
            )}
            {result.check_in_time && (
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Jam Masuk</span>
                <span className="text-[10px] font-black text-slate-700">
                  {new Date(result.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="w-full space-y-2">
          {canCheckIn && (
            <button id="checkin-btn" onClick={handleCheckIn} disabled={status === 'loading'}
              className="w-full h-14 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-[0.2em] shadow-[5px_5px_15px_rgba(227,30,36,0.3)] flex items-center justify-center gap-3 active:shadow-none active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {status === 'loading'
                ? <><IconLoader2 size={18} className="animate-spin" /> Mendeteksi Lokasi...</>
                : <><IconFingerprint size={18} /> Absen Sekarang</>}
            </button>
          )}
          {['out_of_range', 'error'].includes(status) && (
            <button onClick={() => { setStatus('idle'); setResult(null); }}
              className="w-full h-10 rounded-xl bg-white border border-slate-200 text-slate-500 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
              <IconRefresh size={14} /> Coba Lagi
            </button>
          )}
        </div>
      </div>

      {/* Location Info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[#E31E24]/10 rounded-xl flex items-center justify-center text-[#E31E24] flex-shrink-0">
            {isFieldTeam ? <IconHardHat size={16} /> : <IconBuildingSkyscraper size={16} />}
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lokasi Target</p>
            <p className="text-[11px] font-black text-slate-700 mt-0.5">
              {isFieldTeam ? 'Site Proyek (Sesuai Assignment)' : hqName}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Radius</p>
            <p className="text-[11px] font-black text-slate-700">{hqRadius}m</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-50">
          <IconClock size={10} className="text-slate-300" />
          <p className="text-[8px] text-slate-400 font-medium">Batas tepat waktu: 08:30 WIB</p>
        </div>
      </div>
    </div>
  );
};

export default CheckInCard;
