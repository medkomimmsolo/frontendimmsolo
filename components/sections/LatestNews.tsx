'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Calendar, ArrowUpRight, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type LatestNewsProps = {
  posts?: any[];
};

export default function LatestNews({ posts = [] }: LatestNewsProps) {
  const displayPosts = Array.isArray(posts) ? posts : [];

  if (displayPosts.length === 0) {
    return (
      <section className="py-20 md:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <Newspaper className="w-12 h-12 text-[#0f172a]/20 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Suara & <span className="text-[#c20000] italic">Pergerakan</span>
          </h2>
          <p className="text-[#0f172a]/70 mb-8">Belum ada publikasi terbaru. Silakan kembali lagi nanti.</p>
          <Button asChild className="bg-[#c20000] hover:bg-[#a30000] text-white">
            <Link href="/post">
              Lihat Semua Post
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  const featuredBlog = displayPosts[0];
  const regularBlogs = displayPosts.slice(1, 3);

  return (
    <section className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <div data-aos="fade-up" className="flex items-center gap-4 mb-4">
              <span className="text-[#0f172a]/70 font-semibold uppercase tracking-wider text-sm">Publikasi</span>
            </div>
            <div data-aos="fade-up" data-aos-delay="100">
              <h2 
                className="text-4xl md:text-5xl font-bold text-[#0f172a]"
                style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
              >
                Suara & <span className="text-[#c20000] italic">Pergerakan</span>
              </h2>
            </div>
          </div>
          <div data-aos="fade-up" data-aos-delay="200">
            <Button variant="ghost" className="text-[#0f172a]/80 hover:bg-transparent group font-semibold text-base" asChild>
              <Link href="/post" className="flex items-center">
                Lihat Semua Post
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Featured Post (Spans 7 columns) */}
          <div
            data-aos="zoom-in"
            className="lg:col-span-7 h-full"
          >
            <Link href={`/post/${featuredBlog.slug}`} className="block h-full group">
              <div className="relative h-full min-h-[400px] md:min-h-[500px] rounded-sm overflow-hidden">
                {/* Image or Placeholder */}
                <div className="absolute inset-0 bg-white transition-transform duration-700 group-hover:scale-105">
                  {featuredBlog.featured_image ? (
                    <Image 
                      src={featuredBlog.featured_image} 
                      alt={featuredBlog.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-imm-red-50 to-slate-200 opacity-60"></div>
                  )}
                </div>
                
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                
                <div className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight className="w-6 h-6" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className="bg-[#c20000] text-white border-none px-4 py-1">
                      {featuredBlog.category?.name || 'Post'}
                    </Badge>
                    <span className="text-white/80 text-sm flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(featuredBlog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-snug group-hover:text-[#c20000]/60 transition-colors" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                    {featuredBlog.title}
                  </h3>
                  <p className="text-white/80 text-base md:text-lg line-clamp-2 md:line-clamp-3">
                    {featuredBlog.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Regular Posts List (Spans 5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {regularBlogs.map((blog, index) => (
              <div key={blog.id} data-aos="fade-left" data-aos-delay={index * 120} className="flex-1">
                <Link href={`/post/${blog.slug}`} className="block h-full group">
                  <div className="h-full bg-white border border-[#0f172a]/10 rounded-sm p-6 md:p-8 hover:border-imm-red-300 hover:shadow-xl hover:shadow-imm-red-600/5 transition-all duration-300 flex flex-col justify-center relative overflow-hidden">
                    
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16 group-hover:bg-[#c20000]/5 transition-colors duration-500"></div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[#c20000] text-xs font-bold uppercase tracking-wider">
                          {blog.category?.name || 'Post'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-[#0f172a]/70 text-xs flex items-center">
                          {new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-[#0f172a] mb-3 group-hover:text-[#c20000] transition-colors leading-snug" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        {blog.title}
                      </h3>
                      <p className="text-[#0f172a]/80 text-sm md:text-base line-clamp-3">
                        {blog.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
