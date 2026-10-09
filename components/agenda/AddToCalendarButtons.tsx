'use client';

import { CalendarPlus, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function toGoogleDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
}

export default function AddToCalendarButtons({
  title,
  description,
  location,
  startInput,
  slug,
}: {
  title: string;
  description?: string;
  location?: string;
  startInput: string | Date;
  slug: string;
}) {
  const start = new Date(startInput);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const plainDesc = (description || '').replace(/<[^>]*>/g, '').slice(0, 500);

  const googleUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${toGoogleDate(start)}/${toGoogleDate(end)}` +
    `&details=${encodeURIComponent(plainDesc)}` +
    `&location=${encodeURIComponent(location || '')}`;

  const icsUrl = `${process.env.NEXT_PUBLIC_API_URL}/events/${slug}/ics`;

  return (
    <div className="flex flex-wrap items-center gap-3 mt-8">
      <Button asChild className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-full font-bold">
        <a href={googleUrl} target="_blank" rel="noopener noreferrer">
          <CalendarPlus className="w-4 h-4 mr-2" />
          Tambah ke Google Calendar
        </a>
      </Button>
      <Button asChild variant="outline" className="rounded-full font-bold border-[#0f172a]/15 hover:border-emerald-600 hover:text-emerald-700">
        <a href={icsUrl} download>
          <Download className="w-4 h-4 mr-2" />
          Unduh .ics (Apple/Outlook)
        </a>
      </Button>
    </div>
  );
}
