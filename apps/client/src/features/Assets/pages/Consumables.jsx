import React from 'react';
import { 
  IconBox, 
  IconPackage, 
  IconShoppingCart, 
  IconAlertTriangle,
  IconArrowRight,
  IconPlus,
  IconQrcode
} from "@tabler/icons-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Consumables = () => {
  const [inventory, setInventory] = React.useState([]);

  React.useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/assets/consumables', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        });
        const data = await res.json();
        setInventory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInventory();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              Office <span className="text-[#E31E24]">Consumables</span>
            </h2>
            <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-[0.3em] opacity-70">Supply Chain & Inventory Management</p>
          </div>
          <div className="flex gap-4">
            <Button className="h-12 px-6 rounded-2xl bg-[#f0f2f5] shadow-neu text-slate-600 font-black text-xs uppercase tracking-widest hover:text-[#E31E24] hover:shadow-none transition-all flex gap-3 items-center border-2 border-white">
              <IconQrcode size={16} />
              Scan QR Checkout
            </Button>
            <Button className="h-12 px-6 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-neu hover:bg-[#C1181E] transition-all flex gap-3 items-center">
              <IconPlus size={16} />
              Restock Item
            </Button>
          </div>

        </header>

        {/* Inventory Table */}
        <Card className="border-white border-[3px] shadow-neu bg-[#f0f2f5] rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Item Name</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Stock</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Minimum Threshold</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} className="border-b border-white/30 hover:bg-white/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-[#f0f2f5] shadow-neu rounded-xl flex items-center justify-center text-[#E31E24]">
                        <IconPackage size={20} />
                      </div>
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-slate-800">{item.stock} <span className="text-[9px] text-slate-400 uppercase">{item.unit}</span></span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-400">{item.threshold} {item.unit}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border
                      ${item.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <Button variant="ghost" className="h-10 px-4 rounded-xl text-[9px] font-black uppercase text-[#E31E24] hover:bg-rose-50 flex gap-2">
                      <IconPlus size={14} />
                      Request
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

export default Consumables;
