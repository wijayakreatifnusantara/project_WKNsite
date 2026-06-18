import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  IconLoader2,
  IconHandGrab,
  IconArrowsMove
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";

const OrgChart = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(0.8); // Start slightly zoomed out for better overview
  const [searchTerm, setSearchTerm] = useState('');
  const viewportRef = useRef(null);
  
  // Drag-to-pan state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Auto-center scroll on mount
  useEffect(() => {
    if (viewportRef.current && !loading && employees.length > 0) {
      const timer = setTimeout(() => {
        const viewport = viewportRef.current;
        viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
        viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Fetch a larger set for Org Chart to see the full structure
      const response = await fetch('/api/employees?page=1&size=1000');
      const result = await response.json();
      setEmployees(result.data || result || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoom = (delta) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.3), 1.5));
  };

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

  // Drag-to-pan logic
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <IconLoader2 size={40} className="animate-spin text-ios-primary" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Constructing Neural Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-in relative">
      {/* Chart Header */}
      <header className="h-20 bg-white/90  border-b border-white flex items-center justify-between px-10 shrink-0 z-20 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-transparent shadow-sm rounded-xl flex items-center justify-center text-ios-primary border border-white">
            <IconHierarchy2 size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 font-outfit uppercase tracking-tight">Organization Neural Structure</h1>
            <div className="flex items-center gap-2">
               <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest opacity-70">Interactive Canvas • </p>
               <div className="flex items-center gap-1">
                  <IconHandGrab size={10} className="text-slate-400" />
                  <span className="text-[11px] font-semibold text-ios-primary uppercase tracking-widest">Drag to Pan</span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group">
            <IconSearch size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-ios-primary transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 h-9 pl-10 pr-4 bg-white shadow-sm border-none rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none transition-all uppercase tracking-widest"
            />
          </div>

          <div className="flex items-center gap-2 bg-white shadow-sm p-1 rounded-xl border-white border">
            <button onClick={() => handleZoom(-0.1)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-transparent transition-all text-slate-400 hover:text-ios-primary">
              <IconZoomOut size={14} />
            </button>
            <span className="text-xs font-bold text-slate-500 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => handleZoom(0.1)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-transparent transition-all text-slate-400 hover:text-ios-primary">
              <IconZoomIn size={14} />
            </button>
            <div className="w-[1px] h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => setZoom(0.8)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-transparent transition-all text-slate-400 hover:text-ios-primary">
              <IconMaximize size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport - Canvas Style */}
      <div 
        ref={viewportRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className={`flex-1 overflow-hidden relative cursor-${isDragging ? 'grabbing' : 'grab'} bg-slate-50/30`}
      >
        <div 
          className="p-[1000px] min-w-max transition-transform duration-100 origin-center flex flex-col items-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {employees.length === 0 ? (
            <div className="bg-transparent p-12 rounded-[3rem] shadow-sm text-center border-2 border-dashed border-slate-200">
              <IconUsers size={48} className="text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Personnel Data Found</p>
            </div>
          ) : (
            <>
              {/* Root Node: Company (More Compact) */}
              <div className="bg-transparent shadow-sm rounded-2xl border-[4px] border-white p-6 w-[280px] text-center mb-16 relative">
                <div className="h-14 w-14 bg-white shadow-sm rounded-xl flex items-center justify-center mx-auto mb-4 border border-slate-200 text-ios-primary">
                  <IconBuildingSkyscraper size={28} />
                </div>
                <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight font-outfit">PT. Wijaya Karya Nusantara</h2>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">HQ Master Node</p>
                
                {/* Spine */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-1 h-16 bg-gradient-to-b from-slate-200 to-transparent"></div>
              </div>

              {/* Department Level */}
              <div className="flex gap-16 items-start">
                {Object.entries(deptTree).map(([dept, staff]) => (
                  <div key={dept} className="flex flex-col items-center">
                    {/* Dept Node (More Compact) */}
                    <div className="bg-transparent shadow-sm rounded-xl border-2 border-white p-5 w-[220px] relative">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                          <IconUsers size={20} />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight leading-tight">{dept}</h3>
                          <p className="text-[11px] font-semibold text-ios-primary uppercase mt-0.5">{staff.length} Units</p>
                        </div>
                      </div>
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[1px] h-8 bg-slate-200"></div>
                    </div>

                    {/* Staff Cards (High Density) */}
                    <div className="mt-8 space-y-3 flex flex-col items-center">
                      {staff.filter(e => !searchTerm || e["EMPLOYEE NAME"].toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 15).map((emp) => (
                        <div 
                          key={emp["EMPLOYEE ID"]} 
                          className={`group bg-white/80 shadow-sm rounded-xl border border-slate-200 p-3 w-[200px] flex items-center gap-3 hover:translate-x-1 transition-all cursor-default ${searchTerm && emp["EMPLOYEE NAME"].toLowerCase().includes(searchTerm.toLowerCase()) ? 'ring-2 ring-ios-primary bg-red-50' : ''}`}
                        >
                          <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-ios-primary shrink-0">
                            {emp["EMPLOYEE NAME"].split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 overflow-hidden text-left">
                            <h4 className="text-xs font-bold text-slate-800 uppercase truncate leading-none mb-1">{emp["EMPLOYEE NAME"]}</h4>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase truncate">{emp["Job Position *"]}</p>
                          </div>
                        </div>
                      ))}
                      {staff.length > 15 && (
                        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest py-2">
                          +{staff.length - 15} More Nodes
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Controls Overlay */}
      <div className="absolute bottom-10 left-10 flex flex-col gap-4">
         <div className="bg-white/90 backdrop-blur shadow-sm rounded-2xl p-4 border border-white flex flex-col gap-3">
            <div className="flex items-center gap-3">
               <div className="h-2 w-2 rounded-full bg-blue-500"></div>
               <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Division Node</span>
            </div>
            <div className="flex items-center gap-3">
               <IconArrowsMove size={12} className="text-slate-400" />
               <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Hold Left-Click to Move Canvas</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default OrgChart;
