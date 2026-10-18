import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ArrowUpRight, BookOpen, ChevronRight, ShieldCheck } from 'lucide-react';
import { PlaybookIcon } from '@/components/docs/DocBlocks';
import { getPlaybook, playbookGroups } from '@/lib/docs/playbooks';

export const metadata: Metadata = {
  title: 'Playbook Dokumentasi Sistem',
};

const ROLE_LEGEND = [
  { role: 'super-admin', desc: 'Akses penuh semua modul + manajemen pengguna & hak akses.' },
  { role: 'admin', desc: 'Pengelola inti PC — konten, layanan publik, pengaturan.' },
  { role: 'bidang / komisariat', desc: 'Pengurus unit — konten dan data milik unitnya (sebagian perlu review).' },
  { role: 'Role custom', desc: 'Kombinasi permission bebas yang dibuat super-admin.' },
];

export default function DocsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10 lg:px-14">
      <section className="rounded-3xl bg-gradient-to-br from-[#c20000] via-[#a30000] to-[#900000] px-7 py-12 text-white sm:px-12">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          <BookOpen className="h-4 w-4" /> Playbook
        </p>
        <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">Dokumentasi Sistem Website PC IMM Kota Surakarta</h1>
        <p className="mt-4 max-w-2xl text-white/80">
          Panduan lengkap penggunaan setiap modul dashboard — dari berita, agenda, formulir, presensi digital, hingga pengelolaan
          pengguna dan hak akses. Ditulis untuk pengurus dengan semua latar belakang teknis.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/docs/pengenalan-sistem"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#c20000] transition hover:bg-white/90"
          >
            Mulai dari Pengenalan Sistem <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Buka Dashboard <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold text-slate-900">Pilih Playbook</h2>
        <p className="mt-1 text-sm text-slate-500">Setiap modul dashboard memiliki panduan tersendiri.</p>
        {playbookGroups.map((group) => (
          <div key={group.label} className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{group.label}</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {group.slugs.map((slug) => {
                const pb = getPlaybook(slug);
                if (!pb) return null;
                return (
                  <Link
                    key={pb.slug}
                    href={`/docs/${pb.slug}`}
                    className="group flex flex-col rounded-2xl border border-slate-200 p-5 transition hover:border-[#c20000]/40 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c20000]/10 text-[#c20000]">
                        <PlaybookIcon name={pb.icon} className="h-5 w-5" />
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#c20000]" />
                    </div>
                    <p className="mt-4 font-semibold text-slate-900">{pb.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{pb.short}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <ShieldCheck className="h-5 w-5 text-[#c20000]" /> Memahami Role & Hak Akses
        </h2>
        <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200">
          {ROLE_LEGEND.map((item) => (
            <div key={item.role} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:gap-6">
              <span className="w-44 shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-center font-mono text-xs font-semibold text-slate-700">
                {item.role}
              </span>
              <span className="text-sm text-slate-600">{item.desc}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Detail lengkap ada di playbook{' '}
          <Link href="/docs/pengguna-role-hak-akses" className="font-medium text-[#c20000] hover:underline">
            Pengguna, Role & Hak Akses
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
