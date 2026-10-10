'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  children?: ReactNode; // Untuk tombol aksi di sebelah kanan
}

export function PageHeader({ title, description, badge, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 
            className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
            style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
          >
            {title}
          </h1>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#c20000] border border-red-200/60 uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0 w-full sm:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}

