import React, { useState } from 'react';
import { 
  IconUserCircle, 
  IconX, 
  IconCheck,
  IconCalendarEvent,
  IconMessageDots,
  IconStar
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { usePerformance } from '../hooks/usePerformance';

const ReviewFormModal = ({ isOpen, onClose, onSuccess, metrics }) => {
  const { submitReview, loading } = usePerformance();
  const [formData, setFormData] = useState({
    employee_id: '',
    period: '2026-Q1',
    feedback: '',
    reviewer_id: 'adianto@wijayakn.com' // Default reviewer
  });
  const [scores, setScores] = useState({});

  if (!isOpen) return null;

  const handleScoreChange = (metricId, value) => {
    setScores(prev => ({ ...prev, [metricId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitReview({
        ...formData,
        scores
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#f0f2f5] w-full max-w-2xl rounded-[2.5rem] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] border-white border-[6px] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-white/50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-800 font-outfit uppercase tracking-tight">Performance <span className="text-[#E31E24]">Appraisal</span></h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Employee Competency Review</p>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-xl bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] flex items-center justify-center text-slate-400 hover:text-[#E31E24] transition-all">
              <IconX size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar space-y-8">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
              <div className="h-12 px-4 rounded-2xl bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex items-center gap-3">
                <IconUserCircle size={18} className="text-[#E31E24]" />
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
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Review Period</label>
              <div className="h-12 px-4 rounded-2xl bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex items-center gap-3">
                <IconCalendarEvent size={18} className="text-[#E31E24]" />
                <select 
                  value={formData.period}
                  onChange={(e) => setFormData({...formData, period: e.target.value})}
                  className="bg-transparent border-none text-slate-800 font-bold text-xs w-full focus:outline-none appearance-none"
                >
                  <option value="2026-Q1">2026 Q1 Appraisal</option>
                  <option value="2026-M05">2026 May Monthly</option>
                  <option value="2026-Annual">2026 Annual Review</option>
                </select>
              </div>
            </div>
          </div>

          {/* KPI Scores */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.25em] flex items-center gap-2">
              <IconStar size={16} className="text-amber-500" />
              Competency Scoring (1 - 5)
            </h3>
            
            <div className="space-y-6">
              {metrics.map(metric => (
                <div key={metric.id} className="p-5 rounded-2xl bg-white/40 border border-white/50 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{metric.name}</h4>
                      <p className="text-[9px] text-slate-400 italic mt-0.5">{metric.description}</p>
                    </div>
                    <span className="text-[10px] font-black text-[#E31E24] uppercase tracking-widest">Weight: {(metric.weight * 100).toFixed(0)}%</span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleScoreChange(metric.id, num)}
                        className={`flex-1 h-10 rounded-xl text-[11px] font-black transition-all
                          ${scores[metric.id] === num 
                            ? 'bg-[#E31E24] text-white shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)] scale-105' 
                            : 'bg-[#f0f2f5] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] text-slate-400 hover:text-slate-600'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Qualitative Feedback */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Manager Feedback & Comments</label>
            <div className="p-4 rounded-2xl bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex items-start gap-3">
              <IconMessageDots size={18} className="text-[#E31E24] mt-1" />
              <textarea 
                rows={3}
                placeholder="Provide detailed comments on performance, strengths, and areas for growth..."
                value={formData.feedback}
                onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                className="bg-transparent border-none text-slate-800 font-bold text-xs w-full focus:outline-none placeholder:text-slate-300 resize-none"
              ></textarea>
            </div>
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
              disabled={loading || Object.keys(scores).length < metrics.length}
              className="flex-1 h-14 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-[5px_5px_15px_rgba(227,30,36,0.3)] hover:bg-[#C1181E] transition-all disabled:opacity-50 flex gap-2 items-center justify-center"
            >
              {loading ? 'Processing...' : (
                <>
                  <IconCheck size={18} />
                  Submit Appraisal
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewFormModal;
