import type { ReactNode } from 'react';
import DocsShell from '@/components/docs/DocsShell';

export const metadata = {
  title: {
    default: 'Playbook Dokumentasi',
    template: '%s | Playbook PC IMM Kota Surakarta',
  },
  description: 'Panduan penggunaan sistem website PC IMM Kota Surakarta untuk pengurus dan admin.',
};

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
