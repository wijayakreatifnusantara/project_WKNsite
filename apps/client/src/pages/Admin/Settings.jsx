import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  IconTrash,
  IconDownload,
  IconAlertCircle
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Dynamic stats
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [isBackupRunning, setIsBackupRunning] = useState(false);

  const [settings, setSettings] = useState({
    general: {
      system_name: "WKN Corporate CMS",
      tagline: "Intelligent Ecosystem",
      maintenance_mode: false,
      debug_mode: true
    },
    security: {
      session_timeout: 60,
      password_expiry: true,
      two_factor: false,
      ip_restriction: false,
      max_login_attempts: 5
    },
    notifications: {
      smtp_server: "smtp.gmail.com",
      smtp_port: "465",
      system_email: "no-reply@wijayakn.com",
      wa_api_instance: "INST-8890",
      wa_token: "••••••••••••••••",
      wa_webhooks: true
    },
    network: {
      cdn_acceleration: true
    },
    database: {
      auto_backup: true,
      logs_retention: true,
      retention_days: 30,
      last_backup_time: null,
      last_backup_name: null,
      last_backup_size: null
    }
  });

  const tabs = [
    { id: 'general', label: 'General', icon: <IconSettings size={14} />, desc: 'Core system identity' },
    { id: 'security', label: 'Security', icon: <IconShieldLock size={14} />, desc: 'Access & Auth policy' },
    { id: 'notifications', label: 'Alerts', icon: <IconBellRinging size={14} />, desc: 'Push & Email engine' },
    { id: 'network', label: 'Global', icon: <IconWorld size={14} />, desc: 'Localization & API' },
    { id: 'database', label: 'System', icon: <IconDatabase size={14} />, desc: 'Backups & Records' }
  ];

  // Fetch all settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/database/settings`);
        if (response.data) {
          setSettings(response.data);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        setMessage({ text: 'Failed to load configuration settings from server', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Fetch backups list when Database tab is active
  const fetchBackups = async () => {
    setLoadingBackups(true);
    try {
      const response = await axios.get(`${API_URL}/database/backups`);
      setBackups(response.data || []);
    } catch (err) {
      console.error("Failed to load backups list:", err);
    } finally {
      setLoadingBackups(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'database') {
      fetchBackups();
    }
  }, [activeTab]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await axios.post(`${API_URL}/database/settings`, settings);
      if (response.data.status === 'success') {
        setMessage({ text: 'Settings synchronized successfully', type: 'success' });
      } else {
        setMessage({ text: response.data.message || 'Synchronization failed', type: 'error' });
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      setMessage({ text: err.response?.data?.detail || 'Failed to save settings to server', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  const handleForceBackup = async () => {
    setIsBackupRunning(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await axios.post(`${API_URL}/database/backup`);
      if (response.data.status === 'success') {
        setMessage({ text: 'Database backup compiled successfully', type: 'success' });
        fetchBackups();
        
        // Update local state details
        const details = response.data.details;
        setSettings(prev => ({
          ...prev,
          database: {
            ...prev.database,
            last_backup_time: details.created_at || new Date().toISOString(),
            last_backup_name: details.filename,
            last_backup_size: details.size
          }
        }));
      }
    } catch (err) {
      console.error("Backup failed:", err);
      setMessage({ text: err.response?.data?.detail || 'Backup process failed', type: 'error' });
    } finally {
      setIsBackupRunning(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const handleDownloadBackup = async (filename) => {
    try {
      const response = await axios.get(`${API_URL}/database/backups/${filename}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Gagal men-download file backup.");
    }
  };

  const handleDeleteBackup = async (filename) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus backup ${filename}?`)) return;
    setMessage({ text: '', type: '' });
    try {
      const response = await axios.delete(`${API_URL}/database/backups/${filename}`);
      if (response.data.status === 'success') {
        setMessage({ text: `Backup file ${filename} deleted`, type: 'success' });
        fetchBackups();
      }
    } catch (err) {
      console.error("Deletion failed:", err);
      setMessage({ text: 'Failed to delete backup file', type: 'error' });
    } finally {
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  const totalBackupSizeFormatted = () => {
    const bytes = backups.reduce((acc, b) => acc + (b.size_bytes || 0), 0);
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getLastBackupTimeStr = () => {
    if (!settings.database?.last_backup_time) return "Never";
    const lastBackupTime = new Date(settings.database.last_backup_time);
    const diffMs = new Date() - lastBackupTime;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
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

  const CompactInput = ({ placeholder, type = "text", value, onChange }) => (
    <input 
      type={type}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={onChange}
      className="h-8 w-48 bg-slate-50 border border-slate-200 rounded-lg px-3 text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#E31E24]/20 focus:border-[#E31E24]/20 font-mono"
    />
  );

  const CompactToggle = ({ active, onClick }) => (
    <div 
      onClick={onClick}
      className={`w-8 h-4 rounded-full p-0.5 transition-all cursor-pointer ${active ? 'bg-[#E31E24]' : 'bg-slate-300'}`}
    >
      <div className={`h-3 w-3 bg-white rounded-full transition-all shadow-sm ${active ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-4 bg-[#f8fafc]">
        <IconLoader2 className="animate-spin text-[#E31E24]" size={36} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading System settings...</p>
      </div>
    );
  }

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
            {message.type === 'success' ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
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
                      <CompactInput 
                        value={settings.general.system_name} 
                        onChange={e => setSettings(prev => ({ ...prev, general: { ...prev.general, system_name: e.target.value } }))}
                        placeholder="WKN Corporate CMS" 
                      />
                    </SettingRow>
                    <SettingRow label="Tagline" desc="Sub-branding subtitle">
                      <CompactInput 
                        value={settings.general.tagline} 
                        onChange={e => setSettings(prev => ({ ...prev, general: { ...prev.general, tagline: e.target.value } }))}
                        placeholder="Intelligent Ecosystem" 
                      />
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
                      <CompactToggle 
                        active={settings.general.maintenance_mode} 
                        onClick={() => setSettings(prev => ({ ...prev, general: { ...prev.general, maintenance_mode: !prev.general.maintenance_mode } }))}
                      />
                    </SettingRow>
                    <SettingRow label="Debug Mode" desc="Enable advanced system logs">
                      <CompactToggle 
                        active={settings.general.debug_mode} 
                        onClick={() => setSettings(prev => ({ ...prev, general: { ...prev.general, debug_mode: !prev.general.debug_mode } }))}
                      />
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
                    <CompactInput 
                      value={settings.security.session_timeout} 
                      onChange={e => setSettings(prev => ({ ...prev, security: { ...prev.security, session_timeout: parseInt(e.target.value) || 0 } }))}
                      placeholder="60" 
                      type="number" 
                    />
                  </SettingRow>
                  <SettingRow label="Password Expiry" desc="Force change every 90 days">
                    <CompactToggle 
                      active={settings.security.password_expiry} 
                      onClick={() => setSettings(prev => ({ ...prev, security: { ...prev.security, password_expiry: !prev.security.password_expiry } }))}
                    />
                  </SettingRow>
                  <SettingRow label="Two-Factor (2FA)" desc="Mandatory for Admin roles">
                    <CompactToggle 
                      active={settings.security.two_factor} 
                      onClick={() => setSettings(prev => ({ ...prev, security: { ...prev.security, two_factor: !prev.security.two_factor } }))}
                    />
                  </SettingRow>
                  <SettingRow label="IP Restriction" desc="Limit access to HQ network">
                    <CompactToggle 
                      active={settings.security.ip_restriction} 
                      onClick={() => setSettings(prev => ({ ...prev, security: { ...prev.security, ip_restriction: !prev.security.ip_restriction } }))}
                    />
                  </SettingRow>
                  <SettingRow label="Encryption" desc="AES-256 Record Layer">
                    <div className="px-2 py-0.5 bg-slate-800 rounded text-[7px] text-white font-black tracking-widest">ACTIVE</div>
                  </SettingRow>
                  <SettingRow label="Max Login Attempts" desc="Block IP after 5 failures">
                    <CompactInput 
                      value={settings.security.max_login_attempts} 
                      onChange={e => setSettings(prev => ({ ...prev, security: { ...prev.security, max_login_attempts: parseInt(e.target.value) || 0 } }))}
                      placeholder="5" 
                      type="number" 
                    />
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
                      <CompactInput 
                        value={settings.notifications.smtp_server} 
                        onChange={e => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, smtp_server: e.target.value } }))}
                        placeholder="smtp.gmail.com" 
                      />
                    </SettingRow>
                    <SettingRow label="Port" desc="Secure SSL/TLS port">
                      <CompactInput 
                        value={settings.notifications.smtp_port} 
                        onChange={e => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, smtp_port: e.target.value } }))}
                        placeholder="465" 
                      />
                    </SettingRow>
                    <SettingRow label="System Email" desc="Automated sender address">
                      <CompactInput 
                        value={settings.notifications.system_email} 
                        onChange={e => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, system_email: e.target.value } }))}
                        placeholder="no-reply@wijayakn.com" 
                      />
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
                      <CompactInput 
                        value={settings.notifications.wa_api_instance} 
                        onChange={e => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, wa_api_instance: e.target.value } }))}
                        placeholder="INST-8890" 
                      />
                    </SettingRow>
                    <SettingRow label="Token" desc="Secure access bearer">
                      <CompactInput 
                        value={settings.notifications.wa_token} 
                        onChange={e => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, wa_token: e.target.value } }))}
                        placeholder="••••••••••••••••" 
                        type="password" 
                      />
                    </SettingRow>
                    <SettingRow label="Webhooks" desc="Listen for delivery reports">
                      <CompactToggle 
                        active={settings.notifications.wa_webhooks} 
                        onClick={() => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, wa_webhooks: !prev.notifications.wa_webhooks } }))}
                      />
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
                    <CompactToggle 
                      active={settings.network.cdn_acceleration} 
                      onClick={() => setSettings(prev => ({ ...prev, network: { ...prev.network, cdn_acceleration: !prev.network.cdn_acceleration } }))}
                    />
                  </SettingRow>
                </CardContent>
              </Card>
            )}

            {activeTab === 'database' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'DB Uptime', val: '99.98%', icon: <IconServer size={14} /> },
                    { label: 'Last Backup', val: getLastBackupTimeStr(), icon: <IconClock size={14} /> },
                    { label: 'Storage', val: totalBackupSizeFormatted(), icon: <IconDatabase size={14} /> }
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
                      <CompactToggle 
                        active={settings.database.auto_backup} 
                        onClick={() => setSettings(prev => ({ ...prev, database: { ...prev.database, auto_backup: !prev.database.auto_backup } }))}
                      />
                    </SettingRow>
                    <SettingRow label="Logs Retention" desc="Purge history older than specified days">
                      <CompactToggle 
                        active={settings.database.logs_retention} 
                        onClick={() => setSettings(prev => ({ ...prev, database: { ...prev.database, logs_retention: !prev.database.logs_retention } }))}
                      />
                    </SettingRow>
                    <SettingRow label="Retention Period (Days)" desc="Number of days to keep backup files">
                      <CompactInput 
                        value={settings.database.retention_days} 
                        onChange={e => setSettings(prev => ({ ...prev, database: { ...prev.database, retention_days: parseInt(e.target.value) || 30 } }))}
                        type="number" 
                        placeholder="30" 
                      />
                    </SettingRow>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        onClick={handleForceBackup}
                        disabled={isBackupRunning}
                        className="h-8 px-4 bg-slate-800 text-white text-[8px] font-black uppercase tracking-widest rounded hover:bg-slate-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                      >
                        {isBackupRunning ? <IconLoader2 size={12} className="animate-spin" /> : <IconRefresh size={12} />}
                        {isBackupRunning ? 'Backing up...' : 'Force Backup Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Backups table */}
                <Card className="border-slate-200 border bg-white shadow-sm rounded-xl overflow-hidden mt-4">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                    <CardTitle className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Backup Archives</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {loadingBackups ? (
                      <div className="flex items-center gap-2 text-slate-400 text-xs py-4 justify-center">
                        <IconLoader2 size={16} className="animate-spin" /> Loading backup archives...
                      </div>
                    ) : backups.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        No backup archives found on disk
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                              {['Filename', 'Created At', 'Size', 'Initiator', 'Actions'].map(h => (
                                <th key={h} className="px-3 py-2.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-[10px] font-bold text-slate-600">
                            {backups.map((backup) => (
                              <tr key={backup.filename} className="hover:bg-slate-50 transition-all">
                                <td className="px-3 py-2.5 font-mono text-[9px] text-slate-800 truncate max-w-[220px]" title={backup.filename}>
                                  {backup.filename}
                                </td>
                                <td className="px-3 py-2.5 font-medium">
                                  {new Date(backup.created_at).toLocaleString('id-ID')}
                                </td>
                                <td className="px-3 py-2.5 text-slate-500 font-medium">
                                  {backup.size}
                                </td>
                                <td className="px-3 py-2.5 uppercase tracking-wide text-[8px] text-slate-500 font-black">
                                  {backup.initiated_by}
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleDownloadBackup(backup.filename)}
                                      className="px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                                    >
                                      <IconDownload size={10} /> Download
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBackup(backup.filename)}
                                      className="px-2 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                                    >
                                      <IconTrash size={10} /> Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
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
