import React, { useState, useEffect } from 'react';
import { 
  IconX, 
  IconDeviceFloppy, 
  IconTrash, 
  IconCalendar,
  IconClock,
  IconInfoCircle,
  IconCheck
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

const AttendanceEditModal = ({ isOpen, onClose, employeeId, record, defaultDate, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    clock_in: '',
    clock_out: '',
    status: 'Present',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setFormData({
          date: record.date || '',
          clock_in: record.clock_in ? record.clock_in.substring(0, 5) : '',
          clock_out: record.clock_out ? record.clock_out.substring(0, 5) : '',
          status: record.status || 'Present',
          notes: record.notes || ''
        });
      } else {
        setFormData({
          date: defaultDate || new Date().toISOString().split('T')[0],
          clock_in: '08:00',
          clock_out: '17:00',
          status: 'Present',
          notes: ''
        });
      }
    }
  }, [isOpen, record, defaultDate]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const payload = {
        employee_id: employeeId,
        date: formData.date,
        clock_in: formData.clock_in || null,
        clock_out: formData.clock_out || null,
        status: formData.status,
        notes: formData.notes
      };

      let error;
      if (record && record.id) {
        // Update
        try {
          await apiClient.put(`/api/attendance/direct/${record.id}`, payload);
        } catch (e) {
          error = e;
        }
      } else {
        // Insert
        try {
          await apiClient.post('/api/attendance/direct', payload);
        } catch (e) {
          error = e;
        }
      }

      if (error) {
        // Handle duplicate date constraint if it exists
        if (error.code === '23505') {
           throw new Error('Attendance record for this date already exists. Please edit the existing record.');
        }
        throw error;
      }

      toast.success(record ? 'Attendance updated successfully' : 'Attendance created successfully');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving attendance:', err);
      toast.error(err.message || 'Failed to save attendance record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!record || !record.id) return;
    if (!window.confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) return;

    try {
      setDeleting(true);
      try {
        await apiClient.delete(`/api/attendance/direct/${record.id}`); // Assuming a delete endpoint exists or we'll create it
      } catch (e) {
        throw e;
      }

      toast.success('Attendance record deleted');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error deleting attendance:', err);
      toast.error('Failed to delete attendance record');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-slate-150 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${record ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <IconCalendar size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">
                {record ? 'Edit Attendance' : 'Add Attendance'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">
                {formData.date}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1">Date</label>
            <div className="relative">
              <IconCalendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input 
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                disabled={!!record}
                className={`w-full h-10 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24]/20 transition-all ${record ? 'cursor-not-allowed opacity-70' : ''}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1">Clock In</label>
              <div className="relative">
                <IconClock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input 
                  type="time"
                  name="clock_in"
                  value={formData.clock_in}
                  onChange={handleChange}
                  className="w-full h-10 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24]/20 transition-all uppercase"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1">Clock Out</label>
              <div className="relative">
                <IconClock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input 
                  type="time"
                  name="clock_out"
                  value={formData.clock_out}
                  onChange={handleChange}
                  className="w-full h-10 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24]/20 transition-all uppercase"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1">Status</label>
            <div className="relative">
              <IconCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full h-10 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24]/20 transition-all uppercase appearance-none"
              >
                <option value="Present">PRESENT</option>
                <option value="Late">LATE</option>
                <option value="Sick">SICK</option>
                <option value="Leave">LEAVE</option>
                <option value="Absent">ABSENT</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1">Notes</label>
            <div className="relative">
              <IconInfoCircle size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24]/20 transition-all resize-none"
                placeholder="Optional notes..."
              ></textarea>
            </div>
          </div>

        </div>

        <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            {record && (
              <Button 
                variant="outline"
                onClick={handleDelete}
                disabled={deleting || loading}
                className="h-10 px-4 rounded-xl border-rose-200 text-rose-600 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
              >
                {deleting ? 'Deleting...' : (
                  <>
                    <IconTrash size={14} className="mr-2" />
                    Delete
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="h-10 px-6 rounded-xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading || deleting}
              className="h-10 px-6 rounded-xl bg-[#E31E24] text-white font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-[#C1181E] flex gap-2 items-center"
            >
              <IconDeviceFloppy size={14} />
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceEditModal;
