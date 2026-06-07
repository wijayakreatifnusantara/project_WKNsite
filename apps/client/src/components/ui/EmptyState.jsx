import React from 'react';
import { IconDatabaseLeak, IconSearchOff, IconInbox } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const EmptyState = ({ 
  icon: Icon = IconInbox, 
  title = "No Data Available", 
  description = "There is currently no data to display in this section.",
  action,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm animate-fade-in", className)}>
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
        <Icon size={32} className="text-slate-400" stroke={1.5} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1">{description}</p>
      
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export { EmptyState };
