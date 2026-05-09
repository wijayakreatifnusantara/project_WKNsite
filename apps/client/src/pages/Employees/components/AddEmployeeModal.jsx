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
  IconGenderMale,
  IconHeart,
  IconCreditCard,
  IconEdit,
  IconCamera,
  IconPhoto,
  IconCircleCheck
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabaseClient';
import Tesseract from 'tesseract.js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IconScan, IconSparkles } from "@tabler/icons-react";

const InputWrapper = ({ label, icon: Icon, children }) => (
  <div className="space-y-1">
    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
    <div className="relative">
      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
      {children}
    </div>
  </div>
);

const inputStyle = "w-full h-9 pl-9 pr-3 bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] border-none rounded-lg text-[10px] font-black text-slate-700 focus:ring-1 focus:ring-[#E31E24]/20 transition-all appearance-none uppercase placeholder:normal-case";
const dateInputStyle = "w-full h-9 pl-9 pr-8 bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] border-none rounded-lg text-[10px] font-black text-slate-700 focus:ring-1 focus:ring-[#E31E24]/20 transition-all cursor-pointer flex items-center";

const ProfessionalDatePicker = ({ selected, onChange, placeholder, icon: Icon }) => (
  <div className="relative w-full">
    {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 z-10 pointer-events-none" />}
    <DatePicker
      selected={selected ? new Date(selected) : null}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholder}
      showYearDropdown
      scrollableYearDropdown
      yearDropdownItemNumber={100}
      className={`${dateInputStyle} !pl-9`}
      popperClassName="premium-calendar-popper"
      calendarClassName="premium-calendar"
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
  organization_name: 'WIJAYA KREATIF NUSANTARA',
  job_position: '',
  job_level: 'Staff',
  status: 'PERMANENT',
  base_salary: 0,
  join_date: new Date().toISOString().split('T')[0],
  contract_end_date: '',
  probation_end_date: '',
  emergency_contact_1_name: '',
  emergency_contact_1_rel: '',
  emergency_contact_1_phone: '',
  bank_name: '',
  bank_account: '',
  bank_account_holder: '',
  npwp: '',
  ptkp_status: 'TK/0',
  tax_method: 'Gross'
};

