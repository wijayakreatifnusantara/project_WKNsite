import React, { useState, useEffect } from 'react';
import { 
  IconUsers, 
  IconClock, 
  IconChartBar,
  IconDotsVertical,
  IconArrowUpRight,
  IconArrowDownRight,
  IconRefresh,
  IconUserCheck,
  IconUserX,
  IconClockPlay,
  IconClockExclamation,
  IconInfoCircle,
  IconCheck
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Skeleton } from "@/components/ui/Skeleton";
import AnalyticsGrid from './components/AnalyticsGrid';
import { generateExecutiveReport } from './utils/exportReport';
import { toast } from 'sonner';

const Overview = () => {
  const { profile, isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]); // Default empty for Empty State demo

  // Stats Data
  const [stats, setStats] = useState({
    hadir: 0,
    absen: 0,
    lembur: 0,
    telat: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/employees?size=500');
      const employeeData = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setEmployees(employeeData);
      
      // Hitung mock data atau sesuaikan dengan data API sebenarnya
      // Karena endpoint dasbor khusus mungkin belum ada, kita berikan data simulasi representatif
      const totalEmp = employeeData.length || 150;
      setStats({
        hadir: Math.floor(totalEmp * 0.85),
        absen: Math.floor(totalEmp * 0.05),
        lembur: 24, // dalam jam
        telat: Math.floor(totalEmp * 0.10)
      });
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-transparent custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Morning Briefing / Greeting */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              Selamat Pagi, <span className="text-[#E31E24]">{profile?.full_name?.split(' ')[0] || 'Administrator'}</span> 👋
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Berikut adalah ringkasan operasional dan kehadiran tim Anda hari ini.
            </p>
          </div>
          {isAdmin() && (
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  const success = generateExecutiveReport(employees);
                  if (success) toast.success("Laporan berhasil diekspor.");
                  else toast.error("Gagal membuat laporan.");
                }}
                className="h-10 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all flex gap-2 items-center"
              >
                <IconChartBar size={16} />
                Export Data
              </Button>
              <Button 
                onClick={fetchData}
                disabled={loading}
                className="h-10 px-4 rounded-lg bg-[#E31E24] text-white hover:bg-[#C1181E] shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex gap-2 items-center border border-transparent"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <IconRefresh size={16} />}
                Refresh
              </Button>
            </div>
          )}
        </header>

        {/* Clean Light Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard 
            data-tooltip="Karyawan Hadir" 
            value={stats.hadir} 
            subtitle="Tepat Waktu & Telat"
            icon={<IconUserCheck size={22} />} 
            trend="+12%" 
            positive={true} 
            colorClass="text-emerald-600 bg-emerald-50"
          />
          <StatCard 
            data-tooltip="Tidak Hadir / Absen" 
            value={stats.absen} 
            subtitle="Cuti, Izin, Sakit, Alpha"
            icon={<IconUserX size={22} />} 
            trend="-2%" 
            positive={true} 
            colorClass="text-slate-600 bg-slate-100"
          />
          <StatCard 
            data-tooltip="Karyawan Telat" 
            value={stats.telat} 
            subtitle="Lewat dari jam masuk"
            icon={<IconClockExclamation size={22} />} 
            trend="+5%" 
            positive={false} 
            colorClass="text-amber-600 bg-amber-50"
          />
          <StatCard 
            data-tooltip="Total Lembur" 
            value={`${stats.lembur} Jam`} 
            subtitle="Menunggu persetujuan"
            icon={<IconClockPlay size={22} />} 
            trend="+8%" 
            positive={true} 
            colorClass="text-blue-600 bg-blue-50"
          />
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analytics Hub */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Analitik Kehadiran</h3>
              <Button variant="ghost" size="sm" className="text-[#E31E24] text-xs font-semibold hover:bg-red-50">
                Lihat Detail Laporan
              </Button>
            </div>
            {loading ? (
              <div className="h-96 w-full bg-white shadow-sm border border-slate-200 rounded-xl p-6 space-y-4">
                <Skeleton className="h-8 w-1/3 opacity-50" />
                <Skeleton className="h-[280px] w-full rounded-lg opacity-50" />
              </div>
            ) : employees.length === 0 ? (
              <div className="h-96 w-full bg-white shadow-sm border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center animate-fade-in">
                 <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <IconUsers size={32} className="text-slate-400" />
                 </div>
                 <h4 className="text-lg font-bold text-slate-800">Belum Ada Data Karyawan</h4>
                 <p className="text-sm text-slate-500 mt-2 max-w-sm">Data analitik kehadiran akan otomatis dibuat setelah Anda mendaftarkan karyawan ke dalam sistem.</p>
                 <Button className="mt-6 bg-[#E31E24] hover:bg-[#C1181E] text-white rounded-lg active:scale-[0.98] transition-all shadow-sm">
                    Undang Karyawan
                 </Button>
              </div>
            ) : (
              <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-2 overflow-hidden">
                <AnalyticsGrid employees={employees} />
              </div>
            )}
          </div>

          {/* Recent Activity Timeline */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Aktivitas Terkini</h3>
              <IconDotsVertical size={16} className="text-slate-500" />
            </div>
            
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col h-[400px]">
              <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-5 relative h-full flex flex-col">
                  {activities.length > 0 ? (
                    <>
                      {/* Vertical Line for Timeline */}
                      <div className="absolute left-[39px] top-6 bottom-6 w-[2px] bg-slate-100"></div>
                      <div className="space-y-6">
                        {activities.map((act, i) => (
                          <ActivityItem key={i} {...act} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <IconClockExclamation size={28} className="text-slate-400" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">Belum Ada Aktivitas</h4>
                      <p className="text-xs text-slate-500 mt-2 max-w-[200px] leading-relaxed">Aktivitas karyawan seperti clock-in atau lembur akan muncul di sini.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActivities([
                          { title: "Budi Santoso Clock-in", time: "Baru saja", icon: <IconCheck size={14} />, type: "success", desc: "Via Mobile App di Area WKN HQ" },
                          { title: "Pengajuan Lembur: Ahmad", time: "10 menit lalu", icon: <IconInfoCircle size={14} />, type: "info", desc: "Mengajukan 4 jam lembur untuk proyek X" }
                        ])}
                        className="mt-6 text-xs font-bold text-[#E31E24] border-red-100 bg-red-50 hover:bg-red-100 rounded-lg active:scale-[0.98] transition-all duration-200"
                      >
                        Muat Data Simulasi
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, trend, positive, colorClass }) => (
  <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer group relative overflow-hidden">
    {/* Subtle Background Accent */}
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${colorClass.split(' ')[1]}`}></div>
    
    <div className="flex flex-col gap-4 relative z-10">
      <div className="flex items-start justify-between">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${colorClass}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend}
          {positive ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        <p className="text-sm font-bold text-slate-600 mt-1">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ title, time, icon, type, desc }) => {
  const colorMap = {
    warning: "bg-amber-100 text-amber-600 border-amber-200",
    success: "bg-emerald-100 text-emerald-600 border-emerald-200",
    info: "bg-blue-100 text-blue-600 border-blue-200",
    default: "bg-slate-100 text-slate-600 border-slate-200"
  };

  return (
    <div className="flex gap-4 relative group cursor-pointer">
      <div className="flex flex-col items-center">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center z-10 transition-transform duration-200 group-hover:scale-110 shadow-sm bg-white border border-slate-100 ${colorMap[type]}`}>
          {icon}
        </div>
      </div>
      <div className="pt-2 pb-1">
        <div className="flex items-baseline gap-2">
          <h5 className="text-sm font-bold text-slate-800 group-hover:text-[#E31E24] transition-colors">{title}</h5>
          <span className="text-xs font-semibold text-slate-500">{time}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

export default Overview;
