import React, { useState } from 'react';
import { IconX, IconSignature, IconDownload, IconFileCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import SignaturePad from './SignaturePad';

const DocumentSignerModal = ({ isOpen, onClose, document: doc, onSave }) => {
  const [signature, setSignature] = useState(null);
  const [step, setStep] = useState('preview'); // preview, sign, placement
  const [position, setPosition] = useState({ x: 50, y: 50 });

  if (!isOpen || !doc) return null;

  const handleSignatureSave = (dataUrl) => {
    setSignature(dataUrl);
    setStep('placement');
  };

  const finalizeSigning = () => {
    // In a real app, we'd use canvas to merge. 
    // Here we'll simulate saving the signed document.
    onSave({
      ...doc,
      status: 'Signed',
      signed_at: new Date().toISOString(),
      signature_preview: signature,
      signature_pos: position
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm  animate-in fade-in duration-300">
      <div className="w-full max-w-4xl h-[80vh] bg-white border-white border-[4px] shadow-sm rounded-[2.5rem] relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-10 py-8 flex justify-between items-center border-b border-white/30">
          <div>
            <h3 className="text-xl font-bold text-slate-800 font-outfit uppercase tracking-tight flex items-center gap-3">
              <IconSignature size={28} className="text-ios-primary" />
              Digital Signing Room
            </h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Authorized Authorization Workflow</p>
          </div>
          <button 
            onClick={onClose}
            className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white shadow-sm text-slate-400 hover:text-ios-primary transition-all"
          >
            <IconX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document Preview (Left) */}
          <div className="flex-1 bg-slate-200/50 p-10 flex items-center justify-center relative overflow-auto custom-scrollbar">
            <div className="relative bg-transparent shadow-sm border border-slate-200 min-h-[500px] w-full max-w-[400px] flex items-center justify-center group">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Document Preview: {doc.name}</span>
              
              {/* Signature Overlay (if in placement step) */}
              {signature && step === 'placement' && (
                <div 
                  className="absolute cursor-move border-2 border-dashed border-ios-primary p-1 bg-white/50 "
                  style={{ top: `${position.y}%`, left: `${position.x}%`, transform: 'translate(-50%, -50%)' }}
                  onMouseDown={(e) => {
                    const rect = e.currentTarget.parentElement.getBoundingClientRect();
                    const move = (moveEvent) => {
                      const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                      const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;
                      setPosition({ 
                        x: Math.max(0, Math.min(100, x)), 
                        y: Math.max(0, Math.min(100, y)) 
                      });
                    };
                    window.addEventListener('mousemove', move);
                    window.addEventListener('mouseup', () => window.removeEventListener('mousemove', move), { once: true });
                  }}
                >
                  <img src={signature} alt="Signature" className="h-12 w-auto" />
                  <div className="absolute -top-6 left-0 bg-ios-primary text-white text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase">Drag to Position</div>
                </div>
              )}
            </div>
          </div>

          {/* Controls (Right) */}
          <div className="w-96 border-l border-white/30 p-10 flex flex-col gap-8 bg-white">
            {step === 'preview' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="p-6 rounded-2xl bg-white shadow-sm border-white border-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-2">Document Info</h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    Type: {doc.type || 'SOP'}<br/>
                    Owner: {doc.owner || 'HR Dept'}<br/>
                    Status: {doc.status || 'Pending'}
                  </p>
                </div>
                <Button 
                  onClick={() => setStep('sign')}
                  className="w-full h-14 rounded-2xl bg-ios-primary text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-ios-primary/90 transition-all flex gap-3 items-center justify-center"
                >
                  <IconSignature size={20} />
                  Initiate Signing
                </Button>
              </div>
            )}

            {step === 'sign' && (
              <div className="animate-in zoom-in-95 duration-300">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 px-1">Draw your signature</h4>
                <SignaturePad 
                  onSave={handleSignatureSave} 
                  onCancel={() => setStep('preview')} 
                />
              </div>
            )}

            {step === 'placement' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-white shadow-sm">
                  <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Final Step</h4>
                  <p className="text-xs text-emerald-500 font-bold leading-relaxed">
                    Tanda tangan telah dibuat. Silakan geser kotak merah pada dokumen untuk menentukan posisi tanda tangan yang tepat.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={finalizeSigning}
                    className="w-full h-14 rounded-2xl bg-ios-primary text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-ios-primary/90 transition-all flex gap-3 items-center justify-center"
                  >
                    <IconFileCheck size={20} />
                    Authorize & Save
                  </Button>
                  <button 
                    onClick={() => setStep('sign')}
                    className="text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-600 transition-colors"
                  >
                    Redraw Signature
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSignerModal;
