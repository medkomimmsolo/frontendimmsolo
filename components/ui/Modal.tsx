'use client';

import { ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'full';

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  wide: 'max-w-4xl',
  full: 'max-w-5xl',
};

const FOCUSABLE_selector =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const ESC_HANDLERS: ((event: KeyboardEvent) => void)[] = [];

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  header?: ReactNode;
  headerClassName?: string;
  titleId?: string;
  children: ReactNode;
  footer?: ReactNode;
  footerClassName?: string;
  size?: ModalSize;
  className?: string;
  bodyClassName?: string;
  showClose?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  onAttemptClose?: () => boolean | Promise<boolean>;
  ariaLabel?: string;
  bodyId?: string;
}

let scrollLockCount = 0;

function lockBodyScroll() {
  if (++scrollLockCount === 1) {
    document.documentElement.style.overflow = 'hidden';
  }
}

function unlockBodyScroll() {
  if (scrollLockCount > 0 && --scrollLockCount === 0) {
    document.documentElement.style.overflow = '';
  }
}

/**
 * Daftar modul modal yang aktif; modal paling atas (terakhir dibuka)
 * menangani tombol Escape agar modal bertumpuk tidak tertutup semua sekaligus.
 */
export function useEscapeToClose(onClose: (() => void) | null, guard?: () => boolean | Promise<boolean>) {
  const onCloseRef = useRef(onClose);
  const guardRef = useRef(guard);

  useEffect(() => {
    onCloseRef.current = onClose;
    guardRef.current = guard;
  });

  useEffect(() => {
    if (!onClose) return;
    const handler = (event: KeyboardEvent) => {
      if (ESC_HANDLERS[ESC_HANDLERS.length - 1] !== handler) return;
      if (event.key !== 'Escape') return;
      event.preventDefault();
      void (async () => {
        const allowed = guardRef.current ? await guardRef.current() : true;
        if (allowed) onCloseRef.current?.();
      })();
    };
    ESC_HANDLERS.push(handler);
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      const index = ESC_HANDLERS.indexOf(handler);
      if (index >= 0) ESC_HANDLERS.splice(index, 1);
    };
  }, [onClose]);
}

export function Modal({
  open,
  onClose,
  title,
  description,
  header,
  headerClassName = '',
  titleId,
  children,
  footer,
  footerClassName = '',
  size = 'lg',
  className = '',
  bodyClassName = '',
  showClose = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  onSubmit,
  onAttemptClose,
  ariaLabel,
  bodyId,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const autoTitleId = useId();
  const onCloseRef = useRef(onClose);
  const guardRef = useRef(onAttemptClose);

  useEffect(() => {
    onCloseRef.current = onClose;
    guardRef.current = onAttemptClose;
  });

  const headingId = titleId ?? autoTitleId;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const requestClose = useCallback(async () => {
    const allowed = guardRef.current ? await guardRef.current() : true;
    if (!allowed) return;
    onCloseRef.current();
  }, []);

  useEscapeToClose(open && closeOnEsc ? requestClose : null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_selector));
    if (!focusable.length) return;
    const active = document.activeElement as HTMLElement | null;
    if (!active || !panel.contains(active)) {
      event.preventDefault();
      focusable[0].focus();
      return;
    }
    const currentIndex = focusable.indexOf(active);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (active === first || currentIndex <= 0)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || currentIndex === -1)) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockBodyScroll();
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = panel.querySelector<HTMLElement>('[data-autofocus]')
        ?? panel.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea');
      (target ?? panel).focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      unlockBodyScroll();
      previousFocus?.focus?.();
    };
  }, [open]);

  const handleBackdropClick = useCallback(
    async (event: React.MouseEvent<HTMLDivElement>) => {
      if (!closeOnBackdrop) return;
      if (event.target !== event.currentTarget) return;
      await requestClose();
    },
    [closeOnBackdrop, requestClose]
  );

  if (!open || !mounted) return null;

  const panelClasses = `relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl outline-none ${SIZE_CLASS[size]} max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 ${className}`;

  const headerView = (
    <div className={`flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-6 pt-5 pb-4 ${headerClassName}`}>
      {header ?? (
        <div className="min-w-0">
          {title !== undefined && title !== null && (
            typeof title === 'string' || typeof title === 'number' ? (
              <h2 id={headingId} className="text-lg font-bold text-slate-900">{title}</h2>
            ) : (
              <div id={headingId}>{title}</div>
            )
          )}
          {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
        </div>
      )}
      {showClose && (
        <button
          type="button"
          onClick={() => void requestClose()}
          aria-label="Tutup"
          className="shrink-0 rounded-lg bg-white p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  const bodyView = (
    <div id={bodyId} className={`min-h-0 flex-1 overflow-y-auto px-6 py-5 ${bodyClassName}`}>
      {children}
    </div>
  );

  const footerView = footer && (
    <div className={`flex shrink-0 items-center justify-end gap-2.5 border-t border-slate-100 px-6 py-4 ${footerClassName}`}>
      {footer}
    </div>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(event) => void handleBackdropClick(event)}
    >
      {onSubmit ? (
        <form
          ref={panelRef as React.RefObject<HTMLFormElement>}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel ? undefined : headingId}
          onClick={(event) => event.stopPropagation()}
          className={panelClasses}
          onSubmit={onSubmit}
        >
          {headerView}
          {bodyView}
          {footerView}
        </form>
      ) : (
        <div
          ref={panelRef as React.RefObject<HTMLDivElement>}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel ? undefined : headingId}
          onClick={(event) => event.stopPropagation()}
          className={panelClasses}
        >
          {headerView}
          {bodyView}
          {footerView}
        </div>
      )}
    </div>,
    document.body
  );
}

export default Modal;
