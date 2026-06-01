import type { MetadataRoute } from 'next';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { adminDb } from '@/lib/firebase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vesto.app';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/tr`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    const usersSnap = await getDocs(query(
      collection(adminDb, 'users'),
      limit(100)
    ));

    const profilePages: MetadataRoute.Sitemap = usersSnap.docs.map(doc => ({
      url: `${baseUrl}/u/${doc.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...profilePages];
  } catch {
    return staticPages;
  }
}
