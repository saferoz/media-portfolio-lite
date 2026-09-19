'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { usePortfolio } from './portfolio-runtime';

export function PortfolioLink({ onNavigate, href, ...props }: ComponentProps<typeof Link>) {
  const { settleScroll } = usePortfolio();
  const destination = typeof href === 'string' && href.startsWith('/work/') && !href.includes('#') ? `${href}#project-intro` : href;
  return <Link {...props} href={destination} onNavigate={event => { settleScroll(); onNavigate?.(event); }} />;
}
