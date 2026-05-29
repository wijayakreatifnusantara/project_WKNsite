import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  IconCloudUpload, 
  IconFileSpreadsheet, 
  IconX, 
  IconCheck, 
  IconAlertTriangle,
  IconDownload,
  IconLoader2
} from "@tabler/icons-react";
import { apiClient } from '@/lib/apiClient';
import { Button } from "@/components/ui/button";

const BulkAttendanceUploadModal = ({ isOpen, onClose, onRefresh }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const excelDateToJSDate = (serial) => {
    const utc_days  = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    const year = date_info.getFullYear();
    const month = String(date_info.getMonth() + 1).padStart(2, '0');
    const day = String(date_info.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: false });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        
        // Basic validation and date correction
        if (json.length > 0) {
          const required = ['Employee ID', 'Date', 'Status'];
          const keys = Object.keys(json[0]);
          const missing = required.filter(k => !keys.includes(k));
          
          if (missing.length > 0) {
            setError(`Missing columns: ${missing.join(', ')}`);
            setPreviewData([]);
          } else {
            // Fix dates if they are Excel serial numbers
            const correctedData = json.map(row => {
              if (typeof row.Date === 'number') {
                return { ...row, Date: excelDateToJSDate(row.Date) };
              }
              return row;
            });
            setError(null);
            setPreviewData(correctedData);
          }
        }
      } catch (err) {
        setError("Failed to parse Excel file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        "Employee ID": "WKN-001",
        "Date": "2024-05-08",
        "Status": "Present",
        "Clock In": "08:00",
        "Clock Out": "17:00",
        "Notes": "Bulk Input"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Attendance_Template.xlsx");
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch employee mapping to get internal PKs
      const response = await apiClient.get('/api/employees');
      const employeeMap = response.data.data;

      const idMap = {};
      employeeMap.forEach(emp => {
        // Match against internal ID (PK)
        if (emp.id) {
          idMap[String(emp.id).trim().toUpperCase()] = emp.id;
        }
        // Also match against employee_id column if present
        if (emp.employee_id) {
          idMap[String(emp.employee_id).trim().toUpperCase()] = emp.id;
        }
      });

      // 2. Map Excel Employee IDs to Database PKs
      const formattedData = [];
      const missingIds = [];

      previewData.forEach(row => {
        const rawId = String(row['Employee ID'] || '').trim().toUpperCase();
        const internalId = idMap[rawId];
        
        if (internalId) {
          formattedData.push({
            employee_id: internalId,
            date: row['Date'],
            status: row['Status'],
            clock_in: row['Clock In'] || null,
            clock_out: row['Clock Out'] || null,
            notes: row['Notes'] || 'Bulk Uploaded',
            is_manual: true
          });
        } else {
          missingIds.push(row['Employee ID']);
        }
      });

      if (missingIds.length > 0) {
        throw new Error(`The following Employee IDs were not found in the system: ${[...new Set(missingIds)].join(', ')}`);
      }

      await apiClient.post('/api/attendance/bulk-insert', formattedData);

      setSuccess(true);
      setTimeout(() => {
        onRefresh();
        onClose();
        setSuccess(false);
        setFile(null);
        setPreviewData([]);
      }, 2000);

    } catch (err) {
      console.error("Bulk upload error:", err);
      setError(err.message || "Failed to save records to database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#f0f2f5] rounded-[2.5rem] shadow-[20px_20px_60px_#d1d9e6,-20px_-20px_60px_#ffffff] border-white border-[6px] overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/50 flex justify-between items-center bg-white/30">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#E31E24]">
              <IconCloudUpload size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">Bulk Attendance Ingestion</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">High-Volume Data Sync Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-xl hover:bg-white/50 flex items-center justify-center text-slate-400 transition-all">
            <IconX size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button 
              onClick={downloadTemplate}
              variant="outline"
              className="h-10 px-6 rounded-xl border-white border-2 shadow-sm text-[9px] font-black uppercase tracking-widest text-slate-600 flex gap-2"
            >
              <IconDownload size={14} />
              Get Template (.xlsx)
            </Button>
          </div>

          {/* Upload Zone */}
          {!file ? (
            <label className="block w-full cursor-pointer group">
              <div className="h-48 rounded-[2rem] border-4 border-dashed border-slate-200 bg-white/20 flex flex-col items-center justify-center gap-4 group-hover:border-[#E31E24]/30 group-hover:bg-white/40 transition-all">
                <IconFileSpreadsheet size={48} className="text-slate-200 group-hover:text-[#E31E24]/30 group-hover:scale-110 transition-all" />
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Excel or CSV File</p>
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">Maximum 1000 records per upload</p>
                </div>
                <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white">
                <div className="flex items-center gap-4">
                  <IconFileSpreadsheet className="text-[#E31E24]" />
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{file.name}</span>
                </div>
                <button onClick={() => {setFile(null); setPreviewData([]);}} className="text-rose-500 hover:scale-110 transition-all">
                  <IconX size={18} />
                </button>
              </div>

              {previewData.length > 0 && (
                <div className="rounded-2xl border-white border-4 shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] bg-[#f0f2f5] overflow-hidden">
                  <div className="bg-white/50 px-6 py-3 border-b border-white flex justify-between items-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Preview (First 5 records)</p>
                    <span className="text-[8px] font-black text-[#E31E24] bg-[#E31E24]/10 px-2 py-0.5 rounded-full uppercase">Review Logs</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {previewData.slice(0, 5).map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] font-bold text-slate-600 border-b border-white/50 pb-2 last:border-none">
                        <div className="flex flex-col gap-0.5">
                           <span className="font-black text-slate-800">{row['Employee ID']}</span>
                           <span className="text-[8px] text-slate-400">{row['Date']}</span>
                        </div>
                        <div className="flex gap-4 items-center">
                           <div className="flex flex-col items-end">
                              <span className="text-[8px] uppercase text-slate-400">Time</span>
                              <span className="font-mono text-[9px]">{row['Clock In'] || '--:--'} - {row['Clock Out'] || '--:--'}</span>
                           </div>
                           <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                             row['Status'] === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                           }`}>
                             {row['Status']}
                           </span>
                        </div>
                      </div>
                    ))}
                    {previewData.length > 5 && (
                      <div className="pt-2 text-center border-t border-white/50">
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">... and {previewData.length - 5} more records awaiting sync</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-shake">
              <IconAlertTriangle size={18} />
              <p className="text-[9px] font-black uppercase tracking-tight">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600">
              <IconCheck size={18} />
              <p className="text-[9px] font-black uppercase tracking-tight">Bulk synchronization successful! Updating logs...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-white/30 border-t border-white/50 flex justify-end gap-4">
          <Button 
            onClick={onClose}
            className="h-11 px-8 rounded-xl bg-white text-slate-400 font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-100"
          >
            Abort
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!file || previewData.length === 0 || loading || success}
            className="h-11 px-10 rounded-xl bg-slate-800 text-white font-black text-[9px] uppercase tracking-widest hover:bg-slate-900 shadow-lg disabled:opacity-50 flex gap-3 items-center"
          >
            {loading ? <IconLoader2 size={16} className="animate-spin" /> : <IconCheck size={16} />}
            Execute Sync ({previewData.length} Records)
          </Button>
        </div>

      </div>
    </div>
  );
};

export default BulkAttendanceUploadModal;
