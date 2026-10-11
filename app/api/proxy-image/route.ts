import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Parameter url diperlukan', { status: 400 });
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return new NextResponse('Protokol URL tidak valid', { status: 400 });
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IMMProxy/1.0)',
      },
    });

    if (!response.ok) {
      return new NextResponse(`Gagal mengambil gambar: ${response.statusText}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/webp';
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  } catch (err: any) {
    return new NextResponse(`Proxy error: ${err?.message || 'Unknown error'}`, { status: 500 });
  }
}

