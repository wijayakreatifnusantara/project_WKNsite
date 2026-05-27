import React, { useEffect, useState } from 'react';
import { IconMapPin, IconScan } from '@tabler/icons-react';

const GeolocationRadar = () => {
  const [blips, setBlips] = useState([]);

  // Simulate incoming check-ins
  useEffect(() => {
    const interval = setInterval(() => {
      const newBlip = {
        id: Date.now(),
        x: Math.random() * 80 + 10, // 10% to 90%
        y: Math.random() * 80 + 10,
        size: Math.random() * 10 + 5,
        opacity: 1
      };
      setBlips(prev => [...prev, newBlip]);

      setTimeout(() => {
        setBlips(prev => prev.filter(b => b.id !== newBlip.id));
      }, 3000); // blip fades out after 3 seconds
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0f172a] rounded-2xl p-4 shadow-xl flex flex-col justify-between items-center text-center relative overflow-hidden border border-slate-800 h-full">
      <style>{`
        .radar-sweep {
          position: absolute;
          width: 50%;
          height: 50%;
          bottom: 50%;
          right: 50%;
          transform-origin: bottom right;
          background: conic-gradient(from 90deg, transparent 270deg, rgba(227, 30, 36, 0.4) 360deg);
          animation: sweep 4s linear infinite;
          border-radius: 100% 0 0 0;
        }
        @keyframes sweep {
          to { transform: rotate(360deg); }
        }
        .ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
      
      {/* Header */}
      <div className="z-10 w-full flex justify-between items-center mb-2">
        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-1.5">
          <IconScan size={14} className="text-[#E31E24]" /> Live Geofence
        </h4>
        <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full">
          <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[6px] font-bold text-slate-300 uppercase">Active</span>
        </div>
      </div>

      {/* Radar Map */}
      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border border-slate-700 bg-slate-900/50 flex items-center justify-center overflow-hidden my-2">
        {/* Grid lines */}
        <div className="absolute w-full h-[1px] bg-slate-700/50"></div>
        <div className="absolute h-full w-[1px] bg-slate-700/50"></div>
        <div className="absolute w-2/3 h-2/3 rounded-full border border-slate-700/50"></div>
        <div className="absolute w-1/3 h-1/3 rounded-full border border-slate-700/50"></div>
        
        {/* Radar Sweep */}
        <div className="radar-sweep"></div>
        
        {/* HQ Pin */}
        <IconMapPin size={16} className="text-[#E31E24] absolute z-10 drop-shadow-[0_0_5px_rgba(227,30,36,0.8)]" />

        {/* Dynamic Blips */}
        {blips.map(blip => (
          <div 
            key={blip.id}
            className="absolute rounded-full bg-emerald-400 ping"
            style={{
              left: \`\${blip.x}%\`,
              top: \`\${blip.y}%\`,
              width: blip.size,
              height: blip.size
            }}
          ></div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="z-10 w-full flex gap-2 mt-2">
         <div className="flex-1 px-2 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <p className="text-[12px] font-black text-white">42</p>
            <p className="text-[6px] text-slate-500 uppercase font-bold">Zones</p>
         </div>
         <div className="flex-1 px-2 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <p className="text-[12px] font-black text-emerald-400">0</p>
            <p className="text-[6px] text-slate-500 uppercase font-bold">Breaches</p>
         </div>
      </div>
    </div>
  );
};

export default GeolocationRadar;
