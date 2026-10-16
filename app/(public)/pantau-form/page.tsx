import type { Metadata } from 'next';
import { PantauFormClient } from './PantauFormClient';

export const metadata: Metadata = {
  title: 'Pantau Respons Form | PC IMM Kota Surakarta',
  robots: { index: false, follow: false },
};

export default function PantauFormPage() {
  return <PantauFormClient />;
}
