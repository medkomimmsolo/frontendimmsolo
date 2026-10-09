'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  MapPin,
  ExternalLink,
  ArrowRight,
  X,
  CalendarDays,
} from 'lucide-react';

interface AgendaEvent {
  id: number;
  title: string;
  slug: string;
  event_date: string;
  location: string;
  organizers?: string;
  registration_link?: string;
  status: string;
  computedStatus: string;
  badgeText: string;
  badgeClass: string;
}

const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function EventCard({ event }: { event: AgendaEvent }) {
  const eventDate = new Date(event.event_date);
  const time =
    eventDate
      .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
      .replace(/\./g, ':') + ' WIB';
  const dateStr = eventDate.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta',
  });

  return (
    <Card className="group hover:shadow-md transition-all duration-300 border border-[#0f172a]/10 overflow-hidden bg-white">
      <CardContent className="p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${event.badgeClass} border-none shadow-sm rounded-full px-3 py-1 font-semibold`}>
            {event.badgeText}
          </Badge>
        </div>
        <div className="mb-3">
          <Link href={`/agenda/${event.slug}`} className="group-hover:text-[#c20000] transition-colors">
            <h2
              className="text-xl md:text-2xl font-bold text-[#0f172a] leading-snug group-hover:text-[#c20000] transition-colors"
              style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
            >
              {event.title}
            </h2>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-[#0f172a]/70 font-medium mb-2 bg-[#0f172a]/5 p-3 rounded-sm w-fit max-w-full flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="w-4 h-4 mr-2 text-[#c20000] shrink-0" />
            <span>{dateStr} • {time}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 mr-2 text-[#c20000] shrink-0" />
            <span className="break-words">{event.location}</span>
          </div>
        </div>
        {event.organizers && (
          <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
            <span className="text-xs text-[#0f172a]/50 font-semibold uppercase tracking-wider">Oleh:</span>
            {event.organizers.split(',').map((org: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs border-[#c20000]/20 bg-[#c20000]/5 text-[#c20000] font-medium shadow-none px-2 py-0.5">
                {org.trim()}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-4 border-t border-[#0f172a]/5 pt-4">
          <Button asChild variant="outline" size="sm" className="border-[#0f172a]/10 hover:border-[#c20000] hover:text-[#c20000] rounded-sm text-xs font-semibold">
            <Link href={`/agenda/${event.slug}`}>
              Detail Kegiatan
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
          {event.registration_link && event.computedStatus === 'upcoming' && (
            <Button asChild size="sm" className="bg-[#c20000] hover:bg-[#a30000] text-white shadow-sm rounded-sm text-xs font-semibold">
              <a href={event.registration_link} target="_blank" rel="noopener noreferrer">
                Daftar Sekarang
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AgendaView({ events }: { events: AgendaEvent[] }) {
  const today = new Date();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [popupEvent, setPopupEvent] = useState<AgendaEvent | null>(null);

  // ---- Kalender helpers ----
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [currentMonth]);

  const eventsOnDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.event_date), day));

  const eventsThisMonth = useMemo(
    () =>
      events.filter((e) => {
        const d = new Date(e.event_date);
        return (
          d.getFullYear() === currentMonth.getFullYear() &&
          d.getMonth() === currentMonth.getMonth()
        );
      }),
    [events, currentMonth]
  );

  const prevMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  return (
    <div>
      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setView('list')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-semibold border transition-colors ${
            view === 'list'
              ? 'bg-[#0f172a] text-white border-[#0f172a]'
              : 'bg-white text-slate-600 border-slate-200 hover:border-[#c20000] hover:text-[#c20000]'
          }`}
        >
          <List className="w-4 h-4" />
          Daftar
        </button>
        <button
          onClick={() => { setView('calendar'); setSelectedDay(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-semibold border transition-colors ${
            view === 'calendar'
              ? 'bg-[#0f172a] text-white border-[#0f172a]'
              : 'bg-white text-slate-600 border-slate-200 hover:border-[#c20000] hover:text-[#c20000]'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Kalender
        </button>
      </div>

      {/* ===== LIST VIEW ===== */}
      {view === 'list' && (
        <div className="flex flex-col space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <Calendar className="w-12 h-12 text-[#0f172a]/20 mx-auto mb-4" />
              <p className="text-[#0f172a] font-semibold text-lg mb-2">Belum ada agenda kegiatan.</p>
              <p className="text-[#0f172a]/70 text-sm mb-6">Coba ubah filter atau kembali lagi nanti.</p>
            </div>
          ) : (
            events.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </div>
      )}

      {/* ===== CALENDAR VIEW ===== */}
      {view === 'calendar' && (
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          {/* Header Navigasi Bulan */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-sm hover:bg-slate-100 transition-colors"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 text-slate-500" />
            </button>
            <h2 className="text-base font-bold text-[#0f172a]">
              {BULAN[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-sm hover:bg-slate-100 transition-colors"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Grid Hari */}
          <div className="grid grid-cols-7 text-center">
            {HARI.map((h) => (
              <div key={h} className="py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                {h}
              </div>
            ))}

            {daysInMonth.map((day, i) => {
              if (!day)
                return (
                  <div
                    key={`empty-${i}`}
                    className="min-h-[72px] bg-slate-50/50 border-b border-r border-slate-100"
                  />
                );

              const dayEvents = eventsOnDay(day);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
              const isPast = day < today && !isToday;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    if (dayEvents.length === 0) {
                      setSelectedDay(null);
                      setPopupEvent(null);
                      return;
                    }
                    if (dayEvents.length === 1) {
                      setPopupEvent(dayEvents[0]);
                      setSelectedDay(day);
                    } else {
                      setSelectedDay(day);
                      setPopupEvent(null);
                    }
                  }}
                  className={`min-h-[72px] p-1.5 border-b border-r border-slate-100 text-left flex flex-col transition-colors ${
                    isSelected
                      ? 'bg-red-50'
                      : dayEvents.length > 0
                      ? 'hover:bg-amber-50 cursor-pointer'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mb-1 ${
                      isToday
                        ? 'bg-[#c20000] text-white'
                        : isPast
                        ? 'text-slate-300'
                        : 'text-slate-700'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <span
                        key={ev.id}
                        className="block text-[10px] font-semibold text-white bg-[#c20000] rounded px-1 truncate leading-relaxed"
                      >
                        {ev.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        +{dayEvents.length - 2} lagi
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Panel multi-event pada hari dipilih */}
          {selectedDay && !popupEvent && eventsOnDay(selectedDay).length > 1 && (
            <div className="border-t border-slate-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Agenda {selectedDay.getDate()} {BULAN[selectedDay.getMonth()]} {selectedDay.getFullYear()}
                </h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {eventsOnDay(selectedDay).map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => setPopupEvent(ev)}
                    className="text-left px-3 py-2 rounded-sm bg-slate-50 border border-slate-100 hover:border-[#c20000]/30 hover:bg-red-50 transition-colors"
                  >
                    <p className="text-sm font-semibold text-[#0f172a] truncate">{ev.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {ev.location}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ringkasan event bulan ini */}
          <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
            <span>
              {eventsThisMonth.length > 0
                ? `${eventsThisMonth.length} agenda di bulan ini`
                : 'Tidak ada agenda bulan ini'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#c20000] inline-block" /> Ada agenda
            </span>
          </div>
        </div>
      )}

      {/* ===== POPUP DETAIL EVENT ===== */}
      {popupEvent && (
        <div
          className="fixed inset-0 bg-[#0f172a]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPopupEvent(null)}
        >
          <div
            className="bg-white rounded-sm shadow-2xl max-w-lg w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPopupEvent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <Badge className={`${popupEvent.badgeClass} border-none mb-3`}>
              {popupEvent.badgeText}
            </Badge>

            <h2
              className="text-xl font-bold text-[#0f172a] mb-3 pr-6"
              style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
            >
              {popupEvent.title}
            </h2>

            <div className="flex flex-col gap-2 text-sm text-slate-600 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#c20000] shrink-0" />
                <span>
                  {new Date(popupEvent.event_date).toLocaleDateString('id-ID', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    timeZone: 'Asia/Jakarta',
                  })}
                  {' · '}
                  {new Date(popupEvent.event_date)
                    .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
                    .replace('.', ':')} WIB
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#c20000] shrink-0" />
                <span>{popupEvent.location}</span>
              </div>
              {popupEvent.organizers && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Oleh:</span>
                  {popupEvent.organizers.split(',').map((org, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-[#c20000]/20 bg-[#c20000]/5 text-[#c20000]">
                      {org.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-100">
              <Link
                href={`/agenda/${popupEvent.slug}`}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-sm bg-[#0f172a] text-white text-sm font-semibold hover:bg-[#0f172a]/90 transition-colors"
                onClick={() => setPopupEvent(null)}
              >
                Lihat Detail
              </Link>
              {popupEvent.registration_link && popupEvent.computedStatus === 'upcoming' && (
                <a
                  href={popupEvent.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-sm bg-[#c20000] text-white text-sm font-semibold hover:bg-[#a30000] transition-colors"
                >
                  Daftar <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
