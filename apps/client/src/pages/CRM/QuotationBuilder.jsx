import React, { useState, useMemo } from 'react';
import { 
  IconSignature, 
  IconPlus, 
  IconTrash, 
  IconDownload, 
  IconPrinter, 
  IconSend,
  IconChevronDown,
  IconFileInvoice,
  IconBuilding
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const QuotationBuilder = () => {
  const [items, setItems] = useState([
    { id: 1, description: 'Creative Design Service', qty: 1, rate: 5000000, tax: 11 },
    { id: 2, description: 'Web Development Phase 1', qty: 1, rate: 12500000, tax: 11 }
  ]);

  const [clientInfo, setClientInfo] = useState({
    name: 'PT. Wijaya Kusuma',
    address: 'Jl. Sudirman No. 45, Jakarta Selatan',
    email: 'finance@wijayakusuma.co.id'
  });

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', qty: 1, rate: 0, tax: 11 }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.qty * item.rate * (item.tax / 100)), 0);
    return {
      subtotal,
      taxTotal,
      grandTotal: subtotal + taxTotal
    };
  }, [items]);

  const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#f0f2f5] custom-scrollbar animate-fade-in">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-4">
        
        {/* Editor Side */}
        <div className="flex-1 space-y-4">
          <header className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white shadow-md rounded-xl flex items-center justify-center text-[#E31E24] border border-white">
                <IconSignature size={20} />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-800 font-outfit tracking-tight leading-none uppercase">Quotation Builder</h1>
                <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mt-1 opacity-70">Revenue Generation Engine v1.0</p>
              </div>
            </div>
          </header>

          {/* Client Selection Card */}
          <Card className="border-white border-2 shadow-sm bg-[#f0f2f5] rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Select Client Portfolio</label>
                <div className="relative group">
                  <div className="w-full h-10 bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] rounded-xl flex items-center px-4 text-slate-700 font-bold cursor-pointer group-hover:text-[#E31E24] transition-all text-[11px]">
                    <IconBuilding size={16} className="mr-2 text-slate-400" />
                    {clientInfo.name}
                    <IconChevronDown size={14} className="ml-auto text-slate-300" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Quotation Reference</label>
                <div className="w-full h-10 bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] rounded-xl flex items-center px-4 text-slate-400 font-black tracking-widest text-[10px]">
                  QTN-2026-0502-001
                </div>
              </div>
            </div>
          </Card>

          {/* Line Items Card */}
          <Card className="border-white border-2 shadow-sm bg-[#f0f2f5] rounded-xl p-5 flex flex-col max-h-[500px]">
            <div className="space-y-4 flex flex-col h-full">
              <div className="flex justify-between items-center px-1 shrink-0">
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Service Line Items</h3>
                <Button 
                  onClick={addItem}
                  className="h-8 px-4 rounded-lg bg-green-500 text-white font-black text-[8px] uppercase tracking-widest shadow-md hover:bg-green-600 transition-all flex gap-1.5"
                >
                  <IconPlus size={12} /> Add Item
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {items.map((item, idx) => (
                  <div key={item.id} className="flex gap-3 items-end animate-in slide-in-from-left duration-300">
                    <div className="flex-1 space-y-1">
                      <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                      <input 
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full h-10 bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] border-none rounded-lg px-3 text-[11px] font-bold text-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="w-16 space-y-1">
                      <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest pl-1">Qty</label>
                      <input 
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                        className="w-full h-10 bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] border-none rounded-lg px-2 text-[11px] font-bold text-slate-700 text-center focus:outline-none"
                      />
                    </div>
                    <div className="w-32 space-y-1">
                      <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest pl-1">Rate (IDR)</label>
                      <input 
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full h-10 bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] border-none rounded-lg px-3 text-[11px] font-bold text-slate-700 focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="h-10 w-10 flex items-center justify-center text-red-300 hover:text-red-500 transition-colors"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Preview Side */}
        <div className="w-full lg:w-[380px] space-y-4">
          <header className="flex justify-between items-center h-10 px-1">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Document Preview</h3>
            <div className="flex gap-2">
              <button className="h-8 w-8 flex items-center justify-center bg-white shadow-sm rounded-lg text-slate-400 hover:text-blue-500 transition-all"><IconDownload size={14} /></button>
              <button className="h-8 w-8 flex items-center justify-center bg-white shadow-sm rounded-lg text-slate-400 hover:text-slate-800 transition-all"><IconPrinter size={14} /></button>
            </div>
          </header>

          <div className="bg-white shadow-xl rounded-xl p-6 min-h-[500px] flex flex-col border-[4px] border-[#f8f9fa] relative overflow-hidden ring-1 ring-slate-200">
            {/* Watermark Decoration */}
            <div className="absolute -right-20 -top-20 h-40 w-40 bg-red-50 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <img src="/assets/wkn_logo.png" alt="WKN" className="h-8 w-auto grayscale opacity-80" />
                <div className="text-right leading-none">
                  <h2 className="text-lg font-black text-slate-800 font-outfit uppercase">Quotation</h2>
                  <p className="text-[6px] font-black text-slate-300 tracking-[0.3em] uppercase mt-1">Private & Confidential</p>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-4 mb-6 border-b border-slate-50 pb-6">
                <div>
                  <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1">From</p>
                  <p className="text-[9px] font-black text-slate-800">Wijaya Kreatif Nusantara</p>
                  <p className="text-[8px] text-slate-400 font-medium leading-tight mt-0.5">Gedung WKN Lt. 5, Kuningan<br/>Jakarta Selatan, 12940</p>
                </div>
                <div className="text-right">
                  <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1">To</p>
                  <p className="text-[9px] font-black text-slate-800">{clientInfo.name}</p>
                  <p className="text-[8px] text-slate-400 font-medium leading-tight mt-0.5">{clientInfo.address}</p>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-2 text-[7px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="py-2 text-[7px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map(item => (
                      <tr key={item.id}>
                        <td className="py-3">
                          <p className="text-[9px] font-black text-slate-700 leading-tight">{item.description || 'New Service'}</p>
                          <p className="text-[7px] text-slate-400 font-bold mt-0.5">{item.qty} x {formatCurrency(item.rate)}</p>
                        </td>
                        <td className="py-3 text-right text-[9px] font-black text-slate-700">
                          {formatCurrency(item.qty * item.rate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-6 space-y-2 pt-4 border-t-2 border-slate-50">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                  <span className="text-[10px] font-black text-slate-600">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PPN (11%)</span>
                  <span className="text-[10px] font-black text-slate-600">{formatCurrency(totals.taxTotal)}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900 text-white rounded-xl p-3 mt-2 shadow-lg">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em]">Grand Total</span>
                  <span className="text-sm font-black">{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-3">Digitally Signed & Validated</p>
                <Button className="w-full h-10 bg-[#E31E24] text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex gap-2">
                  <IconSend size={14} /> Finalize & Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationBuilder;
