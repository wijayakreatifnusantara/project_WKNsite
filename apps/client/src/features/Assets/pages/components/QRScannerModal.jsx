import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { IconX, IconCamera } from "@tabler/icons-react";

const QRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      scanner.render((decodedText) => {
        onScanSuccess(decodedText);
        scanner.clear();
        onClose();
      }, (error) => {
        // Suppress errors to avoid console noise
      });

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [isOpen, onClose, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#f0f2f5] border-white border-[4px] shadow-neu rounded-[2.5rem] p-8 relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-2xl bg-[#f0f2f5] shadow-neu text-slate-400 hover:text-[#E31E24] transition-all z-20"
        >
          <IconX size={20} />
        </button>

        <div className="text-center mb-8">
          <h3 className="text-lg font-black text-slate-800 font-outfit uppercase tracking-tight flex items-center justify-center gap-3">
            <IconCamera size={24} className="text-[#E31E24]" />
            Asset Intelligence Scanner
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Point your camera at an Asset QR Code</p>
        </div>

        <div className="relative rounded-[2rem] overflow-hidden bg-black shadow-neu border-4 border-white aspect-square">
          <div id="qr-reader" className="w-full h-full"></div>
          
          {/* Scanning Overlay UI */}
          <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none">
            <div className="h-full w-full border-2 border-[#E31E24] animate-pulse"></div>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-2xl bg-white/40 border border-white/50 text-center">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
            Scanning allows instant access to asset identification, assignment history, and lifecycle management.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
