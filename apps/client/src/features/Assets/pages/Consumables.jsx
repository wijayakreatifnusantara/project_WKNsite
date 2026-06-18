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
            <h2 className="text-2xl font-bold text-slate-800 font-outfit tracking-tight uppercase">
              Office <span className="text-ios-primary">Consumables</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest opacity-70">Supply Chain & Inventory Management</p>
          </div>
          <div className="flex gap-4">
            <Button className="h-12 px-6 rounded-2xl bg-white shadow-sm text-slate-600 font-bold text-xs uppercase tracking-widest hover:text-ios-primary hover:shadow-none transition-all flex gap-3 items-center border-2 border-white">
              <IconQrcode size={16} />
              Scan QR Checkout
            </Button>
            <Button className="h-12 px-6 rounded-2xl bg-ios-primary text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-ios-primary/90 transition-all flex gap-3 items-center">
              <IconPlus size={16} />
              Restock Item
            </Button>
          </div>

        </header>

        {/* Inventory Table */}
        <Card className="border-white border-[3px] shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar w-full">
<table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Item Name</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Current Stock</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Minimum Threshold</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} className="border-b border-white/30 hover:bg-white/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-ios-primary">
                        <IconPackage size={20} />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-tight">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-800">{item.stock} <span className="text-xs text-slate-400 uppercase">{item.unit}</span></span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-400">{item.threshold} {item.unit}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border
                      ${item.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <Button variant="ghost" className="h-10 px-4 rounded-xl text-xs font-bold uppercase text-ios-primary hover:bg-rose-50 flex gap-2">
                      <IconPlus size={14} />
                      Request
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        </Card>
      </div>
    </div>
  );
};

export default Consumables;
