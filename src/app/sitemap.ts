// app/sitemap.ts
import { MetadataRoute } from 'next';

const PROD_URL = 'https://weatherly18.netlify.app';
const DEV_URL = 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NODE_ENV === 'production' ? PROD_URL : DEV_URL;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1,
    },
  ];
}
