import React, { useState } from 'react';
import { IconX, IconBriefcase } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const NewJobModal = ({ isOpen, onClose, onSuccess, createJob }) => {
  const [title, setTitle] = useState('');
  const [dept, setDept] = useState('Engineering');
  const [status, setStatus] = useState('Active');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return alert("Judul lowongan wajib diisi!");
    
    setLoading(true);
    const result = await createJob({ title, dept, status });
    setLoading(false);
    
    if (result.success) {
      setTitle('');
      onSuccess();
      onClose();
    } else {
      alert("Gagal membuat lowongan: " + result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm  animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border-[6px] border-white overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white/40">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <IconBriefcase size={16} className="text-[#E31E24]" />
            Post New Job
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-[#E31E24] transition-colors"><IconX size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Job Title / Position</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full h-12 bg-white shadow-sm rounded-xl px-4 text-xs font-bold text-slate-800 focus:outline-none border-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Department</label>
              <select 
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full h-12 bg-white shadow-sm rounded-xl px-4 text-xs font-bold text-slate-800 focus:outline-none border-none cursor-pointer"
              >
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing</option>
                <option value="People">People / HR</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-12 bg-white shadow-sm rounded-xl px-4 text-xs font-bold text-slate-800 focus:outline-none border-none cursor-pointer"
              >
                <option value="Active">Active (Public)</option>
                <option value="Internal Only">Internal Only</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="button"
              onClick={onClose}
              variant="ghost" 
              className="flex-1 h-12 rounded-xl text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-[#E31E24] hover:bg-[#C1181E] text-white font-black text-xs uppercase tracking-widest shadow-sm"
            >
              {loading ? 'Posting...' : 'Publish Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewJobModal;
