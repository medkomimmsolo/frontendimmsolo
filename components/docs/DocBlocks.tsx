import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Folder,
  HelpCircle,
  Image as ImageIcon,
  Inbox,
  Info,
  KeyRound,
  LayoutDashboard,
  Link as LinkIcon,
  Megaphone,
  Network,
  Newspaper,
  QrCode,
  Rocket,
  Settings,
  Shield,
  UserPlus,
  Zap,
} from 'lucide-react';

import type { DocBlock } from '@/lib/docs/playbooks';

export type { DocBlock, DocSection, Playbook, PlaybookGroup } from '@/lib/docs/playbooks';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  key: KeyRound,
  home: LayoutDashboard,
  rocket: Rocket,
  newspaper: Newspaper,
  calendar: CalendarDays,
  network: Network,
  folder: Folder,
  clipboard: ClipboardList,
  qr: QrCode,
  link: LinkIcon,
  zap: Zap,
  inbox: Inbox,
  megaphone: Megaphone,
  image: ImageIcon,
  settings: Settings,
  shield: Shield,
  'user-plus': UserPlus,
  audit: ClipboardList,
  help: HelpCircle,
};

export function PlaybookIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? BookOpen;
  return <Icon className={className} />;
}

const INLINE_RE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

export function renderInline(text: string): ReactNode {
  const parts = text.split(INLINE_RE).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = link[2].startsWith('http') ? link[2] : `/${link[2].replace(/^\//, '')}`;
      return (
        <a key={i} href={href} className="font-medium text-[#c20000] underline decoration-[#c20000]/30 underline-offset-2 hover:decoration-[#c20000]">
          {link[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const CALLOUT_STYLES: Record<string, { wrap: string; icon: ReactNode }> = {
  info: { wrap: 'border-blue-200 bg-blue-50 text-blue-900', icon: <Info className="h-4 w-4 text-blue-500" /> },
  warning: { wrap: 'border-amber-200 bg-amber-50 text-amber-900', icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
  success: { wrap: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: <Info className="h-4 w-4 text-emerald-500" /> },
  danger: { wrap: 'border-red-200 bg-red-50 text-red-900', icon: <CircleAlert className="h-4 w-4 text-red-500" /> },
};

export function BlockRenderer({ block }: { block: DocBlock }) {
  switch (block.type) {
    case 'p':
      return <p className="leading-relaxed text-slate-600">{renderInline(block.text)}</p>;

    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag className={`space-y-2 ${block.ordered ? 'list-decimal' : 'list-disc'} pl-5 marker:text-[#c20000]/60`}>
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed text-slate-600">
              {renderInline(item)}
            </li>
          ))}
        </Tag>
      );
    }

    case 'steps':
      return (
        <ol className="space-y-3">
          {block.items.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c20000] text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-slate-800">{renderInline(step.title)}</p>
                {step.desc ? <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{renderInline(step.desc)}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      );

    case 'flow':
      return (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {block.items.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 ? <ArrowRight className="h-4 w-4 text-slate-400" /> : null}
              <span className="rounded-lg border border-[#c20000]/15 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
                {item}
              </span>
            </span>
          ))}
        </div>
      );

    case 'table':
      return (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                {block.head.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 font-semibold text-slate-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-b border-slate-100 odd:bg-slate-50/60 last:border-0">
                  {row.map((cell, c) => (
                    <td key={c} className="px-4 py-2.5 align-top text-slate-600">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'callout': {
      const tone = block.tone ?? 'info';
      const style = CALLOUT_STYLES[tone] ?? CALLOUT_STYLES.info;
      return (
        <div className={`flex gap-3 rounded-xl border p-4 ${style.wrap}`}>
          <span className="mt-0.5 shrink-0">{style.icon}</span>
          <div className="min-w-0 space-y-1">
            {block.title ? <p className="font-semibold">{block.title}</p> : null}
            <p className="text-sm leading-relaxed">{renderInline(block.text)}</p>
          </div>
        </div>
      );
    }

    case 'links':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {block.items.map((link, i) => (
            <a
              key={i}
              href={link.href.startsWith('http') ? link.href : `/${link.href.replace(/^\//, '')}`}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#c20000]/40 hover:shadow-sm"
            >
              <p className="flex items-center justify-between font-medium text-slate-800">
                {link.label}
                <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#c20000]" />
              </p>
              {link.desc ? <p className="mt-1 text-sm text-slate-500">{link.desc}</p> : null}
            </a>
          ))}
        </div>
      );

    default:
      return null;
  }
}
