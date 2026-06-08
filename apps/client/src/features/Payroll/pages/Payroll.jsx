import React, { useState, useEffect } from 'react';
import { 
  IconCreditCard, 
  IconClock, 
  IconReceiptTax, 
  IconDownload, 
  IconFilter, 
  IconPlus,
  IconDotsVertical,
  IconSearch,
  IconArrowUpRight,
  IconArrowDownRight,
  IconCircleCheck,
  IconLoader2,
  IconTableExport
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePayroll } from './hooks/usePayroll';
import RunPayrollModal from './components/RunPayrollModal';
import dayjs from 'dayjs';

const Payroll = () => {
  const { loading, error, calculationData, fetchHistory, calculatePayroll, finalizePayroll } = usePayroll();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(dayjs().format('YYYY-MM'));
  const [displayData, setDisplayData] = useState([]);

  useEffect(() => {
    // Initial fetch of history for current month
    const load = async () => {
      const data = await fetchHistory(currentPeriod);
      if (data && data.length > 0) {
        setDisplayData(data);
      }
    };
    load();
  }, [currentPeriod, fetchHistory]);

  const handleRunPayroll = async (period) => {
    try {
      const result = await calculatePayroll(period);
      if (result && result.data) {
        setDisplayData(result.data);
        setCurrentPeriod(period);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Payroll calculation failed", err);
    }
  };

  const handleFinalize = async () => {
    if (!calculationData || !calculationData.data) return;
    try {
      await finalizePayroll(currentPeriod, calculationData.data);
      alert(`Payroll untuk periode ${currentPeriod} berhasil difinalisasi!`);
      // Refresh
      fetchHistory(currentPeriod);
    } catch (err) {
      alert("Gagal memfinalisasi payroll: " + err);
    }
  };

  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f2f5] animate-fade-in">
      {/* Page Header */}
      <header className="h-20 bg-[#f0f2f5] border-b border-white/50 flex items-center justify-between px-10 shrink-0 shadow-[0_4px_10px_-5px_rgba(0,0,0,0.05)] z-10">
        <div className="flex flex-col leading-none">
          <h2 className="text-xl font-black text-slate-800 font-outfit uppercase tracking-tight">Treasury Operations</h2>
          <p className="text-[9px] text-slate-400 font-black mt-1.5 uppercase tracking-[0.3em] opacity-70">
            {currentPeriod ? `Active Cycle: ${dayjs(currentPeriod).format('MMMM YYYY')}` : 'Salary Disbursements & Tax Engine'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {calculationData && (
            <Button 
              onClick={handleFinalize}
              variant="outline" 
              className="h-12 px-6 rounded-2xl bg-green-50 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] border-white border-2 text-green-600 font-black text-[10px] uppercase tracking-widest flex gap-2 transition-all"
            >
              <IconCircleCheck size={18} /> Finalize Run
            </Button>
          )}
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-12 px-6 rounded-2xl bg-[#E31E24] hover:bg-[#C1181E] text-white font-black text-[10px] uppercase tracking-widest shadow-[5px_5px_15px_rgba(227,30,36,0.3)] flex gap-2 transition-all"
          >
            <IconPlus size={18} /> Run Logic
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard 
              title="Total Payroll" 
              value={formatIDR(calculationData?.summary?.total_net_disbursement || 0)} 
              subtitle={`Period: ${dayjs(currentPeriod).format('MMM YYYY')}`}
              icon={<IconCreditCard size={24} />}
              trend="+4.2%"
              positive={true}
            />
            <KPICard 
              title="Workforce Size" 
              value={`${displayData.length} Records`} 
              subtitle="Total Active Personnel"
              icon={<IconClock size={24} />}
              trend="Stable"
              positive={true}
              color="amber"
            />
            <KPICard 
              title="Tax Withheld" 
              value={formatIDR(calculationData?.summary?.total_tax_withheld || 0)} 
              subtitle="Estimated PPh 21 TER"
              icon={<IconReceiptTax size={24} />}
              trend="Calculated"
              positive={true}
              color="indigo"
            />
          </div>

          {/* Table Area (Neumorphic Component) */}
          <Card className="border-white border-4 shadow-[15px_15px_30px_#d1d9e6,-15px_-15px_30px_#ffffff] bg-[#f0f2f5] rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-white/50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-6">
                <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Disbursement List</CardTitle>
                <div className="h-12 w-80 relative group hidden md:block">
                  <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#E31E24] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search personnel or ID..." 
                    className="w-full h-full pl-12 pr-6 bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] border-none rounded-2xl text-[11px] font-bold text-slate-700 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="h-12 w-12 flex items-center justify-center text-slate-400 bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] rounded-2xl transition-all hover:text-[#E31E24] active:shadow-none">
                  <IconFilter size={18} />
                </button>
                <button className="h-12 w-12 flex items-center justify-center text-slate-400 bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] rounded-2xl transition-all hover:text-[#E31E24] active:shadow-none">
                  <IconTableExport size={18} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/30">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tax Cat</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gross Salary</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Deductions</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Salary</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="py-20 text-center">
                          <IconLoader2 className="animate-spin mx-auto text-[#E31E24] mb-4" size={32} />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing Calculation Engine...</p>
                        </td>
                      </tr>
                    ) : displayData.length > 0 ? (
                      displayData.map((row, idx) => (
                        <PayrollRow 
                          key={idx} 
                          data={row}
                          formatIDR={formatIDR}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-20 text-center">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No payroll records found for this period</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-6 border-t border-white/50 flex items-center justify-between">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Active Pool: {displayData.length} records</p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="h-10 px-5 text-[9px] font-black uppercase tracking-widest rounded-xl bg-[#f0f2f5] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] border-white border-2 disabled:opacity-30" disabled>Prev</Button>
                  <Button variant="outline" size="sm" className="h-10 px-5 text-[9px] font-black uppercase tracking-widest rounded-xl bg-[#f0f2f5] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] border-white border-2">Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <RunPayrollModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCalculate={handleRunPayroll}
        loading={loading}
      />
    </div>
  );
};

const KPICard = ({ title, value, subtitle, icon, trend, positive, color = "blue" }) => {
  const colors = {
    blue: "text-blue-500 shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]",
    amber: "text-amber-500 shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]",
    indigo: "text-[#E31E24] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]",
  };

  return (
    <Card className="border-white border-2 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] bg-[#f0f2f5] rounded-[2rem] p-8 hover:scale-[1.02] transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-6">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center bg-[#f0f2f5] ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0f2f5] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] text-[10px] font-black ${positive ? 'text-green-500' : 'text-rose-500'}`}>
          {trend}
          {positive ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
        </div>
      </div>
      <div className="space-y-1 leading-none">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-80">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight font-outfit">{value}</h3>
        <p className="text-[9px] text-slate-400 font-bold pt-2 uppercase tracking-widest opacity-60">{subtitle}</p>
      </div>
    </Card>
  );
};

import { pdf } from '@react-pdf/renderer';
import PayslipTemplate from './components/PayslipTemplate';

const PayrollRow = ({ data, formatIDR }) => {
  const { 
    employee_name: name, 
    employee_id: id, 
    tax_category: category, 
    gross_salary, 
    tax_deduction, 
    bpjs_health_employee, 
    bpjs_employment_employee, 
    late_deduction,
    absence_deduction,
    net_salary 
  } = data;
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async (e) => {
    e.stopPropagation();
    setIsGenerating(true);
    try {
      const doc = <PayslipTemplate data={data} />;
      const asPdf = pdf([]);
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payslip_${name}_${data.period}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Gagal membuat PDF: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalDeductions = tax_deduction + 
    (bpjs_health_employee || 0) + 
    (bpjs_employment_employee || 0) + 
    (late_deduction || 0) + 
    (absence_deduction || 0);

  return (
    <tr className="group hover:bg-white/40 transition-all cursor-pointer">
      <td className="px-8 py-4 border-b border-white/20">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-[#f0f2f5] rounded-xl shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] border-2 border-white flex items-center justify-center text-slate-400 font-black text-[11px] uppercase group-hover:text-[#E31E24] transition-colors">
            {name.charAt(0)}
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[11px] font-black text-slate-800 group-hover:text-[#E31E24] transition-colors uppercase tracking-tight">{name}</span>
            <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter mt-1">{id}</span>
          </div>
        </div>
      </td>
      <td className="px-8 py-4 border-b border-white/20 text-center">
        <span className={`px-3 py-1 rounded-lg bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] text-[9px] font-black uppercase tracking-widest text-slate-500`}>
          Cat {category}
        </span>
      </td>
      <td className="px-8 py-4 border-b border-white/20 text-right text-[11px] font-bold text-slate-500 uppercase tracking-tight">
        {formatIDR(gross_salary)}
      </td>
      <td className="px-8 py-4 border-b border-white/20 text-right text-[11px] font-black text-rose-500/70">
        - {formatIDR(totalDeductions)}
      </td>
      <td className="px-8 py-4 border-b border-white/20 text-right">
        <span className="text-[12px] font-black text-slate-900 font-outfit">{formatIDR(net_salary)}</span>
      </td>
      <td className="px-8 py-4 border-b border-white/20 text-center">
        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="h-10 w-10 mx-auto flex items-center justify-center text-slate-300 hover:text-[#E31E24] transition-colors disabled:opacity-50"
        >
          {isGenerating ? <IconLoader2 size={18} className="animate-spin" /> : <IconDownload size={20} />}
        </button>
      </td>
    </tr>
  );
};


export default Payroll;

