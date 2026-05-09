import React, { useState } from 'react';
import { 
  IconWallet, 
  IconDownload, 
  IconChevronRight, 
  IconArrowLeft,
  IconReceipt2,
  IconPlus,
  IconMinus
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MobilePayslip = () => {
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const payslips = [
    { id: 1, month: 'April 2026', total: 'Rp 8.500.000', status: 'Paid', date: '25 Apr 2026' },
    { id: 2, month: 'Maret 2026', total: 'Rp 8.250.000', status: 'Paid', date: '25 Mar 2026' },
    { id: 3, month: 'Februari 2026', total: 'Rp 8.250.000', status: 'Paid', date: '25 Feb 2026' },
  ];

  if (selectedPayslip) {
    return (
      <div className="p-6 animate-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedPayslip(null)}
          className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-8"
        >
          <IconArrowLeft size={16} />
          Back to History
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 font-outfit uppercase tracking-tight">Payslip Details</h2>
          <p className="text-[10px] font-black text-[#E31E24] uppercase tracking-widest mt-1">Period: {selectedPayslip.month}</p>
        </div>

        <Card className="bg-[#f0f2f5] border-white border-[4px] shadow-[12px_12px_24px_#d1d9e6,-12px_-10px_20px_#ffffff] rounded-[2.5rem] p-8 space-y-8">
          {/* Earnings Section */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <IconPlus size={14} className="text-emerald-500" />
              Earnings
            </h4>
            <div className="space-y-3">
              <DetailRow label="Base Salary" value="Rp 7.500.000" />
              <DetailRow label="Transport Allowance" value="Rp 500.000" />
              <DetailRow label="Performance Bonus" value="Rp 500.000" />
            </div>
          </section>

          {/* Deductions Section */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <IconMinus size={14} className="text-rose-500" />
              Deductions
            </h4>
            <div className="space-y-3">
              <DetailRow label="BPJS Kesehatan" value="(Rp 150.000)" color="rose" />
              <DetailRow label="PPH 21 Tax" value="(Rp 100.000)" color="rose" />
            </div>
          </section>

          {/* Net Pay */}
          <div className="pt-8 border-t-2 border-white/50 flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Take Home Pay</span>
            <h3 className="text-3xl font-black text-[#E31E24] font-outfit">{selectedPayslip.total}</h3>
          </div>

          <Button className="w-full h-14 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-[0.2em] shadow-[5px_5px_15px_rgba(227,30,36,0.3)] flex items-center justify-center gap-3 active:shadow-none transition-all">
            <IconDownload size={20} />
            Download PDF
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-black text-slate-800 font-outfit uppercase tracking-tight">Treasury <span className="text-[#E31E24]">Vault</span></h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Salary & Benefit History</p>
      </header>

      <div className="space-y-4">
        {payslips.map(slip => (
          <Card 
            key={slip.id} 
            onClick={() => setSelectedPayslip(slip)}
            className="bg-[#f0f2f5] border-white border-[3px] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] rounded-[2rem] p-5 flex items-center justify-between group active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-[#E31E24]">
                <IconReceipt2 size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{slip.month}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Released: {slip.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-xs font-black text-slate-800">{slip.total}</p>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">{slip.status}</span>
              </div>
              <IconChevronRight size={16} className="text-slate-300 group-hover:text-[#E31E24] transition-colors" />
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Widget */}
      <div className="p-6 rounded-[2.5rem] bg-white/40 border border-white shadow-sm space-y-4">
        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Financial Insights</h4>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Monthly</p>
            <p className="text-lg font-black text-slate-700">Rp 8.330.000</p>
          </div>
          <div className="h-12 w-24 bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] rounded-xl overflow-hidden flex items-end">
            <div className="w-1/3 bg-slate-200 h-[60%]"></div>
            <div className="w-1/3 bg-[#E31E24] h-[85%]"></div>
            <div className="w-1/3 bg-slate-300 h-[70%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, color }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{label}</span>
    <span className={`text-[10px] font-black ${color === 'rose' ? 'text-rose-500' : 'text-slate-700'}`}>{value}</span>
  </div>
);

export default MobilePayslip;
