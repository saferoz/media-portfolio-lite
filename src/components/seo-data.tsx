import { pageStructuredData, type SeoPath } from '@/lib/seo';

export function SeoData({ path }: { path: SeoPath }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify(pageStructuredData(path)).replace(/</g, '\\u003c'),
  }} />;
}
