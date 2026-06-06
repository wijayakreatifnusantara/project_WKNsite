import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  IconArrowLeft, IconDeviceFloppy, IconUserCircle, IconBriefcase, IconCreditCard,
  IconId, IconMail, IconPhone, IconMapPin, IconBuildingSkyscraper, IconAward,
  IconCalendarEvent, IconGenderBigender, IconLoader2, IconFileUpload, IconFileDescription, IconTrash, IconCheck
} from "@tabler/icons-react";
import { apiClient } from '@/lib/apiClient';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const _rawApi = import.meta.env.VITE_API_URL;
const API_URL = _rawApi ? (_rawApi.endsWith('/api') ? _rawApi : _rawApi.replace(/\/$/, '') + '/api') : 'http://localhost:8000/api';

const InputWrapper = ({ label, icon: Icon, children }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1">{label}</label>
    <div className="relative">
      <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
      {children}
    </div>
  </div>
);

const inputStyle = "w-full h-10 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24]/20 transition-all appearance-none uppercase placeholder:normal-case placeholder:text-slate-400";
const dateInputStyle = "w-full h-10 pl-10 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24]/20 transition-all cursor-pointer flex items-center";

const initialFormData = {
  employee_id: '', name: '', email: '', phone: '', gender: 'Laki-laki',
  date_of_birth: '', place_of_birth: '', religion: 'Islam', marital_status: 'Belum Kawin',
  nik: '', ktp_address: '', domicile_address: '', photo: '',
  organization_name: '', organization_id: '', department_id: '', job_position: '',
  job_level: 'Staff', status: 'Aktif', employment_type: 'Permanent', working_location: 'Head Office',
  base_salary: 0, join_date: new Date().toISOString().split('T')[0],
  emergency_contact_1_name: '', emergency_contact_1_rel: '', emergency_contact_1_phone: '',
  bank_name: '', bank_account: '', bank_account_holder: '', bpjs_tk_number: '', bpjs_ks_number: '',
  mobile_password: '', documents: {}
};

