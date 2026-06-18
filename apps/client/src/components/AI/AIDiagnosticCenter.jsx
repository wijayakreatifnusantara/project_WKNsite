import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  IconShieldCheck, 
  IconAlertTriangle, 
  IconCircleCheck, 
  IconActivity, 
  IconRotate, 
  IconSearch, 
  IconDatabase, 
  IconBrain,
  IconArrowRight,
  IconInfoCircle,
  IconX
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AIDiagnosticCenter = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/diagnostics/data');
      setData(response.data.data);
    } catch (error) {
      console.error('Error running AI diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredIssues = data?.issues.filter(issue => 
    activeFilter === 'all' || issue.severity === activeFilter
  ) || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-6xl h-[90vh] bg-[#f0f2f5] shadow-sm rounded-[3rem] overflow-hidden flex flex-col border-[8px] border-white animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="h-16 bg-transparent border-b border-white/20/80 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-ios-primary shrink-0">
              <IconBrain size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 font-outfit uppercase tracking-tight leading-none">AI Diagnostic Center</h1>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Intelligent Data Integrity Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={runDiagnostics}
              className="h-9 px-4 flex items-center gap-2 bg-slate-50 border border-white/20/80 rounded-xl text-slate-600 font-bold text-xs uppercase tracking-wider hover:text-ios-primary hover:bg-red-50/50 hover:border-ios-primary/20 transition-all active:scale-95"
              disabled={loading}
            >
              <IconRotate size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Analyzing...' : 'Deep Scan Now'}
            </button>
            <button 
              onClick={onClose}
              className="h-9 w-9 flex items-center justify-center bg-slate-50 border border-white/20/80 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50/50 hover:border-red-200 transition-all"
            >
              <IconX size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="grid grid-cols-12 gap-10">
            
            {/* Left: Score & Recommendations */}
            <div className="col-span-4 space-y-10">
              {/* Health Score Gauge */}
              <div className="bg-[#f0f2f5] shadow-sm rounded-[3rem] p-10 border-4 border-white flex flex-col items-center text-center">
                <div className="relative h-48 w-48 flex items-center justify-center mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="white"
                      strokeWidth="16"
                      fill="transparent"
                      className="opacity-20"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke={data?.health_score > 80 ? '#22c55e' : data?.health_score > 50 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="16"
                      strokeDasharray={502.6}
                      strokeDashoffset={502.6 - (502.6 * (data?.health_score || 0)) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-slate-800">{data?.health_score || 0}%</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Health Score</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800 uppercase">
                    {data?.health_score > 90 ? 'Excellent' : data?.health_score > 70 ? 'Optimal' : 'Needs Review'}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed px-4">
                    Based on {data?.stats.total_records || 0} employee records scanned.
                  </p>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-[#f0f2f5] shadow-sm rounded-[2.5rem] p-8 border-4 border-white">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <IconInfoCircle size={18} className="text-ios-primary" />
                  AI Intelligence Insights
                </h4>
                <div className="space-y-4">
                  {data?.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3 items-start p-4 bg-[#f0f2f5] shadow-sm rounded-2xl">
                      <IconArrowRight size={14} className="text-ios-primary mt-1 shrink-0" />
                      <p className="text-[11px] font-semibold text-slate-600 leading-relaxed italic">"{rec}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Issues List */}
            <div className="col-span-8 space-y-8">
              {/* Severity Filters */}
              <div className="flex items-center gap-4 bg-[#f0f2f5] shadow-sm p-2 rounded-2xl border-2 border-white w-fit">
                {['all', 'critical', 'high', 'medium', 'low'].map(s => (
                  <button
                    key={s}
                    onClick={() => setActiveFilter(s)}
                    className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeFilter === s ? 'bg-ios-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {s} ({s === 'all' ? data?.issues.length : data?.stats.severity_counts[s] || 0})
                  </button>
                ))}
              </div>

              {/* Issues Scroll Area */}
              <div className="space-y-6">
                {loading ? (
                  <div className="py-20 text-center flex flex-col items-center gap-4 opacity-50">
                    <IconActivity size={48} className="text-ios-primary animate-pulse" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI is scanning database neurons...</p>
                  </div>
                ) : filteredIssues.length > 0 ? (
                  filteredIssues.map((issue, i) => (
                    <div 
                      key={i} 
                      className="group bg-[#f0f2f5] shadow-sm rounded-[2rem] p-8 border-4 border-white flex gap-6 hover:translate-x-2 transition-all"
                    >
                      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        issue.severity === 'critical' ? 'text-red-500' : 
                        issue.severity === 'high' ? 'text-orange-500' : 
                        'text-blue-500'
                      }`}>
                        <IconAlertTriangle size={32} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{issue.message}</h5>
                          <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest text-white shadow-sm ${
                            issue.severity === 'critical' ? 'bg-red-500' : 
                            issue.severity === 'high' ? 'bg-orange-500' : 
                            'bg-blue-500'
                          }`}>
                            {issue.severity} Severity
                          </span>
                        </div>
                        <div className="flex items-center gap-6 mt-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Source Entity</p>
                            <p className="text-xs font-bold text-slate-600">{issue.employee_name} ({issue.employee_id})</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suggested Fix</p>
                            <p className="text-xs font-bold text-ios-primary">{issue.suggestion}</p>
                          </div>
                        </div>
                      </div>
                      <button className="self-center h-12 px-6 rounded-2xl bg-transparent shadow-sm text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-ios-primary hover:text-white transition-all">
                        Auto-Repair
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center flex flex-col items-center gap-4 bg-[#f0f2f5] shadow-sm rounded-[3rem] border-4 border-white">
                    <IconCircleCheck size={48} className="text-green-500" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">No data anomalies detected</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDiagnosticCenter;
