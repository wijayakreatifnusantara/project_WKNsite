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
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabaseClient';
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
            throw new Error("File is empty or invalid format.");
          }

          setProgress({ current: 0, total: data.length });

          // Mapping logic - mapping column names from Excel to Supabase columns
          const mappedData = data.map(row => {
            const generatedId = row['Employee ID'] || row['ID'] || `WKN-TMP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
            return {
              id: generatedId, // Map to primary key 'id'
              employee_id: generatedId, // Map to business key 'employee_id'
              name: row['Full Name'] || row['Name'],
            email: row['Email'],
            phone_number: row['Phone Number'] || row['Phone'],
            whatsapp_number: row['WhatsApp'],
            gender: row['Gender'] || 'Laki-laki',
            date_of_birth: row['Date of Birth'],
            marital_status: row['Marital Status'] || 'Belum Kawin',
            nik: row['NIK'] || row['National ID'],
            address: row['Address'],
            organization_name: row['Organization'] || row['Unit'] || 'WIJAYA KREATIF NUSANTARA',
            job_position: row['Position'],
            job_level: row['Level'] || 'Staff',
            status: row['Status'] || 'Active',
            base_salary: parseFloat(row['Base Salary'] || 0),
            join_date: row['Join Date'] || new Date().toISOString().split('T')[0],
            contract_end_date: row['Contract End Date'],
            // Financial/Bank
            bank_name: row['Bank Name'],
            bank_account: row['Bank Account'],
            bank_account_holder: row['Bank Account Holder'],
            bank_branch: row['Bank Branch'],
            payroll_method: row['Payroll Method'] || 'Bank Transfer',
            // Tax
            npwp: row['NPWP'],
            npwp_16_digit: row['NPWP 16 Digit'],
            ptkp_status: row['PTKP Status'] || 'TK/0',
            tax_method: row['Tax Method'] || 'Gross',
            kpp_name: row['KPP Name'],
            faskes_tk1: row['Faskes TK1'],
            // Employment
            employment_type: row['Employment Type'] || 'Permanent',
            working_location: row['Working Location'] || 'Head Office',
            overtime_eligible: row['Overtime Eligible'] === 'Yes' || row['Overtime Eligible'] === true
            };
          });

          // Insert in chunks of 50 to prevent timeout
          const chunkSize = 50;
          for (let i = 0; i < mappedData.length; i += chunkSize) {
            const chunk = mappedData.slice(i, i + chunkSize);
            const { error: insertError } = await supabase
              .from('employees')
              .insert(chunk);

            if (insertError) throw insertError;
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-[500px] bg-[#f0f2f5] shadow-[20px_20px_60px_#00000040] rounded-[2.5rem] overflow-hidden flex flex-col border border-white animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="h-16 bg-[#f0f2f5] border-b border-white flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-500 shadow-lg rounded-xl flex items-center justify-center text-white">
              <IconFileUpload size={22} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">Neural Data Ingestion</h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 opacity-70">Bulk workforce synchronization</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center bg-white shadow-sm rounded-xl text-slate-400 hover:text-[#E31E24] transition-all"
          >
            <IconX size={18} />
          </button>
        </header>

        <div className="p-10 flex flex-col items-center text-center space-y-8">
          {success ? (
            <div className="py-10 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
              <div className="h-20 w-20 bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)] rounded-full flex items-center justify-center text-white">
                <IconCheck size={40} strokeWidth={3} />
              </div>
              <div>
                <p className="text-lg font-black text-slate-800 uppercase tracking-tighter">Ingestion Successful</p>
                <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mt-1">{progress.total} Records Processed</p>
              </div>
            </div>
          ) : loading ? (
            <div className="py-10 w-full flex flex-col items-center gap-8">
              <div className="relative">
                <IconLoader2 size={64} className="text-blue-500 animate-spin" strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-black text-slate-400">{Math.round((progress.current / progress.total) * 100)}%</span>
                </div>
              </div>
              <div className="w-full space-y-3">
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Ingesting: <span className="text-blue-500">{progress.current}</span> / {progress.total}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-full space-y-4">
                <div 
                  onClick={() => document.getElementById('bulk-upload-input').click()}
                  className="w-full aspect-video bg-[#f0f2f5] shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] rounded-[2rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-400 hover:bg-white/50 transition-all group"
                >
                  <IconFileSpreadsheet size={48} className="text-slate-300 group-hover:text-blue-500 transition-colors" strokeWidth={1} />
                  <div>
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Drop Excel File or Click</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Supports .xlsx, .xls, .csv</p>
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
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in slide-in-from-top-2">
                    <IconAlertTriangle size={18} className="text-red-500 shrink-0" />
                    <p className="text-[9px] font-bold text-red-600 text-left leading-relaxed">{error}</p>
                  </div>
                )}
              </div>

              <div className="w-full pt-4 border-t border-white flex flex-col gap-3">
                <button 
                  onClick={downloadTemplate}
                  className="w-full h-12 flex items-center justify-center gap-3 bg-white shadow-sm border border-white rounded-xl text-slate-600 hover:text-blue-500 transition-all group"
                >
                  <IconDownload size={18} className="group-hover:bounce" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Download Data Template</span>
                </button>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  Use the official template to ensure neural compatibility.<br/>ID generation is automatic if empty.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
