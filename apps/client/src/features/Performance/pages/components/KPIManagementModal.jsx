import React, { useState, useEffect } from 'react';
import { 
  IconX, 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconTargetArrow,
  IconCheck
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const KPIManagementModal = ({ isOpen, onClose, metrics, addMetric, updateMetric, deleteMetric }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentMetric, setCurrentMetric] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [maxScore, setMaxScore] = useState('5');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentMetric(null);
    setName('');
    setDescription('');
    setWeight('');
    setMaxScore('5');
    setLoading(false);
  };

  const handleEditClick = (metric) => {
    setIsEditing(true);
    setCurrentMetric(metric);
    setName(metric.name);
    setDescription(metric.description || '');
    setWeight((metric.weight * 100).toString());
    setMaxScore(metric.max_score?.toString() || '5');
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      name,
      description,
      weight: parseFloat(weight) / 100, // Convert percentage back to decimal
      max_score: parseInt(maxScore)
    };

    try {
      if (isEditing) {
        await updateMetric(currentMetric.id, payload);
      } else {
        await addMetric(payload);
      }
      resetForm();
    } catch (err) {
      console.error("Failed to save metric:", err);
      alert("Gagal menyimpan KPI: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menonaktifkan metrik ini? Metrik yang dinonaktifkan tidak akan muncul lagi di form penilaian.")) {
      try {
        setLoading(true);
        await deleteMetric(id);
      } catch (err) {
        alert("Gagal menghapus KPI: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm  p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-sm border-2 border-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b-2 border-white flex justify-between items-center bg-white">
          <div>
            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-transparent shadow-sm flex items-center justify-center text-ios-primary">
                <IconTargetArrow size={24} />
              </div>
              Kelola Master KPI
            </h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 ml-13">
              Atur parameter penilaian kinerja karyawan
            </p>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-transparent shadow-sm flex items-center justify-center text-slate-400 hover:text-ios-primary hover:bg-rose-50 transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel: List of Metrics */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 border-r-2 border-white">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">Daftar KPI Aktif</h4>
            
            <div className="space-y-4">
              {metrics.length === 0 ? (
                <div className="p-8 text-center bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">Belum ada metrik KPI.</p>
                </div>
              ) : (
                metrics.map(metric => (
                  <div key={metric.id} className="p-4 bg-transparent rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between group hover:border-ios-primary/30 transition-colors">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-bold text-slate-800">{metric.name}</h5>
                        <span className="px-2 py-0.5 bg-rose-100 text-ios-primary rounded text-xs font-bold">
                          {(metric.weight * 100).toFixed(0)}%
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold">
                          Max: {metric.max_score}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {metric.description || 'Tidak ada deskripsi'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(metric)}
                        className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                        data-tooltip="Edit"
                      >
                        <IconEdit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(metric.id)}
                        className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors"
                        data-tooltip="Hapus"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {metrics.length > 0 && (
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs font-bold text-amber-800">
                  Total Bobot Saat Ini: <span className="font-bold text-amber-900">{metrics.reduce((acc, m) => acc + (m.weight * 100), 0).toFixed(0)}%</span>
                  <br/>
                  (Idealnya total keseluruhan adalah 100%)
                </p>
              </div>
            )}
          </div>

          {/* Right Panel: Form */}
          <div className="w-full md:w-80 bg-transparent p-6 overflow-y-auto custom-scrollbar">
            <h4 className="text-[11px] font-semibold text-ios-primary uppercase tracking-wider mb-4">
              {isEditing ? 'Edit Metrik' : 'Tambah Metrik Baru'}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama KPI</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Contoh: Komunikasi"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-ios-primary focus:ring-1 focus:ring-ios-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bobot (%)</label>
                <input 
                  type="number" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  min="1"
                  max="100"
                  placeholder="Contoh: 20"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-ios-primary focus:ring-1 focus:ring-ios-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Skor Maksimal</label>
                <input 
                  type="number" 
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  required
                  min="1"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-ios-primary focus:ring-1 focus:ring-ios-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Deskripsi</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Penjelasan kriteria penilaian..."
                  rows="3"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-ios-primary focus:ring-1 focus:ring-ios-primary transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-ios-primary text-white font-bold hover:bg-ios-primary/90 flex items-center justify-center gap-2"
                >
                  {loading ? 'Menyimpan...' : (isEditing ? <><IconCheck size={18}/> Simpan Perubahan</> : <><IconPlus size={18}/> Tambah KPI</>)}
                </Button>
                
                {isEditing && (
                  <Button 
                    type="button" 
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="w-full h-11 rounded-xl font-bold"
                  >
                    Batal Edit
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPIManagementModal;
