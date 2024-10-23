// app/robots.ts
import { MetadataRoute } from 'next';

const PROD_URL = 'https://weatherly18.netlify.app';
const DEV_URL = 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NODE_ENV === 'production' ? PROD_URL : DEV_URL;

  // In development, we might want to prevent indexing
  if (process.env.NODE_ENV === 'development') {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      sitemap: '', // No sitemap needed in development
    };
  }

  // Production configuration
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
