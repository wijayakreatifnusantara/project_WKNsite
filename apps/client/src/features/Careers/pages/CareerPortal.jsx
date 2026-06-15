import React, { useState, useEffect } from 'react';
import { 
  IconBriefcase, 
  IconArrowRight,
  IconMapPin,
  IconBuilding,
  IconLoader2
} from "@tabler/icons-react";
import { useCareerPortal } from './hooks/useCareerPortal';
import ApplyModal from './components/ApplyModal';

const CareerPortal = () => {
  const { jobs, loading, fetchActiveJobs, submitApplication } = useCareerPortal();
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchActiveJobs();
  }, [fetchActiveJobs]);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col selection:bg-[#E31E24] selection:text-white">
      
      {/* Navigation */}
      <nav className="w-full p-6 lg:px-12 flex justify-between items-center border-b border-white/10  fixed top-0 z-40 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E31E24] rounded-xl flex items-center justify-center">
            <IconBuilding size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-outfit font-black text-xl leading-none uppercase tracking-tight">WKN<span className="text-[#E31E24]">site</span></h1>
            <p className="text-[11px] font-black tracking-[0.3em] uppercase text-slate-400 mt-0.5">Career Portal</p>
          </div>
        </div>
        <div className="hidden md:flex gap-6 text-xs font-black uppercase tracking-widest text-slate-400">
           <a href="#" className="hover:text-white transition-colors">About Us</a>
           <a href="#" className="hover:text-white transition-colors">Culture</a>
           <a href="#" className="text-white">Open Roles</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col pt-32">
        <div className="w-full max-w-5xl mx-auto px-6 lg:px-12 text-center py-20 relative">
          {/* Decorative Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E31E24] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 ">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-widest text-slate-300">We are hiring</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter mb-6 leading-[0.9]">
            Build The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31E24] to-rose-500">Future</span><br/>With Us.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl">
            Join Wijaya Kreatif Nusantara and be part of a team that crafts world-class digital experiences and innovative solutions.
          </p>
        </div>

        {/* Job Listings */}
        <div className="w-full bg-transparent rounded-t-[3rem] p-6 lg:p-12 md:px-24 xl:px-48 flex-1 border-t-8 border-[#E31E24] mt-10">
           <div className="max-w-4xl mx-auto">
             <div className="flex justify-between items-end mb-10">
               <div>
                 <h3 className="text-3xl font-black text-slate-900 font-outfit uppercase tracking-tight">Open Roles</h3>
                 <p className="text-slate-500 text-sm mt-1">Discover your next career opportunity.</p>
               </div>
               <div className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-4 py-2 rounded-xl">
                 {jobs.length} Positions
               </div>
             </div>

             {loading ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                 <IconLoader2 size={32} className="animate-spin mb-4 text-[#E31E24]" />
                 <p className="text-xs font-black uppercase tracking-widest">Loading Opportunities...</p>
               </div>
             ) : jobs.length === 0 ? (
               <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
                 <IconBriefcase size={48} className="mx-auto text-slate-300 mb-4" />
                 <p className="text-slate-500 font-bold">No active job postings at the moment.</p>
                 <p className="text-slate-400 text-sm mt-1">Please check back later.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 gap-4">
                 {jobs.map(job => (
                   <div 
                     key={job.id} 
                     className="group bg-slate-50 hover:bg-transparent border-2 border-slate-200 hover:border-[#E31E24]/30 rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between transition-all hover:shadow-sm"
                   >
                     <div className="mb-6 md:mb-0">
                       <div className="flex items-center gap-3 mb-3">
                         <span className="px-3 py-1 rounded-md bg-[#E31E24]/10 text-[#E31E24] text-xs font-black uppercase tracking-widest">
                           {job.department}
                         </span>
                         <span className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-widest">
                           <IconMapPin size={12} /> Jakarta Selatan
                         </span>
                       </div>
                       <h4 className="text-xl md:text-2xl font-black text-slate-800 font-outfit uppercase tracking-tight group-hover:text-[#E31E24] transition-colors">{job.title}</h4>
                     </div>
                     <button 
                       onClick={() => setSelectedJob(job)}
                       className="w-full md:w-auto h-12 px-8 rounded-xl bg-slate-900 hover:bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                     >
                       Apply Now
                       <IconArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </main>

      <ApplyModal 
        isOpen={!!selectedJob} 
        onClose={() => setSelectedJob(null)} 
        job={selectedJob} 
        submitApplication={submitApplication}
      />
    </div>
  );
};

export default CareerPortal;
