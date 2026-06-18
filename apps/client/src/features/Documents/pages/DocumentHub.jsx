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
    <div className="flex-1 flex overflow-hidden bg-white animate-fade-in">
      {/* Sidebar Categories */}
      <aside className="w-64 border-r border-white/30 flex flex-col p-6 space-y-6 shrink-0">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em] mb-4 ml-1">Categories</h3>
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
              <h2 className="text-2xl font-bold text-slate-800 font-outfit tracking-tight uppercase">
                Document <span className="text-ios-primary">Center</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest opacity-70">Unified Repository for Corporate Intelligence</p>
            </div>
            <Button 
              onClick={() => setIsUploadOpen(true)}
              className="h-12 px-6 rounded-2xl bg-ios-primary text-white font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-ios-primary/90 transition-all flex gap-3 items-center"
            >
              <IconPlus size={16} />
              New Upload
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-ios-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by filename or employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-6 bg-white shadow-sm border-none rounded-2xl text-xs font-bold text-slate-800 focus:outline-none placeholder:text-slate-300 uppercase tracking-widest"
            />
          </div>
        </header>

        {/* 🚨 Document Expiry Alerts Banner */}
        <div className="px-8 pb-4">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-500">
                <IconLock size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-rose-800 uppercase tracking-widest">Action Required: Expiring Documents</h3>
                <p className="text-xs font-bold text-rose-600 mt-1">2 employee contracts and 1 ID card are expiring within 30 days.</p>
              </div>
            </div>
            <Button className="h-8 px-4 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-widest shadow-sm transition-all">
              Review Now
            </Button>
          </div>
        </div>

        {/* File Grid */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center opacity-40">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider animate-pulse">Syncing Repository...</p>
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
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">No Documents Found in this Sector</p>
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
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 group
      ${active 
        ? 'bg-white shadow-sm text-ios-primary' 
        : 'text-slate-400 hover:text-slate-700 hover:bg-white/50'}`}
  >
    <span className="transition-transform group-hover:scale-110">{icon}</span>
    <span>{label}</span>
  </button>
);

const FileCard = ({ doc, onDelete, onSign }) => {
  const getIcon = (type) => {
    if (type?.includes('pdf')) return <IconFileText size={32} className="text-ios-primary" />;
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
    <Card className="border-white border-[3px] shadow-sm bg-white rounded-xl p-5 group hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden">
      {doc.is_private && (
        <div className="absolute top-3 left-3 h-6 w-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm border border-rose-100 z-10 animate-pulse">
          <IconLock size={12} />
        </div>
      )}
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="h-14 w-14 bg-white rounded-xl shadow-sm flex items-center justify-center">
            {getIcon(doc.file_type)}
          </div>
          <div className="flex gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onSign(); }}
              className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-ios-primary transition-all"
              data-tooltip="Sign Document"
            >
              <IconSignature size={14} />
            </button>
            <button className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-ios-primary transition-all">
              <IconDownload size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
              <IconTrash size={14} />
            </button>
          </div>
        </div>
        
        <div className="flex-1">
          <h4 className="text-[11px] font-semibold text-slate-800 uppercase tracking-tight line-clamp-2 mb-1">{doc.name}</h4>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{doc.category}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tighter">{formatSize(doc.file_size)}</span>
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-tighter">{new Date(doc.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
};

// Placeholder icons for missing imports
const IconClipboardCheck = ({ size, className }) => <IconFileDescription size={size} className={className} />;
const IconReceipt2 = ({ size, className }) => <IconFileDescription size={size} className={className} />;

export default DocumentHub;
