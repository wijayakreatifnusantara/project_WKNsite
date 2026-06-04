import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconUpload, IconDeviceFloppy, IconBrush, IconEye } from "@tabler/icons-react";
import { apiClient } from '@/lib/apiClient';

export default function PayslipTemplateBuilder() {
  const [template, setTemplate] = useState({
    id: null,
    companyName: 'PT. Wijaya Kreatif Nusantara',
    primaryColor: '#F97316',
    headerLogo: null,
    showAddress: true,
    addressText: 'Gedung WKNsite, Jl. Sudirman Kav. 1, Jakarta 12190',
    watermarkEnabled: true,
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const { data: res } = await apiClient.get('/api/payroll/templates/active');
      const data = res.data;
      setTemplate({
        id: data.id,
        companyName: data.company_name || '',
        primaryColor: data.primary_color || '#F97316',
        headerLogo: data.header_logo_url || null,
        showAddress: data.show_company_address !== false,
        addressText: data.company_address || '',
        watermarkEnabled: data.watermark_enabled !== false,
      });
    }
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Here we just save it as Base64 for simplicity in the template.
        // For production with large images, we would upload to Supabase Storage.
        setTemplate(prev => ({ ...prev, headerLogo: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        company_name: template.companyName,
        primary_color: template.primaryColor,
        header_logo_url: template.headerLogo,
        show_company_address: template.showAddress,
        company_address: template.addressText,
        watermark_enabled: template.watermarkEnabled,
        is_active: true
      };

      if (template.id) {
        await apiClient.put(`/api/payroll/templates/${template.id}`, payload);
      } else {
        const { data: res } = await apiClient.post('/api/payroll/templates', payload);
        const data = res.data;
        if (data) setTemplate(prev => ({ ...prev, id: data.id }));
      }
      alert('Template berhasil disimpan! Karyawan sekarang akan melihat format ini pada slip gaji mereka.');
    } catch (err) {
      alert('Gagal menyimpan template: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]"><p className="text-[#F97316] font-bold animate-pulse">Memuat Template...</p></div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f2f5] animate-fade-in">
      <header className="h-20 bg-[#f0f2f5] border-b border-white/50 flex items-center justify-between px-10 shrink-0 z-10">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase">Payslip Template Builder</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Desain Kop Surat & Format Slip Gaji</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
            className="h-12 px-6 rounded-2xl bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] border-white text-slate-600 font-black uppercase text-[10px]"
          >
            {previewMode ? <><IconBrush size={18} className="mr-2"/> Edit Mode</> : <><IconEye size={18} className="mr-2"/> Preview PDF</>}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="h-12 px-6 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white font-black text-[10px] uppercase shadow-[5px_5px_15px_rgba(249,115,22,0.3)] disabled:opacity-50"
          >
            <IconDeviceFloppy size={18} className="mr-2" /> {saving ? 'Menyimpan...' : 'Simpan Template'}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar flex gap-8">
        
        {/* Editor Sidebar */}
        {!previewMode && (
          <div className="w-[400px] shrink-0 space-y-6">
            <Card className="border-white border-2 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] bg-[#f0f2f5] rounded-3xl p-6">
              <CardTitle className="text-sm font-black text-slate-800 uppercase mb-6">Kop Surat (Header)</CardTitle>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Logo Perusahaan</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-white/50 relative overflow-hidden">
                    {template.headerLogo ? (
                      <img src={template.headerLogo} alt="Logo" className="max-h-20 object-contain" />
                    ) : (
                      <>
                        <IconUpload className="text-slate-400 mb-2" size={24} />
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Upload Logo / Kop Surat</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Nama Perusahaan</label>
                  <input 
                    type="text" 
                    value={template.companyName}
                    onChange={(e) => setTemplate(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full h-12 px-4 bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] rounded-xl text-sm font-bold text-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Alamat Perusahaan (Opsional)</label>
                  <textarea 
                    value={template.addressText}
                    onChange={(e) => setTemplate(prev => ({ ...prev, addressText: e.target.value }))}
                    className="w-full h-24 p-4 bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] rounded-xl text-xs font-medium text-slate-700 outline-none resize-none"
                  />
                </div>
              </div>
            </Card>

            <Card className="border-white border-2 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] bg-[#f0f2f5] rounded-3xl p-6">
              <CardTitle className="text-sm font-black text-slate-800 uppercase mb-6">Warna & Tema</CardTitle>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Warna Aksen Utama</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color" 
                    value={template.primaryColor}
                    onChange={(e) => setTemplate(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                  />
                  <span className="text-sm font-bold text-slate-700">{template.primaryColor}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Live Preview Pane */}
        <div className="flex-1 flex justify-center">
          <div className="w-[600px] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-sm p-12 overflow-y-auto" style={{ height: '800px', transform: previewMode ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s' }}>
            
            {/* Template Header / Kop Surat */}
            <div className="border-b-2 pb-6 mb-8 text-center" style={{ borderColor: template.primaryColor }}>
              {template.headerLogo && (
                <img src={template.headerLogo} alt="Kop Surat" className="h-16 mx-auto mb-4 object-contain" />
              )}
              <h1 className="text-2xl font-black" style={{ color: template.primaryColor }}>{template.companyName}</h1>
              {template.showAddress && (
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">{template.addressText}</p>
              )}
            </div>

            <div className="text-center mb-8">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest">Slip Gaji Karyawan</h2>
              <p className="text-sm text-slate-500 mt-1">Periode: April 2026</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-8 bg-slate-50 p-4 rounded-lg">
              <div>
                <span className="text-slate-500 font-bold">Nama Pegawai:</span>
                <p className="font-black text-slate-800">John Doe (Demo)</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold">ID / NIK:</span>
                <p className="font-black text-slate-800">WKN-001</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider mb-3" style={{ color: template.primaryColor }}>Penerimaan (Earnings)</h3>
                <div className="flex justify-between border-b py-2 text-sm">
                  <span>Gaji Pokok</span><span>Rp 8.500.000</span>
                </div>
                <div className="flex justify-between border-b py-2 text-sm">
                  <span>Tunjangan Transport</span><span>Rp 750.000</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold mt-2">
                  <span>Total Penerimaan</span><span className="text-green-600">Rp 9.250.000</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider mb-3" style={{ color: template.primaryColor }}>Potongan (Deductions)</h3>
                <div className="flex justify-between border-b py-2 text-sm">
                  <span>BPJS Kesehatan</span><span className="text-red-500">- Rp 120.000</span>
                </div>
                <div className="flex justify-between border-b py-2 text-sm">
                  <span>PPh 21</span><span className="text-red-500">- Rp 245.000</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold mt-2">
                  <span>Total Potongan</span><span className="text-red-600">- Rp 365.000</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t-2 border-slate-800 flex justify-between items-center">
              <span className="text-lg font-black uppercase tracking-widest">Take Home Pay</span>
              <span className="text-2xl font-black">Rp 8.885.000</span>
            </div>

            {template.watermarkEnabled && (
              <div className="mt-16 text-center text-[9px] text-slate-400">
                <p>Dokumen ini dihasilkan secara otomatis oleh sistem WKNsite dan sah tanpa tanda tangan basah.</p>
                <p className="mt-1">Diunduh oleh: John Doe pada Rabu, 27 Mei 2026 14:30:00</p>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}
