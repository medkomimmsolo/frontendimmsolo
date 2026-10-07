import { Metadata } from 'next';
import AjukanAkunClient from './AjukanAkunClient';

export const metadata: Metadata = {
  title: 'Pengajuan Akun | PC IMM Kota Surakarta',
  description: 'Formulir pengajuan akun pengelola website PC IMM Kota Surakarta.',
};

export default function AjukanAkunPage() {
  return <AjukanAkunClient />;
}
