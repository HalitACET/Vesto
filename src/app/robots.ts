import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/u/',
          '/tr/',
          '/en/',
        ],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/recommendations',
          '/notifications',
        ],
      },
    ],
    sitemap: 'https://vesto.app/sitemap.xml',
  };
}
