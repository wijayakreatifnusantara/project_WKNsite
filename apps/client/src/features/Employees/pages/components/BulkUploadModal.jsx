import React, { useState } from 'react';
import { 
  IconX, 
  IconFileUpload, 
  IconFileSpreadsheet, 
  IconCheck, 
  IconLoader2, 
  IconAlertTriangle,
  IconDownload
} from "@tabler/icons-react";
import { apiClient } from '@/lib/apiClient';
import * as XLSX from 'xlsx';

const BulkUploadModal = ({ isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);

          if (data.length === 0) {
            throw new Error("File template kosong atau format tidak sesuai.");
          }

          setProgress({ current: 0, total: data.length });

          // Mapping columns from Excel to database
          const mappedData = data.map(row => {
            const generatedId = row['Employee ID'] || row['ID'] || `WKN-TMP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
            return {
              id: generatedId,
              employee_id: generatedId,
              name: row['Full Name'] || row['Name'],
              email: row['Email'],
              phone_number: row['Phone Number'] || row['Phone'],
              whatsapp_number: row['WhatsApp'],
              gender: row['Gender'] || 'Laki-laki',
              date_of_birth: row['Date of Birth'],
              marital_status: row['Marital Status'] || 'Belum Kawin',
              nik: row['NIK'] || row['National ID'],
              address: row['Address'],
              division_name: row['Organization'] || row['Unit'] || 'WIJAYA KREATIF NUSANTARA',
              job_position: row['Position'],
              job_level: row['Level'] || 'Staff',
              status: row['Status'] || 'Active',
              base_salary: parseFloat(row['Base Salary'] || 0),
              join_date: row['Join Date'] || new Date().toISOString().split('T')[0],
              contract_end_date: row['Contract End Date'],
              bank_name: row['Bank Name'],
              bank_account: row['Bank Account'],
              bank_account_holder: row['Bank Account Holder'],
              bank_branch: row['Bank Branch'],
              payroll_method: row['Payroll Method'] || 'Bank Transfer',
              npwp: row['NPWP'],
              npwp_16_digit: row['NPWP 16 Digit'],
              ptkp_status: row['PTKP Status'] || 'TK/0',
              tax_method: row['Tax Method'] || 'Gross',
              kpp_name: row['KPP Name'],
              faskes_tk1: row['Faskes TK1'],
              employment_type: row['Employment Type'] || 'Permanent',
              working_location: row['Working Location'] || 'Head Office',
              overtime_eligible: row['Overtime Eligible'] === 'Yes' || row['Overtime Eligible'] === true
            };
          });

          const chunkSize = 50;
          for (let i = 0; i < mappedData.length; i += chunkSize) {
            const chunk = mappedData.slice(i, i + chunkSize);
            const { data } = await apiClient.post('/employees/bulk-insert', chunk);
            setProgress(prev => ({ ...prev, current: Math.min(i + chunkSize, data.length) }));
          }

          setSuccess(true);
          setTimeout(() => {
            onRefresh();
            onClose();
            setSuccess(false);
          }, 2000);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Employee ID': 'WKN-0001',
        'Full Name': 'John Doe',
        'Email': 'john@example.com',
        'NIK': '1234567890123456',
        'Gender': 'Laki-laki',
        'Date of Birth': '1990-01-01',
        'Marital Status': 'Belum Kawin',
        'Phone Number': '08123456789',
        'WhatsApp': '08123456789',
        'Address': 'Jakarta',
        'Organization': 'WIJAYA KREATIF NUSANTARA',
        'Position': 'Software Engineer',
        'Level': 'Staff',
        'Status': 'Permanent',
        'Base Salary': 5000000,
        'Join Date': '2024-01-01',
        'Contract End Date': '',
        'Bank Name': 'BCA',
        'Bank Account': '12345678',
        'Bank Account Holder': 'John Doe',
        'Bank Branch': 'Thamrin',
        'Payroll Method': 'Bank Transfer',
        'NPWP': '12.345.678.9-012.000',
        'PTKP Status': 'TK/0',
        'Tax Method': 'Gross',
        'Employment Type': 'Permanent',
        'Working Location': 'Head Office',
        'Overtime Eligible': 'Yes'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "WKN_Employee_Bulk_Template.xlsx");
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm  animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[460px] bg-transparent border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="h-16 bg-transparent border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-[#E31E24]/10 rounded-lg flex items-center justify-center text-[#E31E24]">
              <IconFileUpload size={18} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-tight leading-none">Impor Massal Karyawan</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sinkronisasi Data Massal</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center bg-transparent border border-slate-200 rounded-lg text-slate-400 hover:text-[#E31E24] hover:shadow-sm transition-all shadow-sm"
          >
            <IconX size={16} />
          </button>
        </header>

        <div className="p-8 flex flex-col items-center text-center">
          {success ? (
            <div className="py-8 flex flex-col items-center gap-5 animate-in zoom-in-95 duration-300">
              <div className="h-16 w-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <IconCheck size={32} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">Impor Berhasil</p>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">{progress.total} Data Karyawan Diproses</p>
              </div>
            </div>
          ) : loading ? (
            <div className="py-8 w-full flex flex-col items-center gap-6">
              <div className="relative">
                <IconLoader2 size={48} className="text-[#E31E24] animate-spin" strokeWidth={1.5} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-500">{Math.round((progress.current / progress.total) * 100)}%</span>
                </div>
              </div>
              <div className="w-full space-y-2">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div 
                    className="h-full bg-[#E31E24] transition-all duration-300" 
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Mengimpor: <span className="text-[#E31E24] font-mono">{progress.current}</span> / {progress.total} Data
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-6">
              <div className="w-full">
                <div 
                  onClick={() => document.getElementById('bulk-upload-input').click()}
                  className="w-full aspect-video bg-slate-55/40 hover:bg-red-50/10 border-2 border-dashed border-slate-200 hover:border-[#E31E24]/30 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group"
                >
                  <IconFileSpreadsheet size={40} className="text-slate-300 group-hover:text-[#E31E24] transition-colors" strokeWidth={1.2} />
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Drop Excel File or Click</p>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Supports .xlsx, .xls, .csv</p>
                  </div>
                  <input 
                    id="bulk-upload-input" 
                    type="file" 
                    className="hidden" 
                    accept=".xlsx, .xls, .csv" 
                    onChange={handleFileUpload}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl mt-4 animate-in slide-in-from-top-2">
                    <IconAlertTriangle size={16} className="text-[#E31E24] shrink-0" />
                    <p className="text-xs font-bold text-rose-600 text-left leading-relaxed">{error}</p>
                  </div>
                )}
              </div>

              <div className="w-full pt-6 border-t border-slate-200 flex flex-col gap-4">
                <button 
                  onClick={downloadTemplate}
                  className="w-full h-10 flex items-center justify-center gap-2 bg-transparent border border-slate-200 rounded-lg text-slate-650 hover:text-[#E31E24] hover:shadow-sm transition-all shadow-sm group"
                >
                  <IconDownload size={14} className="group-hover:bounce text-slate-400 group-hover:text-[#E31E24]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Download Data Template</span>
                </button>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-normal">
                  Gunakan template resmi untuk keselarasan data.<br/>Penghasilan ID otomatis jika dikosongkan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
