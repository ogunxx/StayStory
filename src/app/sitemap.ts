import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/**
 * The public pages, for search engines.
 *
 * Only pages that exist and are meant to be indexed belong here — the
 * logged-in product, the auth screens and the API routes are deliberately
 * absent. Add a route when its page ships.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/platform`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/method`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${SITE_URL}/pricing`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
  ]
}
