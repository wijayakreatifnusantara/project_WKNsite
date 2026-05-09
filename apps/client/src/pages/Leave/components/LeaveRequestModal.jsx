import React, { useState, useEffect } from 'react';
import { 
  IconCalendar, 
  IconFileDescription, 
  IconClipboardCheck,
  IconX,
  IconUpload,
  IconInfoCircle,
  IconClock
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const LeaveRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: 'Annual',
    start_date: '',
    end_date: '',
    reason: '',
    employee_id: profile?.employee_id || ''
  });

  const [daysCount, setDaysCount] = useState(0);

  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      let count = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) count++;
      }
      setDaysCount(count);
    }
  }, [formData.start_date, formData.end_date]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('leave_requests')
        .insert([{
          ...formData,
          days_count: daysCount,
          status: 'Pending',
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success("Leave request submitted successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">
                Apply for <span className="text-[#E31E24]">Leave</span>
              </h2>
              <p className="text-[7px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Personnel Absence Authorization</p>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#E31E24] transition-all">
              <IconX size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1">Leave Type</label>
                <div className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 focus-within:border-[#E31E24]/30 transition-all">
                  <IconClipboardCheck size={14} className="text-[#E31E24]" />
                  <select 
                    value={formData.leave_type}
                    onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                    className="bg-transparent border-none text-slate-800 font-black text-[9px] w-full focus:outline-none appearance-none uppercase"
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1">Attachment</label>
                <button type="button" className="h-10 w-full px-3 rounded-xl bg-white border border-slate-200 border-dashed flex items-center justify-center gap-2 text-slate-400 font-black text-[8px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                  <IconUpload size={14} />
                  Upload Doc
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                <div className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 focus-within:border-[#E31E24]/30 transition-all">
                  <IconCalendar size={14} className="text-[#E31E24]" />
                  <input 
                    type="date" 
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="bg-transparent border-none text-slate-800 font-black text-[9px] w-full focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                <div className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 focus-within:border-[#E31E24]/30 transition-all">
                  <IconCalendar size={14} className="text-[#E31E24]" />
                  <input 
                    type="date" 
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="bg-transparent border-none text-slate-800 font-black text-[9px] w-full focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason / Justification</label>
              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 focus-within:border-[#E31E24]/30 transition-all">
                <IconFileDescription size={14} className="text-[#E31E24] mt-0.5" />
                <textarea 
                  rows="2"
                  placeholder="Describe your reason..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="bg-transparent border-none text-slate-800 font-black text-[9px] w-full focus:outline-none resize-none placeholder:text-slate-300"
                />
              </div>
            </div>

            {daysCount > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 p-2 px-3 rounded-lg flex items-center gap-2">
                    <IconClock size={14} className="text-emerald-500" />
                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                      Total Duration: {daysCount} Working Days
                    </p>
                </div>
            )}

            <div className="pt-2 flex gap-3">
              <Button 
                type="button" 
                onClick={onClose}
                variant="ghost"
                className="flex-1 h-10 rounded-xl text-slate-400 font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loading}
                className="flex-1 h-10 rounded-xl bg-[#E31E24] text-white font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-[#C1181E] transition-all disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestModal;
