import React, { useState, useEffect } from 'react';
import { 
  IconClock, 
  IconUser, 
  IconCalendar,
  IconX,
  IconCheck,
  IconNote
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { apiClient } from '@/lib/apiClient';


const ManualAttendanceModal = ({ isOpen, onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    clock_in: '08:00',
    clock_out: '17:00',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    // We can fetch via our apiClient employees endpoint, or directly use the generic one if available
    try {
      const response = await apiClient.get('/employees');
      // map only active employees if needed or assume backend filters
      const data = response.data.data.filter(e => !e.is_resigned && e["Status *"] !== "RESIGNED");
      setEmployees(data || []);
    } catch (e) {
      console.error(e);
      setEmployees([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/attendance/direct', {
        ...formData,
        is_manual: true,
        created_at: new Date().toISOString()
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving manual attendance:", err);
      alert("Failed to save attendance");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#f0f2f5] border-white border-[4px] shadow-neu rounded-[2.5rem] p-8 relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-2xl bg-[#f0f2f5] shadow-neu text-slate-400 hover:text-[#E31E24] transition-all"
        >
          <IconX size={20} />
        </button>

        <div className="mb-8">
          <h3 className="text-xl font-black text-slate-800 font-outfit uppercase tracking-tight flex items-center gap-3">
            <IconClock size={24} className="text-[#E31E24]" />
            Manual Attendance
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Administrative Correction Override</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Employee Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <IconUser size={12} />
              Select Personnel
            </label>
            <select 
              required
              value={formData.employee_id}
              onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
              className="w-full h-12 px-4 bg-[#f0f2f5] shadow-neu border-none rounded-xl text-xs font-bold text-slate-700 focus:outline-none appearance-none"
            >
              <option value="">Choose Employee...</option>
              {employees.map(emp => (
                <option key={emp.id || emp["EMPLOYEE ID"]} value={emp.id || emp["EMPLOYEE ID"]}>{emp.name || emp["EMPLOYEE NAME"]} ({emp.id || emp["EMPLOYEE ID"]})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <IconCalendar size={12} />
                Date
              </label>
              <input 
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full h-12 px-4 bg-[#f0f2f5] shadow-neu border-none rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              />
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <IconCheck size={12} />
                Status
              </label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full h-12 px-4 bg-[#f0f2f5] shadow-neu border-none rounded-xl text-xs font-bold text-slate-700 focus:outline-none appearance-none"
              >
                <option>Present</option>
                <option>Late</option>
                <option>Sick</option>
                <option>Leave</option>
                <option>Absent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Clock In */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                Clock In
              </label>
              <input 
                type="time"
                value={formData.clock_in}
                onChange={(e) => setFormData({...formData, clock_in: e.target.value})}
                className="w-full h-12 px-4 bg-[#f0f2f5] shadow-neu border-none rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              />
            </div>
            {/* Clock Out */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                Clock Out
              </label>
              <input 
                type="time"
                value={formData.clock_out}
                onChange={(e) => setFormData({...formData, clock_out: e.target.value})}
                className="w-full h-12 px-4 bg-[#f0f2f5] shadow-neu border-none rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <IconNote size={12} />
              Reason / Notes
            </label>
            <textarea 
              placeholder="Why is this manual entry being made?"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full h-24 p-4 bg-[#f0f2f5] shadow-neu border-none rounded-xl text-xs font-bold text-slate-700 focus:outline-none resize-none placeholder:text-slate-300"
            />
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-4 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-[0.2em] shadow-neu hover:bg-[#C1181E] transition-all flex gap-3 items-center justify-center"
          >
            {loading ? 'Processing...' : 'Authorize Manual Entry'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ManualAttendanceModal;
