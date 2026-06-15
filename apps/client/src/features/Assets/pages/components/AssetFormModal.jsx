import React, { useState } from 'react';
import { 
  IconDeviceLaptop, 
  IconX, 
  IconTag, 
  IconBarcode,
  IconCalendar,
  IconCurrencyDollar,
  IconTools
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAssets } from '../hooks/useAssets';

const AssetFormModal = ({ isOpen, onClose, onSuccess }) => {
  const { createAsset, loading } = useAssets();
  const [formData, setFormData] = useState({
    asset_tag: '',
    name: '',
    category: 'IT',
    serial_number: '',
    purchase_date: '',
    purchase_value: 0,
    condition: 'Good',
    status: 'Available'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAsset(formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm  animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-sm border-white border-[6px] overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-800 font-outfit uppercase tracking-tight">Register <span className="text-[#E31E24]">New Asset</span></h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Capital Resource Intake</p>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-[#E31E24] transition-all">
              <IconX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Asset Tag (Internal)</label>
                <div className="h-12 px-4 rounded-2xl bg-white shadow-sm flex items-center gap-3 text-[#E31E24]">
                  <IconTag size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="WKN-AST-001"
                    value={formData.asset_tag}
                    onChange={(e) => setFormData({...formData, asset_tag: e.target.value})}
                    className="bg-transparent border-none text-slate-800 font-bold text-xs w-full focus:outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <div className="h-12 px-4 rounded-2xl bg-white shadow-sm flex items-center gap-3 text-[#E31E24]">
                  <IconTools size={18} />
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="bg-transparent border-none text-slate-800 font-bold text-xs w-full focus:outline-none appearance-none"
                  >
                    <option value="IT">IT Equipment</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Tools">Professional Tools</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Asset Name / Model</label>
              <div className="h-12 px-4 rounded-2xl bg-white shadow-sm flex items-center gap-3 text-[#E31E24]">
                <IconDeviceLaptop size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. MacBook Pro 14-inch M3"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-transparent border-none text-slate-800 font-bold text-xs w-full focus:outline-none placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Serial Number</label>
                <div className="h-12 px-4 rounded-2xl bg-white shadow-sm flex items-center gap-3">
                  <IconBarcode size={18} className="text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="SN-XXXX-XXXX"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                    className="bg-transparent border-none text-slate-800 font-bold text-xs w-full focus:outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Purchase Date</label>
                <div className="h-12 px-4 rounded-2xl bg-white shadow-sm flex items-center gap-3">
                  <IconCalendar size={18} className="text-slate-400" />
                  <input 
                    type="date" 
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                    className="bg-transparent border-none text-slate-800 font-bold text-xs w-full focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button 
                type="button" 
                onClick={onClose}
                className="flex-1 h-14 rounded-2xl bg-white shadow-sm text-slate-600 font-black text-xs uppercase tracking-widest hover:shadow-none transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loading}
                className="flex-1 h-14 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-sm hover:bg-[#C1181E] transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Register Asset'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssetFormModal;
