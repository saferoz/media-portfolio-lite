import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import '@fontsource-variable/archivo';
import '@fontsource/ibm-plex-mono/400.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://media.radenhanifa.com'),
  title: 'Raden Hanifa — Video editor & multimedia creative',
  description: 'Explore Raden Hanifa’s work in filming, cinematography, editing, color grading and AI filmmaking. Watch selected projects or request the full portfolio.',
  openGraph: {
    title: 'Raden Hanifa — Filmmaker & Video Editor',
    description: 'Explore commercial reels, interviews, color grading and AI films by Raden Hanifa. Watch selected work and request the full portfolio.',
    siteName: 'Raden Hanifa',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/media/raden-hanifa-og-v1.jpg', width: 1731, height: 909, type: 'image/jpeg', alt: 'Raden Hanifa — Ideas in motion. Media, creative and storytelling.' }],
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    apple: { url: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    icon: [
      { url: '/brand/rh-light-v2.png', type: 'image/png', sizes: '192x192', media: '(prefers-color-scheme: light)' },
      { url: '/brand/rh-dark-v2.png', type: 'image/png', sizes: '192x192', media: '(prefers-color-scheme: dark)' },
    ],
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
