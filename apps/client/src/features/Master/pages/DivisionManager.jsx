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

const DivisionManager = () => {
  const [Divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState({});
  const [expandedOrg, setExpandedOrg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Auto sync states
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

  // Fetch Divisions
  const fetchDivisions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/divisions?active_only=false`);
      const data = await response.json();
      if (data.status === 'success') {
        const orgs = data.data || [];
        setDivisions(orgs);
        // Auto-fetch departments for ALL orgs so DEPT count shows immediately (no click needed)
        if (orgs.length > 0) {
          Promise.all(
            orgs.map(org =>
              fetch(`${API_URL}/divisions/${org.id}/departments?active_only=false`)
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
        showToast('error', data.detail || 'Gagal memuat Divisi');
      }
    } catch (err) {
      showToast('error', 'Koneksi ke server gagal');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Departments for an Division
  const fetchDepartments = async (orgId) => {
    try {
      const response = await fetch(`${API_URL}/divisions/${orgId}/departments?active_only=false`);
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
      const response = await fetch(`${API_URL}/divisions/migrate-employees`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.status === 'success') {
        if (data.data && data.data.migrated > 0) {
          showToast('success', `Auto-Sync: ${data.data.migrated} Karyawan disinkronkan`);
          await fetchDivisions();
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
  }, [fetchDivisions]);

  useEffect(() => {
    const initData = async () => {
      await fetchDivisions();
      await runAutoSync(true);
    };
    initData();
    // Run exactly once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Expand Division Card to show Departments
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
        ? `${API_URL}/divisions/${selectedOrg.id}` 
        : `${API_URL}/divisions`;
      const method = selectedOrg ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgForm)
      });
      const data = await response.json();

      if (data.status === 'success') {
        showToast('success', selectedOrg ? 'Divisi diperbarui' : 'Divisi ditambahkan');
        setIsOrgModalOpen(false);
        await fetchDivisions();
        await runAutoSync(true);
      } else {
        showToast('error', data.detail || 'Gagal menyimpan Divisi');
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
        : `${API_URL}/divisions/${currentOrgId}/departments`;
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

  // Toggle Division Active Status
  const handleToggleOrgStatus = async (org) => {
    try {
      const response = await fetch(`${API_URL}/divisions/${org.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !org.is_active })
      });
      const data = await response.json();
      if (data.status === 'success') {
        showToast('success', `Status Divisi diubah menjadi ${!org.is_active ? 'Aktif' : 'Non-aktif'}`);
        await fetchDivisions();
        await runAutoSync(true);
      } else {
        showToast('error', data.detail || 'Gagal mengubah status Divisi');
      }
    } catch (err) {
      showToast('error', 'Koneksi ke server gagal');
    }
  };

  // Delete Division
  const handleDeleteOrg = async (orgId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus Divisi ini secara permanen?\nSemua departemen di bawah Divisi ini juga akan terhapus.')) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/divisions/${orgId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.status === 'success') {
        showToast('success', data.message || 'Divisi berhasil dihapus');
        await fetchDivisions();
        await runAutoSync(true);
      } else {
        showToast('error', data.detail || 'Gagal menghapus Divisi');
      }
    } catch (err) {
      showToast('error', 'Koneksi ke server gagal');
    } finally {
      setIsLoading(false);
    }
  };

  // Run database employee migration manually from UI
  const handleRunMigration = async () => {
    if (!window.confirm('Jalankan migrasi database pemetaan Karyawan ke Divisi?')) return;
    await runAutoSync(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 animate-fade-in font-outfit relative">


      {/* 🚀 FIXED PREMIUM COMMAND CENTER */}
      <div className="bg-transparent border-b border-slate-200 z-30 shadow-sm shrink-0">
        <div className="max-w-[1400px] mx-auto p-4 space-y-3">
          
          {/* HEADER ROW */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-ios-primary/10 rounded-xl flex items-center justify-center text-ios-primary">
                <IconBuilding size={22} stroke={2} />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-800 tracking-tight leading-none">Manajemen Divisi</h1>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1.5">Multi-Enterprise & Unit Configurations</p>
              </div>
            </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunMigration}
              disabled={isLoading || isSyncing}
              className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-slate-200/65 flex items-center gap-1.5 active:scale-95"
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
              className="h-10 px-5 bg-ios-primary hover:bg-ios-primary/90 text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <IconPlus size={14} />
              Tambah Divisi
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* NOTIFICATION FEEDBACK */}
      {message.text && (
        <div className="px-4 pt-4 max-w-[1400px] mx-auto w-full">
          <div className={`p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {message.type === 'success' ? <IconCircleCheck size={16} /> : <IconAlertCircle size={16} />}
            <span className="text-xs font-bold uppercase tracking-widest">{message.text}</span>
          </div>
        </div>
      )}

      {/* CONTENT LOADING */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-[1400px] mx-auto space-y-4 pb-20">
          {isLoading && Divisions.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <IconLoader2 className="animate-spin text-ios-primary" size={32} />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading database...</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-4">
            {Divisions.map((org) => {
              const isExpanded = expandedOrg === org.id;
              const orgDepts = departments[org.id] || [];

              return (
                <div key={org.id} className="bg-transparent rounded-2xl border border-slate-200 shadow-sm hover:shadow-sm hover:border-slate-200/60 transition-all duration-300 overflow-hidden">
                  <div className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-[#E31E24]/5 to-[#E31E24]/10 border border-ios-primary/10 rounded-xl flex items-center justify-center text-ios-primary shadow-2xs shrink-0">
                        <IconBuilding size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-ios-primary/10 text-ios-primary font-bold text-xs uppercase tracking-widest px-1.5 py-0.5 rounded-lg border border-ios-primary/15 shadow-2xs">
                            {org.code}
                          </span>
                          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-tight leading-none">
                            {org.name}
                          </h2>
                          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-lg uppercase tracking-wider border ${org.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100/60' : 'bg-slate-100 text-slate-500 border-slate-200/60'}`}>
                            {org.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                          {org.description && <span className="truncate max-w-sm">{org.description}</span>}
                          {org.description && (org.pic_name || org.pic_email || org.pic_phone) && <span className="text-slate-300">•</span>}
                          {(org.pic_name || org.pic_email || org.pic_phone) && (
                            <div className="flex items-center gap-2">
                              {org.pic_name && <span className="font-bold text-slate-600">{org.pic_name}</span>}
                              {org.pic_email && <a href={`mailto:${org.pic_email}`} className="hover:text-ios-primary flex items-center gap-1 transition-colors"><IconMail size={12}/>{org.pic_email}</a>}
                              {org.pic_phone && <a href={`tel:${org.pic_phone}`} className="hover:text-ios-primary flex items-center gap-1 transition-colors"><IconPhone size={12}/>{org.pic_phone}</a>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0 mt-2 md:mt-0">
                      <button
                        onClick={() => handleToggleOrgStatus(org)}
                        className={`h-8 px-3 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all border active:scale-95 ${org.is_active ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' : 'bg-emerald-50 text-green-600 border-emerald-100 hover:bg-emerald-100'}`}
                      >
                        {org.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleOpenOrgModal(org)}
                        className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:shadow-sm flex items-center justify-center transition-all active:scale-95"
                        data-tooltip="Edit Divisi"
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrg(org.id)}
                        className="h-8 w-8 rounded-lg border border-red-200 bg-red-50/30 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-all active:scale-95"
                        data-tooltip="Hapus Divisi"
                      >
                        <IconTrash size={14} />
                      </button>
                      <button
                        onClick={() => handleExpandOrg(org.id)}
                        className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <span>DEPT ({orgDepts.length})</span>
                        {isExpanded ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* DEPARTMENTS DRAWER */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50/50 p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Daftar Unit Kerja / Departemen ({org.code})
                        </h4>
                        <button
                          onClick={() => handleOpenDeptModal(org.id)}
                          className="h-7 px-3 bg-slate-800 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-700 transition-all active:scale-95"
                        >
                          <IconPlus size={10} />
                          Tambah Departemen
                        </button>
                      </div>

                      {orgDepts.length === 0 ? (
                        <div className="py-6 text-center bg-transparent rounded-2xl border border-slate-200/50">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Belum ada departemen ditambahkan</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {orgDepts.map(dept => (
                            <div key={dept.id} className="bg-transparent rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-200 transition-all flex flex-col gap-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border border-slate-200/40">
                                      {dept.code}
                                    </span>
                                    <h5 className="text-[11px] font-semibold text-slate-800 uppercase tracking-tight">
                                      {dept.name}
                                    </h5>
                                  </div>
                                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                    <IconUsers size={10} />
                                    <span>Active Status: {dept.is_active ? 'Aktif' : 'Non-aktif'}</span>
                                  </div>
                                </div>

                                <div className="flex gap-1 shrink-0">
                                  <button
                                    onClick={() => handleExpandDept(dept.id)}
                                    className="h-6 px-2 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center gap-1 transition-all border border-indigo-200/60 text-[11px] font-semibold uppercase tracking-wider"
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
                                <div className="pt-2 border-t border-slate-200 animate-in slide-in-from-top-2 duration-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                                      <IconBriefcase size={9} /> Posisi / Jabatan
                                    </span>
                                    <button
                                      onClick={() => handleOpenPosModal(dept.id)}
                                      className="h-5 px-2 bg-indigo-600 text-white rounded text-[11px] font-semibold uppercase tracking-wider flex items-center gap-0.5 hover:bg-indigo-700 transition-all"
                                    >
                                      <IconPlus size={8} /> Tambah
                                    </button>
                                  </div>
                                  {(positions[dept.id] || []).length === 0 ? (
                                    <p className="text-[11px] text-slate-400 font-bold py-1">Belum ada posisi</p>
                                  ) : (
                                    <div className="space-y-1">
                                      {(positions[dept.id] || []).map(pos => (
                                        <div key={pos.id} className="flex items-center justify-between bg-indigo-50/40 border border-indigo-100/60 rounded-lg px-2 py-1.5">
                                          <div>
                                            <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{pos.name}</p>
                                            {pos.level && (
                                              <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">{pos.level}</span>
                                            )}
                                          </div>
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => handleOpenPosModal(dept.id, pos)}
                                              className="h-5 w-5 rounded bg-transparent text-slate-500 hover:bg-slate-100 flex items-center justify-center border border-slate-200/60"
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
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm  flex items-center justify-center p-4">
            <div className="bg-transparent rounded-xl p-6 w-full max-w-md shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <IconBuilding className="text-ios-primary" size={18} />
                  {selectedOrg ? 'Edit Divisi' : 'Tambah Divisi'}
                </h3>
                <button onClick={() => setIsOrgModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <IconX size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitOrg} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">Kode Perusahaan (Singkatan)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SEI"
                    value={orgForm.code}
                    onChange={e => setOrgForm({ ...orgForm, code: e.target.value.toUpperCase() })}
                    className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-ios-primary/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">Nama Perusahaan / Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schneider Electric Indonesia"
                    value={orgForm.name}
                    onChange={e => setOrgForm({ ...orgForm, name: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-ios-primary/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Energy management and industrial automation division"
                    value={orgForm.description}
                    onChange={e => setOrgForm({ ...orgForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-ios-primary/30 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">Nama PIC</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={orgForm.pic_name}
                      onChange={e => setOrgForm({ ...orgForm, pic_name: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-ios-primary/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">No. Telp PIC</label>
                    <input
                      type="text"
                      placeholder="e.g. 0812..."
                      value={orgForm.pic_phone}
                      onChange={e => setOrgForm({ ...orgForm, pic_phone: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-ios-primary/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">Email PIC</label>
                  <input
                    type="email"
                    placeholder="pic@company.com"
                    value={orgForm.pic_email}
                    onChange={e => setOrgForm({ ...orgForm, pic_email: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-ios-primary/30"
                  />
                </div>

                <div className="flex gap-2 justify-end border-t border-slate-200 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsOrgModalOpen(false)}
                    className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 px-5 bg-ios-primary hover:bg-ios-primary/90 text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
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
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm  flex items-center justify-center p-4">
            <div className="bg-transparent rounded-xl p-6 w-full max-w-md shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <IconBuilding className="text-ios-primary" size={18} />
                  {selectedDept ? 'Edit Departemen' : 'Tambah Departemen'}
                </h3>
                <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <IconX size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitDept} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">Kode Departemen (Singkatan)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ENG"
                    value={deptForm.code}
                    onChange={e => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-ios-primary/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">Nama Departemen</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering & Support"
                    value={deptForm.name}
                    onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-ios-primary/30"
                  />
                </div>

                <div className="flex gap-2 justify-end border-t border-slate-200 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsDeptModalOpen(false)}
                    className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 px-5 bg-ios-primary hover:bg-ios-primary/90 text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
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
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm  flex items-center justify-center p-4">
            <div className="bg-transparent rounded-xl p-6 w-full max-w-md shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <IconBriefcase className="text-indigo-600" size={18} />
                  {selectedPos ? 'Edit Posisi' : 'Tambah Posisi'}
                </h3>
                <button onClick={() => setIsPosModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <IconX size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitPos} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">Nama Posisi / Jabatan</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Engineer"
                    value={posForm.name}
                    onChange={e => setPosForm({ ...posForm, name: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">Level / Grade <span className="normal-case font-medium text-slate-300">(opsional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Level 3 / Grade C"
                    value={posForm.level}
                    onChange={e => setPosForm({ ...posForm, level: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">Deskripsi <span className="normal-case font-medium text-slate-300">(opsional)</span></label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Bertanggung jawab atas..."
                    value={posForm.description}
                    onChange={e => setPosForm({ ...posForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400/30 resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end border-t border-slate-200 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsPosModalOpen(false)}
                    className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    {isSubmitting ? <IconLoader2 className="animate-spin" size={14} /> : <IconDeviceFloppy size={14} />}
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default DivisionManager;
