import React, { useState, useEffect, useCallback } from 'react';
import {
  IconBuilding,
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconDeviceFloppy,
  IconLoader2,
  IconCircleCheck,
  IconAlertCircle,
  IconChevronDown,
  IconChevronUp,
  IconUsers,
  IconUser,
  IconMail,
  IconPhone,
  IconBriefcase
} from '@tabler/icons-react';

const _rawApi = import.meta.env.VITE_API_URL;
const API_URL = _rawApi ? (_rawApi.endsWith('/api') ? _rawApi : _rawApi.replace(/\/$/, '') + '/api') : 'http://localhost:8000/api';

const OrganizationManager = () => {
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState({});
  const [expandedOrg, setExpandedOrg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Auto sync states
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(() => {
    const saved = localStorage.getItem('wkn_org_auto_sync');
    return saved !== 'false'; // default is true
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgForm, setOrgForm] = useState({ code: '', name: '', description: '', pic_name: '', pic_email: '', pic_phone: '' });

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ code: '', name: '' });
  const [currentOrgId, setCurrentOrgId] = useState(null);

  // Positions state
  const [positions, setPositions] = useState({});       // { deptId: [...] }
  const [expandedDept, setExpandedDept] = useState(null);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [selectedPos, setSelectedPos] = useState(null);
  const [posForm, setPosForm] = useState({ name: '', level: '', description: '' });
  const [currentDeptId, setCurrentDeptId] = useState(null);

  // Notifications
  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Fetch Organizations
  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/organizations?active_only=false`);
      const data = await response.json();
      if (data.status === 'success') {
        const orgs = data.data || [];
        setOrganizations(orgs);
        // Auto-fetch departments for ALL orgs so DEPT count shows immediately (no click needed)
        if (orgs.length > 0) {
          Promise.all(
            orgs.map(org =>
              fetch(`${API_URL}/organizations/${org.id}/departments?active_only=false`)
                .then(r => r.json())
                .then(d => ({ orgId: org.id, depts: d.status === 'success' ? (d.data || []) : [] }))
                .catch(() => ({ orgId: org.id, depts: [] }))
            )
          ).then(results => {
            const deptMap = {};
            results.forEach(({ orgId, depts }) => { deptMap[orgId] = depts; });
            setDepartments(deptMap);
          });
        }
      } else {
        showToast('error', data.detail || 'Gagal memuat organisasi');
      }
    } catch (err) {
      showToast('error', 'Koneksi ke server gagal');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Departments for an Organization
  const fetchDepartments = async (orgId) => {
    try {
      const response = await fetch(`${API_URL}/organizations/${orgId}/departments?active_only=false`);
      const data = await response.json();
      if (data.status === 'success') {
        setDepartments(prev => ({ ...prev, [orgId]: data.data || [] }));
      }
    } catch (err) {
      showToast('error', 'Gagal memuat departemen');
    }
  };

  // Fetch Positions for a Department
  const fetchPositions = async (deptId) => {
    try {
      const response = await fetch(`${API_URL}/departments/${deptId}/positions?active_only=false`);
      const data = await response.json();
      if (data.status === 'success') {
        setPositions(prev => ({ ...prev, [deptId]: data.data || [] }));
      }
    } catch (err) {
      showToast('error', 'Gagal memuat posisi');
    }
  };

  // Auto sync employees in the background
  const runAutoSync = useCallback(async (silent = true) => {
    try {
      if (silent) {
        setIsSyncing(true);
      } else {
        setIsLoading(true);
      }
      const response = await fetch(`${API_URL}/organizations/migrate-employees`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.status === 'success') {
        if (data.data && data.data.migrated > 0) {
          showToast('success', `Auto-Sync: ${data.data.migrated} Karyawan disinkronkan`);
          await fetchOrganizations();
        } else if (!silent) {
          showToast('success', 'Semua data karyawan sudah tersinkronisasi.');
        }
      } else if (!silent) {
        showToast('error', data.detail || 'Gagal sinkronisasi data');
      }
    } catch (err) {
      console.error('Auto sync failed:', err);
      if (!silent) {
        showToast('error', 'Koneksi ke server gagal');
      }
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [fetchOrganizations]);

  useEffect(() => {
    const initData = async () => {
      await fetchOrganizations();
      await runAutoSync(true);
    };
    initData();
    // Run exactly once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Background interval for Auto Sync
  useEffect(() => {
    if (!isAutoSyncEnabled) return;
    const intervalId = setInterval(() => {
      runAutoSync(true);
    }, 30000); // 30 seconds
    return () => clearInterval(intervalId);
  }, [isAutoSyncEnabled, runAutoSync]);

  // Expand Organization Card to show Departments
  const handleExpandOrg = (orgId) => {
    if (expandedOrg === orgId) {
      setExpandedOrg(null);
    } else {
      setExpandedOrg(orgId);
      // Always refresh dept list on expand to ensure data is up to date
      fetchDepartments(orgId);
    }
  };

  // Open Org Modal for Add/Edit
  const handleOpenOrgModal = (org = null) => {
    if (org) {
      setSelectedOrg(org);
      setOrgForm({
        code: org.code,
        name: org.name,
        description: org.description || '',
        pic_name: org.pic_name || '',
        pic_email: org.pic_email || '',
        pic_phone: org.pic_phone || ''
      });
    } else {
      setSelectedOrg(null);
      setOrgForm({ code: '', name: '', description: '', pic_name: '', pic_email: '', pic_phone: '' });
    }
    setIsOrgModalOpen(true);
  };

  // Submit Org
  const handleSubmitOrg = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = selectedOrg 
        ? `${API_URL}/organizations/${selectedOrg.id}` 
        : `${API_URL}/organizations`;
      const method = selectedOrg ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgForm)
      });
      const data = await response.json();

      if (data.status === 'success') {
        showToast('success', selectedOrg ? 'Organisasi diperbarui' : 'Organisasi ditambahkan');
        setIsOrgModalOpen(false);
        await fetchOrganizations();
        await runAutoSync(true);
      } else {
        showToast('error', data.detail || 'Gagal menyimpan organisasi');
      }
    } catch (err) {
      showToast('error', 'Koneksi ke server gagal');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Dept Modal for Add/Edit
  const handleOpenDeptModal = (orgId, dept = null) => {
    setCurrentOrgId(orgId);
    if (dept) {
      setSelectedDept(dept);
      setDeptForm({ code: dept.code, name: dept.name });
    } else {
      setSelectedDept(null);
      setDeptForm({ code: '', name: '' });
    }
    setIsDeptModalOpen(true);
  };

  // Open Position Modal for Add/Edit
  const handleOpenPosModal = (deptId, pos = null) => {
    setCurrentDeptId(deptId);
    if (pos) {
      setSelectedPos(pos);
      setPosForm({ name: pos.name, level: pos.level || '', description: pos.description || '' });
    } else {
      setSelectedPos(null);
      setPosForm({ name: '', level: '', description: '' });
    }
    setIsPosModalOpen(true);
  };

  // Toggle dept position drawer
  const handleExpandDept = (deptId) => {
    if (expandedDept === deptId) {
      setExpandedDept(null);
    } else {
      setExpandedDept(deptId);
      fetchPositions(deptId);
    }
  };

  // Submit Dept
  const handleSubmitDept = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = selectedDept 
        ? `${API_URL}/departments/${selectedDept.id}` 
        : `${API_URL}/organizations/${currentOrgId}/departments`;
      const method = selectedDept ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptForm)
      });
      const data = await response.json();

      if (data.status === 'success') {
        showToast('success', selectedDept ? 'Departemen diperbarui' : 'Departemen ditambahkan');
        setIsDeptModalOpen(false);
        fetchDepartments(currentOrgId);
      } else {
        showToast('error', data.detail || 'Gagal menyimpan departemen');
      }
    } catch (err) {
      showToast('error', 'Koneksi ke server gagal');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Dept (Soft Delete)
  const handleDeleteDept = async (orgId, deptId) => {
    if (!window.confirm('Hapus departemen ini?')) return;
    try {
      const res = await fetch(`${API_URL}/departments/${deptId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        showToast('success', 'Departemen berhasil dihapus.');
        fetchDepartments(orgId);
      } else {
        showToast('error', data.detail || 'Gagal menghapus');
      }
    } catch (err) {
      showToast('error', 'Koneksi gagal');
    }
  };

  // Submit Position (Add / Edit)
  const handleSubmitPos = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = selectedPos
        ? `${API_URL}/positions/${selectedPos.id}`
        : `${API_URL}/departments/${currentDeptId}/positions`;
      const method = selectedPos ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: posForm.name, level: posForm.level || null, description: posForm.description || null }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast('success', selectedPos ? 'Posisi diperbarui.' : 'Posisi ditambahkan.');
        setIsPosModalOpen(false);
        fetchPositions(currentDeptId);
      } else {
        showToast('error', data.detail || 'Gagal menyimpan posisi');
      }
    } catch (err) {
      showToast('error', 'Koneksi gagal');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Position
  const handleDeletePos = async (deptId, posId) => {
    if (!window.confirm('Hapus posisi ini?')) return;
    try {
      const res = await fetch(`${API_URL}/positions/${posId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        showToast('success', 'Posisi berhasil dihapus.');
        fetchPositions(deptId);
      } else {
        showToast('error', data.detail || 'Gagal menghapus');
      }
    } catch (err) {
      showToast('error', 'Koneksi gagal');
    }
  };

  // Toggle Organization Active Status
  const handleToggleOrgStatus = async (org) => {
    try {
      const response = await fetch(`${API_URL}/organizations/${org.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !org.is_active })
      });
      const data = await response.json();
      if (data.status === 'success') {
        showToast('success', `Status organisasi diubah menjadi ${!org.is_active ? 'Aktif' : 'Non-aktif'}`);
        await fetchOrganizations();
        await runAutoSync(true);
      } else {
        showToast('error', data.detail || 'Gagal mengubah status organisasi');
      }
    } catch (err) {
      showToast('error', 'Koneksi ke server gagal');
    }
  };

  // Delete Organization
  const handleDeleteOrg = async (orgId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus organisasi ini secara permanen?\nSemua departemen di bawah organisasi ini juga akan terhapus.')) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/organizations/${orgId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.status === 'success') {
        showToast('success', data.message || 'Organisasi berhasil dihapus');
        await fetchOrganizations();
        await runAutoSync(true);
      } else {
        showToast('error', data.detail || 'Gagal menghapus organisasi');
      }
    } catch (err) {
      showToast('error', 'Koneksi ke server gagal');
    } finally {
      setIsLoading(false);
    }
  };

  // Run database employee migration manually from UI
  const handleRunMigration = async () => {
    if (!window.confirm('Jalankan migrasi database pemetaan Karyawan ke Organisasi?')) return;
    await runAutoSync(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 animate-fade-in font-outfit relative">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #E31E24;
        }
      `}</style>

      {/* 🚀 FIXED PREMIUM COMMAND CENTER */}
      <div className="bg-white border-b border-slate-200 z-30 shadow-sm shrink-0">
        <div className="max-w-[1400px] mx-auto p-4 space-y-3">
          
          {/* HEADER ROW */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#E31E24]/10 rounded-xl flex items-center justify-center text-[#E31E24]">
                <IconBuilding size={22} stroke={2} />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-800 tracking-tight leading-none">Manajemen Organisasi</h1>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-1.5">Multi-Enterprise & Unit Configurations</p>
              </div>
            </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Auto-Sync status toggle badge */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 h-10 shadow-2xs">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Auto Sync
              </span>
              <button
                type="button"
                onClick={() => {
                  const newValue = !isAutoSyncEnabled;
                  setIsAutoSyncEnabled(newValue);
                  localStorage.setItem('wkn_org_auto_sync', String(newValue));
                  showToast('success', `Auto Sync ${newValue ? 'Diaktifkan' : 'Dinonaktifkan'}`);
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAutoSyncEnabled ? 'bg-[#E31E24]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    isAutoSyncEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <div className="flex items-center gap-1.5 ml-1">
                {isSyncing ? (
                  <IconLoader2 size={12} className="animate-spin text-[#E31E24]" />
                ) : (
                  <span className={`h-2 w-2 rounded-full ${isAutoSyncEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                )}
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">
                  {isSyncing ? 'Syncing...' : isAutoSyncEnabled ? 'Aktif' : 'Off'}
                </span>
              </div>
            </div>

            <button
              onClick={handleRunMigration}
              disabled={isLoading || isSyncing}
              className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all border border-slate-200/65 flex items-center gap-1.5 active:scale-95"
            >
              {isSyncing ? (
                <IconLoader2 size={12} className="animate-spin text-slate-500" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              )}
              Sync Employee IDs
            </button>
            <button 
              onClick={() => handleOpenOrgModal()} 
              className="h-10 px-5 bg-[#E31E24] hover:bg-[#C1181E] text-white font-black text-[9px] uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <IconPlus size={14} />
              Tambah Organisasi
            </button>
          </div>
        </div>
      </div>

      {/* NOTIFICATION FEEDBACK */}
      {message.text && (
        <div className="px-4 pt-4 max-w-[1400px] mx-auto w-full">
          <div className={`p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {message.type === 'success' ? <IconCircleCheck size={16} /> : <IconAlertCircle size={16} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
          </div>
        </div>
      )}

      {/* CONTENT LOADING */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-[1400px] mx-auto space-y-4 pb-20">
          {isLoading && organizations.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <IconLoader2 className="animate-spin text-[#E31E24]" size={32} />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Loading database...</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-4">
            {organizations.map((org) => {
              const isExpanded = expandedOrg === org.id;
              const orgDepts = departments[org.id] || [];

              return (
                <div key={org.id} className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.03),0_1px_2px_0_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)] hover:border-slate-200/60 transition-all duration-300 overflow-hidden">
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 bg-gradient-to-br from-[#E31E24]/5 to-[#E31E24]/10 border border-[#E31E24]/10 rounded-2xl flex items-center justify-center text-[#E31E24] shadow-2xs shrink-0">
                        <IconBuilding size={26} />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-[#E31E24]/10 text-[#E31E24] font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg border border-[#E31E24]/15 shadow-2xs">
                            {org.code}
                          </span>
                          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">
                            {org.name}
                          </h2>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider border ${org.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100/60' : 'bg-slate-100 text-slate-500 border-slate-200/60'}`}>
                            {org.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {org.description && (
                          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">
                            {org.description}
                          </p>
                        )}
                        {(org.pic_name || org.pic_email || org.pic_phone) && (
                          <div className="flex flex-wrap items-center gap-2 pt-2.5 mt-2.5 border-t border-slate-100">
                            {org.pic_name && (
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 font-semibold">
                                <IconUser size={12} className="text-slate-400" />
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PIC:</span>
                                <span>{org.pic_name}</span>
                              </div>
                            )}
                            {org.pic_email && (
                              <a 
                                href={`mailto:${org.pic_email}`} 
                                className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-50 hover:bg-white hover:text-[#E31E24] hover:border-[#E31E24]/20 hover:shadow-2xs px-2 py-0.5 rounded-lg border border-slate-100 font-semibold transition-all"
                              >
                                <IconMail size={12} className="text-slate-400" />
                                <span>{org.pic_email}</span>
                              </a>
                            )}
                            {org.pic_phone && (
                              <a 
                                href={`tel:${org.pic_phone}`} 
                                className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-50 hover:bg-white hover:text-[#E31E24] hover:border-[#E31E24]/20 hover:shadow-2xs px-2 py-0.5 rounded-lg border border-slate-100 font-semibold transition-all"
                              >
                                <IconPhone size={12} className="text-slate-400" />
                                <span>{org.pic_phone}</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      <button
                        onClick={() => handleToggleOrgStatus(org)}
                        className={`h-9 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border active:scale-95 ${org.is_active ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' : 'bg-emerald-50 text-green-600 border-emerald-100 hover:bg-emerald-100'}`}
                      >
                        {org.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleOpenOrgModal(org)}
                        className="h-9 w-9 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-all active:scale-95"
                        title="Edit Organisasi"
                      >
                        <IconEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrg(org.id)}
                        className="h-9 w-9 rounded-xl border border-red-200 bg-red-50/30 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-all active:scale-95"
                        title="Hapus Organisasi"
                      >
                        <IconTrash size={16} />
                      </button>
                      <button
                        onClick={() => handleExpandOrg(org.id)}
                        className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <span>DEPT ({orgDepts.length})</span>
                        {isExpanded ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* DEPARTMENTS DRAWER */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Daftar Unit Kerja / Departemen ({org.code})
                        </h4>
                        <button
                          onClick={() => handleOpenDeptModal(org.id)}
                          className="h-7 px-3 bg-slate-800 text-white rounded-lg font-black text-[8px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-700 transition-all active:scale-95"
                        >
                          <IconPlus size={10} />
                          Tambah Departemen
                        </button>
                      </div>

                      {orgDepts.length === 0 ? (
                        <div className="py-6 text-center bg-white rounded-2xl border border-slate-200/50">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Belum ada departemen ditambahkan</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {orgDepts.map(dept => (
                            <div key={dept.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-slate-200/40">
                                      {dept.code}
                                    </span>
                                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                                      {dept.name}
                                    </h5>
                                  </div>
                                  <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                    <IconUsers size={10} />
                                    <span>Active Status: {dept.is_active ? 'Aktif' : 'Non-aktif'}</span>
                                  </div>
                                </div>

                                <div className="flex gap-1 shrink-0">
                                  <button
                                    onClick={() => handleExpandDept(dept.id)}
                                    className="h-6 px-2 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center gap-1 transition-all border border-indigo-200/60 text-[8px] font-black uppercase tracking-wider"
                                  >
                                    <IconBriefcase size={9} />
                                    POS ({(positions[dept.id] || []).length})
                                    {expandedDept === dept.id ? <IconChevronUp size={8} /> : <IconChevronDown size={8} />}
                                  </button>
                                  <button
                                    onClick={() => handleOpenDeptModal(org.id, dept)}
                                    className="h-6 w-6 rounded bg-slate-50 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-all border border-slate-200/60"
                                  >
                                    <IconEdit size={10} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDept(org.id, dept.id)}
                                    className="h-6 w-6 rounded bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all border border-red-200/60"
                                  >
                                    <IconTrash size={10} />
                                  </button>
                                </div>
                              </div>

                              {/* POSITIONS DRAWER */}
                              {expandedDept === dept.id && (
                                <div className="pt-2 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                                      <IconBriefcase size={9} /> Posisi / Jabatan
                                    </span>
                                    <button
                                      onClick={() => handleOpenPosModal(dept.id)}
                                      className="h-5 px-2 bg-indigo-600 text-white rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 hover:bg-indigo-700 transition-all"
                                    >
                                      <IconPlus size={8} /> Tambah
                                    </button>
                                  </div>
                                  {(positions[dept.id] || []).length === 0 ? (
                                    <p className="text-[8px] text-slate-400 font-bold py-1">Belum ada posisi</p>
                                  ) : (
                                    <div className="space-y-1">
                                      {(positions[dept.id] || []).map(pos => (
                                        <div key={pos.id} className="flex items-center justify-between bg-indigo-50/40 border border-indigo-100/60 rounded-lg px-2 py-1.5">
                                          <div>
                                            <p className="text-[9px] font-black text-slate-700 uppercase tracking-tight">{pos.name}</p>
                                            {pos.level && (
                                              <span className="text-[7px] font-bold text-indigo-500 uppercase tracking-wider">{pos.level}</span>
                                            )}
                                          </div>
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => handleOpenPosModal(dept.id, pos)}
                                              className="h-5 w-5 rounded bg-white text-slate-500 hover:bg-slate-100 flex items-center justify-center border border-slate-200/60"
                                            >
                                              <IconEdit size={8} />
                                            </button>
                                            <button
                                              onClick={() => handleDeletePos(dept.id, pos.id)}
                                              className="h-5 w-5 rounded bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center border border-red-100"
                                            >
                                              <IconTrash size={8} />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── ADD/EDIT ORG MODAL ───────────────────────────────────────────── */}
        {isOrgModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <IconBuilding className="text-[#E31E24]" size={18} />
                  {selectedOrg ? 'Edit Organisasi' : 'Tambah Organisasi'}
                </h3>
                <button onClick={() => setIsOrgModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <IconX size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitOrg} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Kode Perusahaan (Singkatan)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SEI"
                    value={orgForm.code}
                    onChange={e => setOrgForm({ ...orgForm, code: e.target.value.toUpperCase() })}
                    className="w-full h-9 px-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#E31E24]/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Nama Perusahaan / Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schneider Electric Indonesia"
                    value={orgForm.name}
                    onChange={e => setOrgForm({ ...orgForm, name: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#E31E24]/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Energy management and industrial automation division"
                    value={orgForm.description}
                    onChange={e => setOrgForm({ ...orgForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#E31E24]/30 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Nama PIC</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={orgForm.pic_name}
                      onChange={e => setOrgForm({ ...orgForm, pic_name: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#E31E24]/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">No. Telp PIC</label>
                    <input
                      type="text"
                      placeholder="e.g. 0812..."
                      value={orgForm.pic_phone}
                      onChange={e => setOrgForm({ ...orgForm, pic_phone: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#E31E24]/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Email PIC</label>
                  <input
                    type="email"
                    placeholder="pic@company.com"
                    value={orgForm.pic_email}
                    onChange={e => setOrgForm({ ...orgForm, pic_email: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#E31E24]/30"
                  />
                </div>

                <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsOrgModalOpen(false)}
                    className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 px-5 bg-[#E31E24] hover:bg-[#C1181E] text-white font-black text-[9px] uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    {isSubmitting ? <IconLoader2 className="animate-spin" size={14} /> : <IconDeviceFloppy size={14} />}
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── ADD/EDIT DEPT MODAL ───────────────────────────────────────────── */}
        {isDeptModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <IconBuilding className="text-[#E31E24]" size={18} />
                  {selectedDept ? 'Edit Departemen' : 'Tambah Departemen'}
                </h3>
                <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <IconX size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitDept} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Kode Departemen (Singkatan)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ENG"
                    value={deptForm.code}
                    onChange={e => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    className="w-full h-9 px-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#E31E24]/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Nama Departemen</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering & Support"
                    value={deptForm.name}
                    onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#E31E24]/30"
                  />
                </div>

                <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsDeptModalOpen(false)}
                    className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 px-5 bg-[#E31E24] hover:bg-[#C1181E] text-white font-black text-[9px] uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    {isSubmitting ? <IconLoader2 className="animate-spin" size={14} /> : <IconDeviceFloppy size={14} />}
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── ADD/EDIT POSITION MODAL ─────────────────────────────────────────── */}
        {isPosModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <IconBriefcase className="text-indigo-600" size={18} />
                  {selectedPos ? 'Edit Posisi' : 'Tambah Posisi'}
                </h3>
                <button onClick={() => setIsPosModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <IconX size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitPos} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Nama Posisi / Jabatan</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Engineer"
                    value={posForm.name}
                    onChange={e => setPosForm({ ...posForm, name: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Level / Grade <span className="normal-case font-medium text-slate-300">(opsional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Level 3 / Grade C"
                    value={posForm.level}
                    onChange={e => setPosForm({ ...posForm, level: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Deskripsi <span className="normal-case font-medium text-slate-300">(opsional)</span></label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Bertanggung jawab atas..."
                    value={posForm.description}
                    onChange={e => setPosForm({ ...posForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#f0f2f5] border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400/30 resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsPosModalOpen(false)}
                    className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    {isSubmitting ? <IconLoader2 className="animate-spin" size={14} /> : <IconDeviceFloppy size={14} />}
                    Simpan
                  </button>
                </div>
              </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationManager;
