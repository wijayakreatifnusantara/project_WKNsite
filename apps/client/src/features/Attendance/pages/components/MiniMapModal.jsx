import React from 'react';
import { IconX, IconMapPin } from '@tabler/icons-react';
import { Card } from '@/components/ui/card';

const MiniMapModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const { location_lat, location_lng, target_name, distance_meters } = data;

  // Google Maps embed URL using simple coordinates
  // We use the point and a generic marker if we have lat/lng
  const mapUrl = location_lat && location_lng 
    ? `https://maps.google.com/maps?q=${location_lat},${location_lng}&z=16&output=embed`
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm  animate-fade-in">
      <Card className="w-full max-w-md overflow-hidden bg-transparent shadow-sm rounded-2xl animate-scale-up border-0 ring-1 ring-slate-200">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50/80  border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-ios-primary/10">
              <IconMapPin size={18} className="text-ios-primary" />
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-widest text-slate-800 uppercase">Location Data</h3>
              <p className="text-xs font-medium text-slate-500">{target_name || 'Unknown Location'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 text-slate-400 transition-colors rounded-lg hover:bg-slate-200 hover:text-slate-700"
          >
            <IconX size={18} />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          {mapUrl ? (
            <div className="relative w-full h-64 overflow-hidden border border-slate-200 rounded-xl bg-slate-100">
              <iframe 
                src={mapUrl}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-64 text-center border border-dashed rounded-xl border-slate-200 bg-slate-50">
              <IconMapPin size={32} className="mb-2 text-slate-300" />
              <p className="text-xs font-medium text-slate-500">No coordinate data available</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
             <div className="p-3 bg-white shadow-sm border-none rounded-xl">
                <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-1">Target Location</p>
                <p className="text-xs font-bold text-slate-700 truncate">{target_name || '-'}</p>
             </div>
             <div className="p-3 bg-white shadow-sm border-none rounded-xl">
                <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-1">Distance Variance</p>
                <p className="text-xs font-bold text-slate-700">
                   {distance_meters != null ? `${distance_meters} meters` : '-'}
                </p>
             </div>
             <div className="p-3 bg-white shadow-sm border-none rounded-xl col-span-2">
                <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-1">Coordinates</p>
                <p className="text-xs font-mono font-medium text-slate-600">
                   {location_lat && location_lng ? `${location_lat}, ${location_lng}` : 'N/A'}
                </p>
             </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MiniMapModal;
