import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Calendar, User, FileSearch } from 'lucide-react';

import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';
import { toAbsoluteSiteUrl } from '@/lib/absoluteUrl';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (typeof sp?.category === 'string' && sp.category) params.set('category', sp.category);
  if (typeof sp?.page === 'string' && sp.page && sp.page !== '1') params.set('page', sp.page);
  const qs = params.toString();
  const canonical = `https://immsolo.or.id/post${qs ? `?${qs}` : ''}`;
  const ogImage = toAbsoluteSiteUrl('/images/imm_hero_bg.jpg');

  return {
    title: 'Post & Artikel',
    description: 'Kabar terbaru, opini, dan liputan kegiatan seputar Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
    alternates: {
      canonical,
    },
    openGraph: {
      title: 'Post & Artikel | PC IMM Kota Surakarta',
      description: 'Kabar terbaru, opini, dan liputan kegiatan seputar Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
      url: canonical,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Post & Artikel PC IMM Kota Surakarta',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Post & Artikel | PC IMM Kota Surakarta',
      description: 'Kabar terbaru, opini, dan liputan kegiatan seputar Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
      images: [ogImage],
    }
  };
}

async function getBlogs(category?: string, page: number = 1) {
  try {
    const params = new URLSearchParams({ page: String(page), per_page: '12' });
    if (category) params.set('category', category);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs?${params}`, { next: { revalidate: 30 } });
    if (!res.ok) return { items: [], currentPage: 1, lastPage: 1 };
    const json = await res.json();
    const payload = json.data || {};
    return {
      items: Array.isArray(payload) ? payload : payload.data || [],
      currentPage: payload.current_page || 1,
      lastPage: payload.last_page || 1,
    };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return { items: [], currentPage: 1, lastPage: 1 };
  }
}

export default async function PostPage(props: Props) {
  if (await checkMaintenance('maintenance_berita')) return <MaintenancePage />;
  
  const searchParams = await props.searchParams;
  const category = typeof searchParams?.category === 'string' ? searchParams.category : undefined;

  const searchParams2 = await props.searchParams;
  const page = typeof searchParams2?.page === 'string' ? parseInt(searchParams2.page) || 1 : 1;
  const { items: posts, currentPage, lastPage } = await getBlogs(category, page);
  const heroPost = posts.length > 0 ? posts[0] : null;
  const topPosts = posts.slice(1, 5); // Up to 4 posts
  const remainingPosts = posts.slice(5);
  
  // Format category name for title display if category is selected
  const displayTitle = category 
    ? `Kategori: ${category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}` 
    : 'Post & Artikel';

  return (
    <main className="min-h-screen bg-slate-50/70 pt-28 pb-20">
      
      {/* Breadcrumb & Title Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-8">
        <nav aria-label="breadcrumb" className="mb-4">
          <ul className="flex items-center text-sm text-slate-500 space-x-2">
            <li>
              <Link href="/" className="hover:text-[#c20000] transition-colors flex items-center font-medium">
                Beranda
              </Link>
            </li>
            <li>
              <span className="text-slate-300 mx-1">/</span>
            </li>
            <li className="text-[#0f172a] font-semibold" aria-current="page">{category ? 'Kategori' : 'Post & Artikel'}</li>
          </ul>
        </nav>
        <div data-aos="fade-up" className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200/80 pb-6 mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#c20000] border border-red-100 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c20000]"></span>
              Warta & Opini
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] tracking-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              {displayTitle}
            </h1>
          </div>
          <p className="text-slate-500 text-sm md:text-base max-w-md">
            Informasi terkini, tulisan pemikiran, dan kabar pergerakan PC IMM Kota Surakarta.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-16">
        {/* Hero Section: 1 Large Left, 4 Small Right */}
        {heroPost && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column: Large Post */}
            <div className="group bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden flex flex-col hover:shadow-xl hover:border-red-200 transition-all duration-300">
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                <Link href={`/post/${heroPost.slug}`} className="block w-full h-full">
                  <Image
                    src={heroPost.featured_image 
                      ? (heroPost.featured_image.startsWith('http') ? heroPost.featured_image : `/storage/${heroPost.featured_image.replace(/^\/?storage\//, '')}`)
                      : '/images/imm_hero_bg.jpg'} 
                    alt={heroPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </Link>
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-[#c20000] text-white hover:bg-[#a30000] border-none shadow-md font-semibold rounded-full px-3 py-1 text-xs">
                    {heroPost.category?.name || 'Artikel'}
                  </Badge>
                </div>
              </div>
              <div className="p-6 md:p-8 flex flex-col flex-grow">
                <Link href={`/post/${heroPost.slug}`} className="block group/link">
                  <h2 
                    className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-3 leading-[1.3] group-hover/link:text-[#c20000] transition-colors line-clamp-2"
                    style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                  >
                    {heroPost.title}
                  </h2>
                </Link>
                <p className="text-slate-600 text-base mb-6 line-clamp-3 leading-relaxed flex-grow">
                  {heroPost.excerpt}
                </p>
                <div className="flex items-center text-xs text-slate-500 font-medium pt-4 border-t border-slate-100">
                  <div className="flex items-center mr-4">
                    <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {heroPost.user?.name || 'Admin'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {new Date(heroPost.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 4 Small Posts Grid */}
            {topPosts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {topPosts.map((post: any) => (
                  <div key={post.id} className="group bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden flex flex-col hover:shadow-lg hover:border-red-200 hover:-translate-y-1 transition-all duration-300">
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                      <Link href={`/post/${post.slug}`} className="block w-full h-full">
                        <Image
                          src={post.featured_image 
                            ? (post.featured_image.startsWith('http') ? post.featured_image : `/storage/${post.featured_image.replace(/^\/?storage\//, '')}`)
                            : '/images/imm_hero_bg.jpg'} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </Link>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-[#c20000] text-white hover:bg-[#a30000] border-none shadow-sm text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
                          {post.category?.name || 'Artikel'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <Link href={`/post/${post.slug}`} className="block group/link mb-2">
                        <h3 
                          className="text-base font-bold text-[#0f172a] leading-snug group-hover/link:text-[#c20000] transition-colors line-clamp-2"
                          style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                        >
                          {post.title}
                        </h3>
                      </Link>
                      <div className="mt-auto pt-3 flex items-center text-[11px] text-slate-400 font-medium">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Remaining Posts Grid */}
      {remainingPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-8">
            <h2 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Berita Terkini
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {remainingPosts.map((post: any) => (
              <Card key={post.id} className="group hover:shadow-xl hover:border-red-200 hover:-translate-y-1 transition-all duration-300 border border-slate-200/90 overflow-hidden flex flex-col rounded-2xl bg-white shadow-sm">
                <Link href={`/post/${post.slug}`} className="block relative aspect-[16/9] overflow-hidden bg-slate-100">
                  <Image
                    src={post.featured_image 
                      ? (post.featured_image.startsWith('http') ? post.featured_image : `/storage/${post.featured_image.replace(/^\/?storage\//, '')}`)
                      : '/images/imm_hero_bg.jpg'} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-[#c20000] text-white hover:bg-[#a30000] border-none shadow-md rounded-full px-3 py-0.5 text-xs font-semibold">
                      {post.category?.name || 'Artikel'}
                    </Badge>
                  </div>
                </Link>
                <CardContent className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center text-xs text-slate-500 mb-3 font-medium gap-4">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
                    </span>
                    <span className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {post.user?.name || 'Admin'}
                    </span>
                  </div>
                  <Link href={`/post/${post.slug}`} className="block group/link">
                    <h3 
                      className="text-lg font-bold text-[#0f172a] mb-3 leading-snug group-hover/link:text-[#c20000] transition-colors line-clamp-2"
                      style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                    >
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <Link 
                      href={`/post/${post.slug}`} 
                      className="inline-flex items-center text-sm font-bold text-[#c20000] hover:text-[#a30000] transition-colors group/read"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="w-4 h-4 ml-1.5 group-hover/read:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      
      {posts.length === 0 && (
        <div className="text-center py-20 max-w-md mx-auto bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#c20000] flex items-center justify-center mx-auto mb-4 border border-red-100">
            <FileSearch className="w-8 h-8" />
          </div>
          <p className="text-[#0f172a] font-bold text-lg mb-2">Belum ada post yang dipublikasikan.</p>
          <p className="text-slate-500 text-sm mb-6">Coba ubah filter kategori atau kembali lagi nanti.</p>
          <Link href="/post" className="inline-flex items-center px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-[#c20000] hover:text-[#c20000] transition-colors shadow-sm">
            Tampilkan Semua Post
          </Link>
        </div>
      )}

      {lastPage > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-14" aria-label="Pagination">
          {currentPage > 1 && (
            <Link href={`/post?page=${currentPage - 1}${category ? `&category=${category}` : ''}`} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-[#c20000] hover:text-[#c20000] transition-colors shadow-sm">
              Sebelumnya
            </Link>
          )}
          <span className="px-4 py-2 text-sm font-semibold text-slate-500 bg-white rounded-xl border border-slate-200/80 shadow-sm">
            Halaman {currentPage} dari {lastPage}
          </span>
          {currentPage < lastPage && (
            <Link href={`/post?page=${currentPage + 1}${category ? `&category=${category}` : ''}`} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-[#c20000] hover:text-[#c20000] transition-colors shadow-sm">
              Selanjutnya
            </Link>
          )}
        </nav>
      )}

    </main>
  );
}
