'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, ArrowUpRight, Newspaper, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type LatestNewsProps = {
  posts?: any[];
};

export default function LatestNews({ posts = [] }: LatestNewsProps) {
  const displayPosts = Array.isArray(posts) ? posts : [];

  if (displayPosts.length === 0) {
    return (
      <section className="py-20 md:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#c20000] flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Newspaper className="w-8 h-8" />
          </div>
          <h2 
            className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-3" 
            style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
          >
            Suara & <span className="text-[#c20000]">Pergerakan</span>
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm">
            Belum ada publikasi artikel terbaru. Silakan pantau secara berkala untuk update informasi kegiatan.
          </p>
          <Button asChild className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-semibold px-6 h-10 shadow-sm">
            <Link href="/post">
              <span>Buka Halaman Berita</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  const featuredBlog = displayPosts[0];
  const regularBlogs = displayPosts.slice(1, 3);

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 md:mb-16 gap-6">
          <div className="max-w-2xl">
            <div data-aos="fade-up" className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#c20000] border border-red-100 text-xs font-bold uppercase tracking-wider">
                <Newspaper className="w-3.5 h-3.5" /> Publikasi & Opini
              </span>
            </div>
            <div data-aos="fade-up" data-aos-delay="100">
              <h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight leading-tight"
                style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
              >
                Suara & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c20000] to-[#8a0000]">Pergerakan</span>
              </h2>
            </div>
          </div>
          
          <div data-aos="fade-up" data-aos-delay="200">
            <Link 
              href="/post" 
              className="inline-flex items-center gap-2 text-sm font-bold text-[#c20000] hover:text-[#990000] transition-colors group"
            >
              <span>Lihat Semua Berita</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Berita Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Featured Post (Spans 7 columns) */}
          <div data-aos="zoom-in" className="lg:col-span-7 h-full">
            <Link href={`/post/${featuredBlog.slug}`} className="block h-full group">
              <div className="relative h-full min-h-[400px] md:min-h-[500px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-md group-hover:shadow-2xl group-hover:border-red-200 transition-all duration-500 bg-slate-900">
                {/* Image */}
                <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                  {featuredBlog.featured_image ? (
                    <Image 
                      src={featuredBlog.featured_image} 
                      alt={featuredBlog.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900" />
                  )}
                </div>
                
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
                
                {/* Arrow Icon Badge */}
                <div className="absolute top-6 right-6 w-11 h-11 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 shadow-lg">
                  <ArrowUpRight className="w-5 h-5" />
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 z-10">
                  <div className="flex flex-wrap items-center gap-2.5 mb-3">
                    {featuredBlog.category?.name && (
                      <span className="px-3 py-1 rounded-full bg-[#c20000] text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                        {featuredBlog.category.name}
                      </span>
                    )}
                    <span 
                      className="inline-flex items-center gap-1.5 text-xs text-white/80 font-medium"
                      suppressHydrationWarning
                    >
                      <Calendar className="w-3.5 h-3.5 text-red-300" />
                      {new Date(featuredBlog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
                    </span>
                  </div>

                  <h3 
                    className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-snug group-hover:text-red-100 transition-colors line-clamp-2 mb-3"
                    style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                  >
                    {featuredBlog.title}
                  </h3>

                  {featuredBlog.excerpt && (
                    <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                      {featuredBlog.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Regular Posts (Spans 5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {regularBlogs.map((post, idx) => (
              <div 
                key={post.id} 
                data-aos="fade-left" 
                data-aos-delay={(idx + 1) * 150} 
                className="flex-1"
              >
                <Link href={`/post/${post.slug}`} className="block h-full group">
                  <div className="h-full bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm group-hover:shadow-xl group-hover:border-red-200 transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#c20000]">
                          {post.category?.name || 'Berita'}
                        </span>
                        <span 
                          className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1"
                          suppressHydrationWarning
                        >
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })}
                        </span>
                      </div>

                      <h3 
                        className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#c20000] transition-colors leading-snug line-clamp-2 mb-2"
                        style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                      >
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-[#c20000] transition-colors">
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            {regularBlogs.length === 0 && (
              <div className="h-full bg-slate-50 border border-slate-200/60 rounded-2xl p-8 flex items-center justify-center text-center text-slate-400 text-sm">
                Nantikan artikel dan suara pergerakan lainnya segera.
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
