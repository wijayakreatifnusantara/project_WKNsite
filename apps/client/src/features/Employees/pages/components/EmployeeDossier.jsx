import React from 'react';
import { 
  IconX, 
  IconMail, 
  IconPhone, 
  IconMapPin, 
  IconCalendar, 
  IconBriefcase, 
  IconBuildingCommunity, 
  IconId, 
  IconShieldCheck,
  IconClock,
  IconTrendingUp,
  IconCreditCard,
  IconFileText,
  IconAward,
  IconUserCircle,
  IconDownload,
  IconChecklist
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const EmployeeDossier = ({ employee, isOpen, onClose, onEdit, onSign }) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/50 backdrop-blur-sm  animate-in fade-in duration-300">
      <div 
        className="w-full max-w-4xl h-[80vh] bg-white shadow-sm rounded-[3rem] overflow-hidden flex flex-col border-[8px] border-white animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🏆 COMPACT IDENTITY TOP BAR */}
        <header className="relative h-16 bg-transparent border-b border-slate-200/80 flex items-center px-8 gap-4 shrink-0">
          <div className="h-10 w-10 rounded-lg bg-transparent border border-slate-200/80 flex items-center justify-center text-[#E31E24] overflow-hidden shrink-0">
            {employee["Photo"] ? (
              <img src={employee["Photo"]} alt={employee["EMPLOYEE NAME"]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-base font-bold">{employee["EMPLOYEE NAME"]?.[0]}</span>
            )}
          </div>

          <div className="flex-1 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-base font-bold text-slate-800 tracking-tight uppercase leading-none mb-1">
                  {employee["EMPLOYEE NAME"]}
                </h1>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-slate-400">
                    <IconId size={10} className="text-[#E31E24]" />
                    <span className="text-xs font-semibold tracking-wider">{employee["EMPLOYEE ID"]}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${employee.is_resigned || String(employee["Status *"] || employee.status || "").toUpperCase() === 'RESIGNED' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {employee.is_resigned || String(employee["Status *"] || employee.status || "").toUpperCase() === 'RESIGNED' ? 'Inactive' : 'Active Duty'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => {
                  onEdit(employee);
                  onClose();
                }}
                className="h-8 px-4 rounded-lg bg-[#E31E24] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#C1181E] transition-all active:scale-95 shadow-sm"
              >
                Edit Dossier
              </Button>
              <button 
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center bg-transparent border border-slate-200 rounded-lg text-slate-400 hover:text-[#E31E24] transition-all"
              >
                <IconX size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* 📊 INFORMATION ECOSYSTEM */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
          <div className="grid grid-cols-12 gap-10">
            
            {/* 1. IDENTITY & ACCESS (Column 4) */}
            <div className="col-span-4 space-y-12">
              <SectionHeader data-tooltip="Identity & Access" icon={<IconUserCircle size={18} />} />
              <div className="space-y-8 pl-2">
                <SimpleInfo label="Corporate Email" value={employee["EMAIL"] || employee.email} icon={<IconMail />} />
                <SimpleInfo label="Primary Contact" value={employee["PHONE NUMBER"] || employee.phone} icon={<IconPhone />} />
                <SimpleInfo label="Residential" value={employee["Address"] || employee.address} icon={<IconMapPin />} />
                <SimpleInfo label="Active Device" value={`${employee.last_device_brand || ''} ${employee.last_device_model || ''}`.trim() || 'Unknown'} icon={<IconShieldCheck />} />
                <SimpleInfo label="Joining Date" value={employee["Join Date"] || employee.join_date} icon={<IconCalendar />} />
              </div>
            </div>

            {/* 2. STRATEGIC LOGISTICS (Column 4) */}
            <div className="col-span-4 space-y-12">
              <SectionHeader data-tooltip="Strategic Logistics" icon={<IconBriefcase size={18} />} />
              <div className="space-y-8 pl-2">
                <SimpleInfo label="Internal Role" value={employee["Job Position *"] || employee.job_position} icon={<IconTrendingUp />} />
                <SimpleInfo label="Service Level" value={employee["Job Level *"] || employee.job_level} icon={<IconAward />} />
                <SimpleInfo label="Work Pattern" value={employee.shifts?.name || employee.work_pattern || 'N/A'} icon={<IconClock />} />
                <div className="space-y-2">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Contract Status</p>
                  <p className="text-sm font-black text-[#E31E24] uppercase tracking-tighter">{employee["Status *"]}</p>
                </div>
              </div>
            </div>

            {/* 3. DIGITAL REPOSITORY (Column 4) */}
            <div className="col-span-4 space-y-12">
              <SectionHeader data-tooltip="Digital Repository" icon={<IconFileText size={18} />} />
              <div className="space-y-3">
                {employee.documents && employee.documents.length > 0 ? (
                  employee.documents.map((doc, idx) => (
                    <DocumentItem key={idx} name={doc.name || 'Document.pdf'} />
                  ))
                ) : (
                  <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-24">
                    <p className="text-xs font-bold text-slate-400 uppercase">Belum ada dokumen</p>
                  </div>
                )}
                <button className="w-full h-12 mt-2 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:border-[#E31E24] hover:text-[#E31E24] transition-all">
                  + Add Document
                </button>
              </div>

              {/* Tanda Tangan Elektronik Section */}
              <div className="pt-6 border-t border-slate-200/50 space-y-4">
                <div className="flex justify-between items-center px-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Electronic Signature</p>
                  <button 
                    onClick={() => {
                      onSign(employee);
                      onClose();
                    }}
                    className="text-xs font-black text-[#E31E24] uppercase tracking-widest hover:underline"
                  >
                    {employee.signature_url ? 'Update TTD' : '+ Buat TTD'}
                  </button>
                </div>
                {employee.signature_url ? (
                  <div className="bg-transparent p-3 border border-slate-200 rounded-2xl flex items-center justify-center h-28 relative group">
                    <img src={employee.signature_url} alt="Signature" className="h-20 object-contain animate-fade-in" />
                  </div>
                ) : (
                  <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 h-28">
                    <p className="text-xs font-bold text-slate-400 uppercase">Belum ada tanda tangan</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 📈 GROWTH & PERFORMANCE (HORIZONTAL STRIP) - Removed Dummy Data */}
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, icon }) => (
  <div className="flex items-center gap-3">
    <div className="h-8 w-8 bg-transparent shadow-sm border border-slate-200 rounded-lg flex items-center justify-center text-[#E31E24]">
      {icon}
    </div>
    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">{title}</h3>
  </div>
);

const SimpleInfo = ({ label, value, icon }) => (
  <div className="flex items-center gap-4 group">
    <div className="h-10 w-10 bg-transparent shadow-sm border border-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-[#E31E24] transition-all">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight truncate max-w-[200px]">{value || 'N/A'}</p>
    </div>
  </div>
);

const DocumentItem = ({ name }) => (
  <div className="flex items-center justify-between p-4 bg-transparent shadow-sm border border-white rounded-2xl hover:shadow-sm transition-all cursor-pointer group">
    <div className="flex items-center gap-3">
      <IconFileText size={18} className="text-slate-300 group-hover:text-[#E31E24]" />
      <span className="text-xs font-black text-slate-600 truncate max-w-[180px]">{name}</span>
    </div>
    <IconDownload size={14} className="text-slate-300 group-hover:text-slate-800" />
  </div>
);

const SimpleMetric = ({ label, value, color }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end">
      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-[11px] font-black text-slate-800">{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default EmployeeDossier;
