'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Calendar, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const mockBlogs = [
  {
    id: 1,
    title: "Darul Arqam Dasar: Mencetak Kader Militan dan Intelektual di Era Digital",
    slug: "darul-arqam-dasar-mencetak-kader",
    excerpt: "Pelaksanaan DAD serentak oleh beberapa komisariat di lingkungan PC IMM Kota Surakarta berjalan dengan lancar. Fokus utama tahun ini adalah adaptasi gerakan di era digital tanpa menghilangkan esensi ideologi.",
    category: { name: "Kaderisasi" },
    created_at: "2024-03-10T08:00:00Z",
    featured: true
  },
  {
    id: 2,
    title: "Kajian Rutin: Merespon Isu Sosial Terkini",
    slug: "kajian-rutin-merespon-isu-sosial",
    excerpt: "Bidang Hikmah menyelenggarakan diskusi publik mengenai kebijakan pemerintah dan dampaknya bagi masyarakat ekonomi kelas menengah ke bawah.",
    category: { name: "Kajian" },
    created_at: "2024-03-05T14:30:00Z",
    featured: false
  },
  {
    id: 3,
    title: "Aksi Nyata Bakti Sosial Ramadhan",
    slug: "aksi-nyata-bakti-sosial-ramadhan",
    excerpt: "Menyambut bulan suci, kader IMM Surakarta membagikan ratusan paket sembako ke panti asuhan dan kaum dhuafa di pelosok kota.",
    category: { name: "Sosial" },
    created_at: "2024-02-28T10:00:00Z",
    featured: false
  }
];

type LatestNewsProps = {
  posts?: any[];
};

export default function LatestNews({ posts = [] }: LatestNewsProps) {
  const displayPosts = posts && posts.length > 0 ? posts : mockBlogs;
  const featuredBlog = displayPosts[0];
  const regularBlogs = displayPosts.slice(1, 3);

  return (
    <section className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-4"
            >
              <span className="text-[#0f172a]/70 font-semibold uppercase tracking-wider text-sm">Publikasi</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-[#0f172a]"
              style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
            >
              Suara & <span className="text-[#c20000] italic">Pergerakan</span>
            </motion.h2>
          </div>
          <motion.div
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
          >
            <Button variant="ghost" className="text-[#0f172a]/80 hover:bg-transparent group font-semibold text-base" asChild>
              <Link href="/post" className="flex items-center">
                Lihat Semua Post
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Featured Post (Spans 7 columns) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 h-full"
          >
            <Link href={`/post/${featuredBlog.slug}`} className="block h-full group">
              <div className="relative h-full min-h-[400px] md:min-h-[500px] rounded-sm overflow-hidden">
                {/* Image or Placeholder */}
                <div className="absolute inset-0 bg-white transition-transform duration-700 group-hover:scale-105">
                  {featuredBlog.featured_image ? (
                    <img 
                      src={featuredBlog.featured_image} 
                      alt={featuredBlog.title}
                      className="w-full h-full object-cover"
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
                      {new Date(featuredBlog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
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
          </motion.div>

          {/* Regular Posts List (Spans 5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {regularBlogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex-1"
              >
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
                          {new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
