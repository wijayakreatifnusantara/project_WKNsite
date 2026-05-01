import React from 'react';
import { 
  IconUsers, 
  IconClock, 
  IconCreditCard, 
  IconLayoutDashboard, 
  IconLogout, 
  IconSettings, 
  IconBell, 
  IconSearch,
  IconChevronDown,
  IconTrendingUp,
  IconUserPlus,
  IconCalendar
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <img src="/assets/wkn_logo.png" alt="WKN" className="h-6 w-auto" />
          </div>
          <div>
            <h1 className="font-outfit font-bold text-lg leading-tight">WKNsite</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Management</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
          <NavItem icon={<IconLayoutDashboard size={18} />} label="Ringkasan" active />
          
          <NavCategory label="People & Culture">
            <NavItem icon={<IconUsers size={18} />} label="Data Karyawan" />
            <NavItem icon={<IconCalendar size={18} />} label="Manajemen Cuti" />
          </NavCategory>

          <NavCategory label="Operations & Time">
            <NavItem icon={<IconClock size={18} />} label="Log Kehadiran" />
            <NavItem icon={<IconClock size={18} />} label="Rekap Lembur" />
          </NavCategory>

          <NavCategory label="Finance & Admin">
            <NavItem icon={<IconCreditCard size={18} />} label="Sistem Payroll" />
            <NavItem icon={<IconSettings size={18} />} label="Manajemen User" />
          </NavCategory>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
          >
            <IconLogout size={18} />
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari karyawan, laporan, atau fitur..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="h-10 w-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-full transition-colors relative">
              <IconBell size={20} />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{user?.role}</span>
              </div>
              <div className="h-10 w-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} alt="Avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Bento Grid Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-outfit">Selamat Datang, {user?.name?.split(' ')[0]} 👋</h2>
                <p className="text-slate-500 text-sm">Berikut adalah ringkasan operasional hari ini.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="bg-white">Ekspor Laporan</Button>
                <Button size="sm">Sinkron Data</Button>
              </div>
            </header>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-fit">
              {/* Stat 1: Total Employees */}
              <Card className="md:col-span-1 shadow-sm border-slate-200/60 bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                      <IconUsers size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+2.5%</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Karyawan</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1 font-outfit">124</h3>
                </CardContent>
              </Card>

              {/* Stat 2: Attendance Rate */}
              <Card className="md:col-span-1 shadow-sm border-slate-200/60 bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                      <IconClock size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">On Time</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kehadiran Hari Ini</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1 font-outfit">98%</h3>
                </CardContent>
              </Card>

              {/* Main Chart (Large Bento) */}
              <Card className="md:col-span-2 md:row-span-2 shadow-sm border-slate-200/60 bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md font-bold font-outfit text-slate-700">Analisis Pengeluaran</CardTitle>
                    <IconTrendingUp size={18} className="text-slate-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col items-center justify-center min-h-[300px] bg-gradient-to-br from-white to-slate-50">
                   <div className="text-slate-400 text-center p-8">
                      <div className="relative h-40 w-40 mb-6 mx-auto">
                        <div className="absolute inset-0 rounded-full border-8 border-slate-100"></div>
                        <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-pulse opacity-20"></div>
                        <IconLayoutDashboard size={48} className="absolute inset-0 m-auto opacity-10" />
                      </div>
                      <p className="text-sm font-medium text-slate-400 mb-1">Visualisasi Data</p>
                      <p className="text-xs italic text-slate-300">Migrasi grafik sedang diproses...</p>
                   </div>
                </CardContent>
              </Card>

              {/* Stat 3: Employees on Leave */}
              <Card className="md:col-span-1 shadow-sm border-slate-200/60 bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                      <IconCalendar size={20} />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Karyawan Cuti</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1 font-outfit">5</h3>
                </CardContent>
              </Card>

              {/* Stat 4: Expiring Contracts */}
              <Card className="md:col-span-1 shadow-sm border-slate-200/60 bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
                      <IconUserPlus size={20} />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kontrak Berakhir</p>
                  <h3 className="text-3xl font-bold text-rose-500 mt-1 font-outfit">2</h3>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }) => (
  <button className={`
    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
    ${active 
      ? 'bg-primary text-white shadow-lg shadow-primary/25' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
  `}>
    {icon}
    <span>{label}</span>
  </button>
);

const NavCategory = ({ label, children }) => (
  <div className="pt-4 pb-1">
    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 opacity-70">{label}</p>
    <div className="space-y-0.5">
      {children}
    </div>
  </div>
);

export default Dashboard;
