import React from 'react';
import { 
  IconBook, 
  IconSearch, 
  IconFileText, 
  IconShieldCheck,
  IconClock,
  IconChevronRight,
  IconCircleCheck
} from "@tabler/icons-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Wiki = () => {
  const articles = [
    { id: 1, title: 'Employee Onboarding SOP', category: 'HR Policy', lastUpdate: '2 days ago' },
    { id: 2, title: 'IT Security Best Practices', category: 'Technology', lastUpdate: '1 week ago' },
    { id: 3, title: 'Leave & Attendance Policy', category: 'Operations', lastUpdate: '3 hours ago' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 font-outfit tracking-tight uppercase">
              WKN<span className="text-ios-primary"> Handbook</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest opacity-70">Corporate SOPs & Knowledge Base</p>
          </div>
          <div className="h-12 w-64 px-4 bg-white shadow-sm border-white border-2 rounded-2xl flex items-center gap-3">
            <IconSearch size={16} className="text-slate-400" />
            <input 
              placeholder="SEARCH SOP..." 
              className="bg-transparent border-none text-xs font-bold uppercase tracking-widest text-slate-700 w-full focus:outline-none focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20 transition-all"
            />
          </div>
        </header>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <WikiLink label="HR Policies" count="12 Articles" icon={<IconFileText size={24} />} color="indigo" />
          <WikiLink label="IT Security" count="5 Articles" icon={<IconShieldCheck size={24} />} color="emerald" />
          <WikiLink label="Operational SOP" count="18 Articles" icon={<IconBook size={24} />} color="rose" />
        </div>

        {/* Recent Articles */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Recently Updated Articles</h3>
          <div className="grid grid-cols-1 gap-4">
            {articles.map(art => (
              <Card key={art.id} className="border-white border-[3px] shadow-sm bg-white rounded-xl p-6 flex items-center justify-between group hover:scale-[1.005] transition-all cursor-pointer relative overflow-hidden">
                {art.id === 1 && (
                  <div className="absolute top-0 left-0 h-1 w-full bg-ios-primary shadow-sm"></div>
                )}
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-ios-primary">
                    <IconFileText size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{art.title}</h4>
                      {art.id === 1 && (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-500 text-[11px] font-semibold uppercase tracking-widest border border-rose-100">Mandatory</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{art.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right flex items-center gap-2 text-slate-400">
                    <IconClock size={12} />
                    <span className="text-xs font-bold uppercase">{art.lastUpdate}</span>
                  </div>
                  {art.id === 1 ? (
                    <Button className="h-10 px-6 rounded-xl bg-ios-primary text-white text-[11px] font-semibold uppercase tracking-widest shadow-sm hover:bg-ios-primary/90 transition-all">
                       Confirm Read
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-500">
                       <IconCircleCheck size={16} />
                       <span className="text-[11px] font-semibold uppercase">Read</span>
                    </div>
                  )}
                  <IconChevronRight size={18} className="text-slate-300 group-hover:text-ios-primary transition-all" />
                </div>
              </Card>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
};

const WikiLink = ({ label, count, icon, color }) => (
  <Card className="border-white border-[2px] shadow-sm bg-white rounded-xl p-6 group cursor-pointer hover:shadow-none transition-all">
    <div className={`h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4
      ${color === 'indigo' ? 'text-indigo-500' : color === 'emerald' ? 'text-emerald-500' : 'text-rose-500'}`}>
      {icon}
    </div>
    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{label}</h4>
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{count}</p>
  </Card>
);

export default Wiki;
