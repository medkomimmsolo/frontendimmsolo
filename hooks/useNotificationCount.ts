'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface NotificationCounts {
  unread_messages: number;
  pending_account_requests: number;
  pending_blogs: number;
  total: number;
}

/**
 * Hook untuk memuat hitungan notifikasi pending (pesan belum dibaca,
 * pengajuan akun, post pending review) dan melakukan polling tiap 60 detik.
 */
export function useNotificationCount(enabled: boolean = true) {
  const [counts, setCounts] = useState<NotificationCounts>({
    unread_messages: 0,
    pending_account_requests: 0,
    pending_blogs: 0,
    total: 0,
  });

  const fetchCounts = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await api.get('/dashboard/notifications/count');
      if (res.data.success) {
        setCounts(res.data.data);
      }
    } catch {
      // Diam-diam gagal — notifikasi bukan fitur kritis
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    fetchCounts();
    const interval = setInterval(fetchCounts, 60_000);
    return () => clearInterval(interval);
  }, [enabled, fetchCounts]);

  return { counts, refresh: fetchCounts };
}
