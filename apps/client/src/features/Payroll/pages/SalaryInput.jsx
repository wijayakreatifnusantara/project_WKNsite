import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconDeviceFloppy, IconSearch, IconUser, IconAlertCircle } from "@tabler/icons-react";
import { apiClient } from '@/lib/apiClient';

export default function SalaryInput() {
  const [employees, setEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // All components based on employee_salaries table
  const defaultSalaryData = {
    grade: '',
    basic_salary: 0,
    position_allowance: 0,
    skill_allowance: 0,
    communication_allowance: 0,
    work_order_allowance: 0,
    meals_allowance: 0,
    transport_allowance: 0,
    overtime_allowance: 0,
    bpjs_tk_jkk: 0,
    bpjs_tk_jkm: 0,
    bpjs_tk_jht: 0,
    bpjs_tk_pensiun: 0,
    bpjs_kesehatan: 0,
    tax_allowance: 0,
    thr: 0,
    bonus: 0,
    incentive: 0,
    misc_earnings: 0,
    pph21: 0,
    deduction_jht: 0,
    deduction_pensiun: 0,
    deduction_kesehatan: 0,
    loan: 0,
    misc_deductions: 0
  };

  const [salaryData, setSalaryData] = useState(defaultSalaryData);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const response = await apiClient.get('/employees');
    if (response.data.data) setEmployees(response.data.data);
  };

  const handleSelectEmployee = async (emp) => {
    setSelectedEmployee(emp);
    setLoading(true);
    // Fetch their current salary data
    try {
      const { data: res } = await apiClient.get(`/api/payroll/salaries/${emp.id}`);
      const data = res.data;

    if (data) {
      setSalaryData(data);
    } catch (e) {
      setSalaryData(defaultSalaryData);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;
    setSaving(true);
    try {
      const payload = {
        employee_id: selectedEmployee.id,
        grade: salaryData.grade,
        basic_salary: Number(salaryData.basic_salary) || 0,
        position_allowance: Number(salaryData.position_allowance) || 0,
        skill_allowance: Number(salaryData.skill_allowance) || 0,
        communication_allowance: Number(salaryData.communication_allowance) || 0,
        work_order_allowance: Number(salaryData.work_order_allowance) || 0,
        meals_allowance: Number(salaryData.meals_allowance) || 0,
        transport_allowance: Number(salaryData.transport_allowance) || 0,
        overtime_allowance: Number(salaryData.overtime_allowance) || 0,
        bpjs_tk_jkk: Number(salaryData.bpjs_tk_jkk) || 0,
        bpjs_tk_jkm: Number(salaryData.bpjs_tk_jkm) || 0,
        bpjs_tk_jht: Number(salaryData.bpjs_tk_jht) || 0,
        bpjs_tk_pensiun: Number(salaryData.bpjs_tk_pensiun) || 0,
        bpjs_kesehatan: Number(salaryData.bpjs_kesehatan) || 0,
        tax_allowance: Number(salaryData.tax_allowance) || 0,
        thr: Number(salaryData.thr) || 0,
        bonus: Number(salaryData.bonus) || 0,
        incentive: Number(salaryData.incentive) || 0,
        misc_earnings: Number(salaryData.misc_earnings) || 0,
        pph21: Number(salaryData.pph21) || 0,
        deduction_jht: Number(salaryData.deduction_jht) || 0,
        deduction_pensiun: Number(salaryData.deduction_pensiun) || 0,
        deduction_kesehatan: Number(salaryData.deduction_kesehatan) || 0,
        loan: Number(salaryData.loan) || 0,
        misc_deductions: Number(salaryData.misc_deductions) || 0
      };

      // Check if exists
      let existing = null;
      try {
        const { data: res } = await apiClient.get(`/api/payroll/salaries/${selectedEmployee.id}`);
        existing = res.data;
      } catch (e) {
        // Not found
      }

      if (existing && existing.id) {
        await apiClient.put(`/api/payroll/salaries/${existing.id}`, payload);
      } else {
        await apiClient.post('/payroll/salaries', payload);
      }

      alert('Data Gaji Induk berhasil disimpan ke database!');
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) || 
    (emp.id && emp.id.toLowerCase().includes(employeeSearch.toLowerCase()))
  );

  const InputField = ({ label, fieldKey }) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase block mb-2">{label}</label>
      <input 
        type="number" 
        value={salaryData[fieldKey]} 
        onChange={(e) => setSalaryData({...salaryData, [fieldKey]: e.target.value})} 
        className="w-full h-12 px-4 bg-white shadow-sm rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#F97316] transition-all" 
      />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-in">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-10">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase">Input Master Gaji</h2>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1">Kelola Komponen Gaji Karyawan</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={!selectedEmployee || saving}
          className="h-12 px-6 rounded-2xl bg-[#E31E24] hover:bg-[#C1181E] disabled:opacity-50 text-white font-black text-xs uppercase shadow-sm"
        >
          <IconDeviceFloppy size={18} className="mr-2" /> {saving ? 'Menyimpan...' : 'Simpan Gaji'}
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex gap-3 text-yellow-800">
            <IconAlertCircle className="shrink-0" />
            <div className="text-sm">
              <p className="font-bold">Info Mode Admin (Phase 10)</p>
              <p>Hanya Admin yang dapat mengubah data Gaji Pokok, Tunjangan, dan Potongan di halaman ini. Nilai yang dimasukkan di sini akan langsung menjadi acuan aplikasi Mobile karyawan (READ-ONLY) dan e-Payslip.</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            {/* Sidebar: Karyawan */}
            <div className="col-span-4 space-y-6">
              <Card className="border-white border-2 shadow-sm bg-white rounded-xl p-6 h-[800px] flex flex-col">
                <CardTitle className="text-sm font-black text-slate-800 uppercase mb-6 shrink-0">Pilih Karyawan</CardTitle>
                <div className="h-12 relative group shrink-0 mb-4">
                  <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari nama karyawan..." 
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="w-full h-full pl-12 pr-6 bg-white shadow-sm border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {filteredEmployees.map(emp => (
                    <div 
                      key={emp.id} 
                      onClick={() => handleSelectEmployee(emp)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedEmployee?.id === emp.id 
                        ? 'bg-green-50 border-2 border-green-200 shadow-sm' 
                        : 'bg-white/50 border border-white hover:bg-transparent'
                      }`}
                    >
                      <p className="text-sm font-black text-slate-800">{emp.name}</p>
                      <p className="text-xs font-bold text-slate-500">{emp.job_position || 'Staff'}</p>
                    </div>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <p className="text-center text-slate-400 text-sm mt-10">Karyawan tidak ditemukan</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Form Gaji */}
            <div className="col-span-8">
              {!selectedEmployee ? (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 font-bold uppercase">Pilih karyawan dari daftar untuk mengedit gaji</p>
                </div>
              ) : loading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="animate-pulse font-bold text-[#F97316]">Memuat data...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status Card */}
                  <div className="p-4 bg-green-500 text-white rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                      <IconUser size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-lg">{selectedEmployee.name}</h3>
                      <p className="text-xs font-medium opacity-80 uppercase tracking-widest">{selectedEmployee.id}</p>
                    </div>
                  </div>

                  <Card className="border-white border-2 shadow-sm bg-white rounded-xl p-6">
                    <CardTitle className="text-sm font-black text-[#F97316] uppercase mb-6 border-b pb-4">Profil Gaji Pokok</CardTitle>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Grade / Golongan</label>
                        <input type="text" value={salaryData.grade || ''} onChange={(e) => setSalaryData({...salaryData, grade: e.target.value})} className="w-full h-12 px-4 bg-white shadow-sm rounded-xl text-sm font-bold text-slate-700 outline-none" />
                      </div>
                      <InputField label="Gaji Pokok (Basic Salary)" fieldKey="basic_salary" />
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-6">
                    <Card className="border-white border-2 shadow-sm bg-white rounded-xl p-6">
                      <CardTitle className="text-sm font-black text-blue-500 uppercase mb-6 border-b pb-4">Tunjangan Tetap</CardTitle>
                      <div className="space-y-4">
                        <InputField label="Tunjangan Posisi" fieldKey="position_allowance" />
                        <InputField label="Tunjangan Keahlian (Skill)" fieldKey="skill_allowance" />
                        <InputField label="Tunjangan Komunikasi" fieldKey="communication_allowance" />
                        <InputField label="Tunjangan Pajak" fieldKey="tax_allowance" />
                        <InputField label="BPJS TK JKK" fieldKey="bpjs_tk_jkk" />
                        <InputField label="BPJS TK JKM" fieldKey="bpjs_tk_jkm" />
                        <InputField label="BPJS TK JHT" fieldKey="bpjs_tk_jht" />
                        <InputField label="BPJS TK Pensiun" fieldKey="bpjs_tk_pensiun" />
                        <InputField label="BPJS Kesehatan" fieldKey="bpjs_kesehatan" />
                      </div>
                    </Card>

                    <Card className="border-white border-2 shadow-sm bg-white rounded-xl p-6">
                      <CardTitle className="text-sm font-black text-indigo-500 uppercase mb-6 border-b pb-4">Tunjangan Variabel & Non-Upah</CardTitle>
                      <div className="space-y-4">
                        <InputField label="Tunjangan Work Order" fieldKey="work_order_allowance" />
                        <InputField label="Tunjangan Makan" fieldKey="meals_allowance" />
                        <InputField label="Tunjangan Transport" fieldKey="transport_allowance" />
                        <InputField label="Tunjangan Lembur" fieldKey="overtime_allowance" />
                        <div className="h-4"></div>
                        <InputField label="THR" fieldKey="thr" />
                        <InputField label="Bonus" fieldKey="bonus" />
                        <InputField label="Insentif" fieldKey="incentive" />
                        <InputField label="Penerimaan Lain-lain" fieldKey="misc_earnings" />
                      </div>
                    </Card>
                  </div>

                  <Card className="border-white border-2 shadow-sm bg-white rounded-xl p-6">
                    <CardTitle className="text-sm font-black text-rose-500 uppercase mb-6 border-b pb-4">Potongan (Deductions)</CardTitle>
                    <div className="grid grid-cols-2 gap-6">
                      <InputField label="PPh 21" fieldKey="pph21" />
                      <InputField label="BPJS TK JHT" fieldKey="deduction_jht" />
                      <InputField label="BPJS TK Pensiun" fieldKey="deduction_pensiun" />
                      <InputField label="BPJS Kesehatan" fieldKey="deduction_kesehatan" />
                      <InputField label="Pinjaman / Loan" fieldKey="loan" />
                      <InputField label="Potongan Lain-lain" fieldKey="misc_deductions" />
                    </div>
                  </Card>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
