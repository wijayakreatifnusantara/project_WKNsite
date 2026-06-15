import React, { useState, useEffect } from 'react';
import { 
  IconDeviceLaptop, 
  IconCar, 
  IconArmchair, 
  IconTools, 
  IconPlus,
  IconSearch,
  IconFilter,
  IconUserCircle,
  IconHistory,
  IconQrcode,
  IconArrowsLeftRight,
  IconCheck,
  IconCamera
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAssets } from './hooks/useAssets';
import AssetFormModal from './components/AssetFormModal';
import AssignAssetModal from './components/AssignAssetModal';
import AssetHistoryModal from './components/AssetHistoryModal';
import AssetQRModal from './components/AssetQRModal';
import QRScannerModal from './components/QRScannerModal';

const AssetInventory = () => {
  const { assets, fetchAssets, returnAsset, loading } = useAssets();
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assignModal, setAssignModal] = useState({ open: false, asset: null });
  const [historyModal, setHistoryModal] = useState({ open: false, asset: null });
  const [qrModal, setQrModal] = useState({ open: false, asset: null });
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScanSuccess = (decodedText) => {
    setSearchQuery(decodedText);
    setIsScannerOpen(false);
    // Visual feedback or auto-scroll can be added here
  };



  useEffect(() => {
    fetchAssets(selectedStatus);
  }, [fetchAssets, selectedStatus]);

  const stats = [
    { label: 'Total Assets', value: assets.length, icon: <IconDeviceLaptop size={20} />, color: 'slate' },
    { label: 'Assigned', value: assets.filter(a => a.status === 'Assigned').length, icon: <IconUserCircle size={20} />, color: 'indigo' },
    { label: 'Available', value: assets.filter(a => a.status === 'Available').length, icon: <IconCheck size={20} />, color: 'emerald' },
  ];

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.asset_tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent custom-scrollbar animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
              Asset <span className="text-[#E31E24]">Tracking Hub</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-black uppercase tracking-[0.3em] opacity-70">Infrastructure & Inventory Lifecycle</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => setIsScannerOpen(true)}
              className="h-12 px-6 rounded-2xl bg-white shadow-sm border-white border-2 text-slate-600 font-black text-xs uppercase tracking-widest hover:shadow-none transition-all flex gap-3 items-center"
            >
              <IconCamera size={16} className="text-[#E31E24]" />
              Scan Asset QR
            </Button>
            <Button 
              onClick={() => setIsFormOpen(true)}
              className="h-12 px-6 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-sm hover:bg-[#C1181E] transition-all flex gap-3 items-center"
            >
              <IconPlus size={16} />
              Add New Asset
            </Button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-white border-[2px] shadow-sm bg-white rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center
                  ${stat.color === 'emerald' ? 'text-emerald-500' : stat.color === 'indigo' ? 'text-indigo-500' : 'text-slate-500'}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-xl font-black text-slate-800 font-outfit">{stat.value}</h3>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E31E24] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by Tag or Asset Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-6 bg-white shadow-sm border-none rounded-2xl text-xs font-black text-slate-800 focus:outline-none placeholder:text-slate-300 uppercase tracking-widest"
            />
          </div>
          <div className="flex gap-2">
            {['Available', 'Assigned', 'Maintenance'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                className={`px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                  ${selectedStatus === status 
                    ? 'bg-[#E31E24] text-white shadow-sm' 
                    : 'bg-white shadow-sm text-slate-500 hover:shadow-none'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Asset Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
          {filteredAssets.map(asset => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              onAssign={() => setAssignModal({ open: true, asset })}
              onHistory={() => setHistoryModal({ open: true, asset })}
              onQR={() => setQrModal({ open: true, asset })}
              onReturn={async () => {
                await returnAsset({ asset_id: asset.id });
                fetchAssets(selectedStatus);
              }}
            />
          ))}
        </div>
      </div>

      <AssetFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={() => fetchAssets(selectedStatus)} 
      />

      <AssignAssetModal 
        isOpen={assignModal.open}
        asset={assignModal.asset}
        onClose={() => setAssignModal({ open: false, asset: null })}
        onSuccess={() => fetchAssets(selectedStatus)}
      />

      <AssetHistoryModal
        isOpen={historyModal.open}
        asset={historyModal.asset}
        onClose={() => setHistoryModal({ open: false, asset: null })}
      />

      <AssetQRModal 
        isOpen={qrModal.open}
        asset={qrModal.asset}
        onClose={() => setQrModal({ open: false, asset: null })}
      />

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};

const AssetCard = ({ asset, onAssign, onReturn, onHistory, onQR }) => {
  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'Vehicle': return <IconCar size={24} />;
      case 'Furniture': return <IconArmchair size={24} />;
      case 'Tools': return <IconTools size={24} />;
      default: return <IconDeviceLaptop size={24} />;
    }
  };

  return (
    <Card className="border-white border-[3px] shadow-sm bg-white rounded-2xl p-6 group hover:scale-[1.02] transition-all relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="h-14 w-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#E31E24]">
          {getCategoryIcon(asset.category)}
        </div>
        <div className="flex gap-1.5">
          <button 
            onClick={onHistory}
            className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-[#E31E24] transition-all"
            data-tooltip="Assignment History"
          >
            <IconHistory size={16} />
          </button>
          <button 
            onClick={onQR}
            className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-[#E31E24] transition-all"
            data-tooltip="View QR Label"
          >
            <IconQrcode size={16} />
          </button>
          <div className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm
            ${asset.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
            {asset.status}
          </div>
        </div>
      </div>


      <div className="space-y-1 mb-6">
        <div className="flex items-center gap-2">
          <IconQrcode size={12} className="text-slate-300" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{asset.asset_tag}</span>
        </div>
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight line-clamp-1">{asset.name}</h4>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{asset.serial_number || 'No Serial'}</p>
      </div>

      {asset.status === 'Assigned' && (
        <div className="p-3 rounded-xl bg-white/40 border border-slate-200 mb-6 animate-in slide-in-from-bottom-2 duration-300">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Holder</p>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-[#E31E24] flex items-center justify-center text-[11px] font-black text-white">
              {asset.employees?.name?.charAt(0)}
            </div>
            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{asset.employees?.name}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {asset.status === 'Available' ? (
          <Button 
            onClick={onAssign}
            className="flex-1 h-10 rounded-xl bg-white shadow-sm text-[#E31E24] font-black text-xs uppercase tracking-widest hover:shadow-none transition-all flex gap-2 items-center justify-center"
          >
            <IconArrowsLeftRight size={14} />
            Assign
          </Button>
        ) : (
          <Button 
            onClick={onReturn}
            className="flex-1 h-10 rounded-xl bg-slate-800 text-white font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-900 transition-all flex gap-2 items-center justify-center"
          >
            <IconHistory size={14} />
            Return Asset
          </Button>
        )}
      </div>
    </Card>
  );
};

export default AssetInventory;
