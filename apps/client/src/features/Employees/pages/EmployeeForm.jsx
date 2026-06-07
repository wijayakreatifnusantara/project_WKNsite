import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  IconArrowLeft, IconDeviceFloppy, IconUserCircle, IconBriefcase, IconCreditCard,
  IconId, IconMail, IconPhone, IconMapPin, IconBuildingSkyscraper, IconAward,
  IconCalendarEvent, IconGenderBigender, IconLoader2, IconFileUpload, IconFileDescription, IconTrash, IconCheck, IconX, IconPlus
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

const InputWrapper = ({ label, icon: Icon, children, labelRight }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center pl-1">
      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      {labelRight && <div>{labelRight}</div>}
    </div>
    <div className="relative">
      <Icon size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none z-10" />
      {children}
    </div>
  </div>
);

const inputStyle = "w-full h-10 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24]/20 transition-all appearance-none uppercase placeholder:normal-case placeholder:text-slate-400";
const dateInputStyle = "w-full h-10 pl-10 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24]/20 transition-all cursor-pointer flex items-center";

const initialFormData = {
  employee_id: '', name: '', nickname: '', email: '', phone: '', gender: 'Laki-laki',
  date_of_birth: '', place_of_birth: '', religion: 'Islam', marital_status: 'Belum Kawin',
  residence_status: 'Milik Sendiri', blood_type: 'O', height: '', weight: '', uniform_size: '', shoe_size: '',
  nik: '', kk_number: '', ktp_address: '', domicile_address: '', photo: '',
  division_name: '', division_id: '', department_id: '', job_position: '',
  job_level: 'Staff', status: 'Aktif', employment_type: 'Permanent', working_location: 'Head Office',
  base_salary: 0, join_date: new Date().toISOString().split('T')[0],
  emergency_contact_1_name: '', emergency_contact_1_rel: '', emergency_contact_1_phone: '',
  emergency_contact_2_name: '', emergency_contact_2_rel: '', emergency_contact_2_phone: '',
  bank_name: '', bank_account: '', bank_account_holder: '', bpjs_tk_number: '', bpjs_ks_number: '',
  mobile_password: '', documents: {},
  npwp: '', ptkp_status: '', salary_type: 'Netto',
  payroll_components: {
    fixed_income: {
      tunjangan_jabatan: 0, tunjangan_keahlian: 0, tunjangan_komunikasi: 0,
      bpjs_tk_jkk: 0, bpjs_tk_jkm: 0, bpjs_tk_jht: 0, bpjs_tk_jp: 0, bpjs_kesehatan: 0
    },
    variable_income: {
      work_order_allowance: 0, meals_allowance: 0, transport_allowance: 0, overtime_allowance: 0
    },
    non_wage_income: {
      thr: 0, bonus: 0, incentive: 0, miscellaneous_earnings: 0
    },
    deductions: {
      pph21: 0, bpjs_tk_jht: 0, bpjs_tk_jp: 0, bpjs_kesehatan: 0, loan: 0, miscellaneous_deduction: 0
    }
  },
  family_members: [], education_history: [], work_experience: [], certifications: [], skills: ''
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
  const [divisions, setdivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  const isOwnerOrSuperAdmin = user?.role?.toLowerCase() === 'owner' || user?.role?.toLowerCase() === 'superadmin';

  // Load Master Data
  useEffect(() => {
    axios.get(`${API_URL}/divisions?active_only=true`)
      .then(res => { if (res.data.status === 'success') setdivisions(res.data.data || []); })
      .catch(err => console.error('Failed to load orgs', err));
  }, []);

  const fetchDepartments = (orgId) => {
    if (!orgId) { setDepartments([]); return; }
    axios.get(`${API_URL}/divisions/${orgId}/departments?active_only=true`)
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
            
            const fetchedPayroll = data.payroll_components || {};
            const mergedPayroll = {
              fixed_income: { ...initialFormData.payroll_components.fixed_income, ...(fetchedPayroll.fixed_income || {}) },
              variable_income: { ...initialFormData.payroll_components.variable_income, ...(fetchedPayroll.variable_income || {}) },
              non_wage_income: { ...initialFormData.payroll_components.non_wage_income, ...(fetchedPayroll.non_wage_income || {}) },
              deductions: { ...initialFormData.payroll_components.deductions, ...(fetchedPayroll.deductions || {}) }
            };

            const normalized = { 
              ...initialFormData, 
              ...data, 
              employee_id: data.employee_id || data.id,
              documents: data.documents || {},
              payroll_components: mergedPayroll
            };
            setFormData(normalized);
            if (normalized.division_id) fetchDepartments(normalized.division_id);
            if (normalized.department_id) fetchPositions(normalized.department_id);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => { fetchDepartments(formData.division_id); }, [formData.division_id]);
  useEffect(() => { fetchPositions(formData.department_id); }, [formData.department_id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    if ((type === 'text' || e.target.tagName === 'TEXTAREA') && name !== 'email' && name !== 'mobile_password') {
      finalValue = value.toUpperCase();
    }
    setFormData(prev => ({ ...prev, [name]: name === 'base_salary' ? parseFloat(value) || 0 : finalValue }));
  };

  const handlePayrollChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      payroll_components: {
        ...prev.payroll_components,
        [category]: {
          ...prev.payroll_components[category],
          [field]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleOrgChange = async (e) => {
    const org = divisions.find(o => o.name === e.target.value);
    if (org) {
      setFormData(prev => ({ ...prev, division_name: org.name, division_id: org.id, department_id: '' }));
      if (!id && !formData.employee_id) {
        apiClient.get(`/api/employees/generate-id?org_code=${org.code || 'TMP'}`)
          .then(res => { if (res.data.status === 'success') setFormData(prev => ({ ...prev, employee_id: res.data.data })); })
          .catch(() => setFormData(prev => ({ ...prev, employee_id: `${org.code}-TMP-${Math.floor(Math.random() * 1000)}` })));
      }
    } else {
      setFormData(prev => ({ ...prev, division_name: '', division_id: '', department_id: '' }));
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
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('bucket', 'employee_documents');

      const res = await apiClient.post('/api/employees/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status !== 'success') throw new Error('Upload failed on server');

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docType]: res.data.publicUrl
        }
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Gagal mengunggah dokumen: ' + (error.response?.data?.detail || error.message));
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
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('bucket', 'employee_documents');

      const res = await apiClient.post('/api/employees/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status !== 'success') throw new Error('Upload failed on server');

      setFormData(prev => ({ ...prev, photo: res.data.publicUrl }));
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Gagal mengunggah foto: ' + (error.response?.data?.detail || error.message));
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
      if (!/^[a-fA-F0-9]{64}$/.test(payload.mobile_password)) {
        payload.mobile_password = CryptoJS.SHA256(payload.mobile_password).toString();
      }

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
              <select required name="division_name" value={formData.division_name} onChange={handleOrgChange} className={inputStyle} disabled={!!id && !isOwnerOrSuperAdmin}>
                <option value="">PILIH ORGANISASI</option>
                {divisions.map(o => <option key={o.id} value={o.name}>{o.name.toUpperCase()}</option>)}
              </select>
            </InputWrapper>
            <InputWrapper label="Departemen" icon={IconBriefcase}>
              <select name="department_id" value={formData.department_id} onChange={handleChange} className={inputStyle} disabled={!formData.division_id || !formData.employee_id}>
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
              <DatePicker portalId="root-portal" selected={formData.join_date ? new Date(formData.join_date) : null} onChange={(date) => setFormData(p => ({...p, join_date: date.toISOString().split('T')[0]}))} dateFormat="dd/MM/yyyy" className={dateInputStyle} disabled={!formData.employee_id} />
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
                <>
                  <img src={formData.photo} alt="Foto Karyawan" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFormData(prev => ({ ...prev, photo: '' }));
                    }}
                    className="absolute top-2 right-2 bg-slate-900/50 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-sm transition-all hover:scale-110 z-20"
                    title="Hapus Foto"
                  >
                    <IconX size={16} stroke={2.5} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center text-blue-400 p-4 text-center">
                  <IconUserCircle size={48} className="mb-2 opacity-50" />
                  <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">Pilih Foto</span>
                </div>
              )}
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
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
          <InputWrapper label="Nomor Kartu Keluarga" icon={IconId}>
            <input required name="kk_number" value={formData.kk_number} onChange={handleChange} placeholder="3201..." className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Nama Lengkap" icon={IconUserCircle}>
            <input required name="name" value={formData.name} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Nama Panggilan" icon={IconUserCircle}>
            <input name="nickname" value={formData.nickname} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Tempat Lahir" icon={IconMapPin}>
            <input name="place_of_birth" value={formData.place_of_birth} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Tanggal Lahir" icon={IconCalendarEvent}>
            <DatePicker portalId="root-portal" selected={formData.date_of_birth ? new Date(formData.date_of_birth) : null} onChange={(date) => setFormData(p => ({...p, date_of_birth: date.toISOString().split('T')[0]}))} dateFormat="dd/MM/yyyy" className={dateInputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Agama" icon={IconUserCircle}>
            <select name="religion" value={formData.religion} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id}>
              <option value="Islam">ISLAM</option>
              <option value="Kristen Protestan">KRISTEN PROTESTAN</option>
              <option value="Katolik">KATOLIK</option>
              <option value="Hindu">HINDU</option>
              <option value="Buddha">BUDDHA</option>
              <option value="Konghucu">KONGHUCU</option>
            </select>
          </InputWrapper>
          <InputWrapper label="Email (Login Mobile)" icon={IconMail}>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyle.replace('uppercase', '')} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Password Mobile App" icon={IconUserCircle}>
            <div className="relative">
              <input type="text" name="mobile_password" value={formData.mobile_password || ''} onChange={handleChange} placeholder="Default: 12345" className={inputStyle.replace('uppercase', '')} disabled={!formData.employee_id} />
              <button 
                type="button" 
                onClick={() => setFormData(p => ({...p, mobile_password: p.nik}))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                disabled={!formData.employee_id || !formData.nik}
                title="Gunakan NIK sebagai Password"
              >
                Samakan NIK
              </button>
            </div>
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
          <InputWrapper label="Status Tempat Tinggal" icon={IconBuildingSkyscraper}>
            <select name="residence_status" value={formData.residence_status} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id}>
              <option value="Milik Sendiri">MILIK SENDIRI</option>
              <option value="Milik Orang Tua">MILIK ORANG TUA</option>
              <option value="Milik Keluarga">MILIK KELUARGA</option>
              <option value="Kontrakan (Kosan)">KONTRAKAN (KOSAN)</option>
            </select>
          </InputWrapper>
          <InputWrapper label="Golongan Darah" icon={IconUserCircle}>
            <select name="blood_type" value={formData.blood_type} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
              <option value="Tidak Tahu">TIDAK TAHU</option>
            </select>
          </InputWrapper>
          <InputWrapper label="Tinggi Badan (cm)" icon={IconUserCircle}>
            <input type="number" name="height" value={formData.height} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Berat Badan (kg)" icon={IconUserCircle}>
            <input type="number" name="weight" value={formData.weight} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Ukuran Seragam" icon={IconUserCircle}>
            <select name="uniform_size" value={formData.uniform_size} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id}>
              <option value="">PILIH UKURAN</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="XXXL">XXXL</option>
            </select>
          </InputWrapper>
          <InputWrapper label="Ukuran Sepatu" icon={IconUserCircle}>
            <input type="number" name="shoe_size" value={formData.shoe_size} onChange={handleChange} placeholder="40" className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <InputWrapper label="Alamat KTP" icon={IconMapPin}>
            <textarea rows="3" name="ktp_address" value={formData.ktp_address} onChange={handleChange} className={`${inputStyle} h-auto py-2`} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper 
            label="Alamat Domisili" 
            icon={IconMapPin}
            labelRight={
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 cursor-pointer hover:text-slate-700">
                <input 
                  type="checkbox" 
                  checked={formData.domicile_address && formData.domicile_address === formData.ktp_address} 
                  onChange={(e) => {
                    if(e.target.checked) {
                      setFormData(prev => ({...prev, domicile_address: prev.ktp_address}));
                    } else {
                      setFormData(prev => ({...prev, domicile_address: ''}));
                    }
                  }} 
                  className="rounded border-slate-300 text-[#E31E24] focus:ring-[#E31E24]"
                  disabled={!formData.employee_id || !formData.ktp_address}
                />
                <span>Sama dengan KTP</span>
              </label>
            }
          >
            <textarea rows="3" name="domicile_address" value={formData.domicile_address} onChange={handleChange} className={`${inputStyle} h-auto py-2`} disabled={!formData.employee_id} />
          </InputWrapper>
        </div>
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-8 animate-fade-in">
      {/* INFORMASI REKENING & PAJAK */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Informasi Rekening & Pajak</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputWrapper label="Nama Bank" icon={IconBuildingSkyscraper}>
            <input name="bank_name" value={formData.bank_name} onChange={handleChange} placeholder="BCA / MANDIRI" className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="No. Rekening" icon={IconCreditCard}>
            <input name="bank_account" value={formData.bank_account} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Atas Nama Rekening" icon={IconUserCircle}>
            <input name="bank_account_holder" value={formData.bank_account_holder} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="NPWP" icon={IconId}>
            <input name="npwp" value={formData.npwp} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Status PTKP" icon={IconUserCircle}>
            <select name="ptkp_status" value={formData.ptkp_status} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id}>
              <option value="">PILIH STATUS</option>
              <option value="TK/0">TK/0</option>
              <option value="TK/1">TK/1</option>
              <option value="TK/2">TK/2</option>
              <option value="TK/3">TK/3</option>
              <option value="K/0">K/0</option>
              <option value="K/1">K/1</option>
              <option value="K/2">K/2</option>
              <option value="K/3">K/3</option>
            </select>
          </InputWrapper>
          <InputWrapper label="Type Gaji" icon={IconCreditCard}>
            <select name="salary_type" value={formData.salary_type} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id}>
              <option value="Netto">NETTO</option>
              <option value="Gross">GROSS</option>
              <option value="Gross Up">GROSS UP</option>
            </select>
          </InputWrapper>
        </div>
      </div>

      {/* NOMOR BPJS (REFERENSI) */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Nomor BPJS (Referensi)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputWrapper label="No. BPJS Ketenagakerjaan" icon={IconId}>
            <input name="bpjs_tk_number" value={formData.bpjs_tk_number} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="No. BPJS Kesehatan" icon={IconId}>
            <input name="bpjs_ks_number" value={formData.bpjs_ks_number} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
        </div>
      </div>

      {/* KOMPONEN GAJI: FIXED INCOME */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Komponen Gaji - Fixed Income</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputWrapper label="Gaji Pokok (Base Salary)" icon={IconCreditCard}>
            <input type="number" name="base_salary" value={formData.base_salary} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Tunjangan Jabatan" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.fixed_income?.tunjangan_jabatan || ''} onChange={(e) => handlePayrollChange('fixed_income', 'tunjangan_jabatan', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Tunjangan Keahlian" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.fixed_income?.tunjangan_keahlian || ''} onChange={(e) => handlePayrollChange('fixed_income', 'tunjangan_keahlian', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Tunjangan Komunikasi" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.fixed_income?.tunjangan_komunikasi || ''} onChange={(e) => handlePayrollChange('fixed_income', 'tunjangan_komunikasi', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          
          <div className="col-span-full mt-2">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Tunjangan BPJS Ketenagakerjaan (Dibayarkan Perusahaan)</label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-lg border border-slate-200">
              <InputWrapper label="JKK" icon={IconCreditCard}>
                <input type="number" value={formData.payroll_components?.fixed_income?.bpjs_tk_jkk || ''} onChange={(e) => handlePayrollChange('fixed_income', 'bpjs_tk_jkk', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
              </InputWrapper>
              <InputWrapper label="JKM" icon={IconCreditCard}>
                <input type="number" value={formData.payroll_components?.fixed_income?.bpjs_tk_jkm || ''} onChange={(e) => handlePayrollChange('fixed_income', 'bpjs_tk_jkm', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
              </InputWrapper>
              <InputWrapper label="JHT" icon={IconCreditCard}>
                <input type="number" value={formData.payroll_components?.fixed_income?.bpjs_tk_jht || ''} onChange={(e) => handlePayrollChange('fixed_income', 'bpjs_tk_jht', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
              </InputWrapper>
              <InputWrapper label="JP" icon={IconCreditCard}>
                <input type="number" value={formData.payroll_components?.fixed_income?.bpjs_tk_jp || ''} onChange={(e) => handlePayrollChange('fixed_income', 'bpjs_tk_jp', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
              </InputWrapper>
            </div>
          </div>
          <InputWrapper label="Tunjangan BPJS Kesehatan" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.fixed_income?.bpjs_kesehatan || ''} onChange={(e) => handlePayrollChange('fixed_income', 'bpjs_kesehatan', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
        </div>
      </div>

      {/* KOMPONEN GAJI: VARIABLE INCOME */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Komponen Gaji - Variable Income</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputWrapper label="Work Order Allowance" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.variable_income?.work_order_allowance || ''} onChange={(e) => handlePayrollChange('variable_income', 'work_order_allowance', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Meals Allowance" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.variable_income?.meals_allowance || ''} onChange={(e) => handlePayrollChange('variable_income', 'meals_allowance', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Transport Allowance" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.variable_income?.transport_allowance || ''} onChange={(e) => handlePayrollChange('variable_income', 'transport_allowance', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Overtime Allowance" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.variable_income?.overtime_allowance || ''} onChange={(e) => handlePayrollChange('variable_income', 'overtime_allowance', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
        </div>
      </div>

      {/* KOMPONEN GAJI: NON-WAGE INCOME */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Komponen Gaji - Non-Wage Income</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputWrapper label="THR" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.non_wage_income?.thr || ''} onChange={(e) => handlePayrollChange('non_wage_income', 'thr', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Bonus" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.non_wage_income?.bonus || ''} onChange={(e) => handlePayrollChange('non_wage_income', 'bonus', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Incentive" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.non_wage_income?.incentive || ''} onChange={(e) => handlePayrollChange('non_wage_income', 'incentive', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Miscellaneous Earnings" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.non_wage_income?.miscellaneous_earnings || ''} onChange={(e) => handlePayrollChange('non_wage_income', 'miscellaneous_earnings', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
        </div>
      </div>

      {/* KOMPONEN GAJI: DEDUCTION */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Komponen Gaji - Deduction (Potongan)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputWrapper label="PPh21" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.deductions?.pph21 || ''} onChange={(e) => handlePayrollChange('deductions', 'pph21', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          
          <div className="col-span-full mt-2">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Potongan BPJS Ketenagakerjaan</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-lg border border-slate-200">
              <InputWrapper label="JHT" icon={IconCreditCard}>
                <input type="number" value={formData.payroll_components?.deductions?.bpjs_tk_jht || ''} onChange={(e) => handlePayrollChange('deductions', 'bpjs_tk_jht', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
              </InputWrapper>
              <InputWrapper label="JP" icon={IconCreditCard}>
                <input type="number" value={formData.payroll_components?.deductions?.bpjs_tk_jp || ''} onChange={(e) => handlePayrollChange('deductions', 'bpjs_tk_jp', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
              </InputWrapper>
            </div>
          </div>
          
          <InputWrapper label="Potongan BPJS Kesehatan" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.deductions?.bpjs_kesehatan || ''} onChange={(e) => handlePayrollChange('deductions', 'bpjs_kesehatan', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Loan" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.deductions?.loan || ''} onChange={(e) => handlePayrollChange('deductions', 'loan', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Miscellaneous Deduction" icon={IconCreditCard}>
            <input type="number" value={formData.payroll_components?.deductions?.miscellaneous_deduction || ''} onChange={(e) => handlePayrollChange('deductions', 'miscellaneous_deduction', e.target.value)} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
        </div>
      </div>
    </div>
  );

  const handleArrayChange = (field, index, key, value) => {
    let finalValue = value;
    if (typeof value === 'string' && key !== 'email') finalValue = value.toUpperCase();
    setFormData(prev => {
      const arr = [...(prev[field] || [])];
      arr[index] = { ...arr[index], [key]: finalValue };
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field, defaultItem) => {
    setFormData(prev => ({ ...prev, [field]: [...(prev[field] || []), defaultItem] }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => {
      const arr = [...(prev[field] || [])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  };

  const renderFamilyTab = () => (
    <div className="space-y-8 animate-fade-in">
      {/* KONTAK DARURAT */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Kontak Darurat (Utama)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputWrapper label="Nama Kontak 1" icon={IconUserCircle}>
            <input name="emergency_contact_1_name" value={formData.emergency_contact_1_name || ''} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Hubungan" icon={IconUserCircle}>
            <select name="emergency_contact_1_rel" value={formData.emergency_contact_1_rel || ''} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id}>
              <option value="">PILIH HUBUNGAN</option>
              <option value="AYAH KANDUNG">AYAH KANDUNG</option>
              <option value="IBU KANDUNG">IBU KANDUNG</option>
              <option value="AYAH TIRI">AYAH TIRI</option>
              <option value="IBU TIRI">IBU TIRI</option>
              <option value="SUAMI">SUAMI</option>
              <option value="ISTRI">ISTRI</option>
              <option value="ANAK">ANAK</option>
              <option value="KAKAK">KAKAK</option>
              <option value="ADIK">ADIK</option>
              <option value="MERTUA">MERTUA</option>
              <option value="KAKEK">KAKEK</option>
              <option value="NENEK">NENEK</option>
              <option value="LAIN-LAIN">LAIN-LAIN</option>
            </select>
          </InputWrapper>
          <InputWrapper label="No. Handphone" icon={IconPhone}>
            <input name="emergency_contact_1_phone" value={formData.emergency_contact_1_phone || ''} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <InputWrapper label="Nama Kontak 2" icon={IconUserCircle}>
            <input name="emergency_contact_2_name" value={formData.emergency_contact_2_name || ''} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
          <InputWrapper label="Hubungan" icon={IconUserCircle}>
            <select name="emergency_contact_2_rel" value={formData.emergency_contact_2_rel || ''} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id}>
              <option value="">PILIH HUBUNGAN</option>
              <option value="AYAH KANDUNG">AYAH KANDUNG</option>
              <option value="IBU KANDUNG">IBU KANDUNG</option>
              <option value="AYAH TIRI">AYAH TIRI</option>
              <option value="IBU TIRI">IBU TIRI</option>
              <option value="SUAMI">SUAMI</option>
              <option value="ISTRI">ISTRI</option>
              <option value="ANAK">ANAK</option>
              <option value="KAKAK">KAKAK</option>
              <option value="ADIK">ADIK</option>
              <option value="MERTUA">MERTUA</option>
              <option value="KAKEK">KAKEK</option>
              <option value="NENEK">NENEK</option>
              <option value="LAIN-LAIN">LAIN-LAIN</option>
            </select>
          </InputWrapper>
          <InputWrapper label="No. Handphone" icon={IconPhone}>
            <input name="emergency_contact_2_phone" value={formData.emergency_contact_2_phone || ''} onChange={handleChange} className={inputStyle} disabled={!formData.employee_id} />
          </InputWrapper>
        </div>
      </div>

      {/* DATA KELUARGA DINAMIS */}
      <div>
        <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Daftar Anggota Keluarga</h3>
          <button type="button" onClick={() => addArrayItem('family_members', { name: '', relation: '', occupation: '', phone: '' })} className="flex items-center gap-1 text-[10px] font-bold text-[#E31E24] hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50" disabled={!formData.employee_id}>
            <IconPlus size={14} /> Tambah Keluarga
          </button>
        </div>
        <div className="space-y-4">
          {formData.family_members?.map((member, idx) => (
            <div key={idx} className="relative bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <button type="button" onClick={() => removeArrayItem('family_members', idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                <IconX size={16} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pr-6">
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Nama</label><input value={member.name} onChange={e => handleArrayChange('family_members', idx, 'name', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Hubungan</label>
                  <select 
                    value={member.relation || ''} 
                    onChange={e => handleArrayChange('family_members', idx, 'relation', e.target.value)} 
                    className={inputStyle} 
                    disabled={!formData.employee_id}
                  >
                    <option value="">Pilih Hubungan</option>
                    <option value="Ayah Kandung">Ayah Kandung</option>
                    <option value="Ibu Kandung">Ibu Kandung</option>
                    <option value="Ayah Tiri">Ayah Tiri</option>
                    <option value="Ibu Tiri">Ibu Tiri</option>
                    <option value="Suami">Suami</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Kakak">Kakak</option>
                    <option value="Adik">Adik</option>
                    <option value="Mertua">Mertua</option>
                    <option value="Kakek">Kakek</option>
                    <option value="Nenek">Nenek</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Pekerjaan</label><input value={member.occupation} onChange={e => handleArrayChange('family_members', idx, 'occupation', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">No. Telepon</label><input value={member.phone} onChange={e => handleArrayChange('family_members', idx, 'phone', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
              </div>
            </div>
          ))}
          {(!formData.family_members || formData.family_members.length === 0) && (
            <div className="text-center text-slate-400 text-xs py-4">Belum ada data anggota keluarga.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-8 animate-fade-in">
      {/* PENDIDIKAN */}
      <div>
        <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Histori Pendidikan</h3>
          <button type="button" onClick={() => addArrayItem('education_history', { level: '', major: '', institution: '', year: '', certificate_number: '', city: '' })} className="flex items-center gap-1 text-[10px] font-bold text-[#E31E24] hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50" disabled={!formData.employee_id}>
            <IconPlus size={14} /> Tambah Pendidikan
          </button>
        </div>
        <div className="space-y-4">
          {formData.education_history?.map((edu, idx) => (
            <div key={idx} className="relative bg-slate-50 border border-slate-200 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
              <button type="button" onClick={() => removeArrayItem('education_history', idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><IconX size={16} /></button>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tingkat</label>
                <select value={edu.level || edu.degree || ''} onChange={e => handleArrayChange('education_history', idx, 'level', e.target.value)} className={inputStyle} disabled={!formData.employee_id}>
                  <option value="">Pilih Tingkat</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                </select>
              </div>
              
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Jurusan</label><input value={edu.major || ''} onChange={e => handleArrayChange('education_history', idx, 'major', e.target.value)} placeholder="Contoh: Teknik Informatika" className={inputStyle} disabled={!formData.employee_id} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Institusi/Sekolah</label><input value={edu.institution || ''} onChange={e => handleArrayChange('education_history', idx, 'institution', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Kota</label><input value={edu.city || ''} onChange={e => handleArrayChange('education_history', idx, 'city', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Tahun Lulus</label><input value={edu.year || ''} onChange={e => handleArrayChange('education_history', idx, 'year', e.target.value)} type="number" className={inputStyle} disabled={!formData.employee_id} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Ijazah</label><input value={edu.certificate_number || ''} onChange={e => handleArrayChange('education_history', idx, 'certificate_number', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
            </div>
          ))}
          {(!formData.education_history || formData.education_history.length === 0) && <div className="text-center text-slate-400 text-xs py-4">Belum ada histori pendidikan.</div>}
        </div>
      </div>

      {/* PENGALAMAN KERJA */}
      <div>
        <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pengalaman Kerja</h3>
          <button type="button" onClick={() => addArrayItem('work_experience', { company: '', position: '', duration: '', city: '', manager_name: '', manager_phone: '' })} className="flex items-center gap-1 text-[10px] font-bold text-[#E31E24] hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50" disabled={!formData.employee_id}>
            <IconPlus size={14} /> Tambah Pengalaman
          </button>
        </div>
        <div className="space-y-4">
          {formData.work_experience?.map((work, idx) => (
            <div key={idx} className="relative bg-slate-50 border border-slate-200 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-8">
              <button type="button" onClick={() => removeArrayItem('work_experience', idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><IconX size={16} /></button>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Perusahaan</label><input value={work.company || ''} onChange={e => handleArrayChange('work_experience', idx, 'company', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Posisi</label><input value={work.position || ''} onChange={e => handleArrayChange('work_experience', idx, 'position', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Kota</label><input value={work.city || ''} onChange={e => handleArrayChange('work_experience', idx, 'city', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Durasi (Bulan & Tahun)</label><input value={work.duration || ''} onChange={e => handleArrayChange('work_experience', idx, 'duration', e.target.value)} placeholder="Contoh: Jan 2018 - Des 2021" className={inputStyle} disabled={!formData.employee_id} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Nama Atasan/HRD</label><input value={work.manager_name || ''} onChange={e => handleArrayChange('work_experience', idx, 'manager_name', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Telp Atasan/HRD</label><input value={work.manager_phone || ''} onChange={e => handleArrayChange('work_experience', idx, 'manager_phone', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
            </div>
          ))}
          {(!formData.work_experience || formData.work_experience.length === 0) && <div className="text-center text-slate-400 text-xs py-4">Belum ada pengalaman kerja.</div>}
        </div>
      </div>

      {/* KURSUS & SERTIFIKASI */}
      <div>
        <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Kursus atau Sertifikasi</h3>
          <button type="button" onClick={() => addArrayItem('certifications', { name: '', institution: '', city: '', phone: '', year: '', certificate_number: '' })} className="flex items-center gap-1 text-[10px] font-bold text-[#E31E24] hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50" disabled={!formData.employee_id}>
            <IconPlus size={14} /> Tambah Sertifikasi
          </button>
        </div>
        <div className="space-y-4">
          {formData.certifications?.map((cert, idx) => (
            <div key={idx} className="relative bg-slate-50 border border-slate-200 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-8">
              <button type="button" onClick={() => removeArrayItem('certifications', idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><IconX size={16} /></button>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Nama Sertifikasi</label><input value={cert.name || ''} onChange={e => handleArrayChange('certifications', idx, 'name', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Institusi / Penyelenggara</label><input value={cert.institution || ''} onChange={e => handleArrayChange('certifications', idx, 'institution', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Kota</label><input value={cert.city || ''} onChange={e => handleArrayChange('certifications', idx, 'city', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Telp Institusi</label><input value={cert.phone || ''} onChange={e => handleArrayChange('certifications', idx, 'phone', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Tahun</label><input value={cert.year || ''} onChange={e => handleArrayChange('certifications', idx, 'year', e.target.value)} type="number" className={inputStyle} disabled={!formData.employee_id} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Sertifikat</label><input value={cert.certificate_number || ''} onChange={e => handleArrayChange('certifications', idx, 'certificate_number', e.target.value)} className={inputStyle} disabled={!formData.employee_id} /></div>
            </div>
          ))}
          {(!formData.certifications || formData.certifications.length === 0) && <div className="text-center text-slate-400 text-xs py-4">Belum ada kursus atau sertifikasi.</div>}
        </div>
      </div>

      {/* KEAHLIAN */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Keahlian (Skills)</h3>
        <textarea 
          name="skills" 
          value={formData.skills || ''} 
          onChange={handleChange} 
          placeholder="Pisahkan dengan koma. Contoh: Bahasa Inggris, Microsoft Excel, Desain Grafis" 
          className={`${inputStyle} h-auto py-3 normal-case`} 
          rows="3"
          disabled={!formData.employee_id}
        />
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
          <button type="button" onClick={() => setActiveTab('family')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'family' ? 'bg-white shadow-sm text-[#E31E24]' : 'text-slate-500 hover:bg-slate-200'}`}>Data Keluarga</button>
          <button type="button" onClick={() => setActiveTab('history')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'history' ? 'bg-white shadow-sm text-[#E31E24]' : 'text-slate-500 hover:bg-slate-200'}`}>Pendidikan & Pengalaman</button>
          <button type="button" onClick={() => setActiveTab('financial')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'financial' ? 'bg-white shadow-sm text-[#E31E24]' : 'text-slate-500 hover:bg-slate-200'}`}>Finansial & Payroll</button>
          <button type="button" onClick={() => setActiveTab('documents')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'documents' ? 'bg-white shadow-sm text-[#E31E24]' : 'text-slate-500 hover:bg-slate-200'}`}>Dokumen</button>
        </div>
      </header>

      {/* FORM CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-6xl mx-auto">
          <form id="employee-form" onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            {activeTab === 'main' && renderMainTab()}
            {activeTab === 'family' && renderFamilyTab()}
            {activeTab === 'history' && renderHistoryTab()}
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
