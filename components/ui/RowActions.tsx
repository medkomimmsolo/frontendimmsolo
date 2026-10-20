'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';

export type RowActionTone = 'default' | 'danger' | 'success' | 'warning' | 'info' | 'violet';

export interface RowAction {
  label: string;
  icon?: ReactNode;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  tone?: RowActionTone;
  hidden?: boolean;
  disabled?: boolean;
  dividerBefore?: boolean;
}

interface RowActionsProps {
  actions: RowAction[];
  label?: string;
  className?: string;
}

const TONE_CLASS: Record<RowActionTone, string> = {
  default: 'text-slate-700 hover:bg-slate-50',
  danger: 'text-red-600 hover:bg-red-50',
  success: 'text-emerald-600 hover:bg-emerald-50',
  warning: 'text-amber-600 hover:bg-amber-50',
  info: 'text-blue-600 hover:bg-blue-50',
  violet: 'text-violet-600 hover:bg-violet-50',
};

const MENU_WIDTH = 208;

export function RowActions({ actions, label = 'Aksi', className = '' }: RowActionsProps) {
  const visibleActions = actions.filter((action) => !action.hidden);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => setIsOpen(false), []);

  const openMenu = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const estimatedHeight = visibleActions.length * 36 + 12;
    const top = rect.bottom + estimatedHeight + 8 > window.innerHeight
      ? Math.max(8, rect.top - estimatedHeight - 6)
      : rect.bottom + 6;
    const left = Math.min(
      Math.max(8, rect.right - MENU_WIDTH),
      Math.max(8, window.innerWidth - MENU_WIDTH - 8)
    );
    setPosition({ top, left });
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      close();
    };
    const handleScroll = () => close();
    const handleResize = () => close();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  if (visibleActions.length === 0) return null;

  const itemClass = (tone: RowActionTone = 'default', disabled?: boolean) =>
    `flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors ${
      disabled ? 'cursor-not-allowed opacity-40' : TONE_CLASS[tone]
    }`;

  const renderItem = (action: RowAction, index: number) => {
    const content = (
      <>
        {action.icon && <span className="flex h-4 w-4 shrink-0 items-center justify-center">{action.icon}</span>}
        <span className="truncate">{action.label}</span>
      </>
    );

    const sharedProps = {
      className: itemClass(action.tone, action.disabled),
      role: 'menuitem',
      onClick: () => {
        if (action.disabled) return;
        close();
        action.onClick?.();
      },
      'aria-disabled': action.disabled || undefined,
    };

    if (action.href && !action.disabled) {
      const isExternal = action.external || /^https?:\/\//.test(action.href);
      return (
        <div key={`${action.label}-${index}`}>
          {action.dividerBefore && <div className="my-1 border-t border-slate-100" />}
          {isExternal ? (
            <a
              href={action.href}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noopener noreferrer' : undefined}
              className={sharedProps.className}
              role="menuitem"
              onClick={close}
            >
              {content}
            </a>
          ) : (
            <Link href={action.href} className={sharedProps.className} role="menuitem" onClick={close}>
              {content}
            </Link>
          )}
        </div>
      );
    }

    return (
      <div key={`${action.label}-${index}`}>
        {action.dividerBefore && <div className="my-1 border-t border-slate-100" />}
        <button type="button" {...sharedProps}>
          {content}
        </button>
      </div>
    );
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close() : openMenu())}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={label}
        title={label}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 ${className}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            className="fixed z-[80] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
            style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
          >
            {visibleActions.map(renderItem)}
          </div>,
          document.body
        )}
    </>
  );
}
