import React from 'react';
import { 
  IconQrcode, 
  IconShare, 
  IconDownload, 
  IconId, 
  IconMapPin, 
  IconPhone, 
  IconMail,
  IconArrowLeft
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DigitalCard = ({ user }) => {
  return (
    <div className="flex-1 h-full flex flex-col bg-[#f0f2f5] overflow-y-auto p-6 animate-fade-in custom-scrollbar">
      <header className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-black text-slate-800 font-outfit uppercase tracking-tight">Identity <span className="text-[#E31E24]">Vault</span></h2>
      </header>

      <div className="max-w-md mx-auto w-full space-y-10">
        {/* The Card Visualization */}
        <Card className="relative aspect-[1.586/1] w-full bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-[20px_20px_40px_rgba(0,0,0,0.1)] group">
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] bg-[size:20px_20px]"></div>
           <div className="absolute top-0 right-0 w-48 h-48 bg-[#E31E24] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-30"></div>
           
           <div className="relative h-full p-8 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-3">
                    <img src="/assets/wkn_logo.png" alt="WKN" className="h-6 w-auto invert brightness-0" />
                    <span className="text-white font-outfit font-black text-sm tracking-widest">WKNsite</span>
                 </div>
                 <IconId size={32} className="text-[#E31E24]" />
              </div>

              <div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tight">{user?.full_name || 'Adianto'}</h3>
                 <p className="text-[10px] font-bold text-[#E31E24] uppercase tracking-[0.3em] mt-1">{user?.role || 'System Owner'}</p>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-4">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/50">
                       <IconMail size={12} />
                       <span className="text-[8px] font-medium tracking-wider uppercase">{user?.username || 'adianto@wijayakn.com'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/50">
                       <IconMapPin size={12} />
                       <span className="text-[8px] font-medium tracking-wider uppercase">HQ - Jakarta, ID</span>
                    </div>
                 </div>
                 <div className="h-14 w-14 bg-white rounded-xl p-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <IconQrcode size="100%" className="text-slate-900" />
                 </div>
              </div>
           </div>
        </Card>

        {/* QR Large Visualization */}
        <div className="flex flex-col items-center space-y-6">
           <div className="p-8 bg-[#f0f2f5] shadow-[15px_15px_30px_#d1d9e6,-15px_-15px_30px_#ffffff] rounded-[3rem] border-4 border-white">
              <div className="h-48 w-48 flex items-center justify-center bg-white rounded-[2rem] p-4 shadow-inner">
                 <IconQrcode size={160} className="text-slate-800" />
              </div>
           </div>
           <div className="text-center">
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.4em]">Scan to save contact</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">Verified Professional Identity</p>
           </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
           <Button className="h-14 rounded-2xl bg-[#f0f2f5] shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] text-slate-600 font-black text-xs uppercase tracking-widest hover:text-[#E31E24] hover:shadow-none transition-all flex gap-3">
              <IconShare size={18} />
              Share Card
           </Button>
           <Button className="h-14 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-[5px_5px_15px_rgba(227,30,36,0.3)] hover:bg-[#C1181E] transition-all flex gap-3">
              <IconDownload size={18} />
              Save PDF
           </Button>
        </div>
      </div>
    </div>
  );
};

export default DigitalCard;
