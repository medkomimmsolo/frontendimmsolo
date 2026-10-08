import { Metadata } from 'next';
import CariClient from './CariClient';

export const metadata: Metadata = {
  title: 'Pencarian | PC IMM Kota Surakarta',
  description: 'Cari berita, agenda, dan dokumen di website PC IMM Kota Surakarta.',
};

export default function CariPage() {
  return <CariClient />;
}
