import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Calendar, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Post & Artikel | PC IMM Kota Surakarta',
  description: 'Kabar terbaru, opini, dan liputan kegiatan seputar Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
  alternates: {
    canonical: 'https://immsolo.or.id/post'
  },
  openGraph: {
    title: 'Post & Artikel | PC IMM Kota Surakarta',
    description: 'Kabar terbaru, opini, dan liputan kegiatan seputar Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
    url: 'https://immsolo.or.id/post',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Post & Artikel | PC IMM Kota Surakarta',
    description: 'Kabar terbaru, opini, dan liputan kegiatan seputar Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
  }
};

async function getBlogs(category?: string) {
  try {
    const url = category 
      ? `${process.env.NEXT_PUBLIC_API_URL}/blogs?category=${category}`
      : `${process.env.NEXT_PUBLIC_API_URL}/blogs`;
      
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.data || json.data || [];
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export default async function PostPage(props: Props) {
  if (await checkMaintenance('maintenance_berita')) return <MaintenancePage />;
  
  const searchParams = await props.searchParams;
  const category = typeof searchParams?.category === 'string' ? searchParams.category : undefined;

  const posts = await getBlogs(category);
  const heroPost = posts.length > 0 ? posts[0] : null;
  const topPosts = posts.slice(1, 5); // Up to 4 posts
  const remainingPosts = posts.slice(5);
  
  // Format category name for title display if category is selected
  const displayTitle = category 
    ? `Kategori: ${category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}` 
    : 'Index Post';

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-24 pb-20">
      
      {/* Breadcrumb & Title Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-6">
        <nav aria-label="breadcrumb" className="mb-4">
          <ul className="flex items-center text-sm text-[#0f172a]/60 space-x-2">
            <li>
              <Link href="/" className="hover:text-[#c20000] transition-colors flex items-center">
                Home
              </Link>
            </li>
            <li>
              <span className="text-[#0f172a]/40 mx-1">/</span>
            </li>
            <li className="text-[#0f172a] font-medium" aria-current="page">{category ? 'Kategori' : 'Post'}</li>
          </ul>
        </nav>
        <div className="flex items-center justify-between border-b border-[#0f172a]/10 pb-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            {displayTitle}
          </h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-16">
        {/* Hero Section: 1 Large Left, 4 Small Right */}
        {heroPost && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column: Large Post */}
            <div className="group bg-white rounded-md shadow-sm border border-[#0f172a]/5 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Link href={`/post/${heroPost.slug}`} className="block w-full h-full">
                  <img 
                    src={heroPost.featured_image 
                      ? (heroPost.featured_image.startsWith('http') ? heroPost.featured_image : `/storage/${heroPost.featured_image.replace(/^\/?storage\//, '')}`)
                      : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'} 
                    alt={heroPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-[#c20000] text-white hover:bg-[#a30000] border-none shadow-sm font-semibold rounded-sm">
                    {heroPost.category?.name || 'Artikel'}
                  </Badge>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <Link href={`/post/${heroPost.slug}`} className="block group/link">
                  <h3 
                    className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-3 leading-[1.3] group-hover/link:text-[#c20000] transition-colors line-clamp-3"
                    style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                  >
                    {heroPost.title}
                  </h3>
                </Link>
                <p className="text-[#0f172a]/70 text-base mb-6 line-clamp-3 leading-relaxed flex-grow">
                  {heroPost.excerpt}
                </p>
                <div className="flex items-center text-xs text-[#0f172a]/60 font-medium pt-4 border-t border-[#0f172a]/5">
                  <div className="flex items-center mr-4">
                    <User className="w-3.5 h-3.5 mr-1.5" />
                    {heroPost.user?.name || 'Admin'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(heroPost.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 4 Small Posts Grid */}
            {topPosts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {topPosts.map((post: any) => (
                  <div key={post.id} className="group bg-white rounded-md shadow-sm border border-[#0f172a]/5 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Link href={`/post/${post.slug}`} className="block w-full h-full">
                        <img 
                          src={post.featured_image 
                            ? (post.featured_image.startsWith('http') ? post.featured_image : `/storage/${post.featured_image.replace(/^\/?storage\//, '')}`)
                            : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=2070&auto=format&fit=crop'} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-[#c20000] text-white hover:bg-[#a30000] border-none shadow-sm text-[10px] px-2 py-0.5 rounded-sm">
                          {post.category?.name || 'Artikel'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <Link href={`/post/${post.slug}`} className="block group/link mb-2">
                        <h6 
                          className="text-base font-bold text-[#0f172a] leading-snug group-hover/link:text-[#c20000] transition-colors line-clamp-3"
                          style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                        >
                          {post.title}
                        </h6>
                      </Link>
                      <div className="mt-auto pt-3 flex items-center text-[11px] text-[#0f172a]/50 font-medium">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
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
          <div className="flex items-center justify-between border-b border-[#0f172a]/10 pb-3 mb-8">
            <h2 className="text-xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Berita Terkini
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {remainingPosts.map((post: any) => (
              <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 border-[#0f172a]/5 overflow-hidden flex flex-col rounded-md">
                <Link href={`/post/${post.slug}`} className="block relative aspect-[16/9] overflow-hidden">
                  <img 
                    src={post.featured_image 
                      ? (post.featured_image.startsWith('http') ? post.featured_image : `/storage/${post.featured_image.replace(/^\/?storage\//, '')}`)
                      : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=2070&auto=format&fit=crop'} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-[#c20000] text-white hover:bg-[#a30000] border-none shadow-sm rounded-sm">
                      {post.category?.name || 'Artikel'}
                    </Badge>
                  </div>
                </Link>
                <CardContent className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center text-xs text-[#0f172a]/60 mb-3 font-medium gap-4">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1.5" />
                      {post.user?.name || 'Admin'}
                    </span>
                  </div>
                  <Link href={`/post/${post.slug}`} className="block group/link">
                    <h3 
                      className="text-lg font-bold text-[#0f172a] mb-3 leading-snug group-hover/link:text-[#c20000] transition-colors line-clamp-3"
                      style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                    >
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-[#0f172a]/70 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-4 border-t border-[#0f172a]/5">
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
        <div className="text-center py-20">
          <p className="text-[#0f172a]/70 text-lg">Belum ada post yang dipublikasikan.</p>
        </div>
      )}

    </main>
  );
}
