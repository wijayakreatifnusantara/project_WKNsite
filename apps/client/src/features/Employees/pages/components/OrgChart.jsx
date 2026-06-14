import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  IconHierarchy2, 
  IconZoomIn, 
  IconZoomOut, 
  IconMaximize, 
  IconUsers, 
  IconBuildingSkyscraper,
  IconSearch,
  IconArrowsMove
} from "@tabler/icons-react";

const OrgChart = ({ employees, viewMode, setViewMode }) => {
  const [zoom, setZoom] = useState(0.8);
  const [searchTerm, setSearchTerm] = useState('');
  const viewportRef = useRef(null);

  // Drag-to-pan state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Auto-center scroll on mount or data change
  useEffect(() => {
    if (viewportRef.current && employees.length > 0) {
      const timer = setTimeout(() => {
        const viewport = viewportRef.current;
        const centerX = (viewport.scrollWidth - viewport.clientWidth) / 2;
        const centerY = (viewport.scrollHeight - viewport.clientHeight) / 2;
        viewport.scrollTo({
          left: centerX,
          top: centerY,
          behavior: 'smooth'
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [employees.length, viewMode]);

  // Group employees by department
  const deptTree = useMemo(() => {
    const departments = {};
    const empList = Array.isArray(employees) ? employees : [];
    empList.forEach(emp => {
      const dept = emp?.["Division Name *"] || 'Unassigned';
      if (!departments[dept]) departments[dept] = [];
      departments[dept].push(emp);
    });
    return departments;
  }, [employees]);

  const handleZoom = (delta) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.3), 1.5));
  };

  // Drag-to-pan logic
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setStartX(e.pageX - viewportRef.current.offsetLeft);
    setStartY(e.pageY - viewportRef.current.offsetTop);
    setScrollLeft(viewportRef.current.scrollLeft);
    setScrollTop(viewportRef.current.scrollTop);
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - viewportRef.current.offsetLeft;
    const y = e.pageY - viewportRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    viewportRef.current.scrollLeft = scrollLeft - walkX;
    viewportRef.current.scrollTop = scrollTop - walkY;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 animate-fade-in relative">
      {/* Chart Header */}
      <header className="h-16 bg-transparent border-b border-white/50 flex items-center justify-between px-8 shrink-0 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#E31E24]/10 rounded-lg flex items-center justify-center text-[#E31E24]">
            <IconHierarchy2 size={18} />
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-800 font-outfit uppercase tracking-tight leading-none">Struktur Organisasi</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] font-bold text-[#E31E24] bg-red-50/50 px-2 py-0.5 rounded-full border border-red-100/60">{employees.length} KARYAWAN TERLOAD</span>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider opacity-70">• Geser untuk menggeser bagan</p>
            </div>
          </div>
        </div>

        {/* Right Aligned Controls Row */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <IconSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari Karyawan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-44 h-9 pl-9 pr-3 bg-[#f0f2f5] shadow-neu-inset border-none rounded-lg text-[10px] font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-transparent focus:border-[#E31E24]/30 focus:ring-1 focus:ring-[#E31E24]/20 transition-all uppercase tracking-wider"
            />
          </div>

          <div className="flex items-center gap-1 bg-transparent border border-white/50 p-1 rounded-lg shadow-neu">
            <button onClick={() => handleZoom(-0.1)} className="h-7 w-7 flex items-center justify-center rounded hover:shadow-neu-inset transition-all text-slate-400 hover:text-[#E31E24]">
              <IconZoomOut size={14} />
            </button>
            <span className="text-[9px] font-bold text-slate-500 min-w-[36px] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => handleZoom(0.1)} className="h-7 w-7 flex items-center justify-center rounded hover:shadow-neu-inset transition-all text-slate-400 hover:text-[#E31E24]">
              <IconZoomIn size={14} />
            </button>
            <div className="w-[1px] h-3 bg-slate-200 mx-1"></div>
            <button onClick={() => setZoom(0.8)} className="h-7 w-7 flex items-center justify-center rounded hover:shadow-neu-inset transition-all text-slate-400 hover:text-[#E31E24]">
              <IconMaximize size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <div 
        ref={viewportRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className={`flex-1 overflow-hidden relative cursor-${isDragging ? 'grabbing' : 'grab'} bg-slate-50/50`}
      >
        <div 
          className="p-[300px] min-w-max transition-transform duration-100 origin-center flex flex-col items-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Root Node: Company */}
          <div className="bg-transparent border border-white/50 shadow-neu rounded-xl p-5 w-[260px] text-center mb-16 relative">
            <div className="h-10 w-10 bg-[#E31E24]/10 rounded-lg flex items-center justify-center mx-auto mb-3 text-[#E31E24]">
              <IconBuildingSkyscraper size={22} />
            </div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight font-outfit">PT. Wijaya Karya Nusantara</h2>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1">Kantor Pusat / Head Office</p>
            
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[1px] h-16 bg-slate-250"></div>
          </div>

          {/* Department Level */}
          <div className="flex gap-12 items-start">
            {Object.entries(deptTree).map(([dept, staff]) => (
              <div key={dept} className="flex flex-col items-center">
                {/* Dept Node */}
                <div className="bg-transparent border border-white/50/80 shadow-neu rounded-xl p-4 w-[210px] relative">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-50/50 border border-blue-100/50 rounded-lg flex items-center justify-center text-blue-600">
                      <IconUsers size={16} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-tight leading-tight">{dept}</h3>
                      <p className="text-[8px] font-bold text-[#E31E24] uppercase mt-0.5">{staff.length} Karyawan</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[1px] h-8 bg-slate-200"></div>
                </div>

                {/* Staff Cards */}
                <div className="mt-8 space-y-2.5 flex flex-col items-center">
                  {staff.filter(e => !searchTerm || e["EMPLOYEE NAME"].toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 15).map((emp) => (
                    <div 
                      key={emp["EMPLOYEE ID"]} 
                      className={`group bg-transparent border border-white/50/60 shadow-neu rounded-lg p-2.5 w-[190px] flex items-center gap-2.5 hover:border-[#E31E24]/20 transition-all cursor-default ${searchTerm && emp["EMPLOYEE NAME"].toLowerCase().includes(searchTerm.toLowerCase()) ? 'ring-1 ring-[#E31E24] bg-red-50/10' : ''}`}
                    >
                      <div className="h-7 w-7 bg-[#f0f2f5] shadow-neu-inset border-none rounded-md flex items-center justify-center text-[9px] font-bold text-slate-600 shrink-0">
                        {emp["EMPLOYEE NAME"].split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 overflow-hidden text-left leading-none">
                        <h4 className="text-[9px] font-bold text-slate-800 uppercase truncate mb-1">{emp["EMPLOYEE NAME"]}</h4>
                        <p className="text-[7px] font-semibold text-slate-450 uppercase truncate">{emp["Job Position *"]}</p>
                      </div>
                    </div>
                  ))}
                  {staff.length > 15 && (
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest py-2">
                      +{staff.length - 15} Karyawan Lainnya
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Legend */}
      <div className="absolute bottom-6 left-6 z-15">
        <div className="bg-white/90 backdrop-blur border border-white/50/80 shadow-neu rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
            <span className="text-[8px] font-bold text-slate-550 uppercase tracking-wider">Kluster Divisi / Unit</span>
          </div>
          <div className="flex items-center gap-2">
            <IconArrowsMove size={11} className="text-slate-400" />
            <span className="text-[8px] font-bold text-slate-450 uppercase tracking-wider">Klik-Kiri & Tahan untuk Menggeser</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgChart;
