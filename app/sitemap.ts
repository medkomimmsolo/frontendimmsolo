import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://immsolo.or.id';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sejarah`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/struktural`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/post`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/agenda`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dokumen`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shortlink`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  try {
    // Fetch dynamic blogs
    const blogRes = await fetch(`${apiUrl}/blogs`, { next: { revalidate: 3600 } });
    if (blogRes.ok) {
      const blogJson = await blogRes.json();
      const blogs = blogJson.data?.data || [];
      
      blogs.forEach((blog: any) => {
        routes.push({
          url: `${baseUrl}/post/${blog.slug}`,
          lastModified: new Date(blog.updated_at),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }

    // Fetch dynamic events
    const eventRes = await fetch(`${apiUrl}/events`, { next: { revalidate: 3600 } });
    if (eventRes.ok) {
      const eventJson = await eventRes.json();
      const events = eventJson.data?.data || [];

      events.forEach((event: any) => {
        routes.push({
          url: `${baseUrl}/agenda/${event.slug}`,
          lastModified: new Date(event.updated_at),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
  }

  return routes;
}
