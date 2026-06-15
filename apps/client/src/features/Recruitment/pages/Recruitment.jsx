import React, { useState, useEffect } from 'react';
import { 
  IconUserPlus, 
  IconBriefcase, 
  IconUsers, 
  IconFileSearch,
  IconCalendarEvent,
  IconArrowRight,
  IconLoader2
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRecruitment } from './hooks/useRecruitment';
import NewJobModal from './components/NewJobModal';

const Recruitment = () => {
  const { jobs, stats, loading, fetchJobs, createJob } = useRecruitment();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              Talent <span className="text-[#E31E24]">Acquisition</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-black uppercase tracking-[0.3em] opacity-70">Applicant Tracking & Recruitment Pipeline</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-12 px-6 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-sm hover:bg-[#C1181E] transition-all flex gap-3 items-center"
          >
            <IconUserPlus size={16} />
            Post New Job
          </Button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Open Positions" value={stats.openPositions} icon={<IconBriefcase size={24} />} color="indigo" />
          <StatCard label="Total Applicants" value={stats.totalApplicants} icon={<IconUsers size={24} />} color="emerald" />
          <StatCard label="Interviews Ongoing" value={stats.interviewsToday} icon={<IconCalendarEvent size={24} />} color="amber" />
        </div>

        {/* Job Openings */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Active Vacancies</h3>
             {loading && <IconLoader2 size={14} className="text-slate-400 animate-spin" />}
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {jobs.length === 0 && !loading ? (
               <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-white rounded-xl">
                 No active job postings. Click "Post New Job" to start.
               </div>
            ) : (
              jobs.map(job => (
                <Card key={job.id} className="border-white border-[3px] shadow-sm bg-white rounded-xl p-6 flex items-center justify-between group hover:shadow-none transition-all">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#E31E24]">
                      <IconBriefcase size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{job.title}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{job.dept}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-center">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Applicants</p>
                      <p className="text-sm font-black text-slate-700">{job.applicants}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest
                      ${job.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {job.status}
                    </div>
                    <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-white shadow-sm border-white border-2 text-slate-400 hover:text-[#E31E24] p-0 flex items-center justify-center">
                      <IconArrowRight size={20} />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <NewJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        createJob={createJob}
        onSuccess={() => fetchJobs()} 
      />
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <Card className="border-white border-[2px] shadow-sm bg-white rounded-xl p-6">
    <div className="flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center
        ${color === 'emerald' ? 'text-emerald-500' : color === 'indigo' ? 'text-indigo-500' : 'text-amber-500'}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-xl font-black text-slate-800 font-outfit">{value}</h3>
      </div>
    </div>
  </Card>
);

export default Recruitment;
