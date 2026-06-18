import React, { useState } from 'react';
import { 
  IconFileExport, 
  IconUsers, 
  IconClock, 
  IconReceipt,
  IconDownload,
  IconTable,
  IconFilter
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from '@/lib/apiClient';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

const ReportBuilder = () => {
  const [selectedModule, setSelectedModule] = useState('');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const modules = [
    { id: 'employees', name: 'Database Karyawan', icon: <IconUsers size={20} />, type: 'master' },
    { id: 'attendance', name: 'Log Kehadiran (Attendance)', icon: <IconClock size={20} />, type: 'transaction' },
    { id: 'payroll', name: 'Histori Gaji (Payroll)', icon: <IconReceipt size={20} />, type: 'transaction' }
  ];

  const handleExport = async () => {
    if (!selectedModule) {
      toast.error("Silakan pilih modul data terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      let data = [];
      const isTransaction = modules.find(m => m.id === selectedModule)?.type === 'transaction';

      if (selectedModule === 'employees') {
        // Fetch all employees
        const response = await apiClient.get('/employees?size=10000'); // large size to get all
        data = response.data.data || [];
        // Map to Excel format
        data = data.map(e => ({
          'Employee ID': e['EMPLOYEE ID'] || e.id,
          'Full Name': e['EMPLOYEE NAME'] || e.name,
          'Email': e['EMAIL'] || e.email,
          'Division': e['Division Name *'] || e.division_name,
          'Department': e['Department Name *'] || e.departments?.name,
          'Position': e['Job Position *'] || e.job_position,
          'Level': e['Job Level *'] || e.job_level,
          'Status': e['Status *'] || e.status
        }));

      } else if (selectedModule === 'attendance') {
        const response = await apiClient.get(`/api/attendance/daily?date=${dateRange.start}`);
        const attendanceList = response.data.data || response.data || [];
        data = attendanceList.map(a => ({
          'Date': a.date,
          'Employee ID': a.employee_id,
          'Name': a.employee_name,
          'Clock In': a.clock_in,
          'Clock Out': a.clock_out,
          'Status': a.status,
          'Notes': a.notes
        }));
      } else if (selectedModule === 'payroll') {
        const response = await apiClient.get(`/api/payroll/salary?size=10000`);
        const payrollList = response.data.data || [];
        data = payrollList.map(p => ({
          'Employee ID': p.employee_id,
          'Employee Name': p.employees?.name || 'N/A',
          'Basic Salary': p.basic_salary,
          'Allowances': p.total_allowance,
          'Deductions': p.total_deduction,
          'Net Pay': p.net_salary
        }));
      }

      if (data.length === 0) {
        toast.error("Tidak ada data untuk diekspor pada filter ini.");
        setLoading(false);
        return;
      }

      // Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ReportData");
      
      const fileName = `Report_${selectedModule.toUpperCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success(`Berhasil mengunduh ${data.length} baris data!`);
    } catch (err) {
      console.error("Export Error:", err);
      toast.error("Gagal melakukan export data. Pastikan API tersedia.");
    } finally {
      setLoading(false);
    }
  };

  const selectedModObj = modules.find(m => m.id === selectedModule);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent custom-scrollbar animate-fade-in font-outfit">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase flex items-center gap-3">
            <IconFileExport size={32} className="text-ios-primary" />
            Data <span className="text-ios-primary">Report Builder</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-wider">Pusat Ekstraksi Data Master & Transaksi</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT COL: Configuration */}
          <div className="md:col-span-8 space-y-6">
            <Card className="p-6 border-slate-200 shadow-sm rounded-2xl">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
                <IconTable size={18} className="text-blue-500" />
                1. Pilih Sumber Data
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modules.map(mod => (
                  <div 
                    key={mod.id}
                    onClick={() => setSelectedModule(mod.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                      selectedModule === mod.id 
                        ? 'border-ios-primary bg-red-50/30' 
                        : 'border-slate-200 bg-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedModule === mod.id ? 'bg-ios-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {mod.icon}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${selectedModule === mod.id ? 'text-ios-primary' : 'text-slate-700'}`}>{mod.name}</h4>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">{mod.type} DATA</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={`p-6 border-slate-200 shadow-sm rounded-2xl transition-all ${!selectedModObj ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
                <IconFilter size={18} className="text-amber-500" />
                2. Filter & Parameter
              </h3>
              
              {selectedModObj?.type === 'transaction' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal Mulai</label>
                    <input 
                      type="date" 
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      className="w-full h-10 px-3 bg-white shadow-sm border-none rounded-lg text-sm font-medium focus:outline-none focus:border-ios-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal Akhir</label>
                    <input 
                      type="date" 
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      className="w-full h-10 px-3 bg-white shadow-sm border-none rounded-lg text-sm font-medium focus:outline-none focus:border-ios-primary/30"
                      disabled // For this prototype, maybe just query by start date, or pass start/end to API if supported
                    />
                    <p className="text-xs text-slate-400 mt-2 italic">*Hanya tersedia rentang harian pada versi saat ini.</p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Master Data diunduh secara penuh</p>
                  <p className="text-xs text-slate-400 mt-1">Tidak memerlukan filter tanggal</p>
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT COL: Action */}
          <div className="md:col-span-4">
            <Card className="p-6 border-slate-200 shadow-sm rounded-2xl sticky top-8 bg-slate-800 text-white overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <IconFileExport size={120} />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Ringkasan Export</h3>
                
                <div className="space-y-4 mb-8">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Modul Terpilih</p>
                    <p className="text-sm font-bold text-white mt-1">{selectedModObj ? selectedModObj.name : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Format</p>
                    <p className="text-sm font-bold text-white mt-1">Microsoft Excel (.xlsx)</p>
                  </div>
                </div>

                <Button 
                  onClick={handleExport}
                  disabled={loading || !selectedModule}
                  className="w-full h-12 bg-ios-primary hover:bg-ios-primary/90 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm shadow-red-500/20"
                >
                  {loading ? 'Mengekstrak Data...' : (
                    <span className="flex items-center gap-2">
                      <IconDownload size={18} /> GENERATE REPORT
                    </span>
                  )}
                </Button>
                <p className="text-xs text-slate-400 text-center mt-4">Peringatan: Unduhan data dilacak oleh sistem Audit Trail.</p>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportBuilder;
