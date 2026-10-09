'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent' | 'success';
  created_at: string;
}

const typeConfig = {
  info: {
    bg: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    badge: 'bg-blue-100 text-blue-700',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    badge: 'bg-amber-100 text-amber-700',
  },
  urgent: {
    bg: 'bg-red-50 border-red-200 text-red-900',
    icon: <AlertCircle className="w-5 h-5 text-[#c20000] shrink-0" />,
    badge: 'bg-red-100 text-[#c20000]',
  },
  success: {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    badge: 'bg-emerald-100 text-emerald-700',
  },
};

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  useEffect(() => {
    // Muat ID yang sudah ditutup sesi ini
    try {
      const stored = sessionStorage.getItem('dismissed_announcements');
      if (stored) setDismissedIds(JSON.parse(stored));
    } catch {}

    api.get('/announcements/active')
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setAnnouncements(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = (id: number) => {
    const next = [...dismissedIds, id];
    setDismissedIds(next);
    try {
      sessionStorage.setItem('dismissed_announcements', JSON.stringify(next));
    } catch {}
  };

  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.includes(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {visibleAnnouncements.map((a) => {
        const cfg = typeConfig[a.type] || typeConfig.info;

        return (
          <div
            key={a.id}
            className={`rounded-sm border p-4 shadow-sm flex items-start gap-3 transition-all ${cfg.bg}`}
          >
            {cfg.icon}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-bold text-sm">{a.title}</span>
                {a.type === 'urgent' && (
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${cfg.badge}`}>
                    Penting
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed whitespace-pre-line opacity-90">
                {a.content}
              </p>
            </div>
            <button
              onClick={() => handleDismiss(a.id)}
              className="p-1 rounded hover:bg-black/5 opacity-60 hover:opacity-100 transition-opacity"
              title="Tutup pengumuman"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
