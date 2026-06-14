import React, { useState, useEffect } from 'react';
import { 
  IconHistory, 
  IconX, 
  IconArrowRight,
  IconCalendarEvent,
  IconUser
} from "@tabler/icons-react";
import { useAssets } from '../hooks/useAssets';

const AssetHistoryModal = ({ isOpen, asset, onClose }) => {
  const { fetchAssetHistory } = useAssets();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && asset) {
      setLoading(true);
      fetchAssetHistory(asset.id).then(data => {
        setHistory(data || []);
        setLoading(false);
      });
    }
  }, [isOpen, asset, fetchAssetHistory]);

  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#f0f2f5] w-full max-w-2xl rounded-[2.5rem] shadow-neu border-white border-[6px] overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-8 border-b border-white/50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-800 font-outfit uppercase tracking-tight">Assignment <span className="text-[#E31E24]">History</span></h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lifecycle Audit Log: {asset.name}</p>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-xl bg-[#f0f2f5] shadow-neu flex items-center justify-center text-slate-400 hover:text-[#E31E24] transition-all">
              <IconX size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-6">
              {history.map((log, i) => (
                <div key={log.id} className="relative flex gap-6 group">
                  {/* Timeline Line */}
                  {i !== history.length - 1 && (
                    <div className="absolute left-[23px] top-10 bottom-[-24px] w-[2px] bg-slate-200"></div>
                  )}
                  
                  {/* Icon Node */}
                  <div className="h-12 w-12 rounded-2xl bg-[#f0f2f5] shadow-neu flex items-center justify-center shrink-0 z-10 border-white border-2">
                    <IconHistory size={20} className={log.return_date ? 'text-slate-400' : 'text-emerald-500 animate-pulse'} />
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 p-5 rounded-2xl bg-[#f0f2f5] shadow-neu border-white border-2">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <IconUser size={14} className="text-[#E31E24]" />
                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{log.employees?.name}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-60">({log.employee_id})</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-neu
                        ${log.return_date ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'}`}>
                        {log.return_date ? 'Completed' : 'Active'}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned</span>
                        <div className="flex items-center gap-1.5">
                          <IconCalendarEvent size={12} className="text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-600">{new Date(log.assigned_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {log.return_date && (
                        <>
                          <IconArrowRight size={14} className="text-slate-300" />
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Returned</span>
                            <div className="flex items-center gap-1.5">
                              <IconCalendarEvent size={12} className="text-slate-300" />
                              <span className="text-[10px] font-bold text-slate-600">{new Date(log.return_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {log.notes && (
                      <div className="mt-3 pt-3 border-t border-white/30">
                        <p className="text-[9px] text-slate-500 italic">"{log.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 opacity-30">
              <IconHistory size={48} className="text-slate-300 mb-3" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">No assignment history found for this asset.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetHistoryModal;
