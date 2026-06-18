import React, { useState, useEffect, useMemo } from 'react';
import { 
  IconSignature, 
  IconPlus, 
  IconTrash, 
  IconDownload, 
  IconPrinter, 
  IconSend,
  IconChevronDown,
  IconBuilding,
  IconSettings,
  IconPhoto,
  IconLoader2
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuotations } from './hooks/useQuotations';

const QuotationBuilder = () => {
  const { clients, loading, fetchClients, saveQuotation } = useQuotations();
  
  const [items, setItems] = useState([]);
  
  const [selectedClient, setSelectedClient] = useState('');
  const [taxRate, setTaxRate] = useState(0); // Default 0% (Non-PKP)
  const [isSaving, setIsSaving] = useState(false);
  const [refNumber] = useState(`QTN-${new Date().getFullYear()}-${Math.floor(Math.random()*10000).toString().padStart(4, '0')}`);

  // Editable Letterhead Settings
  const [letterhead, setLetterhead] = useState({
    logoUrl: '/assets/wkn_logo.png', // Default
    companyName: 'Wijaya Kreatif Nusantara',
    address: 'Gedung WKN Lt. 5, Kuningan\nJakarta Selatan, 12940'
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const activeClient = clients.find(c => c.id === selectedClient) || { name: 'Select Client...', address: '', email: '' };

  const addItem = () => setItems([...items, { id: Date.now(), description: '', qty: 1, rate: 0 }]);
  const removeItem = (id) => setItems(items.filter(item => item.id !== id));
  const updateItem = (id, field, value) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const taxTotal = subtotal * (taxRate / 100);
    return { subtotal, taxTotal, grandTotal: subtotal + taxTotal };
  }, [items, taxRate]);

  const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const handleSave = async () => {
    if (!selectedClient) return alert('Silakan pilih klien terlebih dahulu!');
    if (items.length === 0) return alert('Item penawaran tidak boleh kosong!');
    
    setIsSaving(true);
    const result = await saveQuotation({
      reference_number: refNumber,
      client_id: selectedClient,
      subtotal: totals.subtotal,
      tax_rate: taxRate,
      tax_total: totals.taxTotal,
      grand_total: totals.grandTotal
    }, items);
    
    setIsSaving(false);
    
    if (result.success) {
      alert('Quotation berhasil disimpan sebagai Draft!');
    } else {
      alert('Gagal menyimpan: ' + result.error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-transparent custom-scrollbar animate-fade-in print:bg-transparent print:p-0">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-4 print:block print:max-w-none">
        
        {/* Editor Side (Hidden during print) */}
        <div className="flex-1 space-y-4 print:hidden">
          <header className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-transparent shadow-sm rounded-xl flex items-center justify-center text-ios-primary border border-white">
                <IconSignature size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 font-outfit tracking-tight leading-none uppercase">Quotation Builder</h1>
                <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mt-1 opacity-70">Revenue Generation Engine</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowSettings(!showSettings)}
              variant="outline" 
              className="h-8 rounded-lg bg-transparent shadow-sm border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest flex gap-2"
            >
              <IconSettings size={14} /> Letterhead
            </Button>
          </header>

          {/* Settings Panel */}
          {showSettings && (
            <Card className="border-white border-2 shadow-sm bg-transparent rounded-xl p-5 animate-in slide-in-from-top-4 duration-300">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                <IconPhoto size={14} className="text-ios-primary"/> Edit Letterhead
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Logo URL (Kosongkan untuk pakai teks)</label>
                  <input type="text" value={letterhead.logoUrl} onChange={e => setLetterhead({...letterhead, logoUrl: e.target.value})} className="w-full h-8 bg-white shadow-sm border-none rounded-lg px-2 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Company Name</label>
                  <input type="text" value={letterhead.companyName} onChange={e => setLetterhead({...letterhead, companyName: e.target.value})} className="w-full h-8 bg-white shadow-sm border-none rounded-lg px-2 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Address / Contact Info</label>
                  <textarea value={letterhead.address} onChange={e => setLetterhead({...letterhead, address: e.target.value})} className="w-full h-16 bg-white shadow-sm border-none rounded-lg p-2 text-xs" />
                </div>
              </div>
            </Card>
          )}

          {/* Client Selection Card */}
          <Card className="border-white border-2 shadow-sm bg-white rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Select Client</label>
                <div className="relative">
                  <select 
                    value={selectedClient} 
                    onChange={e => setSelectedClient(e.target.value)}
                    className="w-full h-10 bg-white shadow-sm rounded-xl px-4 text-slate-700 font-bold cursor-pointer transition-all text-[11px] appearance-none focus:outline-none"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <IconChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Tax Rate (PPN)</label>
                <div className="relative">
                  <select 
                    value={taxRate} 
                    onChange={e => setTaxRate(Number(e.target.value))}
                    className="w-full h-10 bg-white shadow-sm rounded-xl px-4 text-ios-primary font-bold cursor-pointer transition-all text-[11px] appearance-none focus:outline-none"
                  >
                    <option value={0}>0% (Non-PKP Default)</option>
                    <option value={11}>11% (Standar Lama)</option>
                    <option value={12}>12% (Standar Baru)</option>
                  </select>
                  <IconChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </Card>

          {/* Line Items Card */}
          <Card className="border-white border-2 shadow-sm bg-white rounded-xl p-5 flex flex-col max-h-[400px]">
            <div className="space-y-4 flex flex-col h-full">
              <div className="flex justify-between items-center px-1 shrink-0">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Service Line Items</h3>
                <Button onClick={addItem} className="h-8 px-4 rounded-lg bg-green-500 text-white font-bold text-[11px] uppercase tracking-widest shadow-sm hover:bg-green-600 transition-all flex gap-1.5">
                  <IconPlus size={12} /> Add Item
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-end animate-in slide-in-from-left duration-300">
                    <div className="flex-1 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Description</label>
                      <input 
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full h-10 bg-white shadow-sm border-none rounded-lg px-3 text-[11px] font-semibold text-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="w-16 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Qty</label>
                      <input 
                        type="number" value={item.qty}
                        onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                        className="w-full h-10 bg-white shadow-sm border-none rounded-lg px-2 text-[11px] font-semibold text-slate-700 text-center focus:outline-none"
                      />
                    </div>
                    <div className="w-32 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Rate (IDR)</label>
                      <input 
                        type="number" value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full h-10 bg-white shadow-sm border-none rounded-lg px-3 text-[11px] font-semibold text-slate-700 focus:outline-none"
                      />
                    </div>
                    <button onClick={() => removeItem(item.id)} className="h-10 w-10 flex items-center justify-center text-red-300 hover:text-red-500 transition-colors">
                      <IconTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Preview Side */}
        <div className="w-full lg:w-[450px] space-y-4 print:w-full print:block">
          <header className="flex justify-between items-center h-10 px-1 print:hidden">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Document Preview</h3>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="h-8 w-8 flex items-center justify-center bg-transparent shadow-sm rounded-lg text-slate-400 hover:text-slate-800 transition-all"><IconPrinter size={14} /></button>
            </div>
          </header>

          <div className="bg-transparent shadow-sm rounded-xl p-8 min-h-[600px] flex flex-col border-[4px] border-[#f8f9fa] relative overflow-hidden ring-1 ring-slate-200 print:shadow-none print:border-none print:ring-0 print:p-0 print:min-h-0">
            {/* Watermark Decoration - Hidden in print usually, but kept for style */}
            <div className="absolute -right-20 -top-20 h-40 w-40 bg-red-50 rounded-full blur-3xl opacity-50 print:hidden"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Header / Letterhead */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  {letterhead.logoUrl ? (
                    <img src={letterhead.logoUrl} alt="Logo" className="h-12 w-auto object-contain mb-2" onError={(e) => e.target.style.display='none'} />
                  ) : null}
                  <h1 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{letterhead.companyName}</h1>
                  <p className="text-xs text-slate-500 whitespace-pre-line mt-1 leading-relaxed">{letterhead.address}</p>
                </div>
                <div className="text-right leading-none">
                  <h2 className="text-2xl font-bold text-slate-800 font-outfit uppercase">Quotation</h2>
                  <p className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase mt-2">Ref: {refNumber}</p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">Date: {new Date().toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              {/* Addresses */}
              <div className="mb-8 border-t border-slate-200 pt-6">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Prepared For</p>
                <p className="text-sm font-bold text-slate-800">{activeClient.name}</p>
                {activeClient.address && <p className="text-xs text-slate-500 mt-1">{activeClient.address}</p>}
                {activeClient.email && <p className="text-xs text-slate-500">{activeClient.email}</p>}
              </div>

              {/* Table */}
              <div className="flex-1 mb-8">
                <div className="overflow-x-auto custom-scrollbar w-full">
<table className="w-full text-left min-w-max">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                      <th className="py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-16">Qty</th>
                      <th className="py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Price</th>
                      <th className="py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/50">
                    {items.map(item => (
                      <tr key={item.id}>
                        <td className="py-3 pr-2">
                          <p className="text-[11px] font-semibold text-slate-700 leading-tight">{item.description || '-'}</p>
                        </td>
                        <td className="py-3 text-center text-xs text-slate-600">{item.qty}</td>
                        <td className="py-3 text-right text-xs text-slate-600">{formatCurrency(item.rate)}</td>
                        <td className="py-3 text-right text-[11px] font-semibold text-slate-800">
                          {formatCurrency(item.qty * item.rate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
</div>
              </div>

              {/* Totals */}
              <div className="w-2/3 ml-auto space-y-2 border-t-2 border-slate-200 pt-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</span>
                  <span className="text-xs font-bold text-slate-700">{formatCurrency(totals.subtotal)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tax ({taxRate}%)</span>
                    <span className="text-xs font-bold text-slate-700">{formatCurrency(totals.taxTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center bg-slate-900 text-white rounded-xl p-4 mt-3 print:bg-slate-100 print:text-slate-900 print:border-2 print:border-slate-900">
                  <span className="text-xs font-bold uppercase tracking-wider">Grand Total</span>
                  <span className="text-lg font-bold">{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-12 text-center print:hidden">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-full h-12 bg-ios-primary hover:bg-ios-primary/90 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex gap-2 shadow-sm"
                >
                  {isSaving ? <IconLoader2 className="animate-spin" size={16} /> : <><IconSend size={16} /> Save to Database</>}
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
