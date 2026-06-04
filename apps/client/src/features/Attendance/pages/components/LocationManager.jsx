import React, { useState, useEffect, useCallback } from 'react';
import {
  IconMapPin, IconBuildingSkyscraper, IconClock, IconLoader2,
  IconCircleCheck, IconAlertCircle, IconEdit, IconDeviceFloppy,
  IconUsers, IconX, IconArrowLeft, IconPlus, IconTrash,
  IconSearch, IconUser, IconSettings, IconCompass
} from '@tabler/icons-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ─── HQ Config Form ──────────────────────────────────────────────────────────
const HQConfigForm = ({ onSettingsUpdated }) => {
  const [config, setConfig] = useState({ lat: '', lon: '', radius: 100, name: 'WKN HQ Jakarta' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      const r = await axios.get(`${API_URL}/attendance/settings`);
      const d = r.data;
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
      const res = await axios.put(`${API_URL}/attendance/settings`, {
        key: 'hq_location',
        value: { ...config, lat: parseFloat(config.lat), lon: parseFloat(config.lon), radius: parseInt(config.radius) }
      });
      const data = res.data;
      if (res.status === 200 || data.status === 'success') {
        setMsg({ type: 'success', text: 'HQ berhasil disimpan.' });
        if (onSettingsUpdated) onSettingsUpdated();
      } else {
        setMsg({ type: 'error', text: data.message || data.detail || 'Error' });
      }
    } catch (err) {
      const data = err.response?.data || {};
      setMsg({ type: 'error', text: data.message || data.detail || 'Gagal menyimpan. Periksa koneksi.' });
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
    axios.get(`${API_URL}/attendance/settings`)
      .then(res => {
        const d = res.data;
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
      const res = await axios.put(`${API_URL}/attendance/settings`, {
        key: 'allow_free_attendance',
        value: { value: val }
      });
      setEnabled(val);
      setMsg({ type: 'success', text: 'Konfigurasi berhasil disimpan.' });
    } catch (err) {
      const data = err.response?.data || {};
      setMsg({ type: 'error', text: data.message || data.detail || 'Gagal menyimpan.' });
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

// ─── Map Preview Component (Leaflet via inline srcDoc, no install needed) ──────
const LocationMapPreview = ({ lat, lon, radius, height = '140px' }) => {
  const vLat = parseFloat(lat);
  const vLon = parseFloat(lon);
  if (!lat || !lon || isNaN(vLat) || isNaN(vLon)) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-400 gap-1"
        style={{ height }}
      >
        <IconMapPin size={20} className="text-slate-200" />
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Isi lat/lon untuk preview</p>
      </div>
    );
  }

  const mapHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script><style>html,body,#map{height:100%;margin:0;padding:0;}</style></head><body><div id="map"></div><script>var map=L.map('map',{zoomControl:true}).setView([${vLat},${vLon}],16);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'\u00a9 OpenStreetMap contributors'}).addTo(map);L.circle([${vLat},${vLon}],{radius:${radius||100},color:'#E31E24',fillColor:'#E31E24',fillOpacity:0.15,weight:2.5}).addTo(map);var ic=L.divIcon({className:'',html:'<div style="background:#E31E24;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.4)"></div>',iconSize:[16,16],iconAnchor:[8,8]});L.marker([${vLat},${vLon}],{icon:ic}).addTo(map);<\/script></body></html>`;

  return (
    <iframe
      srcDoc={mapHtml}
      style={{ width: '100%', height, border: 'none', borderRadius: '8px' }}
      title="Preview Peta Lokasi"
      sandbox="allow-scripts"
    />
  );
};

// ─── Location Form Modal (Add / Edit) ─────────────────────────────────────────
const LocationFormModal = ({ mode = 'add', location = null, onClose, onSave, saving }) => {
  const [form, setForm] = useState({
    name: location?.name || '',
    lat: location?.lat ?? '',
    lon: location?.lon ?? '',
    radius: location?.radius ?? 100,
  });

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.lat === '' || form.lon === '') return;
    onSave({ name: form.name.trim(), lat: parseFloat(form.lat), lon: parseFloat(form.lon), radius: parseInt(form.radius) || 100 });
  };

  const inputCls = 'w-full h-8 px-2.5 rounded-lg bg-[#f0f2f5] border border-slate-200 text-slate-800 font-semibold text-[11px] focus:outline-none focus:ring-1 focus:ring-[#E31E24]/40';
  const labelCls = 'block text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[min(560px,92vh)] flex flex-col overflow-hidden"
      >
        {/* Header — compact */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 bg-[#E31E24]/10 rounded-lg flex items-center justify-center shrink-0">
              <IconMapPin size={15} className="text-[#E31E24]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">
                {mode === 'add' ? 'Tambah Lokasi' : 'Edit Lokasi'}
              </h3>
              {mode === 'edit' && location?.name && (
                <p className="text-[8px] font-bold text-slate-400 truncate">{location.name}</p>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 shrink-0">
            <IconX size={14} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
          <div>
            <label className={labelCls}>Nama Lokasi *</label>
            <input
              type="text" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="WKN HQ Jakarta"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelCls}>Lat *</label>
              <input type="number" step="any" value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="-6.13" className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className={labelCls}>Lon *</label>
              <input type="number" step="any" value={form.lon} onChange={e => set('lon', e.target.value)} placeholder="106.72" className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className={labelCls}>Radius (m)</label>
              <input type="number" value={form.radius} onChange={e => set('radius', e.target.value)} placeholder="100" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Preview Peta</label>
            <LocationMapPreview lat={form.lat} lon={form.lon} radius={form.radius} height="130px" />
          </div>
        </div>

        {/* Footer — always visible */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <button type="button" onClick={onClose}
            className="h-8 px-4 rounded-lg bg-white border border-slate-200 text-slate-600 font-black text-[8px] uppercase tracking-widest hover:bg-slate-50">
            Batal
          </button>
          <button type="submit" disabled={saving}
            className="h-8 px-4 rounded-lg bg-[#E31E24] text-white font-black text-[8px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-[#C1181E] disabled:opacity-50">
            {saving ? <IconLoader2 size={12} className="animate-spin" /> : <IconDeviceFloppy size={12} />}
            {saving ? 'Menyimpan...' : mode === 'add' ? 'Daftarkan' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Location View Modal ───────────────────────────────────────────────────────
const LocationViewModal = ({ location, onClose, onEdit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[min(480px,88vh)] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 bg-[#E31E24]/10 rounded-lg flex items-center justify-center shrink-0">
            <IconMapPin size={15} className="text-[#E31E24]" />
          </div>
          <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">{location.name}</h3>
        </div>
        <button onClick={onClose} className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 shrink-0">
          <IconX size={14} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Lat', value: location.lat },
            { label: 'Lon', value: location.lon },
            { label: 'Radius', value: `${location.radius}m` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-[10px] font-black text-slate-800 font-mono truncate">{value}</p>
            </div>
          ))}
        </div>
        <LocationMapPreview lat={location.lat} lon={location.lon} radius={location.radius} height="150px" />
      </div>
      <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50/80 shrink-0">
        <button onClick={onClose}
          className="h-8 px-4 rounded-lg bg-white border border-slate-200 text-slate-600 font-black text-[8px] uppercase tracking-widest hover:bg-slate-50">
          Tutup
        </button>
        <button onClick={() => { onClose(); onEdit(); }}
          className="h-8 px-4 rounded-lg bg-amber-500 text-white font-black text-[8px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-amber-600">
          <IconEdit size={12} /> Edit
        </button>
      </div>
    </div>
  </div>
);

// ─── Working Locations Manager ────────────────────────────────────────────────
const WorkingLocationsManager = ({ locations, loading, saving, msg, onAddLocation, onEditLocation, onDeleteLocation }) => {
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit'|'view', index?: number }
  const selectedLoc = modal?.index !== undefined ? locations[modal.index] : null;

  if (loading) return <div className="flex items-center gap-2 text-slate-400 text-xs py-4"><IconLoader2 size={16} className="animate-spin" /> Memuat daftar lokasi kerja...</div>;

  return (
    <div className="space-y-5">
      {/* Section Header + Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconMapPin size={16} className="text-[#E31E24]" />
          <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Daftar Cabang &amp; Lokasi Kerja Proyek</h4>
        </div>
        <button
          id="add-loc-btn"
          onClick={() => setModal({ mode: 'add' })}
          className="h-9 px-4 rounded-xl bg-[#E31E24] text-white font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-md hover:bg-[#C1181E] transition-all active:scale-95"
        >
          <IconPlus size={14} /> Tambah Lokasi
        </button>
      </div>

      {/* Global save message */}
      {msg && (
        <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${msg.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
          {msg.type === 'success' ? <IconCircleCheck size={14} /> : <IconAlertCircle size={14} />}
          {msg.text}
        </div>
      )}

      {/* Location Cards Grid */}
      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 gap-3">
          <IconMapPin size={36} className="text-slate-200" />
          <p className="text-[9px] font-black uppercase tracking-widest">Belum ada lokasi kerja custom terdaftar</p>
          <button
            onClick={() => setModal({ mode: 'add' })}
            className="h-8 px-4 rounded-xl bg-[#E31E24]/5 text-[#E31E24] font-black text-[9px] uppercase tracking-widest hover:bg-[#E31E24]/10 transition-all"
          >
            + Tambah Lokasi Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {locations.map((loc, idx) => (
            <div key={idx} className="bg-[#f8fafc] border border-slate-100 rounded-2xl p-4 flex flex-col gap-3 hover:border-slate-200 hover:shadow-sm transition-all group">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-[#E31E24]/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#E31E24]/20 transition-all">
                    <IconMapPin size={15} className="text-[#E31E24]" />
                  </div>
                  <p className="text-[10px] font-black text-slate-800 leading-tight">{loc.name}</p>
                </div>
                <span className="shrink-0 bg-white border border-slate-200 text-slate-500 font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full">{loc.radius}m</span>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-xl px-2.5 py-2 border border-slate-100">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Lat</p>
                  <p className="text-[9px] font-black text-slate-700 font-mono mt-0.5">{loc.lat}</p>
                </div>
                <div className="bg-white rounded-xl px-2.5 py-2 border border-slate-100">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Lon</p>
                  <p className="text-[9px] font-black text-slate-700 font-mono mt-0.5">{loc.lon}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  id={`view-loc-${idx}`}
                  onClick={() => setModal({ mode: 'view', index: idx })}
                  className="flex-1 h-7 rounded-lg bg-blue-50 text-blue-600 font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-blue-100 transition-all"
                >
                  <IconMapPin size={11} /> Lihat
                </button>
                <button
                  id={`edit-loc-${idx}`}
                  onClick={() => setModal({ mode: 'edit', index: idx })}
                  className="flex-1 h-7 rounded-lg bg-amber-50 text-amber-600 font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-amber-100 transition-all"
                >
                  <IconEdit size={11} /> Edit
                </button>
                <button
                  id={`delete-loc-${idx}`}
                  onClick={() => onDeleteLocation(idx)}
                  disabled={saving}
                  className="flex-1 h-7 rounded-lg bg-rose-50 text-rose-600 font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-rose-100 transition-all disabled:opacity-50"
                >
                  <IconTrash size={11} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {modal?.mode === 'add' && (
        <LocationFormModal
          mode="add"
          saving={saving}
          onClose={() => setModal(null)}
          onSave={(data) => { onAddLocation(data); setModal(null); }}
        />
      )}
      {modal?.mode === 'edit' && selectedLoc && (
        <LocationFormModal
          mode="edit"
          location={selectedLoc}
          saving={saving}
          onClose={() => setModal(null)}
          onSave={(data) => { onEditLocation(modal.index, data); setModal(null); }}
        />
      )}
      {modal?.mode === 'view' && selectedLoc && (
        <LocationViewModal
          location={selectedLoc}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ mode: 'edit', index: modal.index })}
        />
      )}
    </div>
  );
};

// Build unique location dropdown options (HQ first; skip duplicates in working_locations)
const buildLocationOptions = (hqLocation, workingLocations) => {
  const seen = new Set();
  const options = [];
  const add = (name) => {
    const label = (name || '').trim();
    if (!label) return;
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    options.push({ name: label, value: label });
  };
  add(hqLocation?.name || 'Head Office');
  (workingLocations || []).forEach((loc) => add(loc.name));
  return options;
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
      const res = await axios.get(`${API_URL}/employees?page_size=200`);
      const data = res.data;
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
      const res = await axios.put(`${API_URL}/attendance/employees/${empId}/site`, {
        is_field_team: isField,
        working_location: workLoc
      });
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

  const locOptions = buildLocationOptions(hqLocation, workingLocations);

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
      const res = await axios.get(`${API_URL}/attendance/settings`);
      const d = res.data;
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
      const res = await axios.put(`${API_URL}/attendance/settings`, {
        key: 'working_locations',
        value: { locations: updatedList }
      });
      setLocations(updatedList);
      setMsg({ type: 'success', text: 'Lokasi kerja berhasil ditambahkan.' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      const data = err.response?.data || {};
      setMsg({ type: 'error', text: data.message || data.detail || 'Gagal menyimpan.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditLocation = async (indexToEdit, updatedLoc) => {
    const updatedList = locations.map((loc, idx) => (idx === indexToEdit ? updatedLoc : loc));
    setSaving(true);
    setMsg(null);
    try {
      const res = await axios.put(`${API_URL}/attendance/settings`, {
        key: 'working_locations',
        value: { locations: updatedList }
      });
      setLocations(updatedList);
      setMsg({ type: 'success', text: 'Lokasi kerja berhasil diperbarui.' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      const data = err.response?.data || {};
      setMsg({ type: 'error', text: data.message || data.detail || 'Gagal memperbarui.' });
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
      const res = await axios.put(`${API_URL}/attendance/settings`, {
        key: 'working_locations',
        value: { locations: updatedList }
      });
      setLocations(updatedList);
      setMsg({ type: 'success', text: 'Lokasi kerja berhasil dihapus.' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      const data = err.response?.data || {};
      setMsg({ type: 'error', text: data.message || data.detail || 'Gagal menghapus.' });
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
              onEditLocation={handleEditLocation}
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
