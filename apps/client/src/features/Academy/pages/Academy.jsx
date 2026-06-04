import React from 'react';
import { 
  IconSchool, 
  IconPlayerPlay, 
  IconCertificate, 
  IconBook,
  IconTrophy,
  IconUsers
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Academy = () => {
  const courses = [
    { id: 1, title: 'Company Culture & Values', duration: '45m', status: 'Mandatory', progress: 100 },
    { id: 2, title: 'Advanced Project Management', duration: '4h 20m', status: 'Ongoing', progress: 45 },
    { id: 3, title: 'Security Awareness 2026', duration: '1h 10m', status: 'Not Started', progress: 0 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f0f2f5] custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              WKN<span className="text-[#E31E24]"> Academy</span>
            </h2>
            <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-[0.3em] opacity-70">Knowledge Hub & Professional Development</p>
          </div>
          <div className="flex gap-4">
            <Button className="h-12 px-6 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-[5px_5px_15px_rgba(227,30,36,0.3)] hover:bg-[#C1181E] transition-all flex gap-3 items-center">
              <IconBook size={16} />
              Course Catalog
            </Button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Completed Courses" value="12" icon={<IconCertificate size={24} />} color="emerald" />
          <StatCard label="Ongoing Learning" value="3" icon={<IconPlayerPlay size={24} />} color="indigo" />
          <StatCard label="Total Certificates" value="8" icon={<IconTrophy size={24} />} color="amber" />
        </div>

        {/* Course List */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Active Learning Paths</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map(course => (
              <Card key={course.id} className="border-white border-[3px] shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] bg-[#f0f2f5] rounded-[2rem] p-6 flex items-center gap-6 group hover:scale-[1.01] transition-all">
                <div className="h-20 w-20 bg-[#f0f2f5] rounded-[1.5rem] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center text-[#E31E24]">
                  <IconSchool size={32} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{course.title}</h4>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase
                      ${course.status === 'Mandatory' ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400'}`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-[#f0f2f5] shadow-[inset_1px_1px_2px_#d1d9e6,inset_-1px_-1px_2px_#ffffff] rounded-full overflow-hidden">
                      <div className="h-full bg-[#E31E24] transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <span className="text-[9px] font-black text-slate-400">{course.progress}%</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{course.duration} TOTAL</span>
                    <Button variant="ghost" className="h-8 px-4 rounded-xl text-[9px] font-black uppercase text-[#E31E24] hover:bg-rose-50 flex gap-2">
                      <IconPlayerPlay size={12} />
                      {course.progress > 0 ? 'Resume' : 'Start'}
                    </Button>
                  </div>
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

export default Academy;
