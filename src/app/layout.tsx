import type { Metadata } from 'next';
import '@fontsource-variable/archivo';
import '@fontsource/ibm-plex-mono/400.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Raden Hanifa — Video editor & multimedia creative',
  description: 'Selected films, short-form edits, and AI filmmaking by Raden Hanifa. A cinematic eye, from the first idea to the final frame.',
  openGraph: {
    title: 'Raden Hanifa — Selected work',
    description: 'Video editing, cinematography & AI filmmaking.',
    type: 'website',
    images: [{ url: '/media/swiftsoft-poster.webp', width: 1600, height: 900, alt: 'A frame from SwiftSoft by Raden Hanifa' }],
  },
  twitter: { card: 'summary_large_image' },
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
