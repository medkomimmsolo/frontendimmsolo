import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Calendar, User, ChevronRight, Clock, TrendingUp, Eye } from 'lucide-react';
import { notFound } from 'next/navigation';
import ShareButtons from '@/components/post/ShareButtons';
import ReadingProgress from '@/components/post/ReadingProgress';

async function getBlog(slug: string) {
  try {
    const res = await fetch(`/blogs/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

async function getTrendingBlogs() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    // Assuming the API returns a paginated list or an array directly
    return json.data?.data || json.data || [];
  } catch (error) {
    console.error('Error fetching trending blogs:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlog(resolvedParams.slug);
  
  if (!post) {
    return {
      title: 'Not Found | PC IMM Kota Surakarta',
    };
  }

  return {
    title: `${post.title} | PC IMM Kota Surakarta`,
    description: post.meta_description || post.excerpt || `Berita dan post terbaru PC IMM Kota Surakarta: ${post.title}`,
    keywords: post.keywords ? post.keywords.split(',').map((k: string) => k.trim()) : [],
    alternates: {
      canonical: `https://immsolo.or.id/post/${resolvedParams.slug}`
    },
    openGraph: {
      title: `${post.title} | PC IMM Kota Surakarta`,
      description: post.meta_description || post.excerpt || `Berita dan post terbaru PC IMM Kota Surakarta: ${post.title}`,
      url: `https://immsolo.or.id/post/${resolvedParams.slug}`,
      type: 'article',
      publishedTime: post.created_at,
      authors: ['PC IMM Kota Surakarta'],
      images: post.featured_image ? [
        {
          url: post.featured_image,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.meta_description || post.excerpt,
      images: post.featured_image ? [post.featured_image] : [],
    }
  };
}

import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  if (await checkMaintenance('maintenance_berita')) return <MaintenancePage />;
  
  const resolvedParams = await params;
  const [post, trendingBlogs] = await Promise.all([
    getBlog(resolvedParams.slug),
    getTrendingBlogs()
  ]);

  if (!post) {
    notFound();
  }

  // Filter out the current post from the trending list and take the top 5
  const recentPosts = trendingBlogs
    .filter((b: any) => b.slug !== resolvedParams.slug)
    .slice(0, 5);

  const imageUrl = post.featured_image 
    ? (post.featured_image.startsWith('http') ? post.featured_image : `/storage/${post.featured_image.replace(/^\/?storage\//, '')}`) 
    : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop';

  // Calculate reading time (roughly 250 words per minute)
  const wordCount = post.content ? post.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 250) || 1;

  // Format date
  const publishDate = new Date(post.created_at);
  const formattedDate = publishDate.toLocaleDateString('id-ID', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  }).replace('Minggu', 'Ahad');
  const formattedTime = publishDate.toLocaleTimeString('id-ID', { 
    hour: '2-digit', minute: '2-digit' 
  }).replace('.', ':');

  return (
    <>
      {/* Reading Progress Bar */}
      <ReadingProgress />

      <main className="min-h-screen bg-white pt-24 pb-16 selection:bg-[#c20000]/20 selection:text-[#c20000]">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 md:px-6 mb-8">
          <div className="flex items-center text-sm py-4 border-b border-[#0f172a]/8">
            <ol className="flex items-center text-[#0f172a]/50 flex-wrap gap-y-2">
              <li className="flex items-center">
                <Link href="/" className="hover:text-[#c20000] transition-colors duration-200">Beranda</Link>
                <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#0f172a]/30" />
              </li>
              <li className="flex items-center">
                <Link href="/post" className="hover:text-[#c20000] transition-colors duration-200">Post</Link>
                <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#0f172a]/30" />
              </li>
              <li>
                <span className="text-[#0f172a]/70 font-medium truncate max-w-[200px] sm:max-w-[400px] block">
                  {post.title}
                </span>
              </li>
            </ol>
          </div>
        </nav>

        <article className="max-w-7xl mx-auto px-4 md:px-6">
          
          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
            
            {/* ─────────────────────────── LEFT: Article Body ─────────────────────────── */}
            <div className="w-full lg:w-[68%] min-w-0">
              
              {/* ── Article Header ── */}
              <header className="mb-8">
                {/* Category Badge */}
                <div className="flex items-center gap-3 mb-5">
                  <Badge className="bg-[#c20000] text-white hover:bg-[#a30000] px-3.5 py-1 text-[11px] font-bold tracking-[0.12em] uppercase rounded-sm border-none shadow-none">
                    {post.category?.name || 'Berita'}
                  </Badge>
                  {post.views_count > 0 && (
                    <span className="flex items-center gap-1.5 text-[11px] text-[#0f172a]/40 font-medium">
                      <Eye className="w-3.5 h-3.5" />
                      {post.views_count.toLocaleString('id-ID')} dilihat
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <h1 
                  className="text-[1.75rem] sm:text-3xl md:text-4xl lg:text-[2.65rem] font-extrabold text-[#0f172a] leading-[1.25] mb-6"
                  style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                >
                  {post.title}
                </h1>

                

                {/* Author + Meta Row */}
                <div className="flex flex-col gap-4 pt-2">
                  
                  {/* Authors Row */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    {/* Author Block */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c20000]/10 to-[#c20000]/5 border border-[#0f172a]/8 flex items-center justify-center text-[#0f172a]/40 overflow-hidden shrink-0">
                        {post.user?.profile_photo_path ? (
                          <img src={post.user.profile_photo_path} alt={post.user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4.5 h-4.5" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#0f172a]/35 leading-none mb-0.5">
                              Penulis
                            </span>
                        <span className="text-[13px] sm:text-sm font-bold text-[#0f172a] leading-tight truncate">
                          {post.author_name || post.user?.name || 'Admin IMM'}
                        </span>
                        {post.author_role && (
                          <span className="text-[10px] sm:text-[11px] font-medium text-[#0f172a]/45 mt-0.5 truncate">
                            {post.author_role}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Editor Block */}
                    {post.editor_name && (
                      <>
                        <div className="hidden sm:block w-px h-9 bg-[#0f172a]/10" />
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-50 border border-[#0f172a]/8 flex items-center justify-center text-[#0f172a]/30 overflow-hidden shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#0f172a]/35 leading-none mb-0.5">
                              Editor
                            </span>
                            <span className="text-[13px] sm:text-sm font-bold text-[#0f172a] leading-tight truncate">
                              {post.editor_name}
                            </span>
                            {post.editor_role && (
                              <span className="text-[10px] sm:text-[11px] font-medium text-[#0f172a]/45 mt-0.5 truncate">
                                {post.editor_role}
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Date + Time + Reading Time */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3.5 text-[11px] sm:text-xs font-medium text-[#0f172a]/50">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#c20000]/70" />
                      <time dateTime={publishDate.toISOString()} className="text-[#0f172a]/65">
                        {formattedDate}
                      </time>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-[#0f172a]/20" aria-hidden="true" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#c20000]/70" />
                      <span className="text-[#0f172a]/65">{formattedTime} WIB</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-[#0f172a]/20" aria-hidden="true" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#0f172a]/65">{readingTime} menit baca</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* ── Featured Image ── */}
              <figure className="relative w-full mb-10">
                <div className="relative aspect-[16/9] rounded-md overflow-hidden bg-slate-100 border border-[#0f172a]/8">
                  <img 
                    src={imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                {/* Image caption area */}
                {post.image_caption && (
                  <figcaption className="mt-2.5 text-[11px] sm:text-xs text-[#0f172a]/45 text-center italic font-medium">
                    {post.image_caption}
                  </figcaption>
                )}
              </figure>



              {/* ── Article Content (Rich Text from CMS) ── */}
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ 
                  __html: post.content
                    // 1. Hapus paragraf kosong di awal (seperti <p><br></p> atau <p>&nbsp;</p>) yang sering dibuat oleh editor teks
                    .replace(/^(?:\s*<p[^>]*>(?:\s*|&nbsp;|<br\s*\/?>)*<\/p>\s*)+/i, '')
                    // 2. Cari tag <p> pertama yang BENAR-BENAR berisi teks, lalu sisipkan dateline
                    .replace(
                      /(<p[^>]*>)/i, 
                      '$1<span class="dateline">Surakarta, <a href="https://immsolo.or.id" title="Beranda PC IMM Kota Surakarta" style="text-decoration: none !important; border-bottom: none !important; transition: color 0.2s ease;" onmouseover="this.style.color=\'#ef4444\'" onmouseout="this.style.color=\'#c20000\'">immsolo.or.id</a> &mdash; </span>'
                    )
                    // 3. Perbaiki URL gambar relatif atau malformed (seperti /v1/storage/storage/blogs/...) agar mengarah ke backend yang benar
                    .replace(/src="[^"]*\/storage\/(blogs\/[^"]+)"/g, 'src="/storage/$1"')
                }}
              />


              {/* ── Bottom Section: Tags + Share (Mobile) ── */}
              <div className="mt-14 pt-8 border-t border-[#0f172a]/10">
                {/* Tags */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#0f172a]/40 uppercase tracking-wider mr-1">Topik:</span>
                    <Badge variant="outline" className="bg-white text-[#0f172a]/70 hover:bg-[#0f172a] hover:text-white transition-colors cursor-pointer rounded-sm px-3 py-1.5 text-xs font-semibold border-[#0f172a]/10">
                      {post.category?.name || 'Umum'}
                    </Badge>
                    <Badge variant="outline" className="bg-white text-[#0f172a]/70 hover:bg-[#0f172a] hover:text-white transition-colors cursor-pointer rounded-sm px-3 py-1.5 text-xs font-semibold border-[#0f172a]/10">
                      PC IMM
                    </Badge>
                    {post.keywords && post.keywords.split(',').slice(0, 3).map((keyword: string) => (
                      <Badge 
                        key={keyword.trim()} 
                        variant="outline" 
                        className="bg-white text-[#0f172a]/70 hover:bg-[#0f172a] hover:text-white transition-colors cursor-pointer rounded-sm px-3 py-1.5 text-xs font-semibold border-[#0f172a]/10"
                      >
                        {keyword.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Mobile Share Row */}
                <div className="lg:hidden mt-8 pt-6 border-t border-[#0f172a]/8">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0f172a]/40 mb-4">Bagikan Artikel</p>
                  <ShareButtons title={post.title} slug={resolvedParams.slug} layout="horizontal" />
                </div>
              </div>

              {/* ── Back to Posts Link ── */}
              <div className="mt-8">
                <Link 
                  href="/post" 
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#0f172a]/60 hover:text-[#c20000] transition-colors duration-200 group/back"
                >
                  <ArrowLeft className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" />
                  Kembali ke semua post
                </Link>
              </div>

            </div>

            {/* ─────────────────────────── RIGHT: Sticky Sidebar ─────────────────────────── */}
            <aside className="w-full lg:w-[32%]" aria-label="Sidebar">
              <div className="sticky top-28 space-y-6">
                
                {/* ── Trending / Baca Juga ── */}
                {recentPosts.length > 0 && (
                  <div className="bg-white rounded-md border border-[#0f172a]/8 overflow-hidden">
                    <div className="bg-slate-50/80 px-5 py-4 border-b border-[#0f172a]/6 flex items-center gap-2.5">
                      <TrendingUp className="w-4 h-4 text-[#c20000]" />
                      <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#0f172a]">
                        Baca Juga
                      </h3>
                    </div>
                    <div className="divide-y divide-[#0f172a]/5">
                      {recentPosts.map((rPost: any, idx: number) => {
                        const rImageUrl = rPost.featured_image
                          ? (rPost.featured_image.startsWith('http') ? rPost.featured_image : `/storage/${rPost.featured_image.replace(/^\/?storage\//, '')}`)
                          : null;

                        return (
                          <Link 
                            href={`/post/${rPost.slug}`} 
                            key={rPost.id} 
                            className="group flex gap-3.5 p-4 hover:bg-slate-50/60 transition-colors duration-200"
                          >
                            {/* Thumbnail */}
                            <div className="w-24 aspect-[16/9] rounded overflow-hidden bg-slate-100 border border-[#0f172a]/5 shrink-0">
                              {rImageUrl ? (
                                <img 
                                  src={rImageUrl} 
                                  alt={rPost.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-2xl font-extrabold text-[#0f172a]/8">
                                    0{idx + 1}
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Title + Date */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h4 
                                className="text-[13px] font-bold text-[#0f172a]/80 group-hover:text-[#c20000] leading-snug mb-1.5 transition-colors duration-200 line-clamp-2" 
                                style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                              >
                                {rPost.title}
                              </h4>
                              <span className="text-[11px] font-medium text-[#0f172a]/40">
                                {new Date(rPost.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    {/* See all link */}
                    <div className="px-5 py-3.5 border-t border-[#0f172a]/6">
                      <Link 
                        href="/post" 
                        className="text-xs font-bold text-[#c20000] hover:text-[#a30000] transition-colors flex items-center gap-1.5 justify-center"
                      >
                        Lihat semua post
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* ── Share Box (Desktop) ── */}
                <div className="hidden lg:block bg-slate-50/80 rounded-md p-5 border border-[#0f172a]/6">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0f172a]/40 mb-4 text-center">
                    Bagikan Artikel
                  </h3>
                  <ShareButtons title={post.title} slug={resolvedParams.slug} layout="vertical" />
                </div>

              </div>
            </aside>

          </div>
        </article>

      </main>
    </>
  );
}
