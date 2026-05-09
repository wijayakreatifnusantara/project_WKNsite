import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { IconDownload, IconPrinter, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const AssetQRModal = ({ isOpen, onClose, asset }) => {
  if (!isOpen || !asset) return null;

  const downloadQR = () => {
    const svg = document.getElementById("asset-qr-code");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${asset.asset_tag}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const printLabel = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-[#f0f2f5] border-white border-[4px] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] rounded-[2.5rem] p-8 relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-2xl bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] text-slate-400 hover:text-[#E31E24] transition-all"
        >
          <IconX size={20} />
        </button>

        <div className="text-center mb-8">
          <h3 className="text-lg font-black text-slate-800 font-outfit uppercase tracking-tight">Asset QR Label</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Physical Tracking Identification</p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="p-6 bg-white rounded-[2rem] shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] border-4 border-white print:shadow-none print:border-0">
            <QRCodeSVG 
              id="asset-qr-code"
              value={asset.asset_tag || asset.id}
              size={180}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/assets/wkn_logo.png",
                x: undefined,
                y: undefined,
                height: 30,
                width: 30,
                excavate: true,
              }}
            />
          </div>

          <div className="text-center">
            <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{asset.name}</p>
            <p className="text-[10px] font-bold text-[#E31E24] mt-1 font-mono">{asset.asset_tag}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pt-4 no-print">
            <Button 
              onClick={downloadQR}
              className="h-12 rounded-2xl bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] border-white border-2 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:shadow-none transition-all flex gap-2 items-center"
            >
              <IconDownload size={16} />
              Download
            </Button>
            <Button 
              onClick={printLabel}
              className="h-12 rounded-2xl bg-[#E31E24] text-white font-black text-[10px] uppercase tracking-widest shadow-[5px_5px_15px_rgba(227,30,36,0.3)] hover:bg-[#C1181E] transition-all flex gap-2 items-center"
            >
              <IconPrinter size={16} />
              Print Label
            </Button>
          </div>
        </div>

        {/* Print Only Info */}
        <div className="hidden print:block text-center mt-4">
          <p className="text-[8px] font-black text-slate-400 uppercase">WKNsite Corporate Asset Tracking</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .no-print { display: none !important; }
          .fixed { position: static !important; display: block !important; padding: 0 !important; }
          .max-w-sm { max-width: 100% !important; border: 0 !important; shadow: none !important; }
        }
      `}} />
    </div>
  );
};

export default AssetQRModal;
