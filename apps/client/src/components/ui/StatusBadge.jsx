import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

export function StatusBadge({ status, className }) {
  const getStatusStyle = (s) => {
    switch (s?.toUpperCase()) {
      // Success
      case 'PRESENT': 
      case 'ACTIVE':
      case 'APPROVED':
      case 'COMPLETED':
      case 'HIRED':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      // Warning
      case 'LATE':
      case 'PENDING':
      case 'IN_PROGRESS':
      case 'WARNING':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      // Info
      case 'SICK':
      case 'DRAFT':
      case 'INFO':
        return 'text-blue-600 bg-blue-50 border-blue-100';
      // Purple / Indogo
      case 'LEAVE':
      case 'ON_LEAVE':
      case 'REVIEW':
      case 'INTERVIEW':
        return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      // Danger
      case 'ABSENT':
      case 'REJECTED':
      case 'FAILED':
      case 'INACTIVE':
      case 'TERMINATED':
      case 'ERROR':
        return 'text-rose-600 bg-rose-50 border-rose-100';
      default: 
        return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm", 
        getStatusStyle(status),
        className
      )}
    >
      {status || 'UNKNOWN'}
    </Badge>
  );
}
