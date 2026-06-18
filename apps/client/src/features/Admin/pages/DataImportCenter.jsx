import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  IconUpload, 
  IconFileSpreadsheet, 
  IconCheck, 
  IconAlertCircle,
  IconLoader2,
  IconDatabaseImport,
  IconFileCheck,
  IconX
} from "@tabler/icons-react";

const DataImportCenter = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // 'success', 'error', null
  const [selectedModule, setSelectedModule] = useState('employees');

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setImportStatus(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setImportStatus(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setIsUploading(true);
    setImportStatus(null);
    
    try {
      // Mocking the file parsing and importing process
      await new Promise(r => setTimeout(r, 2500));
      setImportStatus('success');
    } catch (err) {
      setImportStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto no-scrollbar bg-[#f8fafc] animate-fade-in">
      <div className="max-w-[1000px] mx-auto space-y-6 pb-20">
        
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-transparent shadow-sm rounded-xl flex items-center justify-center text-ios-primary border border-slate-200">
            <IconDatabaseImport size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight uppercase leading-none">Data Hub</h1>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Bulk Import & Export Center</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SIDEBAR SELECTOR */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Target Module</h3>
            <div className="space-y-2">
              {[
                { id: 'employees', label: 'Employees / Staff', icon: <IconFileSpreadsheet size={16} /> },
                { id: 'attendance', label: 'Attendance Records', icon: <IconFileSpreadsheet size={16} /> },
                { id: 'leaves', label: 'Leave Balances', icon: <IconFileSpreadsheet size={16} /> },
              ].map(mod => (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModule(mod.id)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                    selectedModule === mod.id 
                    ? 'bg-transparent border border-ios-primary shadow-sm text-ios-primary' 
                    : 'bg-transparent border border-slate-200 shadow-sm text-slate-500 hover:scale-[1.02]'
                  }`}
                >
                  {mod.icon}
                  <span className="text-xs font-bold uppercase tracking-widest">{mod.label}</span>
                </button>
              ))}
            </div>
            
            <Card className="border border-slate-200 bg-slate-50/50 rounded-xl shadow-sm mt-6">
              <CardContent className="p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Format Guidelines</h4>
                <p className="text-xs text-slate-500 font-medium">Please ensure your CSV or Excel file headers exactly match the system's database schema. You can download the template below.</p>
                <Button variant="outline" className="w-full h-8 mt-2 text-xs font-bold uppercase tracking-widest border-ios-primary text-ios-primary hover:bg-red-50 hover:text-[#C1181E]">
                  Download Template
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* MAIN UPLOAD AREA */}
          <div className="md:col-span-2">
            <Card className="border border-slate-200 bg-transparent shadow-sm rounded-2xl overflow-hidden h-full flex flex-col">
              <CardHeader className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
                <CardTitle className="text-[11px] font-semibold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <IconUpload size={16} className="text-ios-primary" />
                  Upload Data File
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">
                
                {!file ? (
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="w-full h-full border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-center transition-all hover:bg-slate-50/50 hover:border-ios-primary"
                  >
                    <div className="h-16 w-16 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-300 mb-4">
                      <IconUpload size={28} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-1">Drag & Drop</h3>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">or click to browse your files</p>
                    <input 
                      type="file" 
                      id="file-upload" 
                      className="hidden" 
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer h-10 px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-sm flex items-center justify-center transition-all">
                      Browse Files
                    </label>
                    <p className="text-[11px] font-semibold text-slate-400 mt-4 uppercase tracking-widest">Supported Formats: CSV, XLSX, XLS</p>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center justify-center space-y-6">
                    <div className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white shadow-sm rounded-lg flex items-center justify-center text-emerald-500">
                          <IconFileCheck size={24} />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-semibold text-slate-800 tracking-tight">{file.name}</h4>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{(file.size / 1024).toFixed(2)} KB • Ready for Import</p>
                        </div>
                      </div>
                      {!isUploading && importStatus !== 'success' && (
                        <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 p-2">
                          <IconX size={18} />
                        </button>
                      )}
                    </div>

                    {importStatus === 'success' ? (
                      <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 flex flex-col items-center text-center space-y-2 w-full animate-in zoom-in duration-300">
                        <IconCheck size={32} className="text-green-500" />
                        <h3 className="text-sm font-bold uppercase tracking-widest">Import Successful</h3>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80">All records have been inserted into {selectedModule}.</p>
                        <Button onClick={() => { setFile(null); setImportStatus(null); }} className="mt-2 h-8 px-4 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-widest rounded shadow-sm">
                          Import Another File
                        </Button>
                      </div>
                    ) : importStatus === 'error' ? (
                      <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 flex flex-col items-center text-center space-y-2 w-full animate-in zoom-in duration-300">
                        <IconAlertCircle size={32} className="text-red-500" />
                        <h3 className="text-sm font-bold uppercase tracking-widest">Import Failed</h3>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80">There was an error parsing the file or matching schema.</p>
                        <Button onClick={() => setImportStatus(null)} className="mt-2 h-8 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded shadow-sm">
                          Try Again
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={handleImport} 
                        disabled={isUploading}
                        className="w-full h-12 bg-ios-primary hover:bg-ios-primary/90 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl shadow-sm transition-all active:scale-95"
                      >
                        {isUploading ? <IconLoader2 className="animate-spin mr-2" size={18} /> : <IconDatabaseImport className="mr-2" size={18} />}
                        {isUploading ? 'Processing Import...' : `Begin Import to ${selectedModule.toUpperCase()}`}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataImportCenter;
