import React, { useState } from 'react';
import { 
  IconX, 
  IconUserPlus, 
  IconId, 
  IconMail, 
  IconBuildingSkyscraper, 
  IconBriefcase, 
  IconAward, 
  IconLoader2,
  IconCheck,
  IconPhone,
  IconBrandWhatsapp,
  IconMapPin,
  IconCalendar,
  IconWallet,
  IconUser,
  IconGenderBigender,
  IconHeart,
  IconCreditCard,
  IconEdit,
  IconCamera,
  IconPhoto,
  IconCircleCheck,
  IconUpload,
  IconFilePlus,
  IconAddressBook,
  IconBuildingBank,
  IconFileDescription,
  IconDeviceFloppy,
  IconChevronRight,
  IconChevronLeft,
  IconPlus
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { apiClient } from '@/lib/apiClient';
import Tesseract from 'tesseract.js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IconScan, IconSparkles } from "@tabler/icons-react";
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import CryptoJS from 'crypto-js';

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

const ProfessionalDatePicker = ({ selected, onChange, placeholder, icon: Icon, disabled }) => (
  <div className="relative w-full">
    {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />}
    <DatePicker
      selected={selected ? new Date(selected) : null}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholder}
      showYearDropdown
      scrollableYearDropdown
      yearDropdownItemNumber={100}
      className={`${dateInputStyle} !pl-10 ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200/60 shadow-none' : ''}`}
      popperClassName="premium-calendar-popper"
      calendarClassName="premium-calendar"
      disabled={disabled}
    />
  </div>
);

