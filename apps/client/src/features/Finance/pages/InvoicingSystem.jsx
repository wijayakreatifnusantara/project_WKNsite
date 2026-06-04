import React, { useState, useMemo } from 'react';
import { 
  IconFileInvoice, 
  IconPlus, 
  IconTrash, 
  IconDownload, 
  IconPrinter, 
  IconSend,
  IconChevronDown,
  IconCreditCard,
  IconCalendarTime,
  IconChecks
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const InvoicingSystem = () => {
  const [items, setItems] = useState([
    { id: 1, description: 'Creative Design Service', qty: 1, rate: 5000000, tax: 11 },
    { id: 2, description: 'Web Development Phase 1', qty: 1, rate: 12500000, tax: 11 }
  ]);

  const [invoiceDetails, setInvoiceDetails] = useState({
    client: 'PT. Wijaya Kusuma',
    dueDate: '2026-05-15',
    invoiceNo: 'INV-2026-0089',
    status: 'Unpaid'
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
              <div className="h-10 w-10 bg-white shadow-md rounded-xl flex items-center justify-center text-blue-500 border border-white">
                <IconFileInvoice size={20} />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-800 font-outfit tracking-tight leading-none uppercase">Invoicing Engine</h1>
                <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mt-1 opacity-70">Finance & Billing Management</p>
              </div>
            </div>
          </header>

          {/* Billing Configuration Card */}
          <Card className="border-white border-2 shadow-sm bg-[#f0f2f5] rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Due Date & Terms</label>
                <div className="relative group">
                  <div className="w-full h-10 bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] rounded-xl flex items-center px-4 text-slate-700 font-bold text-[11px]">
                    <IconCalendarTime size={16} className="mr-2 text-slate-400" />
                    <input 
                      type="date"
                      value={invoiceDetails.dueDate}
                      onChange={(e) => setInvoiceDetails({...invoiceDetails, dueDate: e.target.value})}
                      className="bg-transparent border-none focus:outline-none w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Payment Instruction</label>
                <div className="w-full h-10 bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] rounded-xl flex items-center px-4 text-slate-700 font-black text-[9px] tracking-wider">
                  <IconCreditCard size={16} className="mr-2 text-blue-500 shrink-0" />
                  BCA 123-456-7890 (WKN SITE)
                </div>
              </div>
            </div>
          </Card>

          {/* Invoice Items Card */}
          <Card className="border-white border-2 shadow-sm bg-[#f0f2f5] rounded-xl p-5 flex flex-col max-h-[450px]">
            <div className="space-y-4 flex flex-col h-full">
              <div className="flex justify-between items-center px-1 shrink-0">
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Billable Items</h3>
                <Button 
                  onClick={addItem}
                  className="h-8 px-4 rounded-lg bg-blue-500 text-white font-black text-[8px] uppercase tracking-widest shadow-md hover:bg-blue-600 transition-all flex gap-1.5"
                >
                  <IconPlus size={12} /> Add Line Item
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                {items.map((item, idx) => (
                  <div key={item.id} className="flex gap-3 items-end">
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
                      <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest pl-1">Rate</label>
                      <input 
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full h-10 bg-[#f0f2f5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] border-none rounded-lg px-3 text-[11px] font-bold text-slate-700 focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Invoice Preview */}
        <div className="w-full lg:w-[380px] space-y-4">
          <header className="flex justify-between items-center h-10 px-1">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Official Invoice</h3>
            <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shadow-sm ${invoiceDetails.status === 'Unpaid' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
              {invoiceDetails.status}
            </div>
          </header>

          <div className="bg-white shadow-xl rounded-xl p-6 min-h-[550px] flex flex-col border-[6px] border-[#f8f9fa] relative ring-1 ring-slate-200 overflow-hidden">
            <div className="absolute -left-10 -bottom-10 h-32 w-32 bg-blue-50 rounded-full blur-3xl opacity-40"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-start mb-6 leading-none">
                <div>
                  <h2 className="text-xl font-black text-slate-900 font-outfit uppercase">Invoice</h2>
                  <p className="text-[7px] font-black text-blue-500 tracking-widest mt-1">NO: {invoiceDetails.invoiceNo}</p>
                </div>
                <img src="/assets/wkn_logo.png" alt="WKN" className="h-8 w-auto grayscale opacity-80" />
              </div>

              {/* Status & Date */}
              <div className="bg-slate-50 rounded-xl p-3 mb-6 flex justify-between items-center border border-slate-100">
                <div>
                  <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Date Issued</p>
                  <p className="text-[9px] font-black text-slate-800">May 02, 2026</p>
                </div>
                <div className="text-right">
                  <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Due Date</p>
                  <p className="text-[9px] font-black text-red-500">{invoiceDetails.dueDate}</p>
                </div>
              </div>

              {/* Items */}
              <div className="flex-1 space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <div>
                      <p className="text-[9px] font-black text-slate-800 leading-tight">{item.description || 'Consultancy Service'}</p>
                      <p className="text-[7px] text-slate-400 font-bold">{item.qty} Unit(s)</p>
                    </div>
                    <p className="text-[9px] font-black text-slate-800">{formatCurrency(item.qty * item.rate)}</p>
                  </div>
                ))}
              </div>

              {/* Totals Section */}
              <div className="mt-6 bg-slate-900 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10">
                  <IconChecks size={60} />
                </div>
                <div className="space-y-1 relative z-10">
                  <div className="flex justify-between items-center opacity-60">
                    <span className="text-[8px] font-black uppercase tracking-widest">Tax (PPN 11%)</span>
                    <span className="text-[10px] font-bold">{formatCurrency(totals.taxTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Total Amount</span>
                    <span className="text-lg font-black">{formatCurrency(totals.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button className="h-10 bg-white border border-slate-200 text-slate-700 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-slate-50">
                  <IconDownload size={14} className="mr-1.5" /> Download
                </Button>
                <Button className="h-10 bg-blue-500 text-white rounded-lg font-black text-[9px] uppercase tracking-widest shadow-md shadow-blue-500/20 hover:bg-blue-600">
                  <IconSend size={14} className="mr-1.5" /> Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicingSystem;
