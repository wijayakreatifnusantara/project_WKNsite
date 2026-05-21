import React, { useState } from 'react';
import { 
  IconSettings, 
  IconShieldLock, 
  IconBellRinging, 
  IconWorld, 
  IconDatabase,
  IconCheck,
  IconLoader2,
  IconDeviceFloppy,
  IconMail,
  IconMessageDots,
  IconRefresh,
  IconServer,
  IconLock,
  IconClock,
  IconEye,
  IconUserShield,
  IconTrash
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const tabs = [
    { id: 'general', label: 'General', icon: <IconSettings size={14} />, desc: 'Core system identity' },
    { id: 'security', label: 'Security', icon: <IconShieldLock size={14} />, desc: 'Access & Auth policy' },
    { id: 'notifications', label: 'Alerts', icon: <IconBellRinging size={14} />, desc: 'Push & Email engine' },
    { id: 'network', label: 'Global', icon: <IconWorld size={14} />, desc: 'Localization & API' },
    { id: 'database', label: 'System', icon: <IconDatabase size={14} />, desc: 'Backups & Records' }
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ text: 'Settings synchronized successfully', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }, 1500);
  };

  const SettingRow = ({ label, desc, children }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/50 last:border-0">
      <div className="space-y-0.5">
        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{label}</p>
        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">{desc}</p>
      </div>
      <div>{children}</div>
    </div>
  );

  const CompactInput = ({ placeholder, type = "text" }) => (
    <input 
      type={type}
      placeholder={placeholder}
      className="h-8 w-48 bg-slate-50 border border-slate-200 rounded-lg px-3 text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#E31E24]/20 focus:border-[#E31E24]/20"
    />
  );

  const CompactToggle = ({ active }) => (
    <div className={`w-8 h-4 rounded-full p-0.5 transition-all cursor-pointer ${active ? 'bg-[#E31E24]' : 'bg-slate-300'}`}>
      <div className={`h-3 w-3 bg-white rounded-full transition-all shadow-sm ${active ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  );

  return (
    <div className="p-4 h-full overflow-y-auto no-scrollbar bg-[#f8fafc] animate-fade-in custom-scrollbar">
      <div className="max-w-[1200px] mx-auto space-y-4 pb-20">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white shadow-md rounded-xl flex items-center justify-center text-[#E31E24] border border-white">
              <IconSettings size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-none">System Intelligence Center</h1>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Global Configuration & Control Panel</p>
            </div>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-10 px-6 bg-[#E31E24] hover:bg-[#C1181E] text-white font-black text-[9px] uppercase tracking-widest rounded-lg shadow-md transition-all active:scale-95"
          >
            {isSaving ? <IconLoader2 className="animate-spin mr-2" size={14} /> : <IconDeviceFloppy className="mr-2" size={14} />}
            Synchronize Config
          </Button>
        </div>

        {message.text && (
          <div className={`p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            <IconCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* CATEGORY NAV */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2">Modules</h3>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-300 border ${
                  activeTab === tab.id 
                  ? 'bg-white border-slate-200 shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-100/50 hover:translate-x-0.5'
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all border ${activeTab === tab.id ? 'bg-[#E31E24] border-[#E31E24] text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400 shadow-sm'}`}>
                  {tab.icon}
                </div>
                <div className="text-left leading-none">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-[#E31E24]' : 'text-slate-600'}`}>{tab.label}</p>
                  <p className="text-[7px] text-slate-400 font-bold mt-1 uppercase tracking-tighter truncate w-24">{tab.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* CONFIG AREA */}
          <div className="lg:col-span-4 space-y-4">
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-slate-200 border bg-white shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                    <CardTitle className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Brand Identity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-1">
                    <SettingRow label="System Name" desc="Main corporate branding title">
                      <CompactInput placeholder="WKN Corporate CMS" />
                    </SettingRow>
                    <SettingRow label="Tagline" desc="Sub-branding subtitle">
                      <CompactInput placeholder="Intelligent Ecosystem" />
                    </SettingRow>
                    <SettingRow label="Version" desc="Current software release">
                      <span className="text-[9px] font-black text-slate-400 tracking-widest">v3.4.0-PRO</span>
                    </SettingRow>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 border bg-white shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                    <CardTitle className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Environment</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-1">
                    <SettingRow label="Maintenance Mode" desc="Block public access to system">
                      <CompactToggle active={false} />
                    </SettingRow>
                    <SettingRow label="Debug Mode" desc="Enable advanced system logs">
                      <CompactToggle active={true} />
                    </SettingRow>
                    <SettingRow label="API Status" desc="External gateway heartbeat">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black text-green-600 uppercase">Online</span>
                      </div>
                    </SettingRow>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'security' && (
              <Card className="border-slate-200 border bg-white shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                  <CardTitle className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Security & Auth Policy</CardTitle>
                </CardHeader>
                <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  <SettingRow label="Session Timeout" desc="Auto logout after inactivity (min)">
                    <CompactInput placeholder="60" type="number" />
                  </SettingRow>
                  <SettingRow label="Password Expiry" desc="Force change every 90 days">
                    <CompactToggle active={true} />
                  </SettingRow>
                  <SettingRow label="Two-Factor (2FA)" desc="Mandatory for Admin roles">
                    <CompactToggle active={false} />
                  </SettingRow>
                  <SettingRow label="IP Restriction" desc="Limit access to HQ network">
                    <CompactToggle active={false} />
                  </SettingRow>
                  <SettingRow label="Encryption" desc="AES-256 Record Layer">
                    <div className="px-2 py-0.5 bg-slate-800 rounded text-[7px] text-white font-black tracking-widest">ACTIVE</div>
                  </SettingRow>
                  <SettingRow label="Max Login Attempts" desc="Block IP after 5 failures">
                    <CompactInput placeholder="5" type="number" />
                  </SettingRow>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-slate-200 border bg-white shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Email Engine (SMTP)</CardTitle>
                    <IconMail size={14} className="text-slate-400" />
                  </CardHeader>
                  <CardContent className="p-4 space-y-1">
                    <SettingRow label="SMTP Server" desc="Outgoing mail gateway">
                      <CompactInput placeholder="smtp.gmail.com" />
                    </SettingRow>
                    <SettingRow label="Port" desc="Secure SSL/TLS port">
                      <CompactInput placeholder="465" />
                    </SettingRow>
                    <SettingRow label="System Email" desc="Automated sender address">
                      <CompactInput placeholder="no-reply@wijayakn.com" />
                    </SettingRow>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 border bg-white shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-[10px] font-black text-slate-800 uppercase tracking-widest">WhatsApp Gateway</CardTitle>
                    <IconMessageDots size={14} className="text-green-500" />
                  </CardHeader>
                  <CardContent className="p-4 space-y-1">
                    <SettingRow label="API Instance" desc="Provider instance ID">
                      <CompactInput placeholder="INST-8890" />
                    </SettingRow>
                    <SettingRow label="Token" desc="Secure access bearer">
                      <CompactInput placeholder="••••••••••••••••" type="password" />
                    </SettingRow>
                    <SettingRow label="Webhooks" desc="Listen for delivery reports">
                      <CompactToggle active={true} />
                    </SettingRow>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'network' && (
              <Card className="border-slate-200 border bg-white shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                  <CardTitle className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Localization & Global Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  <SettingRow label="System Timezone" desc="Current server clock">
                    <span className="text-[10px] font-black text-slate-700">Asia/Jakarta (GMT+7)</span>
                  </SettingRow>
                  <SettingRow label="Currency Format" desc="Local monetary display">
                    <span className="text-[10px] font-black text-slate-700">IDR (Rp)</span>
                  </SettingRow>
                  <SettingRow label="Language" desc="Global UI vocabulary">
                    <span className="text-[10px] font-black text-slate-700 uppercase">English (US)</span>
                  </SettingRow>
                  <SettingRow label="CDN Acceleration" desc="Boost asset loading speed">
                    <CompactToggle active={true} />
                  </SettingRow>
                </CardContent>
              </Card>
            )}

            {activeTab === 'database' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'DB Uptime', val: '99.98%', icon: <IconServer size={14} /> },
                    { label: 'Last Backup', val: '2h ago', icon: <IconClock size={14} /> },
                    { label: 'Storage', val: '1.2 GB', icon: <IconDatabase size={14} /> }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 flex items-center justify-between transition-all hover:translate-y-[-1px]">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xs font-black text-slate-800">{stat.val}</p>
                      </div>
                      <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                        {stat.icon}
                      </div>
                    </div>
                  ))}
                </div>
                <Card className="border-slate-200 border bg-white shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                    <CardTitle className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Maintenance & Recovery</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-1">
                    <SettingRow label="Auto-Backup" desc="Scheduled daily at 02:00 AM">
                      <CompactToggle active={true} />
                    </SettingRow>
                    <SettingRow label="Logs Retention" desc="Purge history older than 30 days">
                      <CompactToggle active={true} />
                    </SettingRow>
                    <div className="mt-4 flex gap-2">
                      <Button className="h-8 px-4 bg-slate-800 text-white text-[8px] font-black uppercase tracking-widest rounded hover:bg-slate-700 transition-all flex items-center gap-1.5 shadow-sm">
                        <IconRefresh size={12} /> Force Backup Now
                      </Button>
                      <Button className="h-8 px-4 bg-red-100 text-red-600 text-[8px] font-black uppercase tracking-widest rounded hover:bg-red-200 transition-all flex items-center gap-1.5 shadow-sm border border-red-200">
                        <IconTrash size={12} /> Purge Cache
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
