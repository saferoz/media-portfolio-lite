import type { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/media/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] }];
  },
};

export default config;
