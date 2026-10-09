import { Metadata } from 'next';
import AjukanAkunClient from './AjukanAkunClient';

export const metadata: Metadata = {
  title: 'Pengajuan Akun',
  description: 'Formulir pengajuan akun pengelola website PC IMM Kota Surakarta.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AjukanAkunPage() {
  return <AjukanAkunClient />;
}
