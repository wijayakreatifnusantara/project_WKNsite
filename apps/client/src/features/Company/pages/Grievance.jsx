import React from 'react';
import { 
  IconShieldLock, 
  IconMessageReport, 
  IconLock, 
  IconCircleCheck,
  IconAlertCircle,
  IconArrowRight
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Grievance = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent custom-scrollbar animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 bg-white shadow-sm rounded-xl border-4 border-white items-center justify-center text-ios-primary mb-4">
            <IconShieldLock size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 font-outfit tracking-tight uppercase">
            Confidential <span className="text-ios-primary">Grievance Portal</span>
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">Your safety and comfort are our priority. All reports are encrypted and handled with strict confidentiality by the Internal Audit Team.</p>
        </header>

        <Card className="border-white border-[4px] shadow-sm bg-white rounded-[3rem] p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Type of Report</label>
              <select className="w-full h-14 px-6 bg-white shadow-sm border-none rounded-2xl text-xs font-bold text-slate-700 uppercase tracking-widest focus:outline-none focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20 transition-all">
                <option>Harassment / Bullying</option>
                <option>Integrity / Fraud</option>
                <option>Operational Grievance</option>
                <option>System Improvement</option>
              </select>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Reporting Method</label>
               <div className="flex gap-4">
                  <button className="flex-1 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center gap-3 text-ios-primary border-2 border-transparent hover:border-red-100 transition-all">
                     <IconLock size={18} />
                     <span className="text-xs font-bold uppercase tracking-widest">Anonymous</span>
                  </button>
                  <button className="flex-1 h-14 bg-white/50 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:bg-transparent transition-all">
                     <IconCircleCheck size={18} />
                     <span className="text-xs font-bold uppercase tracking-widest">Identify Me</span>
                  </button>
               </div>
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Describe the Situation</label>
             <textarea 
               rows={6}
               placeholder="PROVIDE CLEAR DETAILS, DATES, AND LOCATIONS..."
               className="w-full p-6 bg-white shadow-sm border-none rounded-2xl text-xs font-bold text-slate-700 placeholder:text-slate-300 uppercase tracking-widest resize-none focus:outline-none focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20 transition-all"
             />
          </div>

          <div className="flex items-center gap-4 p-6 bg-rose-50/50 rounded-2xl border border-rose-100 border-dashed">
             <IconAlertCircle size={24} className="text-rose-500 shrink-0" />
             <p className="text-xs font-bold text-rose-600 leading-relaxed uppercase">False reporting or defamation may lead to disciplinary action. Please ensure all information provided is accurate and made in good faith.</p>
          </div>

          <Button className="w-full h-16 rounded-2xl bg-ios-primary text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-ios-primary/90 transition-all flex items-center justify-center gap-4 active:scale-95">
             Submit Encrypted Report
             <IconArrowRight size={20} />
          </Button>
        </Card>

        <div className="text-center">
           <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">Encrypted via WKN-Security Protocol v4.1</p>
        </div>
      </div>
    </div>
  );
};

export default Grievance;
