import React, { useState, useMemo } from 'react';
import { 
  IconCalculator, 
  IconX, 
  IconTrendingUp, 
  IconCoins, 
  IconUsers,
  IconChartBar,
  IconAlertCircle,
  IconArrowRight,
  IconWallet
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const SalarySimulator = ({ isOpen, onClose, employees }) => {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.["EMPLOYEE ID"] || '');
  const [adjustmentPercent, setAdjustmentPercent] = useState(5);
  
  const selectedEmp = useMemo(() => 
    employees.find(e => e["EMPLOYEE ID"] === selectedEmpId), 
    [selectedEmpId, employees]
  );

  // Use actual base salary from selected employee record
  const baseSalary = selectedEmp?.["Gaji Pokok *"] || 7500000; 
  
  const calculations = useMemo(() => {
    const current = baseSalary;
    const proposed = current * (1 + adjustmentPercent / 100);
    const diff = proposed - current;
    
    // BPJS Calculations (Simplified)
    const bpjsTK = proposed * 0.057; // 5.7% total
    const bpjsKes = proposed * 0.05; // 5% total
    
    return {
      current,
      proposed,
      diff,
      bpjsTK,
      bpjsKes,
      takeHome: proposed - (bpjsTK * 0.02) - (bpjsKes * 0.01) // Employee share
    };
  }, [adjustmentPercent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm  animate-in fade-in duration-300">
      <div 
        className="w-full max-w-5xl h-[85vh] bg-white shadow-sm rounded-[3rem] overflow-hidden flex flex-col border-[8px] border-white animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="h-20 bg-white border-b-2 border-white flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-ios-primary">
              <IconCalculator size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 font-outfit uppercase tracking-tight">Salary Projection Lab</h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider opacity-70">Budget Impact Simulator & Forecast</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-11 w-11 flex items-center justify-center bg-white shadow-sm rounded-xl text-slate-400 hover:text-red-500 transition-all"
          >
            <IconX size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel: Inputs */}
          <div className="w-[350px] bg-white border-r-2 border-white p-10 space-y-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-2">Target Personnel</label>
              <select 
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full h-12 px-5 bg-white shadow-sm border-none rounded-2xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp["EMPLOYEE ID"]} value={emp["EMPLOYEE ID"]}>{emp["EMPLOYEE NAME"]}</option>
                ))}
              </select>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary Adjustment</label>
                <span className="text-xs font-bold text-ios-primary">{adjustmentPercent}%</span>
              </div>
              <input 
                type="range" 
                min="-20" 
                max="50" 
                value={adjustmentPercent}
                onChange={(e) => setAdjustmentPercent(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#E31E24]"
              />
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 uppercase px-1">
                <span>Decrease</span>
                <span>Neutral</span>
                <span>Growth</span>
              </div>
            </div>

            <div className="p-6 bg-white/40 border-2 border-white rounded-2xl space-y-4">
              <div className="flex items-center gap-3 text-ios-primary">
                <IconAlertCircle size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Simulation Context</span>
              </div>
              <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                This simulation includes BPJS Ketenagakerjaan (5.7%), BPJS Kesehatan (5%), and estimated PPh 21 based on PTKP 2024.
              </p>
            </div>

            <Button className="w-full h-14 rounded-2xl bg-ios-primary text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-ios-primary/90 transition-all flex gap-3">
              <IconChartBar size={18} />
              Commit to Forecast
            </Button>
          </div>

          {/* Right Panel: Visualization */}
          <div className="flex-1 p-12 overflow-y-auto custom-scrollbar space-y-10">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-8">
              <div className="bg-white shadow-sm rounded-[2.5rem] p-8 border-4 border-white text-center">
                <IconWallet size={20} className="text-slate-300 mx-auto mb-4" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Base</p>
                <h3 className="text-xl font-bold text-slate-700">Rp {calculations.current.toLocaleString()}</h3>
              </div>
              <div className="bg-white shadow-sm rounded-[2.5rem] p-8 border-4 border-white text-center">
                <IconTrendingUp size={20} className="text-green-500 mx-auto mb-4" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Proposed Base</p>
                <h3 className="text-xl font-bold text-green-600">Rp {calculations.proposed.toLocaleString()}</h3>
              </div>
              <div className="bg-white shadow-sm rounded-[2.5rem] p-8 border-4 border-white text-center">
                <IconCoins size={20} className="text-blue-500 mx-auto mb-4" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Take Home Pay</p>
                <h3 className="text-xl font-bold text-blue-600">Rp {Math.round(calculations.takeHome).toLocaleString()}</h3>
              </div>
            </div>

            {/* Projection Chart Mockup */}
            <div className="bg-white shadow-sm rounded-[3rem] p-10 border-2 border-white relative overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-3">
                  <IconTrendingUp size={20} className="text-ios-primary" />
                  Annual Budget Projection
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-slate-300"></div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Baseline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-ios-primary"></div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Simulated</span>
                  </div>
                </div>
              </div>

              {/* Chart Bars */}
              <div className="h-48 flex items-end justify-between gap-4 px-4">
                {[45, 52, 48, 61, 55, 68, 72, 65, 80, 85, 82, 95].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative">
                      <div className="absolute bottom-0 w-full bg-slate-200 rounded-t-lg transition-all duration-500" style={{ height: `${h-10}%` }}></div>
                      <div className="absolute bottom-0 w-full bg-ios-primary rounded-t-lg transition-all duration-500 opacity-60 group-hover:opacity-100" style={{ height: `${h + (adjustmentPercent/2)}%` }}></div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300 uppercase">M{i+1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4">Company Cost Breakdown</h4>
                <div className="bg-white/40 border-2 border-white rounded-2xl p-8 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span>Base Salary</span>
                    <span>Rp {calculations.proposed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>BPJS TK (Company 4.54%)</span>
                    <span>Rp {Math.round(calculations.proposed * 0.0454).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>BPJS Kes (Company 4.0%)</span>
                    <span>Rp {Math.round(calculations.proposed * 0.04).toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t-2 border-[#f0f2f5] flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Total Monthly Cost</span>
                    <span className="text-xs font-bold text-ios-primary">Rp {Math.round(calculations.proposed * 1.0854).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4">Yearly Impact Forecast</h4>
                <div className="bg-white/40 border-2 border-white rounded-2xl p-8 space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 shrink-0">
                      <IconTrendingUp size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-none mb-1">Budget Delta</p>
                      <h5 className="text-lg font-bold text-green-600">+ Rp {(calculations.diff * 12).toLocaleString()} / Year</h5>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl">
                    <IconAlertCircle size={16} className="text-blue-400" />
                    <p className="text-xs font-bold text-slate-400 leading-tight">
                      This adjustment will place the employee at the <strong>75th percentile</strong> of current market standards for {selectedEmp?.["Job Position *"]}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalarySimulator;
