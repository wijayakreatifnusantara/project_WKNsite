import React from 'react';
import { 
  IconUserPlus, 
  IconBriefcase, 
  IconUsers, 
  IconFileSearch,
  IconCalendarEvent,
  IconArrowRight
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Recruitment = () => {
  const jobs = [
    { id: 1, title: 'Senior Software Engineer', dept: 'Engineering', applicants: 24, status: 'Active' },
    { id: 2, title: 'Project Manager', dept: 'Operations', applicants: 12, status: 'Active' },
    { id: 3, title: 'HR Generalist', dept: 'People', applicants: 8, status: 'Internal Only' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f0f2f5] custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              Talent <span className="text-[#E31E24]">Acquisition</span>
            </h2>
            <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-[0.3em] opacity-70">Applicant Tracking & Recruitment Pipeline</p>
          </div>
          <Button className="h-12 px-6 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-[5px_5px_15px_rgba(227,30,36,0.3)] hover:bg-[#C1181E] transition-all flex gap-3 items-center">
            <IconUserPlus size={16} />
            Post New Job
          </Button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Open Positions" value="5" icon={<IconBriefcase size={24} />} color="indigo" />
          <StatCard label="Total Applicants" value="142" icon={<IconUsers size={24} />} color="emerald" />
          <StatCard label="Interviews Today" value="4" icon={<IconCalendarEvent size={24} />} color="amber" />
        </div>

        {/* Job Openings */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Active Vacancies</h3>
          <div className="grid grid-cols-1 gap-4">
            {jobs.map(job => (
              <Card key={job.id} className="border-white border-[3px] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] bg-[#f0f2f5] rounded-[1.5rem] p-6 flex items-center justify-between group hover:shadow-none transition-all">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 bg-[#f0f2f5] rounded-xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-[#E31E24]">
                    <IconBriefcase size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{job.title}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{job.dept}</p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Applicants</p>
                    <p className="text-sm font-black text-slate-700">{job.applicants}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest
                    ${job.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {job.status}
                  </div>
                  <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] border-white border-2 text-slate-400 hover:text-[#E31E24] p-0 flex items-center justify-center">
                    <IconArrowRight size={20} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <Card className="border-white border-[2px] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] bg-[#f0f2f5] rounded-[1.5rem] p-6">
    <div className="flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center
        ${color === 'emerald' ? 'text-emerald-500' : color === 'indigo' ? 'text-indigo-500' : 'text-amber-500'}`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-xl font-black text-slate-800 font-outfit">{value}</h3>
      </div>
    </div>
  </Card>
);

export default Recruitment;
