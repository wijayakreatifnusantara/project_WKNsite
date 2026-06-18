import React, { useState } from 'react';
import { 
  IconUserCircle, 
  IconX, 
  IconCheck,
  IconClipboardCheck,
  IconDeviceLaptop
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAssets } from '../hooks/useAssets';

const AssignAssetModal = ({ isOpen, asset, onClose, onSuccess }) => {
  const { assignAsset, loading } = useAssets();
  const [formData, setFormData] = useState({
    employee_id: '',
    condition: 'Good',
    notes: ''
  });

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignAsset({
        asset_id: asset.id,
        ...formData
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm  animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-sm border-white border-[6px] overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-outfit uppercase tracking-tight">Assign <span className="text-ios-primary">Asset</span></h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Resource Handover Protocol</p>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-ios-primary transition-all">
              <IconX size={20} />
            </button>
          </div>

          <div className="mb-8 p-5 rounded-2xl bg-transparent shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-ios-primary">
              <IconDeviceLaptop size={24} />
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-slate-800 uppercase tracking-tight">{asset.name}</h4>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{asset.asset_tag}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Select Employee ID</label>
              <div className="h-12 px-4 rounded-2xl bg-white shadow-sm flex items-center gap-3">
                <IconUserCircle size={18} className="text-ios-primary" />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. WKN-001"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                  className="bg-transparent border-none text-slate-800 font-bold text-xs w-full focus:outline-none placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Initial Condition</label>
              <div className="h-12 px-4 rounded-2xl bg-white shadow-sm flex items-center gap-3">
                <IconClipboardCheck size={18} className="text-ios-primary" />
                <select 
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  className="bg-transparent border-none text-slate-800 font-bold text-xs w-full focus:outline-none appearance-none"
                >
                  <option value="New">Brand New</option>
                  <option value="Good">Good / Used</option>
                  <option value="Fair">Fair (Wear visible)</option>
                  <option value="Poor">Poor (Functional but damaged)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button 
                type="button" 
                onClick={onClose}
                className="flex-1 h-14 rounded-2xl bg-white shadow-sm text-slate-600 font-bold text-xs uppercase tracking-widest hover:shadow-none transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loading}
                className="flex-1 h-14 rounded-2xl bg-ios-primary text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-ios-primary/90 transition-all disabled:opacity-50 flex gap-2 items-center justify-center"
              >
                {loading ? 'Processing...' : (
                  <>
                    <IconCheck size={18} />
                    Complete Handover
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignAssetModal;
