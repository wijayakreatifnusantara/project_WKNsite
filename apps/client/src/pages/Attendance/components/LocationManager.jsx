import React, { useState, useEffect, useCallback } from 'react';
import {
  IconMapPin, IconBuildingSkyscraper, IconClock, IconLoader2,
  IconCircleCheck, IconAlertCircle, IconEdit, IconDeviceFloppy,
  IconUsers, IconX, IconArrowLeft, IconPlus, IconTrash,
  IconSearch, IconUser, IconSettings, IconCompass
} from '@tabler/icons-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ─── HQ Config Form ──────────────────────────────────────────────────────────
const HQConfigForm = ({ onSettingsUpdated }) => {
  const [config, setConfig] = useState({ lat: '', lon: '', radius: 100, name: 'WKN HQ Jakarta' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/attendance/settings`);
      const d = await r.json();
      if (d.status === 'success' && d.data.hq_location) {
        setConfig(d.data.hq_location);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`${API_URL}/attendance/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'hq_location', value: { ...config, lat: parseFloat(config.lat), lon: parseFloat(config.lon), radius: parseInt(config.radius) } }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'HQ berhasil disimpan.' });
        if (onSettingsUpdated) onSettingsUpdated();
      } else {
        setMsg({ type: 'error', text: data.message || data.detail || 'Error' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Gagal menyimpan. Periksa koneksi.' });
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, id, value, onChange, type = 'text', placeholder }) => (
    <div>
      <label htmlFor={id} className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
      <input
        id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full h-9 px-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#E31E24]/30"
      />
    </div>
  );

  if (loading) return <div className="flex items-center gap-2 text-slate-400 text-xs py-4"><IconLoader2 size={16} className="animate-spin" /> Memuat konfigurasi HQ...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <IconBuildingSkyscraper size={16} className="text-[#E31E24]" />
        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Konfigurasi Kantor Utama (HQ)</h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Nama Kantor Utama" id="hq-name" value={config.name || ''} onChange={e => setConfig(p => ({ ...p, name: e.target.value }))} placeholder="WKN HQ Jakarta" />
        <Field label="Latitude" id="hq-lat" type="number" value={config.lat || ''} onChange={e => setConfig(p => ({ ...p, lat: e.target.value }))} placeholder="-6.2088" />
        <Field label="Longitude" id="hq-lon" type="number" value={config.lon || ''} onChange={e => setConfig(p => ({ ...p, lon: e.target.value }))} placeholder="106.8456" />
        <Field label="Radius (meter)" id="hq-radius" type="number" value={config.radius || ''} onChange={e => setConfig(p => ({ ...p, radius: e.target.value }))} placeholder="100" />
      </div>

      <div className="flex items-center gap-3">
        <button id="save-hq-btn" onClick={handleSave} disabled={saving}
          className="h-9 px-5 rounded-xl bg-[#E31E24] text-white font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-md hover:bg-[#C1181E] transition-all disabled:opacity-50">
          {saving ? <IconLoader2 size={14} className="animate-spin" /> : <IconDeviceFloppy size={14} />}
          {saving ? 'Menyimpan...' : 'Simpan Kantor Utama'}
        </button>
        {msg && (
          <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${msg.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
            {msg.type === 'success' ? <IconCircleCheck size={14} /> : <IconAlertCircle size={14} />}
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Free Attendance Toggle ───────────────────────────────────────────────────
const FreeAttendanceToggle = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/attendance/settings`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          setEnabled(!!d.data.allow_free_attendance);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (val) => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/attendance/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'allow_free_attendance', value: { value: val } }),
      });
      const data = await res.json();
      if (res.ok) {
        setEnabled(val);
        setMsg({ type: 'success', text: 'Konfigurasi berhasil disimpan.' });
      } else {
        setMsg({ type: 'error', text: data.message || data.detail || 'Gagal menyimpan.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Gagal menyimpan. Periksa koneksi.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-slate-400 text-xs py-2"><IconLoader2 size={16} className="animate-spin" /> Memuat status kebijakan...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <IconCompass size={16} className="text-[#E31E24]" />
        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Kebijakan Absensi Global</h4>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#f8fafc] border border-slate-100 rounded-2xl gap-4">
        <div className="space-y-0.5">
          <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Bebas Absen Di Mana Saja (Kebijakan Global)</p>
          <p className="text-[9px] font-bold text-slate-400">
            Jika diaktifkan, seluruh karyawan dapat bebas absen masuk/keluar dari mana saja tanpa divalidasi geofencing kantor ataupun site.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="allow-free-attendance-toggle" className="relative inline-flex items-center cursor-pointer">
            <input
              id="allow-free-attendance-toggle"
              type="checkbox"
              checked={enabled}
              onChange={(e) => handleToggle(e.target.checked)}
              disabled={saving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E31E24]"></div>
          </label>
          {msg && (
            <span className={`text-[8px] font-black uppercase tracking-widest ${msg.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
              {msg.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Working Locations Manager ────────────────────────────────────────────────
const WorkingLocationsManager = ({ locations, loading, saving, msg, onAddLocation, onDeleteLocation }) => {
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [radius, setRadius] = useState(100);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !lat || !lon) return;
    onAddLocation({ name: name.trim(), lat: parseFloat(lat), lon: parseFloat(lon), radius: parseInt(radius) || 100 });
    setName('');
    setLat('');
    setLon('');
    setRadius(100);
  };

  const Field = ({ label, id, value, onChange, type = 'text', placeholder }) => (
    <div>
      <label htmlFor={id} className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
      <input
        id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full h-9 px-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#E31E24]/30"
      />
    </div>
  );

  if (loading) return <div className="flex items-center gap-2 text-slate-400 text-xs py-4"><IconLoader2 size={16} className="animate-spin" /> Memuat daftar lokasi kerja...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <IconMapPin size={16} className="text-[#E31E24]" />
        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Daftar Cabang & Lokasi Kerja Proyek</h4>
      </div>

      {/* Add New Location Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-[#f8fafc] border border-slate-100 rounded-2xl space-y-4">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tambah Lokasi Kerja Baru</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Nama Lokasi Kerja" id="loc-name" value={name} onChange={e => setName(e.target.value)} placeholder="Schneider Cikarang" />
          <Field label="Latitude" id="loc-lat" type="number" value={lat} onChange={e => setLat(e.target.value)} placeholder="-6.2891" />
          <Field label="Longitude" id="loc-lon" type="number" value={lon} onChange={e => setLon(e.target.value)} placeholder="107.1654" />
          <Field label="Radius (meter)" id="loc-radius" type="number" value={radius} onChange={e => setRadius(e.target.value)} placeholder="100" />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} id="add-loc-btn"
            className="h-9 px-5 rounded-xl bg-[#E31E24] text-white font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-md hover:bg-[#C1181E] transition-all disabled:opacity-50">
            <IconPlus size={14} /> Daftarkan Lokasi
          </button>
          {msg && (
            <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${msg.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
              {msg.type === 'success' ? <IconCircleCheck size={14} /> : <IconAlertCircle size={14} />}
              {msg.text}
            </div>
          )}
        </div>
      </form>

      {/* Table of locations */}
      {locations.length === 0 ? (
        <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
          <p className="text-[9px] font-black uppercase tracking-widest">Belum ada lokasi kerja custom</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Nama Lokasi Kerja', 'Latitude', 'Longitude', 'Radius Toleransi', 'Aksi'].map(h => (
                  <th key={h} className="px-3 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {locations.map((loc, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-all">
                  <td className="px-3 py-2 text-[9px] font-bold text-slate-800 flex items-center gap-1.5">
                    <IconMapPin size={12} className="text-slate-400 shrink-0" />
                    {loc.name}
                  </td>
                  <td className="px-3 py-2 text-[9px] font-mono text-slate-500">{loc.lat}</td>
                  <td className="px-3 py-2 text-[9px] font-mono text-slate-500">{loc.lon}</td>
                  <td className="px-3 py-2 text-[9px] font-mono text-slate-500">{loc.radius} meter</td>
                  <td className="px-3 py-2">
                    <button
                      id={`delete-loc-${idx}`}
                      onClick={() => onDeleteLocation(idx)}
                      disabled={saving}
                      className="h-7 px-3 rounded-lg bg-rose-50 text-rose-600 font-black text-[8px] uppercase tracking-widest flex items-center gap-1 hover:bg-rose-100 transition-all">
                      <IconTrash size={12} /> Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Employee Location Settings Manager ───────────────────────────────────────
const EmployeeLocationSettings = ({ workingLocations, hqLocation }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [rowStatus, setRowStatus] = useState({}); // Stores 'loading', 'success', or null per employee ID

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/employees?page_size=200`);
      const data = await res.json();
      setEmployees(data.data || []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const updateEmployeeSettings = async (empId, isField, workLoc) => {
    setRowStatus(prev => ({ ...prev, [empId]: 'loading' }));
    try {
      const res = await fetch(`${API_URL}/attendance/employees/${empId}/site`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_field_team: isField,
          working_location: workLoc
        }),
      });
      if (res.ok) {
        setRowStatus(prev => ({ ...prev, [empId]: 'success' }));
        // Refresh local employee state
        setEmployees(prev =>
          prev.map(emp =>
            emp['EMPLOYEE ID'] === empId
              ? { ...emp, is_field_team: isField, working_location: workLoc, 'Working Location': workLoc }
              : emp
          )
        );
        setTimeout(() => {
          setRowStatus(prev => ({ ...prev, [empId]: null }));
        }, 1500);
      } else {
        setRowStatus(prev => ({ ...prev, [empId]: 'error' }));
      }
    } catch {
      setRowStatus(prev => ({ ...prev, [empId]: 'error' }));
    }
  };

  const filtered = employees.filter(emp => {
    const query = search.toLowerCase();
    const name = (emp['EMPLOYEE NAME'] || '').toLowerCase();
    const id = (emp['EMPLOYEE ID'] || '').toLowerCase();
    const pos = (emp['Job Position *'] || '').toLowerCase();
    return name.includes(query) || id.includes(query) || pos.includes(query);
  });

  // Locations options
  const locOptions = [
    { name: hqLocation?.name || 'Head Office', value: hqLocation?.name || 'Head Office' },
    ...(workingLocations || []).map(loc => ({ name: loc.name, value: loc.name }))
  ];

  if (loading) return <div className="flex items-center gap-2 text-slate-400 text-xs py-10 justify-center"><IconLoader2 size={24} className="animate-spin" /> Memuat data penempatan karyawan...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <IconUsers size={16} className="text-[#E31E24]" />
          <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Penempatan Lokasi Kerja Karyawan</h4>
        </div>
        <div className="relative w-full md:w-64">
          <IconSearch size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, ID, posisi..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#E31E24]/30"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Karyawan', 'Posisi', 'Lokasi Absen Ditentukan', 'Bebas Absen (Anywhere)', 'Status'].map(h => (
                <th key={h} className="px-3 py-2.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(emp => {
              const empId = emp['EMPLOYEE ID'];
              const empName = emp['EMPLOYEE NAME'];
              const empPosition = emp['Job Position *'] || 'Staff';
              const isBebasAbsen = !!emp.is_field_team;
              const currentLocName = emp.working_location || emp['Working Location'] || 'Head Office';
              const status = rowStatus[empId];

              return (
                <tr key={empId} className="hover:bg-slate-50 transition-all">
                  {/* Name & ID */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-[#E31E24]/5 border border-[#E31E24]/10 flex items-center justify-center text-[#E31E24] font-black text-[9px]">
                        {empName ? empName.substring(0, 1) : 'A'}
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-800 leading-tight">{empName}</p>
                        <p className="text-[7px] font-bold text-slate-400 mt-0.5">{empId}</p>
                      </div>
                    </div>
                  </td>

                  {/* Position */}
                  <td className="px-3 py-2 text-[9px] text-slate-500 font-medium">{empPosition}</td>

                  {/* Locations Selection Dropdown */}
                  <td className="px-3 py-2">
                    <select
                      value={currentLocName}
                      disabled={status === 'loading'}
                      onChange={(e) => updateEmployeeSettings(empId, isBebasAbsen, e.target.value)}
                      className="h-8 px-2.5 rounded-lg bg-[#f0f2f5] border border-slate-200 text-slate-700 font-black text-[9px] uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#E31E24]/20"
                    >
                      {locOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Free Attendance Toggle Switch */}
                  <td className="px-3 py-2">
                    <div className="flex items-center">
                      <label htmlFor={`free-toggle-${empId}`} className="relative inline-flex items-center cursor-pointer">
                        <input
                          id={`free-toggle-${empId}`}
                          type="checkbox"
                          checked={isBebasAbsen}
                          disabled={status === 'loading'}
                          onChange={(e) => updateEmployeeSettings(empId, e.target.checked, currentLocName)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                      <span className={`ml-2 text-[8px] font-black uppercase tracking-wider ${isBebasAbsen ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {isBebasAbsen ? 'Bebas Absen' : 'Geofenced'}
                      </span>
                    </div>
                  </td>

                  {/* Inline Status Feedback */}
                  <td className="px-3 py-2">
                    {status === 'loading' && (
                      <span className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
                        <IconLoader2 size={10} className="animate-spin" /> Menyimpan
                      </span>
                    )}
                    {status === 'success' && (
                      <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                        <IconCircleCheck size={12} /> Tersimpan
                      </span>
                    )}
                    {status === 'error' && (
                      <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 uppercase tracking-widest">
                        <IconAlertCircle size={12} /> Gagal
                      </span>
                    )}
                    {!status && <span className="text-[8px] text-slate-300">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main LocationManager Page Component ──────────────────────────────────────
const LocationManager = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('database'); // 'database' or 'employees'
  const [locations, setLocations] = useState([]);
  const [hqLocation, setHqLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/attendance/settings`);
      const d = await res.json();
      if (d.status === 'success') {
        setLocations(d.data.working_locations || []);
        setHqLocation(d.data.hq_location);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleAddLocation = async (newLoc) => {
    const updatedList = [...locations, newLoc];
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/attendance/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'working_locations', value: { locations: updatedList } }),
      });
      const data = await res.json();
      if (res.ok) {
        setLocations(updatedList);
        setMsg({ type: 'success', text: 'Lokasi kerja berhasil ditambahkan.' });
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ type: 'error', text: data.message || data.detail || 'Gagal menyimpan.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Gagal menyimpan. Periksa koneksi.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLocation = async (indexToDelete) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus lokasi kerja ini?')) return;
    const updatedList = locations.filter((_, idx) => idx !== indexToDelete);
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/attendance/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'working_locations', value: { locations: updatedList } }),
      });
      const data = await res.json();
      if (res.ok) {
        setLocations(updatedList);
        setMsg({ type: 'success', text: 'Lokasi kerja berhasil dihapus.' });
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ type: 'error', text: data.message || data.detail || 'Gagal menghapus.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Gagal menghapus. Periksa koneksi.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[11px]">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 px-6 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-[#E31E24] hover:border-[#E31E24]/20 hover:bg-white transition-all active:scale-95 shrink-0"
          >
            <IconArrowLeft size={16} />
          </button>
          <div className="h-8 w-8 bg-[#E31E24]/10 rounded-lg flex items-center justify-center text-[#E31E24]">
            <IconMapPin size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">
              Lokasi <span className="text-[#E31E24]">Kerja</span>
            </h2>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Kelola Database Lokasi & Penempatan Karyawan</p>
          </div>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center bg-[#f0f2f5] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('database')}
            className={`h-8 px-4 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <IconBuildingSkyscraper size={13} />
            Database Lokasi Kerja
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`h-8 px-4 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'employees'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <IconUsers size={13} />
            Penempatan Karyawan
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'database' ? (
        <div className="space-y-6">
          {/* Global free attendance policy toggle */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <FreeAttendanceToggle />
          </div>

          {/* Custom Working Locations list manager */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <WorkingLocationsManager
              locations={locations}
              loading={loading}
              saving={saving}
              msg={msg}
              onAddLocation={handleAddLocation}
              onDeleteLocation={handleDeleteLocation}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          {/* Employee assignments list */}
          <EmployeeLocationSettings workingLocations={locations} hqLocation={hqLocation} />
        </div>
      )}
    </div>
  );
};

export default LocationManager;
