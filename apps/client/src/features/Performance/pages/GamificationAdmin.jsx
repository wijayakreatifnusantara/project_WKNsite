import React, { useState, useEffect } from 'react';
import { 
  IconTrophy, 
  IconMedal,
  IconFlame,
  IconPlus,
  IconMinus,
  IconGift,
  IconSearch,
  IconInfoCircle
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GamificationAdmin = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustingUser, setAdjustingUser] = useState(null);
  const [bonusAmount, setBonusAmount] = useState(0);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/performance/leaderboard?limit=100', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setLeaderboard(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleAdjustBonus = async () => {
    if (!adjustingUser || bonusAmount === 0) return;
    try {
      const res = await fetch('http://localhost:8000/api/performance/gamification/bonus', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ employee_id: adjustingUser.id, bonus: parseInt(bonusAmount) })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAdjustingUser(null);
        setBonusAmount(0);
        fetchLeaderboard(); // Refresh
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeaderboard = leaderboard.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent custom-scrollbar animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              Gamification <span className="text-[#E31E24]">Control</span>
            </h2>
            <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-[0.3em] opacity-70">Rewards & Point Adjustment</p>
          </div>
        </header>

        {/* Top 3 Podium (Optional visually) */}
        
        <div className="flex gap-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-transparent border border-white/20 rounded-2xl shadow-neu-inset text-sm font-bold focus:outline-none focus:border-[#E31E24]/30 transition-all"
            />
          </div>
        </div>

        <Card className="bg-transparent border border-white/20 shadow-neu rounded-3xl overflow-hidden p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/20">
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Rank</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Employee</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Streak</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Base Points</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Bonus Points</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#E31E24]">Total Points</th>
                <th className="pb-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="py-8 text-center text-slate-400 text-sm font-bold">Loading leaderboard...</td></tr>
              ) : filteredLeaderboard.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-center text-slate-400 text-sm font-bold">No employees found.</td></tr>
              ) : (
                filteredLeaderboard.map((emp, index) => (
                  <tr key={emp.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-black text-slate-700">#{index + 1}</td>
                    <td className="py-4 px-4 flex items-center gap-3">
                      <img src={emp.avatar_url || `https://ui-avatars.com/api/?name=${emp.name}`} alt={emp.name} className="w-10 h-10 rounded-xl shadow-neu border border-white/20" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{emp.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{emp.department}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-orange-500 font-bold text-xs">
                        <IconFlame size={14} /> {emp.streak} Days
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-slate-600">{emp.base_points} pts</td>
                    <td className="py-4 px-4 text-xs font-bold text-emerald-600">{emp.bonus_points > 0 ? '+' : ''}{emp.bonus_points} pts</td>
                    <td className="py-4 px-4 text-sm font-black text-[#E31E24]">{emp.points} PTS</td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => setAdjustingUser(emp)}
                        className="h-8 px-4 rounded-xl bg-transparent border border-white/20 shadow-neu text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#E31E24] transition-all"
                      >
                        Adjust Bonus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Adjust Bonus Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-[#f0f2f5] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 rounded-3xl overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800 font-outfit uppercase tracking-tight">Adjust Bonus Points</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">For {adjustingUser.name}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-transparent shadow-neu-inset border border-white/20 flex items-center justify-center text-amber-500">
                  <IconGift size={24} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Point Adjustment (+ or -)</label>
                  <input 
                    type="number"
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value)}
                    className="w-full h-12 px-4 bg-transparent border border-white/20 rounded-xl shadow-neu-inset text-sm font-bold focus:outline-none focus:border-[#E31E24]/30 transition-all"
                  />
                </div>
                
                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <IconInfoCircle className="text-blue-500 mt-0.5 shrink-0" size={16} />
                  <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                    Points will be added to the employee's current bonus pool. Use negative values to deduct points.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setAdjustingUser(null); setBonusAmount(0); }}
                  className="flex-1 h-12 rounded-xl bg-transparent border border-white/20 shadow-neu text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-all active:shadow-neu-inset"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdjustBonus}
                  className="flex-1 h-12 rounded-xl bg-[#E31E24] shadow-[4px_4px_10px_rgba(227,30,36,0.3),-4px_-4px_10px_rgba(255,255,255,0.9)] text-xs font-black uppercase tracking-widest text-white hover:bg-red-700 transition-all active:shadow-inset"
                >
                  Apply Bonus
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GamificationAdmin;
