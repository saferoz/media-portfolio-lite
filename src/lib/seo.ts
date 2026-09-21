import type { Metadata } from 'next';
import { profile } from './portfolio';

// Canonical identity is independent of preview hosts and build environment.
export const siteOrigin = 'https://media.radenhanifa.com';
export const personId = 'https://radenhanifa.com/#person';
export const websiteId = `${siteOrigin}/#website`;
export const portraitUrl = new URL(profile.portrait, siteOrigin).href;
export const portraitImageId = `${portraitUrl}#image`;
export const projectSlugs = ['oxfordsaudia-interviews', 'oxfordsaudia-educational-series'];
export const personDescription = 'Raden Hanifa is a media producer and cinematographer whose portfolio includes commercial reels, aviation interviews and educational videos, color grading and AI filmmaking.';
export const seoPages = {
  '/': {
    title: 'Raden Hanifa — Media Producer & Cinematographer',
    description: 'Explore films and brand content by Raden Hanifa: cinematography, video editing and color grading across aviation interviews, education and commercial projects.',
    image: '/media/raden-hanifa-og-v1.jpg', width: 1731, height: 909,
    alt: 'Raden Hanifa — Ideas in motion. Media, creative and storytelling.',
  },
  '/color-grading': {
    title: 'Color Grading Portfolio — Raden Hanifa',
    description: 'Explore Raden Hanifa’s aviation color grading, including OxfordSaudia interviews and a graduation trailer, with original footage and finished grades.',
    image: '/media/grading-after.webp', width: 1920, height: 1080, alt: 'Aviation footage color graded by Raden Hanifa',
  },
  '/work/oxfordsaudia-interviews': {
    title: 'OxfordSaudia Aviation Interviews — Raden Hanifa',
    description: 'OxfordSaudia student and captain interviews: scripting, direction, cinematography, editing, motion titles and dialogue polishing by Raden Hanifa.',
    image: '/media/students-poster.webp', alt: 'OxfordSaudia student interviews',
  },
  '/work/oxfordsaudia-educational-series': {
    title: 'OxfordSaudia Aviation Educational Videos — Raden Hanifa',
    description: 'Aviation lessons for student pilots, including 5 Hazardous Attitudes. Script, direction, filming, editing and audio finishing by Raden Hanifa.',
    image: '/media/hazardous-v2-poster.webp', alt: 'OxfordSaudia 5 Hazardous Attitudes educational film',
  },
} as const;
export type SeoPath = keyof typeof seoPages;
// Match Next.js's root-URL normalization across sitemap, metadata and JSON-LD.
export const pageUrl = (path: SeoPath) => path === '/' ? siteOrigin : new URL(path, siteOrigin).href;

export function pageMetadata(path: SeoPath): Metadata {
  const page = seoPages[path];
  const image = { url: new URL(page.image, siteOrigin).href, alt: page.alt,
    ...('width' in page ? { width: page.width, height: page.height } : {}) };
  return {
    title: page.title, description: page.description,
    alternates: { canonical: pageUrl(path) },
    openGraph: { title: page.title, description: page.description, url: pageUrl(path),
      siteName: profile.name, locale: 'en_US', type: 'website', images: [image] },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description, images: [image] },
  };
}

export function pageStructuredData(path: SeoPath) {
  const page = seoPages[path];
  const graph: Record<string, unknown>[] = [
    { '@type': 'Person', '@id': personId, name: profile.name, url: 'https://radenhanifa.com/',
      jobTitle: profile.role,
      image: path === '/' ? { '@id': portraitImageId } : portraitUrl,
      sameAs: [profile.linkedin, profile.instagram, profile.cv],
      description: personDescription, knowsAbout: ['Aviation filmmaking', 'Cinematography', 'Video editing', 'Color grading', 'AI filmmaking'] },
    { '@type': 'WebSite', '@id': websiteId, url: pageUrl('/'), name: profile.name,
      inLanguage: 'en', creator: { '@id': personId } },
    { '@type': 'WebPage', '@id': `${pageUrl(path)}#webpage`, url: pageUrl(path), name: page.title,
      description: page.description, inLanguage: 'en', isPartOf: { '@id': websiteId },
      author: { '@id': personId }, about: { '@id': personId },
      ...(path === '/' ? { primaryImageOfPage: { '@id': portraitImageId } } : {}) },
  ];
  if (path === '/') graph.push({
    '@type': 'ImageObject', '@id': portraitImageId, url: portraitUrl, contentUrl: portraitUrl,
    caption: 'Portrait of Raden Hanifa, media producer and cinematographer',
    width: 900, height: 1153, representativeOfPage: true,
  });
  return { '@context': 'https://schema.org', '@graph': graph };
}
