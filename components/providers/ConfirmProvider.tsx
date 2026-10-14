'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'default';
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue>({ confirm: async () => false });

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ open: boolean; options: ConfirmOptions }>({
    open: false,
    options: { message: '' },
  });
  const resolver = useRef<(value: boolean) => void>(() => {});
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const confirm = useCallback((options: ConfirmOptions | string) => {
    const normalized: ConfirmOptions = typeof options === 'string' ? { message: options } : options;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setState({ open: true, options: { title: 'Konfirmasi tindakan', confirmText: 'Lanjutkan', cancelText: 'Batal', tone: 'default', ...normalized } });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, open: false }));
    resolver.current(value);
    requestAnimationFrame(() => {
      if (previousFocus.current?.isConnected) previousFocus.current.focus();
    });
  }, []);

  // Start on the safe action and keep keyboard focus inside the modal.
  useEffect(() => {
    if (state.open) {
      cancelButtonRef.current?.focus();
    }
  }, [state.open]);

  useEffect(() => {
    if (!state.open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close(false);
        return;
      }
      if (event.key === 'Tab') {
        const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        if (!buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, state.open]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]" onClick={() => close(false)}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-message"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl outline-none sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start gap-3">
              <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${state.options.tone === 'danger' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                {state.options.tone === 'danger' ? <AlertTriangle className="h-5 w-5" aria-hidden="true" /> : <CircleHelp className="h-5 w-5" aria-hidden="true" />}
              </span>
              <div className="min-w-0">
                <h3 id="confirm-dialog-title" className="text-base font-bold text-slate-900">{state.options.title}</h3>
                <p id="confirm-dialog-message" className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">{state.options.message}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button ref={cancelButtonRef} variant="outline" onClick={() => close(false)} className="min-h-10">{state.options.cancelText}</Button>
              <Button
                onClick={() => close(true)}
                className={`min-h-10 ${state.options.tone === 'danger' ? 'bg-red-700 text-white hover:bg-red-800' : 'bg-[#c20000] text-white hover:bg-[#a30000]'}`}
              >
                {state.options.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}