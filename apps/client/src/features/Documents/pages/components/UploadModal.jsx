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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm  animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-sm border-white border-[6px] overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-outfit uppercase tracking-tight">Upload <span className="text-ios-primary">Document</span></h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Add New Resource to Registry</p>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-ios-primary transition-all">
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
              <div className={`h-32 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center border-2 border-dashed ${file ? 'border-ios-primary' : 'border-slate-200'} transition-all`}>
                <IconUpload size={24} className={file ? 'text-ios-primary' : 'text-slate-300'} />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">
                  {file ? file.name : 'Drag & Drop or Click to Select'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Document Name</label>
              <div className="h-12 px-4 rounded-2xl bg-white shadow-sm flex items-center gap-3">
                <IconFileText size={18} className="text-ios-primary" />
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
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                <div className="h-12 px-4 rounded-2xl bg-white shadow-sm flex items-center gap-3">
                  <IconTag size={18} className="text-ios-primary" />
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
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Link Employee ID</label>
                <div className="h-12 px-4 rounded-2xl bg-white shadow-sm flex items-center gap-3">
                  <IconUserCircle size={18} className="text-ios-primary" />
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
                <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Private Document</span>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Restricted to Administrators only</span>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, is_private: !formData.is_private})}
                className={`w-12 h-6 rounded-full transition-all flex items-center px-1 shadow-sm
                  ${formData.is_private ? 'bg-ios-primary' : 'bg-slate-200'}`}
              >
                <div className={`h-4 w-4 rounded-full bg-transparent shadow-sm transition-transform ${formData.is_private ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
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
                disabled={loading || !file}
                className="flex-1 h-14 rounded-2xl bg-ios-primary text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-ios-primary/90 transition-all disabled:opacity-50"
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
