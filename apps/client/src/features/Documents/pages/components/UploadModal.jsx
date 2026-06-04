import React, { useState } from 'react';
import { 
  IconUpload, 
  IconX, 
  IconFileText, 
  IconTag,
  IconUserCircle
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useDocuments } from '../hooks/useDocuments';

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const { uploadDocument, loading } = useDocuments();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Misc',
    description: '',
    employee_id: '',
    is_private: false
  });
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('description', formData.description);
    if (formData.employee_id) data.append('employee_id', formData.employee_id);
    data.append('is_private', formData.is_private);

    try {
      await uploadDocument(data);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#f0f2f5] w-full max-w-lg rounded-[2.5rem] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] border-white border-[6px] overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-800 font-outfit uppercase tracking-tight">Upload <span className="text-[#E31E24]">Document</span></h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Add New Resource to Registry</p>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-xl bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] flex items-center justify-center text-slate-400 hover:text-[#E31E24] transition-all">
              <IconX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Dropzone */}
            <div className="relative group">
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`h-32 rounded-2xl bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex flex-col items-center justify-center border-2 border-dashed ${file ? 'border-[#E31E24]' : 'border-slate-200'} transition-all`}>
                <IconUpload size={24} className={file ? 'text-[#E31E24]' : 'text-slate-300'} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                  {file ? file.name : 'Drag & Drop or Click to Select'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Name</label>
              <div className="h-12 px-4 rounded-2xl bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex items-center gap-3">
                <IconFileText size={18} className="text-[#E31E24]" />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Employee Contract v2"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-transparent border-none text-slate-800 font-bold text-xs w-full focus:outline-none placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <div className="h-12 px-4 rounded-2xl bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex items-center gap-3">
                  <IconTag size={18} className="text-[#E31E24]" />
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="bg-transparent border-none text-slate-800 font-bold text-xs w-full focus:outline-none appearance-none"
                  >
                    <option value="Contract">Contract</option>
                    <option value="Policy">Policy</option>
                    <option value="Employee">Employee File</option>
                    <option value="Finance">Finance</option>
                    <option value="Misc">Misc</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Link Employee ID</label>
                <div className="h-12 px-4 rounded-2xl bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex items-center gap-3">
                  <IconUserCircle size={18} className="text-[#E31E24]" />
                  <input 
                    type="text" 
                    placeholder="e.g. WKN-001"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    className="bg-transparent border-none text-slate-800 font-bold text-xs w-full focus:outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">Private Document</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Restricted to Administrators only</span>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, is_private: !formData.is_private})}
                className={`w-12 h-6 rounded-full transition-all flex items-center px-1 shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]
                  ${formData.is_private ? 'bg-[#E31E24]' : 'bg-slate-200'}`}
              >
                <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${formData.is_private ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>


            <div className="pt-4 flex gap-4">
              <Button 
                type="button" 
                onClick={onClose}
                className="flex-1 h-14 rounded-2xl bg-[#f0f2f5] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] text-slate-600 font-black text-xs uppercase tracking-widest hover:shadow-none transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loading || !file}
                className="flex-1 h-14 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-[5px_5px_15px_rgba(227,30,36,0.3)] hover:bg-[#C1181E] transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Upload File'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
