'use client';

import { ToastBar, Toaster, toast } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      containerStyle={{
        top: 'max(16px, env(safe-area-inset-top))',
        right: 16,
        width: 'min(420px, calc(100vw - 32px))',
      }}
      toastOptions={{
        duration: 5000,
        style: {
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.14)',
          color: '#0f172a',
          fontSize: 14,
          lineHeight: 1.5,
          maxWidth: '100%',
          padding: 12,
        },
        success: {
          duration: 3500,
          ariaProps: { role: 'status', 'aria-live': 'polite' },
          style: {
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#14532d',
          },
          iconTheme: {
            primary: '#15803d',
            secondary: '#ffffff',
          },
        },
        error: {
          duration: 6500,
          ariaProps: { role: 'alert', 'aria-live': 'assertive' },
          style: {
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#7f1d1d',
          },
          iconTheme: {
            primary: '#b91c1c',
            secondary: '#ffffff',
          },
        },
        loading: {
          ariaProps: { role: 'status', 'aria-live': 'polite' },
          style: {
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            color: '#334155',
          },
        },
        blank: {
          ariaProps: { role: 'status', 'aria-live': 'polite' },
          style: {
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e3a8a',
          },
        },
      }}
    >
      {(item) => (
        <ToastBar toast={item}>
          {({ icon, message }) => (
            <div className="flex w-full min-w-0 items-start gap-3">
              <span className="mt-0.5 shrink-0">{icon}</span>
              <div className="min-w-0 flex-1 break-words">{message}</div>
              <button
                type="button"
                onClick={() => toast.dismiss(item.id)}
                aria-label="Tutup notifikasi"
                className="shrink-0 rounded-md p-1 text-slate-500 transition-colors hover:bg-black/5 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-slate-500"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
