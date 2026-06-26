'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { MapPin, Clock, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const mockEvents = [
  {
    id: 1,
    title: "Musyawarah Cabang XX IMM Kota Surakarta",
    slug: "musycab-xx-imm-surakarta",
    date: "2024-05-20T08:00:00Z",
    location: "Gedung Balai Muhammadiyah Surakarta",
    status: "upcoming",
    organizers: "Panitia Pemilihan, PC IMM Kota Surakarta"
  },
  {
    id: 2,
    title: "Sekolah Pimpinan: Upgrading Kepemimpinan Organisasi",
    slug: "sekolah-pimpinan-upgrading",
    date: "2024-04-15T09:00:00Z",
    location: "Aula UMS",
    status: "upcoming",
    organizers: "Bidang Kader"
  },
  {
    id: 3,
    title: "Diskusi Publik: Peran Mahasiswa dalam Mengawal Demokrasi",
    slug: "diskusi-publik-peran-mahasiswa",
    date: "2024-05-02T13:00:00Z",
    location: "Amphitheater FKIP UNS",
    status: "upcoming",
    organizers: "Bidang Hikmah, LSO Hikmah"
  }
];

export default function UpcomingEvents() {
  return (
    <section className="py-32 bg-[#0f172a] relative overflow-hidden text-white">
      {/* Decorative large text */}
      <div className="absolute top-10 left-0 w-full overflow-hidden opacity-[0.02] pointer-events-none select-none flex whitespace-nowrap">
        <div className="text-[15rem] font-black tracking-tighter" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          AGENDA AGENDA AGENDA
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column: Heading */}
          <div className="lg:w-1/3">
            <div className="sticky top-32">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 mb-6"
              >
                <span className="text-[#c20000]/80 font-bold uppercase tracking-widest text-sm">Jadwal</span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
              >
                Agenda <br/>
                <span className="text-[#c20000] italic">Mendatang</span>
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-white/70 text-lg mb-10 max-w-sm"
              >
                Jangan lewatkan berbagai kegiatan menarik, diskusi, dan aksi dari PC IMM Kota Surakarta.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Button asChild size="lg" variant="white" className="group">
                  <Link href="/agenda" className="inline-flex items-center">
                    Lihat Semua Agenda
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Interactive List */}
          <div className="lg:w-2/3">
            <div className="border-t border-slate-800">
              {mockEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/agenda/${event.slug}`} className="block group border-b border-slate-800 py-8 md:py-12 relative overflow-hidden">
                    
                    {/* Hover Reveal Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-imm-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#c20000] transform scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300"></div>

                    <div className="flex flex-col md:flex-row gap-6 md:items-center relative z-10 px-4 md:px-8">
                      
                      {/* Date */}
                      <div className="shrink-0 w-32">
                        <div className="text-[#c20000]/80 font-bold text-sm tracking-widest uppercase mb-1">
                          {new Date(event.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                          {new Date(event.date).getDate().toString().padStart(2, '0')}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-[#c20000]/80 transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex flex-col gap-2 text-sm text-white/70 font-medium">
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-white/50" />
                              {event.location}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-white/50" />
                              {new Date(event.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </div>
                          </div>
                          {event.organizers && (
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-xs uppercase tracking-wider text-white/40">Oleh:</span>
                              {event.organizers.split(',').map((org, idx) => (
                                <span key={idx} className="bg-white/10 text-white/80 px-2 py-0.5 rounded-sm text-xs">
                                  {org.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className="shrink-0 w-14 h-14 rounded-full border border-slate-700 flex items-center justify-center group-hover:bg-[#c20000] group-hover:border-imm-red-600 transition-all duration-300 self-start md:self-center">
                        <ArrowUpRight className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>

                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
