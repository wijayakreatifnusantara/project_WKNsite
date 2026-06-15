import React from 'react';
import { 
  IconClipboardCheck, 
  IconMessageDots, 
  IconChartBar, 
  IconArrowRight,
  IconStar,
  IconClock
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Surveys = () => {
  const [activeSurveys, setActiveSurveys] = React.useState([]);

  React.useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/company/surveys', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        });
        const data = await res.json();
        setActiveSurveys(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSurveys();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              Voice of <span className="text-[#E31E24]">Personnel</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-black uppercase tracking-[0.3em] opacity-70">Engagement Surveys & Feedback Loop</p>
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-2xl bg-white shadow-sm border-white border-2 text-slate-600 font-black text-xs uppercase tracking-widest hover:shadow-none transition-all flex gap-3 items-center">
            <IconChartBar size={16} />
            Analytics Portal
          </Button>
        </header>

        {/* Engagement Highlight */}
        <Card className="bg-white border-white border-[4px] shadow-sm rounded-[2.5rem] p-10 flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <IconStar size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">WKN Engagement Score</h3>
            </div>
            <p className="text-slate-400 text-xs max-w-md">Your feedback drives corporate evolution. We are currently at 88% overall satisfaction based on recent internal polls.</p>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(i => <IconStar key={i} size={20} className={i <= 4 ? "text-amber-400 fill-amber-400" : "text-slate-200"} />)}
            </div>
          </div>
          <div className="h-32 w-32 rounded-full border-[10px] border-[#f0f2f5] shadow-sm flex flex-col items-center justify-center bg-white/20">
             <span className="text-3xl font-black text-emerald-500 font-outfit">8.8</span>
             <span className="text-[11px] font-black text-slate-400 uppercase">Excellent</span>
          </div>
        </Card>

        {/* Active Surveys */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">Available Surveys</h3>
          <div className="grid grid-cols-1 gap-4">
            {activeSurveys.map(sv => (
              <Card key={sv.id} className="border-white border-[3px] shadow-sm bg-white rounded-2xl p-6 flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#E31E24]">
                    <IconClipboardCheck size={28} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{sv.title}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sv.questions} Questions • {sv.duration} ESTIMATED</p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                   <div className="text-right flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest border mb-1
                        ${sv.status === 'Required' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        {sv.status}
                      </span>
                      <div className="flex items-center gap-2 text-slate-400">
                        <IconClock size={12} />
                        <span className="text-[11px] font-black uppercase">Expires: {sv.deadline}</span>
                      </div>
                   </div>
                   <Button className="h-12 px-6 rounded-xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-sm hover:bg-[#C1181E] transition-all flex gap-3 items-center">
                     Take Survey
                     <IconArrowRight size={14} />
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

export default Surveys;
