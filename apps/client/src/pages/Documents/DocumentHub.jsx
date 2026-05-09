import React, { useState, useEffect } from 'react';
import { 
  IconFolder, 
  IconFileText, 
  IconFileZip, 
  IconPhoto, 
  IconFileDescription,
  IconPlus,
  IconSearch,
  IconDotsVertical,
  IconDownload,
  IconTrash,
  IconUser,
  IconLock
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDocuments } from './hooks/useDocuments';
import UploadModal from './components/UploadModal';
import DocumentSignerModal from './components/DocumentSignerModal';
import { IconSignature } from "@tabler/icons-react";

const DocumentHub = () => {
  const { documents, fetchDocuments, deleteDocument, loading } = useDocuments();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [signingModal, setSigningModal] = useState({ open: false, doc: null });

  useEffect(() => {
    fetchDocuments(selectedCategory);
  }, [fetchDocuments, selectedCategory]);

  const categories = [
    { id: 'Contract', label: 'Contracts', icon: <IconFileDescription size={18} /> },
    { id: 'Policy', label: 'Company Policies', icon: <IconClipboardCheck size={18} /> },
    { id: 'Employee', label: 'Employee Files', icon: <IconUser size={18} /> },
    { id: 'Finance', label: 'Financial Docs', icon: <IconReceipt2 size={18} /> },
    { id: 'Misc', label: 'Miscellaneous', icon: <IconFolder size={18} /> },
  ];

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f0f2f5] animate-fade-in">
      {/* Sidebar Categories */}
      <aside className="w-64 border-r border-white/30 flex flex-col p-6 space-y-6 shrink-0">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 ml-1">Categories</h3>
          <div className="space-y-2">
            <CategoryItem 
              active={selectedCategory === null} 
              onClick={() => setSelectedCategory(null)}
              label="All Documents" 
              icon={<IconFolder size={18} />} 
            />
            {categories.map(cat => (
              <CategoryItem 
                key={cat.id}
                active={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                label={cat.label} 
                icon={cat.icon} 
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="p-8 pb-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight uppercase">
                Document <span className="text-[#E31E24]">Center</span>
              </h2>
              <p className="text-slate-400 text-[9px] mt-1 font-black uppercase tracking-[0.3em] opacity-70">Unified Repository for Corporate Intelligence</p>
            </div>
            <Button 
              onClick={() => setIsUploadOpen(true)}
              className="h-12 px-6 rounded-2xl bg-[#E31E24] text-white font-black text-xs uppercase tracking-widest shadow-[5px_5px_15px_rgba(227,30,36,0.3)] hover:bg-[#C1181E] transition-all flex gap-3 items-center"
            >
              <IconPlus size={16} />
              New Upload
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E31E24] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by filename or employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-6 bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] border-none rounded-2xl text-xs font-black text-slate-800 focus:outline-none placeholder:text-slate-300 uppercase tracking-widest"
            />
          </div>
        </header>

        {/* File Grid */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center opacity-40">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Syncing Repository...</p>
            </div>
          ) : filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDocs.map(doc => (
                  <FileCard 
                    key={doc.id} 
                    doc={doc} 
                    onDelete={() => deleteDocument(doc.id)} 
                    onSign={() => setSigningModal({ open: true, doc })}
                  />
                ))}
            </div>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center opacity-30">
              <IconFolder size={64} className="text-slate-300 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Documents Found in this Sector</p>
            </div>
          )}
        </div>
      </main>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={() => fetchDocuments(selectedCategory)} 
      />

      <DocumentSignerModal
        isOpen={signingModal.open}
        document={signingModal.doc}
        onClose={() => setSigningModal({ open: false, doc: null })}
        onSave={(updatedDoc) => {
          // Simulation: normally we'd update Supabase here
          alert(`Document '${updatedDoc.name}' has been authorized successfully.`);
          fetchDocuments(selectedCategory);
        }}
      />
    </div>
  );
};

const CategoryItem = ({ label, icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 group
      ${active 
        ? 'bg-[#f0f2f5] shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] text-[#E31E24]' 
        : 'text-slate-400 hover:text-slate-700 hover:bg-white/50'}`}
  >
    <span className="transition-transform group-hover:scale-110">{icon}</span>
    <span>{label}</span>
  </button>
);

const FileCard = ({ doc, onDelete, onSign }) => {
  const getIcon = (type) => {
    if (type?.includes('pdf')) return <IconFileText size={32} className="text-[#E31E24]" />;
    if (type?.includes('image')) return <IconPhoto size={32} className="text-emerald-500" />;
    if (type?.includes('zip')) return <IconFileZip size={32} className="text-amber-500" />;
    return <IconFileDescription size={32} className="text-indigo-500" />;
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card className="border-white border-[3px] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] bg-[#f0f2f5] rounded-[1.5rem] p-5 group hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden">
      {doc.is_private && (
        <div className="absolute top-3 left-3 h-6 w-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm border border-rose-100 z-10 animate-pulse">
          <IconLock size={12} />
        </div>
      )}
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="h-14 w-14 bg-[#f0f2f5] rounded-xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center">
            {getIcon(doc.file_type)}
          </div>
          <div className="flex gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onSign(); }}
              className="h-8 w-8 rounded-lg bg-[#f0f2f5] shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] flex items-center justify-center text-slate-400 hover:text-[#E31E24] transition-all"
              title="Sign Document"
            >
              <IconSignature size={14} />
            </button>
            <button className="h-8 w-8 rounded-lg bg-[#f0f2f5] shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] flex items-center justify-center text-slate-400 hover:text-[#E31E24] transition-all">
              <IconDownload size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="h-8 w-8 rounded-lg bg-[#f0f2f5] shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
              <IconTrash size={14} />
            </button>
          </div>
        </div>
        
        <div className="flex-1">
          <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tight line-clamp-2 mb-1">{doc.name}</h4>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{doc.category}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-white/50 flex justify-between items-center">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{formatSize(doc.file_size)}</span>
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">{new Date(doc.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
};

// Placeholder icons for missing imports
const IconClipboardCheck = ({ size, className }) => <IconFileDescription size={size} className={className} />;
const IconReceipt2 = ({ size, className }) => <IconFileDescription size={size} className={className} />;

export default DocumentHub;
