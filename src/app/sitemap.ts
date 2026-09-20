import type { MetadataRoute } from 'next';
import { pageUrl, seoPages, type SeoPath } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return (Object.keys(seoPages) as SeoPath[]).map(path => ({ url: pageUrl(path) }));
}
