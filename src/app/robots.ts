import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/**
 * The public marketing pages are open to crawlers. Everything behind a login
 * — the product itself, the auth screens, the API and the admin area — is
 * disallowed, because none of it is useful in search results and some of it
 * shouldn't be there at all.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin',
        '/dashboard',
        '/audit',
        '/blueprint',
        '/compass',
        '/generator',
        '/story',
        '/journey',
        '/legend',
        '/history',
        '/properties',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