const DOC_TYPES = [
  { id: 'cv', label: 'Curriculum Vitae (CV)' },
  { id: 'ktp', label: 'KTP' },
  { id: 'kk', label: 'Kartu Keluarga (KK)' },
  { id: 'sim_a', label: 'SIM A' },
  { id: 'sim_c', label: 'SIM C' },
  { id: 'passport', label: 'Passport' },
  { id: 'buku_tabungan', label: 'Buku Tabungan' },
  { id: 'npwp', label: 'NPWP' },
  { id: 'lain_lain', label: 'Dokumen Lainnya' }
];

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('main');
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  const isOwnerOrSuperAdmin = user?.role?.toLowerCase() === 'owner' || user?.role?.toLowerCase() === 'superadmin';

  // Load Master Data
  useEffect(() => {
    axios.get(`${API_URL}/organizations?active_only=true`)
      .then(res => { if (res.data.status === 'success') setOrganizations(res.data.data || []); })
      .catch(err => console.error('Failed to load orgs', err));
  }, []);

  const fetchDepartments = (orgId) => {
    if (!orgId) { setDepartments([]); return; }
    axios.get(`${API_URL}/organizations/${orgId}/departments?active_only=true`)
      .then(res => setDepartments(res.data.data || []))
      .catch(() => setDepartments([]));
  };

  const fetchPositions = (deptId) => {
    if (!deptId) { setPositions([]); return; }
    axios.get(`${API_URL}/departments/${deptId}/positions?active_only=true`)
      .then(res => setPositions(res.data.data || []))
      .catch(() => setPositions([]));
  };

  // Check if Edit Mode
  useEffect(() => {
    if (id) {
      setLoading(true);
      apiClient.get(`/api/employees/direct/${id}`)
        .then(res => {
          if (res.status === 'success') {
            const data = res.data;
            const normalized = { 
              ...initialFormData, 
              ...data, 
              employee_id: data.employee_id || data.id,
              documents: data.documents || {} 
            };
            setFormData(normalized);
            if (normalized.organization_id) fetchDepartments(normalized.organization_id);
            if (normalized.department_id) fetchPositions(normalized.department_id);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => { fetchDepartments(formData.organization_id); }, [formData.organization_id]);
  useEffect(() => { fetchPositions(formData.department_id); }, [formData.department_id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    if ((type === 'text' || e.target.tagName === 'TEXTAREA') && name !== 'email') {
      finalValue = value.toUpperCase();
    }
    setFormData(prev => ({ ...prev, [name]: name === 'base_salary' ? parseFloat(value) || 0 : finalValue }));
  };

  const handleOrgChange = async (e) => {
    const org = organizations.find(o => o.name === e.target.value);
    if (org) {
      setFormData(prev => ({ ...prev, organization_name: org.name, organization_id: org.id, department_id: '' }));
      if (!id && !formData.employee_id) {
        apiClient.get(`/api/employees/generate-id?org_code=${org.code}`)
          .then(res => { if (res.status === 'success') setFormData(prev => ({ ...prev, employee_id: res.data })); })
          .catch(() => setFormData(prev => ({ ...prev, employee_id: `${org.code}-TMP-${Math.floor(Math.random() * 1000)}` })));
      }
    } else {
      setFormData(prev => ({ ...prev, organization_name: '', organization_id: '', department_id: '' }));
    }
  };

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB!');
      return;
    }

    setUploadingDoc(docType);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.employee_id || 'new'}_${docType}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('employee_documents')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('employee_documents').getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docType]: publicUrl
        }
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Gagal mengunggah dokumen: ' + error.message);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2MB!');
      return;
    }

    setUploadingDoc('photo');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.employee_id || 'new'}_photo_${Date.now()}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      const { data, error } = await supabase.storage
        .from('employee_documents')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('employee_documents').getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, photo: publicUrl }));
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Gagal mengunggah foto: ' + error.message);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleRemoveDocument = (docType) => {
    setFormData(prev => {
      const newDocs = { ...prev.documents };
      delete newDocs[docType];
      return { ...prev, documents: newDocs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, id: formData.employee_id };
      delete payload.employee_id;
      if (!payload.mobile_password) payload.mobile_password = '12345';
      payload.mobile_password = CryptoJS.SHA256(payload.mobile_password).toString();

      if (id) {
        await apiClient.put(`/api/employees/direct/${id}`, payload);
      } else {
        await apiClient.post('/api/employees/direct', payload);
      }
      alert('Data karyawan berhasil disimpan!');
      navigate('/master/employees');
    } catch (err) {
      alert('Gagal menyimpan data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderMainTab = () => (
    <div className="space-y-8 animate-fade-in">
      {/* SEKSI KEPEGAWAIAN & FOTO */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Informasi Kepegawaian</h3>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* KOLOM KIRI: FORM */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputWrapper label="ID Karyawan" icon={IconId}>
              <input name="employee_id" value={formData.employee_id} readOnly placeholder="Otomatis setelah pilih Organisasi" className={`${inputStyle} bg-slate-100 text-slate-500 cursor-not-allowed`} />
            </InputWrapper>
            <InputWrapper label="Organisasi" icon={IconBuildingSkyscraper}>
              <select required name="organization_name" value={formData.organization_name} onChange={handleOrgChange} className={inputStyle} disabled={!!id && !isOwnerOrSuperAdmin}>
                <option value="">PILIH ORGANISASI</option>
                {organizations.map(o => <option key={o.id} value={o.name}>{o.name.toUpperCase()}</option>)}
              </select>
            </InputWrapper>
            <InputWrapper label="Departemen" icon={IconBriefcase}>
              <select name="department_id" value={formData.department_id} onChange={handleChange} className={inputStyle} disabled={!formData.organization_id || !formData.employee_id}>
                <option value="">PILIH DEPARTEMEN</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name.toUpperCase()}</option>)}
              </select>
            </InputWrapper>
            <InputWrapper label="Jabatan" icon={IconAward}>
              <select name="job_position" value={formData.job_position} onChange={handleChange} className={inputStyle} disabled={!formData.department_id || !formData.employee_id}>
                <option value="">PILIH JABATAN</option>
                {positions.map(p => <option key={p.id} value={p.name}>{p.name.toUpperCase()}</option>)}
              </select>
            </InputWrapper>
            <InputWrapper label="Status Pegawai" icon={IconUserCircle}>
              <select name="status" value={formData.status} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id}>
                <option value="Aktif">AKTIF</option>
                <option value="Kontrak">KONTRAK</option>
                <option value="Probation">PROBATION</option>
              </select>
            </InputWrapper>
            <InputWrapper label="Tanggal Bergabung" icon={IconCalendarEvent}>
              <DatePicker selected={formData.join_date ? new Date(formData.join_date) : null} onChange={(date) => setFormData(p => ({...p, join_date: date.toISOString().split('T')[0]}))} dateFormat="dd/MM/yyyy" className={dateInputStyle} disabled={!formData.employee_id} />
            </InputWrapper>
            <InputWrapper label="Lokasi Kerja" icon={IconMapPin}>
              <select name="working_location" value={formData.working_location} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id}>
                <option value="Head Office">HEAD OFFICE</option>
                <option value="Branch A">BRANCH A</option>
                <option value="Remote">REMOTE</option>
              </select>
            </InputWrapper>
          </div>

          {/* KOLOM KANAN: FOTO */}
          <div className="w-full lg:w-56 shrink-0 flex flex-col gap-3">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider text-center">Foto Karyawan</h4>
            <div className={`relative w-full aspect-[3/4] rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all border-2 ${formData.employee_id ? 'bg-blue-50 border-dashed border-blue-300 hover:bg-blue-100 hover:border-blue-400' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
              {formData.photo ? (
                <img src={formData.photo} alt="Foto Karyawan" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-blue-400 p-4 text-center">
                  <IconUserCircle size={48} className="mb-2 opacity-50" />
                  <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">Pilih Foto</span>
                </div>
              )}
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                onChange={handlePhotoUpload}
                disabled={uploadingDoc === 'photo' || !formData.employee_id}
              />
              {uploadingDoc === 'photo' && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                  <IconLoader2 className="animate-spin text-blue-600" size={24} />
                  <span className="text-[9px] font-bold text-blue-600 uppercase">Mengunggah...</span>
                </div>
              )}
            </div>
            <p className="text-[9px] font-medium text-slate-500 leading-relaxed text-center bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
              Latar belakang biru. Format JPG/PNG (Maks 2MB).
            </p>
          </div>
        </div>
        
        {!formData.employee_id && (
          <div className="mt-6 p-3 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-lg border border-amber-200 flex items-center gap-2 animate-pulse">
            <IconBuildingSkyscraper size={16} />
            Silakan pilih Organisasi terlebih dahulu untuk menghasilkan ID Karyawan dan membuka form isian.
          </div>
        )}
      </div>

      {/* SEKSI DATA PRIBADI */}
      <div className={`transition-opacity duration-300 ${!formData.employee_id ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Informasi Pribadi</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputWrapper label="NIK KTP" icon={IconId}>
            <input required name="nik" value={formData.nik} onChange={handleChange} placeholder="3201..." className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Nama Lengkap" icon={IconUserCircle}>
            <input required name="name" value={formData.name} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Email" icon={IconMail}>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyle.replace('uppercase', '')} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="No. Handphone" icon={IconPhone}>
            <input required name="phone" value={formData.phone} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Jenis Kelamin" icon={IconGenderBigender}>
            <select name="gender" value={formData.gender} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id}>
              <option value="Laki-laki">LAKI-LAKI</option>
              <option value="Perempuan">PEREMPUAN</option>
            </select>
          </InputWrapper>
          <InputWrapper label="Status Pernikahan" icon={IconUserCircle}>
            <select name="marital_status" value={formData.marital_status} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id}>
              <option value="Belum Kawin">BELUM KAWIN</option>
              <option value="Kawin">KAWIN</option>
            </select>
          </InputWrapper>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <InputWrapper label="Alamat KTP" icon={IconMapPin}>
            <textarea rows="3" name="ktp_address" value={formData.ktp_address} onChange={handleChange} className={`${inputStyle} h-auto py-2`} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Alamat Domisili" icon={IconMapPin}>
            <textarea rows="3" name="domicile_address" value={formData.domicile_address} onChange={handleChange} className={`${inputStyle} h-auto py-2`} disabled={!formData.employee_id} />
          </InputWrapper>
        </div>
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InputWrapper label="Nama Bank" icon={IconBuildingSkyscraper}>
          <input name="bank_name" value={formData.bank_name} onChange={handleChange} placeholder="BCA / MANDIRI" className={inputStyle} />
        </InputWrapper>
        <InputWrapper label="No. Rekening" icon={IconCreditCard}>
          <input name="bank_account" value={formData.bank_account} onChange={handleChange} className={inputStyle} />
        </InputWrapper>
        <InputWrapper label="Atas Nama Rekening" icon={IconUserCircle}>
          <input name="bank_account_holder" value={formData.bank_account_holder} onChange={handleChange} className={inputStyle} />
        </InputWrapper>
        <InputWrapper label="No. BPJS Ketenagakerjaan" icon={IconId}>
          <input name="bpjs_tk_number" value={formData.bpjs_tk_number} onChange={handleChange} className={inputStyle} />
        </InputWrapper>
        <InputWrapper label="No. BPJS Kesehatan" icon={IconId}>
          <input name="bpjs_ks_number" value={formData.bpjs_ks_number} onChange={handleChange} className={inputStyle} />
        </InputWrapper>
        <InputWrapper label="Gaji Pokok (Base Salary)" icon={IconCreditCard}>
          <input type="number" name="base_salary" value={formData.base_salary} onChange={handleChange} className={inputStyle} />
        </InputWrapper>
      </div>
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3">
        <IconFileDescription className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Penyimpanan Dokumen Karyawan</h4>
          <p className="text-xs text-blue-700 mt-1">Unggah dokumen format PDF, JPG, atau PNG. Maksimal 5MB per file. Dokumen akan langsung tersimpan di Cloud Storage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOC_TYPES.map(doc => {
          const isUploaded = !!formData.documents?.[doc.id];
          const isUploading = uploadingDoc === doc.id;

          return (
            <div key={doc.id} className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between bg-slate-50 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isUploaded ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                    {isUploaded ? <IconCheck size={20} /> : <IconFileDescription size={20} />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{doc.label}</h5>
                    <span className="text-[10px] text-slate-500">{isUploaded ? 'Terunggah' : 'Belum diunggah'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {isUploaded ? (
                  <>
                    <a href={formData.documents[doc.id]} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 h-8 bg-white border border-slate-300 text-slate-700 text-[11px] font-bold rounded-lg hover:bg-slate-100 transition-all">
                      Lihat File
                    </a>
                    <button type="button" onClick={() => handleRemoveDocument(doc.id)} className="h-8 w-8 flex items-center justify-center bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-all">
                      <IconTrash size={14} />
                    </button>
                  </>
                ) : (
                  <div className="relative flex-1">
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      onChange={(e) => handleFileUpload(e, doc.id)}
                      disabled={isUploading || !formData.employee_id}
                    />
                    <button type="button" disabled={isUploading || !formData.employee_id} className="w-full flex items-center justify-center gap-2 h-8 bg-white border border-slate-300 text-slate-700 text-[11px] font-bold rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50">
                      {isUploading ? <IconLoader2 size={14} className="animate-spin" /> : <IconFileUpload size={14} />}
                      {isUploading ? 'Mengunggah...' : 'Pilih File'}
                    </button>
                  </div>
                )}
              </div>
              {!formData.employee_id && !isUploaded && (
                <div className="absolute inset-x-0 bottom-0 text-center py-1 bg-red-100 text-red-600 text-[9px] font-bold">
                  Simpan data awal karyawan terlebih dahulu
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 font-inter">
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/master/employees')} className="h-8 w-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 transition-all border border-slate-200">
            <IconArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{id ? 'Update Data Karyawan' : 'Tambah Karyawan Baru'}</h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Lengkapi form rekam medis, kepegawaian, dan gaji</p>
          </div>
        </div>
        
        {/* TAB NAVIGATION */}
        <div className="flex p-1 bg-slate-100 border border-slate-200/60 rounded-lg">
          <button type="button" onClick={() => setActiveTab('main')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'main' ? 'bg-white shadow-sm text-[#E31E24]' : 'text-slate-500 hover:bg-slate-200'}`}>Data Utama</button>
          <button type="button" onClick={() => setActiveTab('financial')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'financial' ? 'bg-white shadow-sm text-[#E31E24]' : 'text-slate-500 hover:bg-slate-200'}`}>Finansial & Payroll</button>
          <button type="button" onClick={() => setActiveTab('documents')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'documents' ? 'bg-white shadow-sm text-[#E31E24]' : 'text-slate-500 hover:bg-slate-200'}`}>Dokumen</button>
        </div>
      </header>

      {/* FORM CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-6xl mx-auto">
          <form id="employee-form" onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            {activeTab === 'main' && renderMainTab()}
            {activeTab === 'financial' && renderFinancialTab()}
            {activeTab === 'documents' && renderDocumentsTab()}
          </form>
        </div>
      </div>

      {/* STICKY ACTION BAR */}
      <div className="h-16 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pastikan semua data mandatory terisi sebelum menyimpan
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/master/employees')} className="h-10 px-6 rounded-lg font-bold text-[11px] uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all">
            Batal
          </button>
          <button type="submit" form="employee-form" disabled={loading} className="h-10 px-6 rounded-lg font-bold text-[11px] uppercase tracking-wider bg-[#E31E24] text-white shadow-md hover:bg-[#C1181E] disabled:opacity-50 transition-all flex items-center gap-2">
            {loading ? <IconLoader2 size={16} className="animate-spin" /> : <IconDeviceFloppy size={16} />}
            Simpan Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
