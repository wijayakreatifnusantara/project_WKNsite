import React from 'react';
import { 
  IconX, 
  IconPrinter, 
  IconDownload, 
  IconQrcode, 
  IconId, 
  IconBuildingSkyscraper,
  IconPhone,
  IconWorld,
  IconMail
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const IDCardGenerator = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 print:hidden">
      <div 
        className="w-full max-w-4xl h-[90vh] bg-[#f0f2f5] shadow-[20px_20px_60px_#1e293b,-20px_-20px_60px_#ffffff] rounded-[3rem] overflow-hidden flex flex-col border-[8px] border-white animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="h-20 bg-[#f0f2f5] border-b-2 border-white flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] rounded-xl flex items-center justify-center text-[#E31E24]">
              <IconId size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 font-outfit uppercase tracking-tight">Smart ID Generator</h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-70">Corporate Identity Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handlePrint}
              className="h-11 px-5 rounded-xl bg-[#E31E24] text-white font-black text-[10px] uppercase tracking-widest shadow-[5px_5px_15px_rgba(227,30,36,0.3)] hover:bg-[#C1181E] transition-all flex gap-3"
            >
              <IconPrinter size={16} />
              Print Card
            </Button>
            <button 
              onClick={onClose}
              className="h-11 w-11 flex items-center justify-center bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] rounded-xl text-slate-400 hover:text-red-500 transition-all"
            >
              <IconX size={20} />
            </button>
          </div>
        </header>

        {/* Studio Content */}
        <div className="flex-1 overflow-y-auto p-12 flex items-center justify-center bg-[#f0f2f5] custom-scrollbar">
          <div className="flex gap-20 scale-110">
            
            {/* FRONT CARD */}
            <div className="relative w-[320px] h-[500px] bg-[#f0f2f5] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] rounded-[2.5rem] border-[6px] border-white overflow-hidden flex flex-col p-8 items-center text-center">
              {/* Header Logo */}
              <div className="flex flex-col items-center mb-10">
                <img src="/assets/wkn_logo.png" alt="WKN" className="h-10 w-auto object-contain mb-2" />
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] leading-none">WIJAYA KARYA</h3>
              </div>

              {/* Avatar Slot */}
              <div className="h-32 w-32 bg-[#f0f2f5] shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] rounded-[2rem] border-4 border-white flex items-center justify-center mb-8 relative group">
                <div className="text-4xl font-black text-slate-300 uppercase select-none group-hover:scale-110 transition-transform">
                  {employee["EMPLOYEE NAME"]?.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#E31E24] rounded-xl flex items-center justify-center text-white shadow-lg border-4 border-white">
                  <IconShieldCheck size={20} />
                </div>
              </div>

              {/* Employee Info */}
              <div className="space-y-2 mb-10">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">{employee["EMPLOYEE NAME"]}</h2>
                <p className="text-[10px] font-black text-[#E31E24] uppercase tracking-widest">{employee["Job Position *"]}</p>
              </div>

              {/* ID Barcode / QR Placeholder */}
              <div className="mt-auto flex flex-col items-center">
                <div className="p-3 bg-white shadow-[inset_2px_2px_4px_#d1d9e6] rounded-xl mb-3">
                  <IconQrcode size={64} className="text-slate-800" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Identity Number</span>
                  <span className="text-[12px] font-black text-slate-700 tracking-[0.2em] mt-1">{employee["EMPLOYEE ID"]}</span>
                </div>
              </div>

              {/* Decoration */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#E31E24] opacity-5 rounded-full blur-3xl"></div>
            </div>

            {/* BACK CARD */}
            <div className="relative w-[320px] h-[500px] bg-[#f0f2f5] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] rounded-[2.5rem] border-[6px] border-white overflow-hidden flex flex-col p-10 items-center justify-between">
              <div className="w-full">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 border-b-2 border-white pb-4">Terms & Conditions</h3>
                <div className="space-y-4 text-left">
                  <p className="text-[8px] font-bold text-slate-400 leading-relaxed italic">
                    1. This identity card is strictly for official use within PT. WIJAYA KARYA NUSANTARA premises.
                  </p>
                  <p className="text-[8px] font-bold text-slate-400 leading-relaxed italic">
                    2. If found, please return to the nearest HR department or office location mentioned below.
                  </p>
                  <p className="text-[8px] font-bold text-slate-400 leading-relaxed italic">
                    3. Misuse of this card may result in disciplinary actions as per corporate policy.
                  </p>
                </div>
              </div>

              <div className="w-full space-y-4 pt-6 border-t-2 border-white">
                <div className="flex items-center gap-3">
                  <IconBuildingSkyscraper size={14} className="text-[#E31E24]" />
                  <span className="text-[8px] font-black text-slate-500 uppercase">WKN Tower, Jakarta Selatan, ID</span>
                </div>
                <div className="flex items-center gap-3">
                  <IconPhone size={14} className="text-[#E31E24]" />
                  <span className="text-[8px] font-black text-slate-500 uppercase">+62 21 555 0123</span>
                </div>
                <div className="flex items-center gap-3">
                  <IconWorld size={14} className="text-[#E31E24]" />
                  <span className="text-[8px] font-black text-slate-500 uppercase">www.wijayakn.com</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center">
                <div className="h-10 w-full bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] rounded-lg flex items-center justify-center px-4">
                  <span className="text-[9px] font-black text-slate-400 tracking-[0.5em] uppercase">Security Verified</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>


      <div className="hidden print-area flex-row gap-10">
        {/* Simplified Front for Print */}
        <div className="print-card w-[54mm] h-[86mm] border rounded-lg overflow-hidden flex flex-col items-center text-center p-4 bg-white">
           <img src="/assets/wkn_logo.png" alt="WKN" className="h-6 w-auto mb-2" />
           <div className="h-20 w-20 border-2 rounded-xl mb-4 flex items-center justify-center font-bold text-xl">
             {employee["EMPLOYEE NAME"]?.split(' ').map(n => n[0]).join('')}
           </div>
           <h2 className="text-sm font-bold uppercase">{employee["EMPLOYEE NAME"]}</h2>
           <p className="text-[8px] font-bold text-red-600 uppercase mb-4">{employee["Job Position *"]}</p>
           <IconQrcode size={32} />
           <p className="text-[10px] font-mono mt-2">{employee["EMPLOYEE ID"]}</p>
        </div>
        {/* Simplified Back for Print */}
        <div className="print-card w-[54mm] h-[86mm] border rounded-lg overflow-hidden flex flex-col items-center text-center p-4 bg-white justify-between">
           <div className="text-[6px] text-left">
             <p className="font-bold mb-2 uppercase">Official Identity Card</p>
             <p>This card is the property of PT. WKN. If found, please return to office.</p>
           </div>
           <div className="text-[6px] font-bold">
             <p>WKN TOWER, JAKARTA</p>
             <p>WWW.WIJAYAKN.COM</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const IconShieldCheck = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default IDCardGenerator;
