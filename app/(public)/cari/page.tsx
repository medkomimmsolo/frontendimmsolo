import { Metadata } from 'next';
import CariClient from './CariClient';

export const metadata: Metadata = {
  title: 'Pencarian',
  description: 'Cari berita, agenda, dan dokumen di website PC IMM Kota Surakarta.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function CariPage() {
  return <CariClient />;
}
