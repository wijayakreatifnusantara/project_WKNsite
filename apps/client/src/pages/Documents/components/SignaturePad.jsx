import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { IconEraser, IconCheck, IconX, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const SignaturePad = ({ onSave, onCancel }) => {
  const sigCanvas = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigCanvas.current.clear();
    setIsEmpty(true);
  };

  const save = () => {
    if (sigCanvas.current.isEmpty()) return;
    const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="relative group">
        {/* Neumorphic Drawing Area */}
        <div className="bg-[#f0f2f5] p-2 rounded-[2rem] shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border-4 border-white">
          <SignatureCanvas 
            ref={sigCanvas}
            penColor="#1e293b"
            onBegin={() => setIsEmpty(false)}
            canvasProps={{
              width: 400,
              height: 200,
              className: 'signature-canvas cursor-crosshair rounded-[1.5rem]'
            }}
          />
        </div>

        {/* Decorative Corner Marks */}
        <div className="absolute top-6 left-6 h-4 w-4 border-t-2 border-l-2 border-slate-300 rounded-tl-sm pointer-events-none opacity-40"></div>
        <div className="absolute top-6 right-6 h-4 w-4 border-t-2 border-r-2 border-slate-300 rounded-tr-sm pointer-events-none opacity-40"></div>
        <div className="absolute bottom-6 left-6 h-4 w-4 border-b-2 border-l-2 border-slate-300 rounded-bl-sm pointer-events-none opacity-40"></div>
        <div className="absolute bottom-6 right-6 h-4 w-4 border-b-2 border-r-2 border-slate-300 rounded-br-sm pointer-events-none opacity-40"></div>
        
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] select-none">Draw Signature Here</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 w-full justify-center">
        <Button 
          variant="outline"
          onClick={clear}
          className="h-12 w-12 rounded-2xl bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] border-white border-2 text-slate-400 hover:text-[#E31E24] transition-all flex items-center justify-center p-0"
        >
          <IconRefresh size={20} />
        </Button>
        
        <div className="flex gap-3">
          <Button 
            onClick={onCancel}
            className="h-12 px-6 rounded-2xl bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] border-white border-2 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:shadow-none transition-all"
          >
            Cancel
          </Button>
          <Button 
            onClick={save}
            disabled={isEmpty}
            className={`h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex gap-3 items-center
              ${isEmpty 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50' 
                : 'bg-[#E31E24] text-white shadow-[5px_5px_15px_rgba(227,30,36,0.3)] hover:bg-[#C1181E]'}`}
          >
            <IconCheck size={18} />
            Capture Signature
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
