import React, { useState } from 'react';
import { 
  IconCalculator, 
  IconAlertCircle, 
  IconCheck, 
  IconLoader2 
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import dayjs from 'dayjs';

const RunPayrollModal = ({ isOpen, onClose, onCalculate, loading }) => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm  animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] border-4 border-white shadow-sm overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-transparent shadow-sm rounded-2xl flex items-center justify-center text-ios-primary">
              <IconCalculator size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight font-outfit">Run Payroll Engine</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Initialize Monthly Disbursement</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Target Period</label>
              <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full h-12 px-5 bg-white shadow-sm border-none rounded-2xl text-sm font-bold text-slate-700 focus:outline-none"
              />
            </div>

            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex gap-3">
              <IconAlertCircle size={18} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 font-bold leading-relaxed uppercase tracking-tight">
                Sistem akan menghitung Gaji Pokok, Tunjangan, PPh 21 (TER), dan BPJS untuk seluruh karyawan aktif pada periode ini.
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Button 
              onClick={onClose}
              variant="outline" 
              className="flex-1 h-12 rounded-2xl bg-white shadow-sm border-white border-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:shadow-none transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => onCalculate(selectedMonth)}
              disabled={loading}
              className="flex-1 h-12 rounded-2xl bg-ios-primary text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-ios-primary/90 transition-all flex gap-2"
            >
              {loading ? <IconLoader2 className="animate-spin" size={16} /> : <IconCheck size={16} />}
              {loading ? 'Calculating...' : 'Start Logic'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunPayrollModal;
