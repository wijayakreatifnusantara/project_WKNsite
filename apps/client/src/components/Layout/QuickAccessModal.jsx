import React, { useState, useEffect } from 'react';
import { IconX, IconCheck, IconStar } from '@tabler/icons-react';

const QuickAccessModal = ({ isOpen, onClose, availableMenus, currentSelection, onSave }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Maximum number of items allowed in Quick Access
  const MAX_ITEMS = 5;

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(currentSelection);
    }
  }, [isOpen, currentSelection]);

  if (!isOpen) return null;

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      if (selectedIds.length < MAX_ITEMS) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleSave = () => {
    onSave(selectedIds);
    onClose();
  };

  // Group menus by category
  const groupedMenus = availableMenus.reduce((acc, menu) => {
    if (!acc[menu.category]) {
      acc[menu.category] = [];
    }
    acc[menu.category].push(menu);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 animate-fade-in-down"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
              <IconStar size={20} className="fill-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Edit Quick Access</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih menu untuk disematkan di sidebar. Maksimal {MAX_ITEMS} menu ({selectedIds.length}/{MAX_ITEMS}).
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {Object.entries(groupedMenus).map(([category, menus]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 mb-2">
                  {category}
                </h3>
                <div className="space-y-1.5">
                  {menus.map(menu => {
                    const isSelected = selectedIds.includes(menu.id);
                    const isDisabled = !isSelected && selectedIds.length >= MAX_ITEMS;
                    
                    return (
                      <div 
                        key={menu.id}
                        onClick={() => !isDisabled && toggleSelection(menu.id)}
                        className={`
                          flex items-center gap-3 p-2 rounded-lg border transition-all duration-200 select-none
                          ${isSelected ? 'bg-amber-50 border-amber-200 cursor-pointer' : 
                            isDisabled ? 'opacity-50 cursor-not-allowed border-transparent bg-slate-50' : 
                            'hover:bg-slate-50 border-transparent cursor-pointer'}
                        `}
                      >
                        <div className={`
                          w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors
                          ${isSelected ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 bg-white'}
                        `}>
                          {isSelected && <IconCheck size={14} stroke={3} />}
                        </div>
                        <div className={`flex items-center gap-2 ${isSelected ? 'text-amber-900' : 'text-slate-600'}`}>
                          {menu.iconNode}
                          <span className="text-[13px] font-medium">{menu.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-[13px] font-bold text-white bg-ios-primary rounded-lg hover:bg-ios-primary/90 shadow-sm transition-colors flex items-center gap-2"
          >
            <IconCheck size={16} />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAccessModal;
