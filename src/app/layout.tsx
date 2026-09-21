import type { Metadata } from 'next';
import { siteOrigin } from '@/lib/seo';
import { Analytics } from '@vercel/analytics/next';
import '@fontsource-variable/archivo';
import '@fontsource/ibm-plex-mono/400.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: 'Raden Hanifa',
  icons: {
    apple: { url: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    icon: [
      { url: '/brand/rh-tile-v3.png', type: 'image/png', sizes: '192x192' },
    ],
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="describedby" href="/llms.txt" type="text/plain" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
