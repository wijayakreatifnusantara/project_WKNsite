import React, { useRef, useState } from 'react';
import { 
  IconSignature, 
  IconX, 
  IconCircleCheck, 
  IconEraser, 
  IconFileText, 
  IconShieldLock,
  IconDownload,
  IconFingerprint
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const DigitalSignature = ({ isOpen, onClose, employee, documentTitle = "Employment Contract 2024" }) => {
  const canvasRef = useRef(null);
  const [isSigned, setIsSigned] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  if (!isOpen || !employee) return null;

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(x, y);
    ctx.stroke();
    setIsSigned(true);
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-5xl h-[85vh] bg-[#f0f2f5] shadow-[20px_20px_60px_#1e293b,-20px_-20px_60px_#ffffff] rounded-[3rem] overflow-hidden flex flex-col border-[8px] border-white animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="h-20 bg-[#f0f2f5] border-b-2 border-white flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] rounded-xl flex items-center justify-center text-[#E31E24]">
              <IconSignature size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 font-outfit uppercase tracking-tight">E-Sign Laboratory</h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-70">Secure Digital Document Execution</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-11 w-11 flex items-center justify-center bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] rounded-xl text-slate-400 hover:text-red-500 transition-all"
          >
            <IconX size={20} />
          </button>
        </header>

        {/* Studio Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Document Preview */}
          <div className="flex-1 bg-slate-200/30 p-12 overflow-y-auto custom-scrollbar flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white shadow-2xl rounded-sm p-16 min-h-[1000px] relative">
              <div className="flex justify-between items-center mb-10 pb-6 border-b">
                <img src="/assets/wkn_logo.png" alt="WKN" className="h-8 w-auto opacity-50" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidential</span>
              </div>
              
              <h2 className="text-2xl font-serif font-bold text-slate-800 mb-8">{documentTitle}</h2>
              
              <div className="space-y-6 text-sm text-slate-600 leading-relaxed font-serif">
                <p>This agreement is entered into between PT. WIJAYA KARYA NUSANTARA and the employee <strong>{employee["EMPLOYEE NAME"]}</strong>.</p>
                <p>The employee agrees to comply with all corporate policies, including but not limited to confidentiality, intellectual property rights, and code of conduct.</p>
                <p>The position of <strong>{employee["Job Position *"]}</strong> carries responsibilities as detailed in the attached job description. Salary and benefits are subject to the terms discussed during the recruitment process.</p>
                <div className="py-10">
                  <div className="h-40 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Document Body Content Placeholder</p>
                  </div>
                </div>
                <p>By signing below, the parties acknowledge that they have read and understood the terms of this agreement.</p>
              </div>

              {/* Signature Footer */}
              <div className="mt-20 pt-10 border-t flex justify-between">
                <div className="w-48">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-10">Authorized Representative</p>
                  <div className="h-[1px] bg-slate-300 mb-2"></div>
                  <p className="text-xs font-bold text-slate-800 uppercase">Adi Anto</p>
                  <p className="text-[9px] text-slate-400">Super Admin</p>
                </div>
                <div className="w-48">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-10">Employee Signature</p>
                  {isSigned && (
                    <div className="absolute bottom-20 right-20 transform scale-50 opacity-50 origin-bottom-right">
                       <IconFingerprint size={120} className="text-[#E31E24]" />
                    </div>
                  )}
                  <div className="h-[1px] bg-slate-300 mb-2"></div>
                  <p className="text-xs font-bold text-slate-800 uppercase">{employee["EMPLOYEE NAME"]}</p>
                  <p className="text-[9px] text-slate-400">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Signature Pad Panel */}
          <div className="w-[380px] bg-[#f0f2f5] border-l-2 border-white p-10 flex flex-col gap-8">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <IconShieldLock size={18} className="text-[#E31E24]" />
                Identity Verification
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-2 leading-relaxed">
                Please provide your legal digital signature below to execute this document.
              </p>
            </div>

            {/* Canvas Container */}
            <div className="flex flex-col gap-4">
              <div className="bg-[#f0f2f5] shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] rounded-[2rem] border-4 border-white overflow-hidden relative">
                <canvas 
                  ref={canvasRef}
                  width={300}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  className="cursor-crosshair w-full h-48"
                />
                {!isSigned && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Sign Here</p>
                  </div>
                )}
              </div>
              <div className="flex justify-between px-2">
                <button 
                  onClick={clearCanvas}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-red-500 transition-colors"
                >
                  <IconEraser size={14} />
                  Clear Pad
                </button>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isSigned ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase">{isSigned ? 'Captured' : 'Waiting'}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div className="p-4 bg-white/50 border-2 border-white rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <IconFingerprint size={16} className="text-[#E31E24]" />
                  <span className="text-[9px] font-black text-slate-700 uppercase">Biometric Hash</span>
                </div>
                <p className="text-[8px] font-mono text-slate-400 break-all">
                  SHA-256: 8f92b7c1a2e3d4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9
                </p>
              </div>

              <Button 
                className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex gap-3 ${isSigned ? 'bg-[#E31E24] text-white shadow-[8px_8px_20px_rgba(227,30,36,0.3)] hover:bg-[#C1181E]' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
                disabled={!isSigned}
              >
                <IconCircleCheck size={20} />
                Finalize & Sign
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalSignature;
