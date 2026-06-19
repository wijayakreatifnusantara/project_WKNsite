import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IconSearch, 
  IconLayoutDashboard, 
  IconUsers, 
  IconClock, 
  IconMapPin, 
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCalendarTime,
  IconClockPlay,
  IconChartBar,
  IconReceipt,
  IconUserPlus,
  IconFileText,
  IconSettings
} from '@tabler/icons-react';

const MENU_ITEMS = [
  { id: 'overview', title: 'System Overview', path: '/overview', icon: <IconLayoutDashboard size={18} />, group: 'General' },
  { id: 'employees', title: 'Database Karyawan', path: '/master/employees', icon: <IconUsers size={18} />, group: 'Data Master' },
  { id: 'divisions', title: 'Divisi & Jabatan', path: '/master/divisions', icon: <IconBuildingSkyscraper size={18} />, group: 'Data Master' },
  { id: 'shifts', title: 'Shift & Libur', path: '/master/shifts', icon: <IconCalendarEvent size={18} />, group: 'Data Master' },
  { id: 'attendance_log', title: 'Log Kehadiran', path: '/attendance/report', icon: <IconClock size={18} />, group: 'Time & Attendance' },
  { id: 'attendance_location', title: 'Lokasi Kerja', path: '/attendance/location', icon: <IconMapPin size={18} />, group: 'Time & Attendance' },
  { id: 'attendance_schedule', title: 'Jadwal & Shift', path: '/attendance/schedule', icon: <IconCalendarTime size={18} />, group: 'Time & Attendance' },
  { id: 'attendance_overtime', title: 'Manajemen Lembur', path: '/attendance/overtime', icon: <IconClockPlay size={18} />, group: 'Time & Attendance' },
  { id: 'attendance_recap', title: 'Rekap Laporan Absen', path: '/attendance/recap', icon: <IconChartBar size={18} />, group: 'Time & Attendance' },
  { id: 'onboarding', title: 'Onboarding Karyawan', path: '/employees/onboarding', icon: <IconUserPlus size={18} />, group: 'Core HR' },
  { id: 'documents', title: 'Dokumen Hub', path: '/documents', icon: <IconFileText size={18} />, group: 'Core HR' },
  { id: 'payroll_salary', title: 'Data Gaji Karyawan', path: '/finance/salary', icon: <IconReceipt size={18} />, group: 'Finance & Payroll' },
  { id: 'admin_settings', title: 'Administrasi Sistem', path: '/admin', icon: <IconSettings size={18} />, group: 'System' },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const filteredItems = query === '' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.group.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter' && filteredItems.length > 0) {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in-down">
        
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-slate-200 bg-transparent">
          <IconSearch className="text-slate-400 mr-3" size={22} />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none py-5 text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0"
            placeholder="Ketik untuk mencari halaman atau menu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="text-xs font-bold text-slate-400 border border-slate-200 bg-slate-50 px-2 py-1 rounded-lg ml-3 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center">
              <IconSearch className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-sm font-semibold text-slate-500">Tidak ada hasil ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain (misal: "lembur" atau "jadwal")</p>
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(
                filteredItems.reduce((acc, item) => {
                  (acc[item.group] = acc[item.group] || []).push(item);
                  return acc;
                }, {})
              ).map(([group, items]) => (
                <div key={group} className="mb-4 last:mb-0">
                  <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {group}
                  </h3>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const globalIndex = filteredItems.findIndex(i => i.id === item.id);
                      const isSelected = selectedIndex === globalIndex;
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-ios-primary/10 text-ios-primary border border-ios-primary/20' 
                              : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                          }`}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                        >
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center mr-3 ${
                            isSelected ? 'bg-ios-primary text-white shadow-sm shadow-sm/20' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {item.icon}
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? 'font-bold' : ''}`}>
                            {item.title}
                          </span>
                          {isSelected && (
                            <span className="ml-auto text-xs font-bold text-ios-primary/70 mr-2 flex items-center gap-1">
                              <span className="border border-ios-primary/30 bg-ios-primary/10 px-1.5 py-0.5 rounded">Enter</span> untuk buka
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="border border-slate-200 bg-white px-1.5 py-0.5 rounded shadow-sm text-slate-700">↑</span>
              <span className="border border-slate-200 bg-white px-1.5 py-0.5 rounded shadow-sm text-slate-700">↓</span>
              Navigasi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="border border-slate-200 bg-white px-1.5 py-0.5 rounded shadow-sm text-slate-700">Enter</span>
              Pilih
            </span>
          </div>
          <div>
            WKN<span className="text-ios-primary">site</span> Enterprise Search
          </div>
        </div>
      </div>
    </div>
  );
}
