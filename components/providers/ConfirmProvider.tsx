'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
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

  const confirm = useCallback((options: ConfirmOptions | string) => {
    const normalized: ConfirmOptions = typeof options === 'string' ? { message: options } : options;
    setState({ open: true, options: { title: 'Konfirmasi', confirmText: 'Ya', cancelText: 'Batal', tone: 'default', ...normalized } });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (value: boolean) => {
    setState((prev) => ({ ...prev, open: false }));
    resolver.current(value);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4" onClick={() => close(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-[#0f172a] mb-2">{state.options.title}</h3>
            <p className="text-sm text-slate-600 mb-6">{state.options.message}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => close(false)}>{state.options.cancelText}</Button>
              <Button
                onClick={() => close(true)}
                className={state.options.tone === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-[#c20000] hover:bg-[#a30000] text-white'}
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
