import { MetadataRoute } from 'next';

const BASE_URL = 'https://immsolo.or.id';
const MAX_PAGES = 5;
const PER_PAGE = 100;

async function fetchAllPages(apiUrl: string, resource: 'blogs' | 'events'): Promise<any[]> {
  const items: any[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const res = await fetch(`${apiUrl}/${resource}?per_page=${PER_PAGE}&page=${page}`, { next: { revalidate: 3600 } });
      if (!res.ok) break;
      const json = await res.json();
      const payload = json.data || {};
      const batch = Array.isArray(payload) ? payload : payload.data || [];
      if (batch.length === 0) break;
      items.push(...batch);
      const lastPage = payload.last_page || 1;
      if (page >= lastPage) break;
    } catch (error) {
      console.error(`Error generating sitemap for ${resource} page ${page}:`, error);
      break;
    }
  }
  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BASE_URL;
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();

  // Base routes (tanpa lastModified palsu agar tidak diabaikan Google)
  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/tentang`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/sejarah`, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${baseUrl}/struktural`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/lembaga`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/post`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/agenda`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/dokumen`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/form`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/links`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/kontak`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${baseUrl}/kebijakan-privasi`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/syarat-ketentuan`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    if (!apiUrl) {
      console.warn('NEXT_PUBLIC_API_URL kosong — sitemap hanya berisi rute statis.');
      return routes;
    }
    const [blogs, events] = await Promise.all([
      fetchAllPages(apiUrl, 'blogs'),
      fetchAllPages(apiUrl, 'events'),
    ]);
    for (const blog of blogs) {
      routes.push({
        url: `${baseUrl}/post/${blog.slug}`,
        lastModified: blog.updated_at ? new Date(blog.updated_at) : undefined,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    for (const event of events) {
      routes.push({
        url: `${baseUrl}/agenda/${event.slug}`,
        lastModified: event.updated_at ? new Date(event.updated_at) : undefined,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // Formulir, tautan, lembaga diambil paralel agar build cepat.
    const [formRes, linksRes, lembagaRes] = await Promise.all([
      fetch(`${apiUrl}/forms`, { next: { revalidate: 3600 } }).catch(() => null),
      fetch(`${apiUrl}/links`, { next: { revalidate: 3600 } }).catch(() => null),
      fetch(`${apiUrl}/lembaga?per_page=100`, { next: { revalidate: 3600 } }).catch(() => null),
    ]);
    if (formRes?.ok) {
      const formJson = await formRes.json();
      const forms = formJson.data || [];
      for (const form of forms) {
        if (!form.slug) continue;
        routes.push({
          url: `${baseUrl}/form/${form.slug}`,
          lastModified: form.updated_at ? new Date(form.updated_at) : undefined,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }

    if (linksRes?.ok) {
      const linksJson = await linksRes.json();
      const pages = linksJson.data || [];
      for (const page of pages) {
        if (!page.slug) continue;
        routes.push({
          url: `${baseUrl}/links/${page.slug}`,
          changeFrequency: 'monthly',
          priority: 0.5,
        });
      }
    }

    // Komisariat & lembaga
    if (lembagaRes?.ok) {
      const lembagaJson = await lembagaRes.json();
      const lembagas = lembagaJson.data || [];
      for (const item of lembagas) {
        if (!item.slug) continue;
        routes.push({
          url: `${baseUrl}/lembaga/${item.slug}`,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
  }

  return routes;
}
