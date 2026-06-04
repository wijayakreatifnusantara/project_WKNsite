import React from 'react';
import { 
  IconReceipt, 
  IconPlus, 
  IconClock, 
  IconCheck, 
  IconX,
  IconArrowRight,
  IconWallet
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Expenses = () => {
  const claims = [
    { id: 1, title: 'Transport to Client site', category: 'Travel', amount: 'Rp 150.000', status: 'Approved', date: 'May 04' },
    { id: 2, title: 'Team Dinner', category: 'Meals', amount: 'Rp 450.000', status: 'Pending', date: 'May 05' },
    { id: 3, title: 'AWS Cloud Hosting', category: 'Technical', amount: 'Rp 1.200.000', status: 'Review', date: 'May 01' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f0f2f5] custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              Expense <span className="text-[#E31E24]">Claims</span>
            </h2>
            <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-[0.3em] opacity-70">Reimbursement Management & Disbursements</p>
          </div>
          <Button className="h-12 px-6 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-[5px_5px_15px_rgba(227,30,36,0.3)] hover:bg-[#C1181E] transition-all flex gap-3 items-center">
            <IconPlus size={16} />
            Submit Claim
          </Button>
        </header>

        {/* Balance Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-[#E31E24] rounded-[2.5rem] p-8 text-white shadow-[10px_10px_30px_rgba(227,30,36,0.2)] relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Approved this Month</p>
              <h3 className="text-4xl font-black font-outfit mt-2">Rp 2.450.000</h3>
              <div className="mt-8 flex gap-4">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-[9px] font-black uppercase">5 Claims Paid</div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-[9px] font-black uppercase">2 In Queue</div>
              </div>
            </div>
            <IconWallet size={120} className="absolute -bottom-6 -right-6 text-white/10 rotate-12 group-hover:scale-110 transition-all duration-500" />
          </Card>
          
          <div className="grid grid-cols-2 gap-6">
            <StatCard label="Pending Approval" value="2" icon={<IconClock size={20} />} color="amber" />
            <StatCard label="Rejected" value="0" icon={<IconX size={20} />} color="rose" />
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Recent Reimbursements</h3>
          <div className="grid grid-cols-1 gap-4">
            {claims.map(claim => (
              <Card key={claim.id} className="border-white border-[3px] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] bg-[#f0f2f5] rounded-[2rem] p-6 flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 bg-[#f0f2f5] rounded-2xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-[#E31E24]">
                    <IconReceipt size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{claim.title}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{claim.category} • {claim.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <p className="text-lg font-black text-slate-700 font-outfit">{claim.amount}</p>
                  <div className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest
                    ${claim.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {claim.status}
                  </div>
                  <Button variant="ghost" className="h-10 w-10 rounded-xl bg-[#f0f2f5] shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] border-white border-2 text-slate-300 hover:text-[#E31E24] p-0 flex items-center justify-center">
                    <IconArrowRight size={16} />
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
  <Card className="border-white border-[2px] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] bg-[#f0f2f5] rounded-[1.5rem] p-6 flex flex-col justify-center items-center gap-3">
    <div className={`h-10 w-10 rounded-xl bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center
      ${color === 'amber' ? 'text-amber-500' : 'text-rose-500'}`}>
      {icon}
    </div>
    <div className="text-center">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <h3 className="text-xl font-black text-slate-800 font-outfit leading-none">{value}</h3>
    </div>
  </Card>
);

export default Expenses;
