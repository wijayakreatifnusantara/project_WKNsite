import React, { useState, useEffect } from 'react';
import { 
  IconTrophy, 
  IconChartBar, 
  IconStar, 
  IconSearch,
  IconPlus,
  IconChevronRight,
  IconArrowUpRight,
  IconCalendarStats,
  IconUserCircle,
  IconTargetArrow,
  IconDownload,
  IconBell,
  IconAlertCircle,
  IconClock,
  IconSettings
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePerformance, getPerformanceBadge, exportToPDF } from './hooks/usePerformance';
import ReviewFormModal from './components/ReviewFormModal';
import PerformanceRadarChart from './components/PerformanceRadarChart';
import RiskGauge from './components/RiskGauge';
import KPIManagementModal from './components/KPIManagementModal';

const PerformanceHub = () => {
  const { reviews, fetchReviews, metrics, fetchMetrics, fetchBurnoutRisk, fetchPendingReviews, pendingReviews, loading, addMetric, updateMetric, deleteMetric } = usePerformance();
  const [searchQuery, setSearchQuery] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [burnoutData, setBurnoutData] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);



  useEffect(() => {
    fetchReviews();
    fetchMetrics();
    fetchPendingReviews();
  }, [fetchReviews, fetchMetrics, fetchPendingReviews]);

  useEffect(() => {
    if (selectedReview) {
      fetchBurnoutRisk(selectedReview.employee_id).then(setBurnoutData);
    } else {
      setBurnoutData(null);
    }
  }, [selectedReview, fetchBurnoutRisk]);


  const stats = [
    { label: 'Avg Performance', value: '4.2', icon: <IconStar size={20} />, color: 'amber' },
    { label: 'Reviews Done', value: reviews.length, icon: <IconChartBar size={20} />, color: 'indigo' },
    { label: 'Top Performer', value: 'Adianto', icon: <IconTrophy size={20} />, color: 'emerald' },
  ];

  const filteredReviews = reviews.filter(rev => 
    rev.employees?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rev.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportPDF = (review) => {
    const employeeName = review.employees?.name || 'Unknown';
    exportToPDF(review, employeeName, metrics);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              Performance <span className="text-[#E31E24]">Hub (KPI)</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-black uppercase tracking-[0.3em] opacity-70">Human Capital Excellence & Appraisals</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell (T020) */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-[#E31E24] transition-all relative"
              >
                <IconBell size={20} />
                {pendingReviews.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#E31E24] text-white text-xs font-black flex items-center justify-center shadow-sm">
                    {pendingReviews.length}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-16 w-80 bg-white rounded-2xl shadow-sm border-white border-3 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-200">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <IconAlertCircle size={14} className="text-[#E31E24]" />
                      Pending Reviews
                    </h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {pendingReviews.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">All reviews completed!</p>
                      </div>
                    ) : (
                      pendingReviews.map((employee, idx) => (
                        <div key={idx} className="p-4 flex items-center gap-3 border-b border-white/30 last:border-0 hover:bg-white/30 transition-colors">
                          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                            <IconUserCircle size={20} className="text-[#E31E24]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{employee.name}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{employee.id}</p>
                          </div>
                          <IconClock size={14} className="text-amber-500" />
                        </div>
                      ))
                    )}
                  </div>
                  {pendingReviews.length > 0 && (
                    <div className="p-3 border-t border-slate-200 bg-white/30">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                        {pendingReviews.length} employee(s) awaiting review
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => setIsReviewModalOpen(true)}
              className="h-12 px-6 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-sm hover:bg-[#C1181E] transition-all flex gap-3 items-center"
            >
              <IconPlus size={16} />
              New Appraisal
            </Button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-white border-[2px] shadow-sm bg-white rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center
                  ${stat.color === 'emerald' ? 'text-emerald-500' : stat.color === 'amber' ? 'text-amber-500' : 'text-indigo-500'}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-xl font-black text-slate-800 font-outfit">{stat.value}</h3>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recent Reviews */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Recent Appraisals</h3>
              <div className="relative group min-w-[240px]">
                <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#E31E24] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search Employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 bg-white shadow-sm border-none rounded-xl text-xs font-black text-slate-800 focus:outline-none placeholder:text-slate-300 uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredReviews.map(rev => (
                <ReviewCard 
                  key={rev.id} 
                  review={rev} 
                  onClick={() => setSelectedReview(rev)}
                  isActive={selectedReview?.id === rev.id}
                  onExport={handleExportPDF}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Visualization & Configuration */}
          <div className="space-y-8">
            {selectedReview ? (
              <Card className="border-white border-[3px] shadow-sm bg-white rounded-2xl p-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.25em] flex items-center gap-2 mb-1">
                      <IconChartBar size={16} className="text-[#E31E24]" />
                      Competency Analysis
                    </h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{selectedReview.employees?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Export PDF Button (T019) */}
                    <button 
                      onClick={() => handleExportPDF(selectedReview)}
                      className="h-10 px-4 rounded-xl bg-white shadow-sm flex items-center gap-2 text-[11px] font-black text-[#E31E24] uppercase tracking-widest hover:text-[#C1181E] transition-all"
                    >
                      <IconDownload size={14} />
                      Export PDF
                    </button>
                    <button onClick={() => setSelectedReview(null)} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-[#E31E24] transition-colors">Reset</button>
                  </div>
                </div>
                
                <PerformanceRadarChart 
                  data={metrics.map(m => ({
                    subject: m.name.split(' ')[0],
                    score: selectedReview.scores[m.id] || 0
                  }))} 
                />

                <div className="mt-8 space-y-4">
                  {metrics.map(metric => (
                    <div key={metric.id} className="flex justify-between items-center px-4 py-3 rounded-xl bg-white/40 border border-slate-200">
                      <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{metric.name}</span>
                      <span className="text-xs font-black text-slate-800">{selectedReview.scores[metric.id] || 0}</span>
                    </div>
                  ))}
                </div>

                {/* AI Burnout Predictor Section */}
                {burnoutData && (
                  <div className="mt-10 pt-10 border-t-4 border-slate-200 space-y-6">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.25em] flex items-center gap-2">
                      <IconActivity size={16} className="text-[#E31E24]" />
                      AI Wellness Monitor
                    </h3>
                    
                    <RiskGauge 
                      score={burnoutData.risk_score} 
                      level={burnoutData.level} 
                      color={burnoutData.color} 
                    />

                    <div className="space-y-4">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Contributing Factors</p>
                      {burnoutData.factors.map((f, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white shadow-sm border-white border-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-black text-slate-700 uppercase">{f.factor}</span>
                            <span className={`text-[11px] font-black uppercase ${f.impact === 'High' || f.impact === 'Critical' ? 'text-rose-500' : 'text-amber-500'}`}>
                              {f.impact} Impact
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-bold leading-relaxed">{f.desc}</p>
                        </div>
                      ))}
                    </div>

                    {burnoutData.level === 'High' && (
                      <div className="p-5 rounded-xl bg-rose-50 border-2 border-white shadow-sm">
                        <p className="text-xs font-black text-rose-600 uppercase tracking-tight mb-2">AI Recommendation</p>
                        <p className="text-xs text-rose-500 font-bold leading-relaxed">
                          Sistem mendeteksi risiko kejenuhan tinggi. Direkomendasikan untuk memberikan istirahat (Wellness Leave) selama 1-2 hari atau melakukan sesi konseling 1-on-1 segera.
                        </p>
                      </div>
                    )}

                    {/* 360 Feedback Enhancement */}
                    <div className="mt-10 pt-10 border-t-4 border-slate-200 space-y-6">
                       <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.25em] flex items-center gap-2">
                          <IconUsers size={16} className="text-[#E31E24]" />
                          360° Multi-Source Feedback
                       </h3>
                       <div className="grid grid-cols-2 gap-4">
                          <FeedbackBubble label="Peers" score="4.5" count={4} />
                          <FeedbackBubble label="Subordinates" score="4.2" count={2} />
                          <FeedbackBubble label="Clients" score="4.8" count={12} />
                          <FeedbackBubble label="Cross-Dept" score="4.0" count={3} />
                       </div>
                    </div>
                  </div>
                )}
              </Card>


            ) : (
              <>
                <Card className="border-white border-[3px] shadow-sm bg-white rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.25em] flex items-center gap-2">
                    <IconTargetArrow size={16} className="text-[#E31E24]" />
                    KPI Metrics & Weights
                  </h3>
                  <button 
                    onClick={() => setIsKpiModalOpen(true)}
                    className="h-8 px-3 rounded-xl bg-white shadow-sm flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-[#E31E24] transition-all"
                  >
                    <IconSettings size={14} />
                    Kelola Master KPI
                  </button>
                </div>
              <div className="space-y-4">
                {metrics.map(metric => (
                  <div key={metric.id} className="flex flex-col gap-1">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{metric.name}</span>
                      <span className="text-xs font-black text-[#E31E24] uppercase tracking-widest">{(metric.weight * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white shadow-sm rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#E31E24] shadow-sm rounded-full transition-all duration-1000" 
                        style={{ width: `${metric.weight * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-white border-[3px] shadow-sm bg-white rounded-2xl p-6">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
                <IconTrophy size={16} className="text-amber-500" />
                Performance Leaderboard
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-slate-200">
                    <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-xs font-black text-slate-400">
                      #{i}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Karyawan {i}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Score: 4.8</p>
                    </div>
                    <IconArrowUpRight size={14} className="text-emerald-500" />
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
        </div>
      </div>

      <ReviewFormModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        onSuccess={() => fetchReviews()} 
        metrics={metrics}
      />

      <KPIManagementModal
        isOpen={isKpiModalOpen}
        onClose={() => setIsKpiModalOpen(false)}
        metrics={metrics}
        addMetric={addMetric}
        updateMetric={updateMetric}
        deleteMetric={deleteMetric}
      />
    </div>
  );
};

const ReviewCard = ({ review, onClick, isActive, onExport }) => {
  const badge = getPerformanceBadge(review.total_score);

  return (
    <Card 
      onClick={onClick}
      className={`border-white border-[3px] shadow-sm bg-white rounded-xl p-5 group hover:scale-[1.01] transition-all cursor-pointer
        ${isActive ? 'ring-2 ring-[#E31E24] shadow-sm' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <IconUserCircle size={24} className="text-[#E31E24]" />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{review.employees?.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <IconCalendarStats size={12} className="text-slate-300" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{review.period}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Performance Badge (T018) */}
          <div className={`px-3 py-2 rounded-xl ${badge.bgColor} ${badge.borderColor} border-2 text-center min-w-[60px]`}>
            <span className={`text-lg font-black ${badge.textColor}`}>{badge.grade}</span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</span>
            <div className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${badge.bgColor} ${badge.textColor}`}>
              {review.total_score} / 5.0
            </div>
          </div>
          
          {/* Export Button */}
          {onExport && (
            <button 
              onClick={(e) => { e.stopPropagation(); onExport(review); }}
              className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-[#E31E24] transition-all"
              data-tooltip="Export to PDF"
            >
              <IconDownload size={18} />
            </button>
          )}
          
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-[#E31E24] transition-all">
            <IconChevronRight size={18} />
          </div>
        </div>
      </div>
    </Card>
  );
};

const FeedbackBubble = ({ label, score, count }) => (
  <div className="p-4 rounded-2xl bg-white shadow-sm border-white border-2 flex flex-col items-center gap-1">
    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
    <span className="text-sm font-black text-slate-800">{score}</span>
    <span className="text-[11px] font-bold text-[#E31E24] uppercase">{count} Responses</span>
  </div>
);

export default PerformanceHub;

