import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  IconHierarchy2, 
  IconZoomIn, 
  IconZoomOut, 
  IconMaximize, 
  IconUsers, 
  IconBuildingSkyscraper,
  IconChevronRight,
  IconChevronDown,
  IconSearch,
  IconArrowsMove,
  IconHandGrab
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";

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
        // Center relative to the actual content dimensions
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

  // Group employees by department for the chart
  const deptTree = useMemo(() => {
    const departments = {};
    const empList = Array.isArray(employees) ? employees : [];
    empList.forEach(emp => {
      const dept = emp?.["Organization Name *"] || 'Unassigned';
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
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f2f5] animate-fade-in relative">
      {/* Chart Header */}
      <header className="h-20 bg-[#f0f2f5] border-b-2 border-white flex items-center justify-between px-10 shrink-0 z-10 relative">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] rounded-xl flex items-center justify-center text-[#E31E24] border border-white">
            <IconHierarchy2 size={24} />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800 font-outfit uppercase tracking-tight leading-none">Neural Structure</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] font-black text-[#E31E24] bg-red-50 px-2 py-0.5 rounded-full border border-red-100">{employees.length} PERSONNEL LOADED</span>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-70">• Drag to Pan</p>
            </div>
          </div>
        </div>

        {/* Right Aligned Controls Row */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <IconSearch size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E31E24] transition-colors" />
            <input 
              type="text" 
              placeholder="Locate Personnel..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 h-10 pl-10 pr-4 bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] border-none rounded-xl text-[10px] font-black text-slate-700 placeholder:text-slate-300 focus:outline-none transition-all uppercase tracking-widest"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#f0f2f5] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] p-1.5 rounded-xl border-white border-2">
            <button onClick={() => handleZoom(-0.1)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white transition-all text-slate-400 hover:text-[#E31E24]">
              <IconZoomOut size={16} />
            </button>
            <span className="text-[10px] font-black text-slate-500 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => handleZoom(0.1)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white transition-all text-slate-400 hover:text-[#E31E24]">
              <IconZoomIn size={16} />
            </button>
            <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
            <button onClick={() => setZoom(0.8)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white transition-all text-slate-400 hover:text-[#E31E24]">
              <IconMaximize size={16} />
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
        className={`flex-1 overflow-hidden relative cursor-${isDragging ? 'grabbing' : 'grab'} bg-slate-50/30`}
      >
        <div 
          className="p-[300px] min-w-max transition-transform duration-100 origin-center flex flex-col items-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Root Node: Company (Compact) */}
          <div className="bg-white shadow-[15px_15px_30px_rgba(0,0,0,0.05)] rounded-[2rem] border-[4px] border-white p-6 w-[280px] text-center mb-16 relative">
            <div className="h-14 w-14 bg-[#f0f2f5] shadow-sm rounded-xl flex items-center justify-center mx-auto mb-4 border border-slate-100 text-[#E31E24]">
              <IconBuildingSkyscraper size={28} />
            </div>
            <h2 className="text-base font-black text-slate-800 uppercase tracking-tight font-outfit">PT. Wijaya Karya Nusantara</h2>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">HQ Master Node</p>
            
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-1 h-16 bg-gradient-to-b from-slate-200 to-transparent"></div>
          </div>

          {/* Department Level */}
          <div className="flex gap-16 items-start">
            {Object.entries(deptTree).map(([dept, staff]) => (
              <div key={dept} className="flex flex-col items-center">
                {/* Dept Node (Compact) */}
                <div className="bg-white shadow-[10px_10px_20px_rgba(0,0,0,0.03)] rounded-[1.5rem] border-2 border-white p-5 w-[220px] relative">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                      <IconUsers size={20} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-tight leading-tight">{dept}</h3>
                      <p className="text-[8px] font-black text-[#E31E24] uppercase mt-0.5">{staff.length} Units</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[1px] h-8 bg-slate-200"></div>
                </div>

                {/* Staff Cards (High Density) */}
                <div className="mt-8 space-y-3 flex flex-col items-center">
                  {staff.filter(e => !searchTerm || e["EMPLOYEE NAME"].toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 15).map((emp) => (
                    <div 
                      key={emp["EMPLOYEE ID"]} 
                      className={`group bg-white/80 shadow-sm rounded-xl border border-slate-100 p-3 w-[200px] flex items-center gap-3 hover:translate-x-1 transition-all cursor-default ${searchTerm && emp["EMPLOYEE NAME"].toLowerCase().includes(searchTerm.toLowerCase()) ? 'ring-2 ring-[#E31E24] bg-red-50' : ''}`}
                    >
                      <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-[9px] font-black text-[#E31E24] shrink-0">
                        {emp["EMPLOYEE NAME"].split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 overflow-hidden text-left">
                        <h4 className="text-[9px] font-black text-slate-800 uppercase truncate leading-none mb-1">{emp["EMPLOYEE NAME"]}</h4>
                        <p className="text-[7px] font-bold text-slate-400 uppercase truncate">{emp["Job Position *"]}</p>
                      </div>
                    </div>
                  ))}
                  {staff.length > 15 && (
                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest py-2">
                      +{staff.length - 15} More Nodes
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Legend */}
      <div className="absolute bottom-6 left-6">
        <div className="bg-white/90 backdrop-blur shadow-xl rounded-2xl p-4 border border-white flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Division Cluster</span>
          </div>
          <div className="flex items-center gap-2">
            <IconArrowsMove size={12} className="text-slate-400" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hold Left-Click to Move</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgChart;
