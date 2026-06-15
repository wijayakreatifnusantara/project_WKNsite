import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiClient } from '@/lib/apiClient';
import { IconMapPin, IconRefresh, IconRadar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LiveTracking = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchLocations = async () => {
    try {
      const res = await apiClient.get('/tracking/active');
      if (res.data && Array.isArray(res.data.data)) {
        setEmployees(res.data.data);
      } else if (Array.isArray(res.data)) {
        setEmployees(res.data);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch tracking data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    // Poll every 10 seconds
    const interval = setInterval(fetchLocations, 10000);
    return () => clearInterval(interval);
  }, []);

  const createCustomIcon = (photoUrl, name) => {
    const avatar = photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 40px; 
          height: 40px; 
          border-radius: 50%; 
          border: 3px solid #ef4444; 
          background-image: url('${avatar}');
          background-size: cover;
          background-position: center;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          position: relative;
        ">
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid #ef4444;
          "></div>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
      popupAnchor: [0, -48]
    });
  };

  // Center on Jakarta if no data, otherwise center on first employee
  const center = employees.length > 0 && employees[0].last_lat 
    ? [employees[0].last_lat, employees[0].last_lng] 
    : [-6.2088, 106.8456];

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in font-outfit">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-wider flex items-center gap-3">
            <IconRadar className="text-blue-600 animate-pulse" size={28} />
            Live Tracking Radar
          </h1>
          <p className="text-sm text-slate-500 mt-1">Pantau pergerakan karyawan secara real-time</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Update Terakhir</p>
            <p className="text-sm font-medium text-slate-700">{dayjs(lastUpdated).format('HH:mm:ss')}</p>
          </div>
          <button 
            onClick={() => { setLoading(true); fetchLocations(); }}
            className="h-10 w-10 bg-transparent border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm"
          >
            <IconRefresh size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-transparent rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        {loading && employees.length === 0 ? (
          <div className="absolute inset-0 z-10 bg-white/80  flex items-center justify-center">
            <IconRadar className="text-blue-600 animate-spin" size={48} />
          </div>
        ) : null}

        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {employees.map((emp) => (
            emp.last_lat && emp.last_lng && (
              <Marker 
                key={emp.id} 
                position={[emp.last_lat, emp.last_lng]}
                icon={createCustomIcon(emp.photo, emp.name)}
              >
                <Popup className="custom-popup">
                  <div className="p-1">
                    <h3 className="font-bold text-slate-800 text-sm">{emp.name}</h3>
                    <p className="text-xs text-slate-500 mb-2">{emp.job_position} • {emp.division_name}</p>
                    <div className="flex items-center gap-1.5 text-xs bg-slate-50 p-2 rounded-md border border-slate-200">
                      <IconMapPin size={12} className="text-rose-500" />
                      <span className="text-slate-600">
                        Diperbarui: <strong className="text-slate-800">{dayjs().to(dayjs(emp.last_location_update))}</strong>
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
        
        {/* Radar Overlay Indicator */}
        <div className="absolute bottom-6 right-6 z-[1000] bg-white/90  px-4 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">{employees.length} Karyawan Aktif</p>
            <p className="text-xs text-slate-500">Memancarkan sinyal GPS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
