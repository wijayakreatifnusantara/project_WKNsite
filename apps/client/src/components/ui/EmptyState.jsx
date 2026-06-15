import React from 'react';
import { IconDatabaseLeak, IconSearchOff, IconInbox } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const EmptyState = ({ 
  icon: Icon = IconInbox, 
  title = "Belum Ada Data", 
  description = "Tidak ada data yang tersedia untuk ditampilkan pada bagian ini.",
  action,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center bg-transparent animate-fade-in", className)}>
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={32} className="text-slate-300" stroke={1.5} />
      </div>
      <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">{title}</h3>
      <p className="text-xs font-bold text-slate-400 mt-1">{description}</p>
      
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export { EmptyState };
