import React, { useState } from 'react';
import { IconX, IconSend, IconLink, IconUser, IconMail, IconPhone } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const ApplyModal = ({ isOpen, onClose, job, submitApplication }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resume_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !job) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await submitApplication({
      job_id: job.id,
      ...formData
    });
    
    setLoading(false);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ name: '', email: '', phone: '', resume_url: '' });
        onClose();
      }, 3000);
    } else {
      alert("Terjadi kesalahan: " + result.error);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-10 text-center animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconSend size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 font-outfit uppercase tracking-tight mb-2">Application Sent!</h2>
          <p className="text-slate-500 text-sm">Thank you for applying to <strong>{job.title}</strong>. Our HR team will review your profile shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 bg-slate-900 relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
            <IconX size={24} />
          </button>
          <div className="inline-block px-3 py-1 rounded-full bg-[#E31E24]/20 border border-[#E31E24]/30 text-[#E31E24] text-[10px] font-black uppercase tracking-widest mb-4">
            {job.department}
          </div>
          <h2 className="text-2xl font-black text-white font-outfit uppercase tracking-tight">{job.title}</h2>
          <p className="text-slate-400 text-xs mt-2">Submit your details to apply for this position.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <IconUser size={14} /> Full Name
            </label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31E24]/50 border border-slate-200"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <IconMail size={14} /> Email Address
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31E24]/50 border border-slate-200"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <IconPhone size={14} /> Phone Number
              </label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+62 812..."
                className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31E24]/50 border border-slate-200"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <IconLink size={14} /> Resume / CV Link
            </label>
            <input 
              type="url" 
              name="resume_url"
              value={formData.resume_url}
              onChange={handleChange}
              placeholder="Link to Google Drive, LinkedIn, etc."
              className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E31E24]/50 border border-slate-200"
              required
            />
            <p className="text-[9px] text-slate-400 mt-1">Make sure the link is publicly accessible.</p>
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl bg-[#E31E24] hover:bg-[#C1181E] text-white font-black text-[11px] uppercase tracking-widest shadow-[0_8px_20px_rgba(227,30,36,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Submitting...' : (
                <>Submit Application <IconSend size={16} /></>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
