import { redirect, notFound } from 'next/navigation';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return {
    title: `Redirecting...`,
    robots: {
      index: false,
      follow: false,
    }
  };
}

export default async function ShortlinkRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let targetUrl = null;
  let isPending = false;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/s/${slug}`, {
      cache: 'no-store'
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.target_url) {
        targetUrl = json.data.target_url;
      }
    } else if (res.status === 403) {
      const json = await res.json();
      if (json.is_pending) {
        isPending = true;
      }
    }
  } catch (error) {
    console.error('Error fetching shortlink:', error);
  }

  // Next.js redirect() throws an error internally, so it MUST be outside try-catch
  if (isPending) {
    redirect(`/shortlink/pending?slug=${slug}`);
  } else if (targetUrl) {
    redirect(targetUrl);
  } else {
    // Jika tidak ditemukan atau error, arahkan ke 404
    notFound();
  }
}