const initialFormData = {
  employee_id: '',
  name: '',
  email: '',
  phone: '',
  gender: 'Laki-laki',
  date_of_birth: '',
  place_of_birth: '',
  religion: 'Islam',
  marital_status: 'Belum Kawin',
  nik: '',
  ktp_address: '',
  domicile_address: '',
  photo: '',
  organization_name: '',
  organization_id: '',
  department_id: '',
  job_position: '',
  job_level: 'Staff',
  status: 'PERMANENT',
  employment_type: 'Permanent',
  working_location: 'Head Office',
  base_salary: 0,
  join_date: new Date().toISOString().split('T')[0],
  contract_end_date: '',
  probation_end_date: '',
  emergency_contact_1_name: '',
  emergency_contact_1_rel: '',
  emergency_contact_1_phone: '',
  emergency_contact_2_name: '',
  emergency_contact_2_rel: '',
  emergency_contact_2_phone: '',
  bank_name: '',
  bank_account: '',
  bank_account_holder: '',
  npwp: '',
  ptkp_status: 'TK/0',
  tax_method: 'Gross',
  mobile_password: ''
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const AddEmployeeModal = ({ isOpen, onClose, onRefresh, editData }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isScanning, setIsScanning] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const fileInputRef = React.useRef(null);
  const { user } = useAuth();
  const isOwnerOrSuperAdmin = user?.role?.toLowerCase() === 'owner' || user?.role?.toLowerCase() === 'superadmin';
  const isFieldsLocked = !formData.organization_id;
  const getFieldStyle = (disabled) => 
    `${inputStyle} ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200/60 shadow-none' : ''}`;

  const [workingLocations, setWorkingLocations] = useState(['Head Office']);

  React.useEffect(() => {
    axios.get(`${API_URL}/attendance/settings`)
      .then(res => {
        const d = res.data;
        if (d.status === 'success' && d.data.working_locations) {
          const locations = d.data.working_locations.map(loc => loc.name);
          setWorkingLocations(locations);
        }
      })
      .catch(err => console.error('Failed to load working locations:', err));
  }, []);

  React.useEffect(() => {
    axios.get(`${API_URL}/organizations?active_only=true`)
      .then(res => {
        const d = res.data;
        if (d.status === 'success') {
          setOrganizations(d.data || []);
        }
      })
      .catch(err => console.error('Failed to load organizations:', err));
  }, []);

  // Helper: fetch departments for a given org id
  const fetchDepartmentsForOrg = React.useCallback((orgId) => {
    if (!orgId) { setDepartments([]); return; }
    axios.get(`${API_URL}/organizations/${orgId}/departments?active_only=true`)
      .then(res => {
        const d = res.data;
        if (d.status === 'success') {
          setDepartments(d.data || []);
        } else {
          setDepartments([]);
        }
      })
      .catch(err => {
        console.error('Failed to load departments:', err);
        setDepartments([]);
      });
  }, []);

  // Helper: fetch positions for a given department id
  const fetchPositionsForDept = React.useCallback((deptId) => {
    if (!deptId) { setPositions([]); return; }
    axios.get(`${API_URL}/departments/${deptId}/positions?active_only=true`)
      .then(res => {
        const d = res.data;
        if (d.status === 'success') {
          setPositions(d.data || []);
        } else {
          setPositions([]);
        }
      })
      .catch(err => {
        console.error('Failed to load positions:', err);
        setPositions([]);
      });
  }, []);

  // Fetch departments when organization_id changes (new employee flow / org switcher)
  React.useEffect(() => {
    fetchDepartmentsForOrg(formData.organization_id);
  }, [formData.organization_id, fetchDepartmentsForOrg]);

  // Fetch positions when department_id changes
  React.useEffect(() => {
    fetchPositionsForDept(formData.department_id);
  }, [formData.department_id, fetchPositionsForDept]);

  // Match organization_id when organizations are loaded or edited organization name is set
  React.useEffect(() => {
    if (organizations.length > 0 && formData.organization_name && !formData.organization_id) {
      const matchedOrg = organizations.find(o => o.name === formData.organization_name);
      if (matchedOrg) {
        setFormData(prev => ({
          ...prev,
          organization_id: matchedOrg.id
        }));
        // If it's a new employee, set correct initial auto ID format based on organization code
        if (!editData && !formData.employee_id) {
          generateAutoID(matchedOrg.code);
        }
      }
    }
  }, [organizations, formData.organization_name, editData]);

  React.useEffect(() => {
    if (isOpen && editData) {
      // Map database names to form fields
      // User's DB has keys like "EMPLOYEE NAME", "EMPLOYEE ID", etc.
      const normalizedData = { ...initialFormData };
      
      // Direct mapping for common aliases
      const mapping = {
        "id": "employee_id",
        "EMPLOYEE ID": "employee_id",
        "name": "name",
        "EMPLOYEE NAME": "name",
        "email": "email",
        "EMAIL": "email",
        "phone_number": "phone",
        "whatsapp_number": "phone",
        "Organization Name *": "organization_name",
        "Job Position *": "job_position",
        "Job Level *": "job_level",
        "Status *": "status",
        "Basic Salary": "base_salary",
        "Join Date": "join_date",
        "Photo": "photo",
        "photo": "photo"
      };

      // Apply mapping
      Object.entries(editData).forEach(([dbKey, value]) => {
        const formKey = mapping[dbKey] || dbKey;
        if (formKey in normalizedData && value !== undefined) {
          normalizedData[formKey] = value === null ? '' : value;
        }
      });

      // Special handling for dates (ensure they are strings for the form)
      ['date_of_birth', 'join_date', 'contract_end_date', 'probation_end_date'].forEach(field => {
        if (normalizedData[field] && typeof normalizedData[field] === 'string') {
          // Keep only YYYY-MM-DD
          normalizedData[field] = normalizedData[field].split('T')[0];
        }
      });
      
      setFormData(normalizedData);
      // Immediately fetch departments and positions using editData's ids — avoids race condition with state
      if (editData.organization_id) {
        fetchDepartmentsForOrg(editData.organization_id);
      }
      if (normalizedData.department_id) {
        fetchPositionsForDept(normalizedData.department_id);
      }
    } else if (isOpen && !editData) {
      setFormData(initialFormData);
      setDepartments([]);
      setPositions([]);
    }
  }, [isOpen, editData, fetchDepartmentsForOrg, fetchPositionsForDept]);

  const handleClose = () => {
    // If editing, we can just close
    if (editData) {
      onClose();
      return;
    }
    
    const isDirty = formData.name || formData.nik || formData.ktp_address || formData.email;
    if (isDirty && !success) {
      if (window.confirm("Input data belum selesai. Apakah Anda yakin ingin menutup dan menghapus semua progres?")) {
        setFormData(initialFormData);
        onClose();
      }
    } else {
      setFormData(initialFormData);
      onClose();
    }
  };

  const generateAutoID = async (orgCode) => {
    const code = (orgCode || 'WKN').toUpperCase();
    try {
      const response = await apiClient.get(`/api/employees/generate-id?org_code=${code}`);
      if (response.status === 'success') {
        setFormData(prev => ({ ...prev, employee_id: response.data }));
      }
    } catch (error) {
      console.error('Error generating ID:', error);
      // Fallback
      setFormData(prev => ({ ...prev, employee_id: `${code}-TMP-${Math.floor(Math.random() * 1000)}` }));
    }
  };

  const handleOrgChange = async (e) => {
    const orgName = e.target.value;
    const org = organizations.find(o => o.name === orgName);
    
    if (org) {
      setFormData(prev => ({
        ...prev,
        organization_name: org.name,
        organization_id: org.id,
        department_id: '' // reset department
      }));
      // Auto generate ID based on selected organization code
      await generateAutoID(org.code);
    } else {
      setFormData(prev => ({
        ...prev,
        organization_name: '',
        organization_id: '',
        department_id: ''
      }));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user profile in profiles table first via API
      try {
        await apiClient.post('/api/auth/profiles', {
          username: formData.email,
          full_name: formData.name,
          password: 'admin', // Default password for new users
          role: formData.is_field_team ? 'staff' : (formData.job_position?.toLowerCase().includes('manager') ? 'manager' : 'staff'),
          is_active: true
        });
      } catch (err) {
        console.error('Warning: Failed to create profile:', err);
      }

      const submissionData = { ...formData };
      // Map form's employee_id to database's primary 'id' column for both add and edit
      submissionData.id = formData.employee_id;
      delete submissionData.employee_id;

      // Jika password mobile kosong, beri default 12345
      if (!submissionData.mobile_password || submissionData.mobile_password.trim() === '') {
        submissionData.mobile_password = '12345';
      }
      
      // Hash password
      submissionData.mobile_password = CryptoJS.SHA256(submissionData.mobile_password).toString();

      Object.keys(submissionData).forEach(key => {
        if (submissionData[key] === '') {
          submissionData[key] = null;
        }
      });

      // Check if organization has changed on edit (Mutation)
      const originalOrgId = editData?.organization_id;
      const currentOrgId = formData.organization_id;
      const isMutation = editData && originalOrgId && currentOrgId && originalOrgId !== currentOrgId;

      if (isMutation) {
        if (!isOwnerOrSuperAdmin) {
          alert('Hanya Owner atau Superadmin yang dapat melakukan mutasi lintas organisasi.');
          setLoading(false);
          return;
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const dateSuffix = todayStr.replace(/-/g, '');
        const originalEmail = editData.email || '';
        let mutatedEmail = originalEmail;
        if (originalEmail.includes('@')) {
          const [localPart, domain] = originalEmail.split('@');
          mutatedEmail = `${localPart}_mutated_${dateSuffix}@${domain}`;
        } else {
          mutatedEmail = `${originalEmail}_mutated_${dateSuffix}`;
        }

        // 1. Deactivate the legacy record first (frees up the unique email constraint)
        await apiClient.put(`/api/employees/direct/${editData.id}`, {
          is_resigned: true,
          status: 'MUTASI',
          resign_date: todayStr,
          email: mutatedEmail
        });

        // 2. Create the new record under the new organization
        const newEmployeeData = {
          ...submissionData,
          join_date: todayStr,
          is_resigned: null,
          resign_date: null
        };

        await apiClient.post('/api/employees/direct', newEmployeeData);

      } else {
        if (editData) {
          await apiClient.put(`/api/employees/direct/${editData.id}`, submissionData);
        } else {
          await apiClient.post('/api/employees/direct', submissionData);
        }
      }
      
      setSuccess(true);
      setTimeout(() => {
        onRefresh();
        onClose();
        setFormData(initialFormData);
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error processing employee:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScanKTP = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    try {
      // --- STAGE 1: IMAGE PREPROCESSING (Canvas Optimization) ---
      const preprocessImage = async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              // Upscale for better OCR
              canvas.width = img.width * 2;
              canvas.height = img.height * 2;
              
              // Apply Grayscale & Contrast
              ctx.filter = 'grayscale(100%) contrast(150%) brightness(110%)';
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        });
      };

      const processedImage = await preprocessImage(file);

      // --- STAGE 2: MULTI-LANGUAGE OCR ---
      const { data: { text } } = await Tesseract.recognize(processedImage, 'ind+eng');
      
      // STAGE 3: AGGRESSIVE TEXT NORMALIZATION
      // Fix common OCR digit errors
      const digitFix = (str) => str.replace(/I/g, '1').replace(/L/g, '1').replace(/O/g, '0').replace(/S/g, '5').replace(/B/g, '8').replace(/G/g, '6');
      
      const cleanText = text.replace(/[|]/g, 'I').replace(/\s+/g, ' ');
      const noSpaceText = cleanText.replace(/\s/g, '').toUpperCase();
      console.log('AI Raw Text:', cleanText);

      const lowerText = cleanText.toLowerCase();
      
      const getRawValue = (label, endLabel) => {
        const startIdx = lowerText.indexOf(label.toLowerCase());
        if (startIdx === -1) return '';
        let part = cleanText.substring(startIdx + label.length);
        part = part.replace(/^[:\s\-=—]*\s*/, '');
        if (endLabel) {
          const endIdx = part.toLowerCase().indexOf(endLabel.toLowerCase());
          if (endIdx !== -1) part = part.substring(0, endIdx);
        }
        return part.split('\n')[0].trim();
      };

      // 1. NIK - Use DigitFix on the potential NIK block
      const nikSection = cleanText.match(/NIK\s*[:\s]*([A-Z0-9\s]{15,22})/i)?.[1] || '';
      let nik = digitFix(nikSection.replace(/\s/g, '')).match(/\d{16}/)?.[0] || '';
      if (!nik) {
        // Fallback: search anywhere for 16 digits after digit fixing
        const fixedFullText = digitFix(cleanText.replace(/\s/g, ''));
        nik = fixedFullText.match(/\d{16}/)?.[0] || '';
      }

      // 2. NAMA - Search between Nama and Tempat
      let nama = getRawValue('Nama', 'Tempat');
      if (!nama || nama.length < 4) {
        const blocks = cleanText.match(/[A-Z]{4,}(\s[A-Z]{3,})+/g) || [];
        nama = blocks.find(b => !/PROVINSI|KABUPATEN|KOTA|JAKARTA|NIK|BARAT|PENGELUARAN|AGAMA|STATUS|WARGANEGARA/i.test(b)) || '';
      }
      nama = nama.replace(/[:=]/g, '').replace(/^[—\s-]*/, '').replace(/\s[A-Z0-9]$/, '').trim();

      // 3. GENDER - Keyword search on no-space text
      const isFemale = /PEREMPUAN|WANITA|PUAN/i.test(noSpaceText);
      let gender = isFemale ? 'Perempuan' : 'Laki-laki';

      // 4. DATE OF BIRTH - Search near 'Lahir'
      const lahirIdx = lowerText.indexOf('lahir');
      let dob = '';
      if (lahirIdx !== -1) {
        const nearLahir = digitFix(cleanText.substring(lahirIdx, lahirIdx + 60));
        const dobMatch = nearLahir.match(/(\d{1,2})[\s\-\.]*(\d{1,2})[\s\-\.]*(\d{4})/);
        if (dobMatch) {
          dob = `${dobMatch[3]}-${dobMatch[2].padStart(2, '0')}-${dobMatch[1].padStart(2, '0')}`;
        }
      }

      // 5. STATUS PERKAWINAN
      const isMarried = /KAWIN/i.test(noSpaceText) && !/BELUMKAWIN/i.test(noSpaceText);
      const isSingle = /BELUMKAWIN/i.test(noSpaceText);
      let status = isMarried ? 'Kawin' : 'Belum Kawin';

      // 6. ALAMAT - Improved sweep
      let street = getRawValue('Alamat', 'RT/RW');
      const rtrw = getRawValue('RT/RW', 'Kel');
      const kel = getRawValue('Kel', 'Kec');
      const kec = getRawValue('Kec', 'Agama');

      let fullAddress = `${street} ${rtrw ? 'RT/RW '+rtrw : ''} ${kel ? kel : ''} ${kec ? kec : ''}`.trim();
      fullAddress = fullAddress.replace(/[:=]/g, '').replace(/\s+/g, ' ').trim();

      // Final Data Sync
      setFormData(prev => ({
        ...prev,
        nik: nik || prev.nik,
        name: nama.toUpperCase() || prev.name,
        ktp_address: fullAddress.toUpperCase() || prev.ktp_address,
        gender: gender,
        marital_status: status,
        date_of_birth: dob || prev.date_of_birth
      }));

      alert('KTP AI Processing Finished!');
    } catch (err) {
      console.error('AI Error:', err);
      alert('AI Processing encountered an issue.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // --- AUTO-CROP LOGIC (CANVAS) ---
      const processImage = async (sourceFile) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Set target dimensions (Square 500x500)
              const size = 500;
              canvas.width = size;
              canvas.height = size;
              
              // Calculate crop (Center Crop)
              let sourceX, sourceY, sourceSize;
              if (img.width > img.height) {
                sourceSize = img.height;
                sourceX = (img.width - img.height) / 2;
                sourceY = 0;
              } else {
                sourceSize = img.width;
                sourceX = 0;
                sourceY = (img.height - img.width) / 2;
              }
              
              // Draw cropped & resized image
              ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
              
              canvas.toBlob((blob) => {
                resolve(blob);
              }, 'image/jpeg', 0.9);
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(sourceFile);
        });
      };

      const croppedBlob = await processImage(file);
      const fileName = `${formData.employee_id || 'new'}_${Date.now()}.jpg`;

      // Convert Blob to File
      const uploadFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });
      
      // Use FormData to send file to FastAPI
      const formPayload = new FormData();
      formPayload.append('file', uploadFile);
      formPayload.append('bucket', 'employees');

      const response = await apiClient.post('/api/employees/upload', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status !== 'success') throw new Error('Upload gagal');

      setFormData(prev => ({ ...prev, photo: response.publicUrl }));
      alert('Foto berhasil diunggah dengan auto-crop 1:1');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Gagal mengunggah foto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    
    // Auto Capitalize for text inputs (except email)
    if (type === 'text' || e.target.tagName === 'TEXTAREA') {
      if (name !== 'email') {
        finalValue = value.toUpperCase();
      }
    }

    setFormData(prev => {
      const updated = { 
        ...prev, 
        [name]: name === 'base_salary' ? parseFloat(value) || 0 : finalValue 
      };
      
      // Apabila permanen, tgl contract end tdk bisa di isi, maka hapus isinya
      if (name === 'employment_type' && finalValue === 'Permanent') {
        updated.contract_end_date = '';
      }
      
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-slate-150 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 ${editData ? 'bg-green-500' : 'bg-[#E31E24]'} shadow-sm rounded-lg flex items-center justify-center text-white`}>
              {editData ? <IconEdit size={18} /> : <IconUserPlus size={18} />}
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-850 uppercase tracking-tight leading-none">
                {editData ? 'Update Talent Profile' : 'Master Personnel Onboarding'}
              </h2>
              <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-[0.3em] mt-1 opacity-70">
                {editData ? `Editing ID: ${editData.id}` : 'Cloud identity synchronization'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning || isFieldsLocked}
              className={`h-9 px-4 bg-white border rounded-lg text-[9px] font-bold transition-all flex items-center gap-2 shadow-sm group ${
                isFieldsLocked 
                  ? 'border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50' 
                  : 'border-[#E31E24] text-[#E31E24] hover:bg-[#E31E24] hover:text-white'
              }`}
            >
              {isScanning ? (
                <IconLoader2 size={14} className="animate-spin" />
              ) : (
                <IconScan size={14} className="group-hover:scale-110 transition-transform" />
              )}
              {isScanning ? 'Processing AI...' : 'Scan KTP (Auto-Fill)'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleScanKTP} 
            />
            <button 
              onClick={handleClose}
              className="h-8 w-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all border border-slate-100"
            >
              <IconX size={16} />
            </button>
          </div>
        </header>

        <form 
          onSubmit={handleSubmit} 
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar"
        >
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 5px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #e2e8f0;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #cbd5e1;
            }
          `}</style>
          {success ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 animate-in zoom-in-95 duration-500">
              <div className="h-16 w-16 bg-green-500 shadow-md rounded-full flex items-center justify-center text-white">
                <IconCircleCheck size={32} strokeWidth={3} />
              </div>
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Master Record Synchronized</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* PHOTO UPLOAD SECTION */}
              <div className="flex justify-center pt-2 pb-6">
                <div className="relative group">
                  <div className="h-28 w-28 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 shadow-sm">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <IconUser size={40} />
                    )}
                  </div>
                  <label className={`absolute -bottom-2 -right-2 h-9 w-9 text-white rounded-lg flex items-center justify-center shadow-md cursor-pointer transition-all ${
                    isFieldsLocked 
                      ? 'bg-slate-300 text-slate-400 cursor-not-allowed hover:scale-100' 
                      : 'bg-[#E31E24] hover:bg-[#C1181E] hover:scale-105 active:scale-95'
                  }`}>
                    <IconCamera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isFieldsLocked} />
                  </label>
                  {formData.photo && (
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, photo: ''}))}
                      className="absolute -top-2 -right-2 h-7 w-7 bg-white text-slate-400 rounded-lg flex items-center justify-center border border-slate-100 shadow hover:text-[#E31E24] transition-all"
                    >
                      <IconX size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* SECTION 1: CAREER & ORGANIZATION (Moved to top) */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-3 bg-emerald-600 rounded-full"></span> Career & Organization
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <InputWrapper label={editData && !isOwnerOrSuperAdmin ? "Org Name (Locked)" : "Org Name"} icon={IconBuildingSkyscraper}>
                    <select 
                      required 
                      name="organization_name" 
                      value={formData.organization_name} 
                      onChange={handleOrgChange} 
                      className={`${inputStyle} ${editData && !isOwnerOrSuperAdmin ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
                      disabled={editData && !isOwnerOrSuperAdmin}
                    >
                      <option value="">PILIH ORGANISASI</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.name}>{org.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </InputWrapper>
                  
                  {/* Relocated from Identity Profile section */}
                  <InputWrapper label="Employee ID (System Locked)" icon={IconId}>
                    <input 
                      readOnly
                      name="employee_id" 
                      placeholder="Generating..." 
                      value={formData.employee_id} 
                      className={`${inputStyle} text-slate-400 bg-slate-100 cursor-not-allowed border-l-2 border-l-slate-300 shadow-none font-bold tracking-widest`} 
                    />
                  </InputWrapper>

                  <InputWrapper label="Department" icon={IconBuildingSkyscraper}>
                    <select 
                      name="department_id" 
                      value={formData.department_id || ''} 
                      onChange={handleChange} 
                      className={getFieldStyle(isFieldsLocked)}
                      disabled={isFieldsLocked}
                    >
                      <option value="">PILIH DEPARTEMEN</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </InputWrapper>
                  <InputWrapper label="Position" icon={IconBriefcase}>
                    <select 
                      name="job_position" 
                      value={formData.job_position || ''} 
                      onChange={handleChange} 
                      className={getFieldStyle(isFieldsLocked || !formData.department_id)} 
                      disabled={isFieldsLocked || !formData.department_id}
                    >
                      <option value="">PILIH POSISI</option>
                      {positions.map(pos => (
                        <option key={pos.id} value={pos.name}>{pos.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </InputWrapper>
                  <InputWrapper label="Employment Type" icon={IconCheck}>
                    <select name="employment_type" value={formData.employment_type} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked}>
                      <option>Permanent</option>
                      <option>Contract</option>
                      <option>Probation</option>
                      <option>Intern</option>
                    </select>
                  </InputWrapper>
                  <InputWrapper label="Working Location" icon={IconMapPin}>
                    <select name="working_location" value={formData.working_location} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked}>
                      {Array.from(new Set(['Head Office', formData.working_location, ...workingLocations].filter(Boolean))).map(locName => (
                        <option key={locName} value={locName}>{locName}</option>
                      ))}
                    </select>
                  </InputWrapper>
                  <InputWrapper label="Join Date" icon={IconCalendar}>
                    <ProfessionalDatePicker 
                      selected={formData.join_date} 
                      onChange={(date) => setFormData({...formData, join_date: date ? date.toISOString().split('T')[0] : ''})}
                      placeholder="DD/MM/YYYY"
                      disabled={isFieldsLocked}
                    />
                  </InputWrapper>
                  <InputWrapper label="Contract End" icon={IconCalendar}>
                    <ProfessionalDatePicker 
                      selected={formData.contract_end_date} 
                      onChange={(date) => setFormData({...formData, contract_end_date: date ? date.toISOString().split('T')[0] : ''})}
                      placeholder="DD/MM/YYYY"
                      disabled={isFieldsLocked || formData.employment_type === 'Permanent'}
                    />
                  </InputWrapper>
                  <InputWrapper label="Base Salary (Monthly)" icon={IconWallet}>
                    <input type="number" name="base_salary" value={formData.base_salary} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                  </InputWrapper>
                </div>
              </div>

              {/* SECTION 2: IDENTITY (Unlocked only after Org selected) */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-3 bg-[#E31E24] rounded-full"></span> Identity Profile
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <InputWrapper label="Full Name" icon={IconUser}>
                    <input required name="name" placeholder="Full Legal Name" value={formData.name} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                  </InputWrapper>
                  <InputWrapper label="NIK (ID Number)" icon={IconCreditCard}>
                    <input required name="nik" placeholder="16 Digit NIK" value={formData.nik} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                  </InputWrapper>
                  <InputWrapper label="Mobile App Password" icon={IconId}>
                    <input name="mobile_password" placeholder="Pass untuk absen (Opsional)" value={formData.mobile_password} onChange={handleChange} className={`${getFieldStyle(isFieldsLocked)} lowercase`} disabled={isFieldsLocked} />
                  </InputWrapper>
                  <InputWrapper label="Place of Birth" icon={IconMapPin}>
                    <input name="place_of_birth" placeholder="e.g. Jakarta" value={formData.place_of_birth} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                  </InputWrapper>
                  <InputWrapper label="Date of Birth" icon={IconCalendar}>
                    <ProfessionalDatePicker 
                      selected={formData.date_of_birth} 
                      onChange={(date) => setFormData({...formData, date_of_birth: date ? date.toISOString().split('T')[0] : ''})}
                      placeholder="DD/MM/YYYY"
                      disabled={isFieldsLocked}
                    />
                  </InputWrapper>
                  <InputWrapper label="Gender" icon={IconGenderBigender}>
                    <select name="gender" value={formData.gender} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked}>
                      <option>Laki-laki</option>
                      <option>Perempuan</option>
                    </select>
                  </InputWrapper>
                  <InputWrapper label="Religion" icon={IconSparkles}>
                    <select name="religion" value={formData.religion} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked}>
                      <option>Islam</option>
                      <option>Kristen Protestan</option>
                      <option>Katolik</option>
                      <option>Hindu</option>
                      <option>Buddha</option>
                      <option>Khonghucu</option>
                    </select>
                  </InputWrapper>
                  <InputWrapper label="Marital Status" icon={IconHeart}>
                    <select name="marital_status" value={formData.marital_status} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked}>
                      <option>Belum Kawin</option>
                      <option>Kawin</option>
                      <option>Cerai Hidup</option>
                      <option>Cerai Mati</option>
                    </select>
                  </InputWrapper>
                </div>
              </div>

              {/* SECTION 3: CONTACT & LOCALIZATION */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-3 bg-blue-650 rounded-full bg-blue-600"></span> Contact & Localization
                </h3>
                
                {/* Addresses First */}
                <div className="grid grid-cols-1 gap-4">
                  <InputWrapper label="Alamat KTP (Sesuai Kartu Identitas)" icon={IconMapPin}>
                    <input name="ktp_address" placeholder="Masukkan alamat lengkap sesuai KTP..." value={formData.ktp_address} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                  </InputWrapper>
                  
                  <div className="space-y-1 relative">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest">Alamat Domisili (Tempat Tinggal Sekarang)</label>
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, domicile_address: prev.ktp_address}))}
                        className={`text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded border transition-all flex items-center gap-1 ${
                          isFieldsLocked 
                            ? 'border-slate-200 text-slate-400 bg-slate-55/40 cursor-not-allowed' 
                            : 'text-[#E31E24] hover:bg-red-50 border-[#E31E24]/20'
                        }`}
                        disabled={isFieldsLocked}
                      >
                        <IconCheck size={10} /> Sama dengan KTP
                      </button>
                    </div>
                    <div className="relative">
                      <IconMapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input name="domicile_address" placeholder="Masukkan alamat lengkap tempat tinggal saat ini..." value={formData.domicile_address} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                    </div>
                  </div>
                </div>

                {/* Email & Phone Below */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <InputWrapper label="Email Address (Personal/Corp)" icon={IconMail}>
                    <input required type="email" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} className={`${getFieldStyle(isFieldsLocked)} lowercase placeholder:normal-case`} disabled={isFieldsLocked} />
                  </InputWrapper>
                  <InputWrapper label="Nomor Telepon Karyawan" icon={IconPhone}>
                    <input name="phone" placeholder="+62..." value={formData.phone} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                  </InputWrapper>
                </div>
              </div>

              {/* SECTION 4: EMERGENCY CONTACTS */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-3 bg-rose-600 rounded-full"></span> Emergency Contacts
                </h3>
                <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {/* Contact 1 */}
                  <div className="space-y-3">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider italic">Primary Contact</p>
                    <div className="grid grid-cols-1 gap-2">
                      <InputWrapper label="Full Name" icon={IconUser}>
                        <input name="emergency_contact_1_name" value={formData.emergency_contact_1_name} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                      </InputWrapper>
                      <div className="grid grid-cols-2 gap-2">
                        <InputWrapper label="Relationship" icon={IconHeart}>
                          <input name="emergency_contact_1_rel" value={formData.emergency_contact_1_rel} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                        </InputWrapper>
                        <InputWrapper label="Phone" icon={IconPhone}>
                          <input name="emergency_contact_1_phone" value={formData.emergency_contact_1_phone} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                        </InputWrapper>
                      </div>
                    </div>
                  </div>
                  {/* Contact 2 */}
                  <div className="space-y-3">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider italic">Secondary Contact</p>
                    <div className="grid grid-cols-1 gap-2">
                      <InputWrapper label="Full Name" icon={IconUser}>
                        <input name="emergency_contact_2_name" value={formData.emergency_contact_2_name} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                      </InputWrapper>
                      <div className="grid grid-cols-2 gap-2">
                        <InputWrapper label="Relationship" icon={IconHeart}>
                          <input name="emergency_contact_2_rel" value={formData.emergency_contact_2_rel} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                        </InputWrapper>
                        <InputWrapper label="Phone" icon={IconPhone}>
                          <input name="emergency_contact_2_phone" value={formData.emergency_contact_2_phone} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                        </InputWrapper>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: BANKING & TAX INTELLIGENCE */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-3 bg-amber-600 rounded-full"></span> Banking & Tax Intelligence
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <InputWrapper label="Bank Name" icon={IconBuildingSkyscraper}>
                    <input name="bank_name" placeholder="e.g. BCA" value={formData.bank_name} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                  </InputWrapper>
                  <InputWrapper label="Account Number" icon={IconCreditCard}>
                    <input name="bank_account" placeholder="0000000000" value={formData.bank_account} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                  </InputWrapper>
                  <InputWrapper label="Account Holder" icon={IconUser}>
                    <input name="bank_account_holder" placeholder="Name in Bank Book" value={formData.bank_account_holder} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                  </InputWrapper>
                  
                  <InputWrapper label="NPWP (Tax ID)" icon={IconId}>
                    <input name="npwp" placeholder="Tax ID" value={formData.npwp} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked} />
                  </InputWrapper>
                  <InputWrapper label="PTKP Status" icon={IconAward}>
                    <select name="ptkp_status" value={formData.ptkp_status} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked}>
                      <option>TK/0</option>
                      <option>TK/1</option>
                      <option>K/0</option>
                      <option>K/1</option>
                      <option>K/2</option>
                      <option>K/3</option>
                    </select>
                  </InputWrapper>
                  <InputWrapper label="Tax Method" icon={IconWallet}>
                    <select name="tax_method" value={formData.tax_method} onChange={handleChange} className={getFieldStyle(isFieldsLocked)} disabled={isFieldsLocked}>
                      <option>Gross</option>
                      <option>Gross Up</option>
                      <option>Nett</option>
                    </select>
                  </InputWrapper>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-[#E31E24] text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-sm hover:bg-[#C1181E] active:scale-98 transition-all flex gap-3"
                >
                  {loading ? (
                    <IconLoader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      {editData ? 'Update Existing Record' : 'Finalize Master Record'} 
                      <IconCheck size={16} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