const AddEmployeeModal = ({ isOpen, onClose, onRefresh, editData }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = React.useRef(null);

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
    } else if (isOpen && !editData) {
      setFormData(initialFormData);
    }
  }, [isOpen, editData]);

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

  React.useEffect(() => {
    if (isOpen && !formData.employee_id && !editData) {
      generateAutoID();
    }
  }, [isOpen, editData]);

  const generateAutoID = async () => {
    try {
      // Query all IDs that start with WKN- to find the highest number
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .like('id', 'WKN-%');

      if (error) throw error;

      let maxNum = 0;
      if (data && data.length > 0) {
        data.forEach(item => {
          const parts = item.id.split('-');
          if (parts.length > 1) {
            const num = parseInt(parts[1]);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        });
      }

      const nextNum = maxNum + 1;
      // We'll use 3-digit padding to match your existing WKN-001 format
      const nextID = `WKN-${nextNum.toString().padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, employee_id: nextID }));
    } catch (err) {
      console.error('Error generating ID:', err);
      setFormData(prev => ({ ...prev, employee_id: 'WKN-001' }));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Clean data & Map IDs
      const submissionData = { ...formData };
      
      // If adding new, map WKN ID to the primary 'id' column
      // If editing, 'id' is already in submissionData from useEffect
      if (!editData) {
        submissionData.id = formData.employee_id;
      }
      delete submissionData.employee_id;

      Object.keys(submissionData).forEach(key => {
        if (submissionData[key] === '') {
          submissionData[key] = null;
        }
      });

      let query;
      if (editData) {
        query = supabase.from('employees').update(submissionData).eq('id', editData.id);
      } else {
        query = supabase.from('employees').insert([submissionData]);
      }

      const { error } = await query;

      if (error) throw error;
      
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
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employees')
        .upload(filePath, croppedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('employees')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, photo: publicUrl }));
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

    setFormData({ 
      ...formData, 
      [name]: name === 'base_salary' ? parseFloat(value) || 0 : finalValue 
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-[850px] bg-[#f0f2f5] shadow-[20px_20px_60px_#00000030] rounded-[2rem] overflow-hidden flex flex-col border border-white animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="h-14 bg-[#f0f2f5] border-b border-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 ${editData ? 'bg-green-500' : 'bg-[#E31E24]'} shadow-md rounded-xl flex items-center justify-center text-white`}>
              {editData ? <IconEdit size={18} /> : <IconUserPlus size={18} />}
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-tight leading-none">
                {editData ? 'Update Talent Profile' : 'Master Personnel Onboarding'}
              </h2>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 opacity-70">
                {editData ? `Editing ID: ${editData.id}` : 'Cloud identity synchronization'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="h-9 px-4 bg-white shadow-sm border border-[#E31E24]/20 rounded-xl text-[8px] font-black text-[#E31E24] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2 group"
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
              className="h-8 w-8 flex items-center justify-center bg-white shadow-sm rounded-lg text-slate-400 hover:text-[#E31E24] transition-all"
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
              background: #d1d9e6;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #E31E24;
            }
          `}</style>
          {success ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 animate-in zoom-in-95 duration-500">
              <div className="h-16 w-16 bg-green-500 shadow-lg rounded-full flex items-center justify-center text-white">
                <IconCircleCheck size={32} strokeWidth={3} />
              </div>
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Master Record Synchronized</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* PHOTO UPLOAD SECTION */}
              <div className="flex justify-center pt-2 pb-6">
                <div className="relative group">
                  <div className="h-28 w-28 rounded-[2rem] bg-white shadow-lg border-[4px] border-white overflow-hidden flex items-center justify-center text-slate-300">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <IconUser size={40} />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#E31E24] text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-[#C1181E] hover:scale-110 active:scale-95 transition-all">
                    <IconCamera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                  {formData.photo && (
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, photo: ''}))}
                      className="absolute -top-2 -right-2 h-7 w-7 bg-white text-slate-400 rounded-lg flex items-center justify-center shadow hover:text-[#E31E24] transition-all"
                    >
                      <IconX size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* SECTION 1: IDENTITY */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-black text-[#E31E24] uppercase tracking-widest flex items-center gap-2">
                  <span className="h-1 w-4 bg-[#E31E24] rounded-full"></span> Identity Profile
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <InputWrapper label="Employee ID (System Locked)" icon={IconId}>
                    <input 
                      readOnly
                      name="employee_id" 
                      placeholder="Generating..." 
                      value={formData.employee_id} 
                      className={`${inputStyle} text-slate-400 bg-slate-50 cursor-not-allowed border-l-2 border-l-slate-300 shadow-none font-black tracking-widest`} 
                    />
                  </InputWrapper>
                  <InputWrapper label="Full Name" icon={IconUser}>
                    <input required name="name" placeholder="Full Legal Name" value={formData.name} onChange={handleChange} className={inputStyle} />
                  </InputWrapper>
                  <InputWrapper label="NIK (ID Number)" icon={IconCreditCard}>
                    <input required name="nik" placeholder="16 Digit NIK" value={formData.nik} onChange={handleChange} className={inputStyle} />
                  </InputWrapper>
                  <InputWrapper label="Place of Birth" icon={IconMapPin}>
                    <input name="place_of_birth" placeholder="e.g. Jakarta" value={formData.place_of_birth} onChange={handleChange} className={inputStyle} />
                  </InputWrapper>
                  <InputWrapper label="Date of Birth" icon={IconCalendar}>
                    <ProfessionalDatePicker 
                      selected={formData.date_of_birth} 
                      onChange={(date) => setFormData({...formData, date_of_birth: date ? date.toISOString().split('T')[0] : ''})}
                      placeholder="DD/MM/YYYY"
                    />
                  </InputWrapper>
                  <InputWrapper label="Gender" icon={IconGenderMale}>
                    <select name="gender" value={formData.gender} onChange={handleChange} className={inputStyle}>
                      <option>Laki-laki</option>
                      <option>Perempuan</option>
                    </select>
                  </InputWrapper>
                  <InputWrapper label="Religion" icon={IconSparkles}>
                    <select name="religion" value={formData.religion} onChange={handleChange} className={inputStyle}>
                      <option>Islam</option>
                      <option>Kristen Protestan</option>
                      <option>Katolik</option>
                      <option>Hindu</option>
                      <option>Buddha</option>
                      <option>Khonghucu</option>
                    </select>
                  </InputWrapper>
                  <InputWrapper label="Marital Status" icon={IconHeart}>
                    <select name="marital_status" value={formData.marital_status} onChange={handleChange} className={inputStyle}>
                      <option>Belum Kawin</option>
                      <option>Kawin</option>
                      <option>Cerai Hidup</option>
                      <option>Cerai Mati</option>
                    </select>
                  </InputWrapper>
                </div>
              </div>

              {/* SECTION 2: CONTACT & LOCALIZATION */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="h-1 w-4 bg-blue-500 rounded-full"></span> Contact & Localization
                </h3>
                
                {/* Addresses First */}
                <div className="grid grid-cols-1 gap-4">
                  <InputWrapper label="Alamat KTP (Sesuai Kartu Identitas)" icon={IconMapPin}>
                    <input name="ktp_address" placeholder="Masukkan alamat lengkap sesuai KTP..." value={formData.ktp_address} onChange={handleChange} className={inputStyle} />
                  </InputWrapper>
                  
                  <div className="space-y-1 relative">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Alamat Domisili (Tempat Tinggal Sekarang)</label>
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, domicile_address: prev.ktp_address}))}
                        className="text-[7px] font-black text-[#E31E24] uppercase tracking-widest hover:bg-red-50 px-2 py-0.5 rounded border border-red-100 transition-all flex items-center gap-1"
                      >
                        <IconCheck size={10} /> Sama dengan KTP
                      </button>
                    </div>
                    <div className="relative">
                      <IconMapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      <input name="domicile_address" placeholder="Masukkan alamat lengkap tempat tinggal saat ini..." value={formData.domicile_address} onChange={handleChange} className={inputStyle} />
                    </div>
                  </div>
                </div>

                {/* Email & Phone Below */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <InputWrapper label="Email Address (Personal/Corp)" icon={IconMail}>
                    <input required type="email" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} className={`${inputStyle} lowercase placeholder:normal-case`} />
                  </InputWrapper>
                  <InputWrapper label="Nomor Telepon Karyawan" icon={IconPhone}>
                    <input name="phone" placeholder="+62..." value={formData.phone} onChange={handleChange} className={inputStyle} />
                  </InputWrapper>
                </div>
              </div>

              {/* SECTION 2.5: EMERGENCY CONTACTS */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="h-1 w-4 bg-rose-500 rounded-full"></span> Emergency Contacts
                </h3>
                <div className="grid grid-cols-2 gap-6 bg-white/30 p-4 rounded-2xl border border-white">
                  {/* Contact 1 */}
                  <div className="space-y-3">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Primary Contact</p>
                    <div className="grid grid-cols-1 gap-2">
                      <InputWrapper label="Full Name" icon={IconUser}>
                        <input name="emergency_contact_1_name" value={formData.emergency_contact_1_name} onChange={handleChange} className={inputStyle} />
                      </InputWrapper>
                      <div className="grid grid-cols-2 gap-2">
                        <InputWrapper label="Relationship" icon={IconHeart}>
                          <input name="emergency_contact_1_rel" value={formData.emergency_contact_1_rel} onChange={handleChange} className={inputStyle} />
                        </InputWrapper>
                        <InputWrapper label="Phone" icon={IconPhone}>
                          <input name="emergency_contact_1_phone" value={formData.emergency_contact_1_phone} onChange={handleChange} className={inputStyle} />
                        </InputWrapper>
                      </div>
                    </div>
                  </div>
                  {/* Contact 2 */}
                  <div className="space-y-3">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Secondary Contact</p>
                    <div className="grid grid-cols-1 gap-2">
                      <InputWrapper label="Full Name" icon={IconUser}>
                        <input name="emergency_contact_2_name" value={formData.emergency_contact_2_name} onChange={handleChange} className={inputStyle} />
                      </InputWrapper>
                      <div className="grid grid-cols-2 gap-2">
                        <InputWrapper label="Relationship" icon={IconHeart}>
                          <input name="emergency_contact_2_rel" value={formData.emergency_contact_2_rel} onChange={handleChange} className={inputStyle} />
                        </InputWrapper>
                        <InputWrapper label="Phone" icon={IconPhone}>
                          <input name="emergency_contact_2_phone" value={formData.emergency_contact_2_phone} onChange={handleChange} className={inputStyle} />
                        </InputWrapper>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: EMPLOYMENT & FINANCE */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                  <span className="h-1 w-4 bg-green-600 rounded-full"></span> Career & Treasury
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <InputWrapper label="Org Name" icon={IconBuildingSkyscraper}>
                    <select name="organization_name" value={formData.organization_name} onChange={handleChange} className={inputStyle}>
                      <option>WIJAYA KREATIF NUSANTARA</option>
                      <option>WIJAYA KUSUMA</option>
                    </select>
                  </InputWrapper>
                  <InputWrapper label="Position" icon={IconBriefcase}>
                    <input name="job_position" placeholder="e.g. Engineer" value={formData.job_position} onChange={handleChange} className={inputStyle} />
                  </InputWrapper>
                  <InputWrapper label="Employment Type" icon={IconCheck}>
                    <select name="employment_type" value={formData.employment_type} onChange={handleChange} className={inputStyle}>
                      <option>Permanent</option>
                      <option>Contract</option>
                      <option>Probation</option>
                      <option>Intern</option>
                    </select>
                  </InputWrapper>
                  <InputWrapper label="Working Location" icon={IconMapPin}>
                    <input name="working_location" value={formData.working_location} onChange={handleChange} className={inputStyle} />
                  </InputWrapper>
                  <InputWrapper label="Join Date" icon={IconCalendar}>
                    <ProfessionalDatePicker 
                      selected={formData.join_date} 
                      onChange={(date) => setFormData({...formData, join_date: date ? date.toISOString().split('T')[0] : ''})}
                      placeholder="DD/MM/YYYY"
                    />
                  </InputWrapper>
                  <InputWrapper label="Contract End" icon={IconCalendar}>
                    <ProfessionalDatePicker 
                      selected={formData.contract_end_date} 
                      onChange={(date) => setFormData({...formData, contract_end_date: date ? date.toISOString().split('T')[0] : ''})}
                      placeholder="DD/MM/YYYY"
                    />
                  </InputWrapper>
                  <div className="col-span-2">
                    <InputWrapper label="Base Salary (Monthly)" icon={IconWallet}>
                      <input type="number" name="base_salary" value={formData.base_salary} onChange={handleChange} className={inputStyle} />
                    </InputWrapper>
                  </div>
                </div>
              </div>

              {/* SECTION 4: BANKING & TAX INTELLIGENCE */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="h-1 w-4 bg-amber-500 rounded-full"></span> Banking & Tax Intelligence
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <InputWrapper label="Bank Name" icon={IconBuildingSkyscraper}>
                    <input name="bank_name" placeholder="e.g. BCA" value={formData.bank_name} onChange={handleChange} className={inputStyle} />
                  </InputWrapper>
                  <InputWrapper label="Account Number" icon={IconCreditCard}>
                    <input name="bank_account" placeholder="0000000000" value={formData.bank_account} onChange={handleChange} className={inputStyle} />
                  </InputWrapper>
                  <InputWrapper label="Account Holder" icon={IconUser}>
                    <input name="bank_account_holder" placeholder="Name in Bank Book" value={formData.bank_account_holder} onChange={handleChange} className={inputStyle} />
                  </InputWrapper>
                  
                  <InputWrapper label="NPWP (Tax ID)" icon={IconId}>
                    <input name="npwp" placeholder="Tax ID" value={formData.npwp} onChange={handleChange} className={inputStyle} />
                  </InputWrapper>
                  <InputWrapper label="PTKP Status" icon={IconAward}>
                    <select name="ptkp_status" value={formData.ptkp_status} onChange={handleChange} className={inputStyle}>
                      <option>TK/0</option>
                      <option>TK/1</option>
                      <option>K/0</option>
                      <option>K/1</option>
                      <option>K/2</option>
                      <option>K/3</option>
                    </select>
                  </InputWrapper>
                  <InputWrapper label="Tax Method" icon={IconWallet}>
                    <select name="tax_method" value={formData.tax_method} onChange={handleChange} className={inputStyle}>
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
                  className="w-full h-11 rounded-xl bg-[#E31E24] text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-md hover:bg-[#C1181E] active:scale-95 transition-all flex gap-3"
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
