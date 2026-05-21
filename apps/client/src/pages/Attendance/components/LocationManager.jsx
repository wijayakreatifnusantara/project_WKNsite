import React, { useState, useEffect, useCallback } from 'react';
import {
  IconMapPin, IconBuildingSkyscraper, IconClock, IconLoader2,
  IconCircleCheck, IconAlertCircle, IconEdit, IconDeviceFloppy,
  IconUsers, IconX, IconArrowLeft
} from '@tabler/icons-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── HQ Config Form ──────────────────────────────────────────────────────────
const HQConfigForm = () => {
  const [config, setConfig] = useState({ lat: '', lon: '', radius: 100, name: 'WKN HQ Jakarta' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/attendance/settings`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success' && d.data.hq_location) {
          setConfig(d.data.hq_location);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`${API_BASE}/attendance/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'hq_location', value: { ...config, lat: parseFloat(config.lat), lon: parseFloat(config.lon), radius: parseInt(config.radius) } }),
      });
      const data = await res.json();
      setMsg({ type: res.ok ? 'success' : 'error', text: data.message || data.detail || 'Error' });
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

  if (loading) return <div className="flex items-center gap-2 text-slate-400 text-xs py-4"><IconLoader2 size={16} className="animate-spin" /> Memuat konfigurasi...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <IconBuildingSkyscraper size={16} className="text-[#E31E24]" />
        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Konfigurasi Lokasi HQ</h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Nama Lokasi" id="hq-name" value={config.name || ''} onChange={e => setConfig(p => ({ ...p, name: e.target.value }))} placeholder="WKN HQ Jakarta" />
        <Field label="Latitude" id="hq-lat" type="number" value={config.lat || ''} onChange={e => setConfig(p => ({ ...p, lat: e.target.value }))} placeholder="-6.2088" />
        <Field label="Longitude" id="hq-lon" type="number" value={config.lon || ''} onChange={e => setConfig(p => ({ ...p, lon: e.target.value }))} placeholder="106.8456" />
        <Field label="Radius (meter)" id="hq-radius" type="number" value={config.radius || ''} onChange={e => setConfig(p => ({ ...p, radius: e.target.value }))} placeholder="100" />
      </div>

      <div className="flex items-center gap-3">
        <button id="save-hq-btn" onClick={handleSave} disabled={saving}
          className="h-9 px-5 rounded-xl bg-[#E31E24] text-white font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-md hover:bg-[#C1181E] transition-all disabled:opacity-50">
          {saving ? <IconLoader2 size={14} className="animate-spin" /> : <IconDeviceFloppy size={14} />}
          {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
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

// ─── Site Assignment Modal ────────────────────────────────────────────────────
const AssignSiteModal = ({ employee, onClose, onSaved }) => {
  const [form, setForm] = useState({ lat: employee.assigned_site_lat || '', lon: employee.assigned_site_long || '', is_field_team: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSave = async () => {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`${API_BASE}/attendance/employees/${employee.id}/site`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_site_lat: parseFloat(form.lat), assigned_site_long: parseFloat(form.lon), is_field_team: form.is_field_team }),
      });
      const data = await res.json();
      if (res.ok) { setMsg({ type: 'success', text: data.message }); setTimeout(onSaved, 1000); }
      else setMsg({ type: 'error', text: data.detail || 'Gagal.' });
    } catch {
      setMsg({ type: 'error', text: 'Gagal menyimpan.' });
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Assign Site</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">{employee.name} · {employee.id}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
            <IconX size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {[['Latitude Site', 'site-lat', form.lat, 'lat'], ['Longitude Site', 'site-lon', form.lon, 'lon']].map(([label, id, val, key]) => (
            <div key={key}>
              <label htmlFor={id} className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
              <input id={id} type="number" value={val} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder="-6.xxxx"
                className="w-full h-9 px-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#E31E24]/30" />
            </div>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_field_team} onChange={e => setForm(p => ({ ...p, is_field_team: e.target.checked }))}
              className="rounded accent-[#E31E24]" />
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tandai sebagai Field Team</span>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button id="save-site-btn" onClick={handleSave} disabled={saving}
            className="flex-1 h-10 rounded-xl bg-[#E31E24] text-white font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:bg-[#C1181E] transition-all disabled:opacity-50">
            {saving ? <IconLoader2 size={14} className="animate-spin" /> : <IconDeviceFloppy size={14} />}
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
        {msg && (
          <p className={`text-[9px] font-black uppercase tracking-widest text-center ${msg.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>{msg.text}</p>
        )}
      </div>
    </div>
  );
};

// ─── Field Team Table ─────────────────────────────────────────────────────────
const FieldTeamTable = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const fetchFieldTeam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/employees?page_size=100`);
      const data = await res.json();
      const fieldTeam = (data.data || []).filter(e => e.is_field_team || e['Job Position *']?.toLowerCase().includes('field'));
      setEmployees(fieldTeam);
    } catch {
      setEmployees([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFieldTeam(); }, [fetchFieldTeam]);

  if (loading) return <div className="flex items-center gap-2 text-slate-400 text-xs py-4"><IconLoader2 size={16} className="animate-spin" /> Memuat data Field Team...</div>;

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <IconClock size={16} className="text-amber-500" />
        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Field Team — Site Assignment</h4>
        <span className="ml-auto text-[8px] font-black text-slate-400">{employees.length} anggota</span>
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          <IconUsers size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-[9px] font-black uppercase tracking-widest">Belum ada Field Team. Assign karyawan via tombol Edit di bawah.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['ID', 'Nama', 'Posisi', 'Site Lat', 'Site Lon', 'Aksi'].map(h => (
                  <th key={h} className="px-3 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map(emp => (
                <tr key={emp['EMPLOYEE ID']} className="hover:bg-slate-50 transition-all">
                  <td className="px-3 py-2 text-[9px] font-black text-slate-600">{emp['EMPLOYEE ID']}</td>
                  <td className="px-3 py-2 text-[9px] font-bold text-slate-800">{emp['EMPLOYEE NAME']}</td>
                  <td className="px-3 py-2 text-[9px] text-slate-500">{emp['Job Position *'] || '—'}</td>
                  <td className="px-3 py-2 text-[9px] font-mono text-slate-500">{emp.assigned_site_lat ?? <span className="text-rose-300">—</span>}</td>
                  <td className="px-3 py-2 text-[9px] font-mono text-slate-500">{emp.assigned_site_long ?? <span className="text-rose-300">—</span>}</td>
                  <td className="px-3 py-2">
                    <button
                      id={`assign-site-${emp['EMPLOYEE ID']}`}
                      onClick={() => setSelectedEmp({ id: emp['EMPLOYEE ID'], name: emp['EMPLOYEE NAME'], assigned_site_lat: emp.assigned_site_lat, assigned_site_long: emp.assigned_site_long })}
                      className="h-7 px-3 rounded-lg bg-[#E31E24]/10 text-[#E31E24] font-black text-[8px] uppercase tracking-widest flex items-center gap-1 hover:bg-[#E31E24]/20 transition-all">
                      <IconEdit size={12} /> Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedEmp && (
        <AssignSiteModal employee={selectedEmp} onClose={() => setSelectedEmp(null)} onSaved={() => { setSelectedEmp(null); fetchFieldTeam(); }} />
      )}
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * T018: LocationManager — Admin UI for managing HQ coordinates and field team site assignments
 */
const LocationManager = ({ onBack }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 bg-white p-2 px-5 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-md">
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
              Location <span className="text-[#E31E24]">Manager</span>
            </h2>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Geofencing & Site Assignments</p>
         </div>
      </div>
      
      {/* HQ Config */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <HQConfigForm />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Field Team</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* Field Team Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <FieldTeamTable />
      </div>
    </div>
  );
};

export default LocationManager;
