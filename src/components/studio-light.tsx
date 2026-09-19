'use client';

import { useRef, useSyncExternalStore } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { usePortfolio } from './portfolio-runtime';

const desktopQuery = '(min-width: 768px) and (hover: hover) and (pointer: fine)';
function subscribeDesktop(callback: () => void) {
  const query = matchMedia(desktopQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function MovingLight() {
  const target = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target, offset: ['start end', 'end start'] });
  const transform = useTransform(scrollYProgress, [0, 1], ['translateY(-12px)', 'translateY(12px)']);
  return <motion.span ref={target} className="studio-light-wash" style={{ transform }} />;
}

export function StudioLight({ side = 'left', quiet = false }: { side?: 'left' | 'right'; quiet?: boolean }) {
  const { reducedMotion, saveData } = usePortfolio();
  const desktop = useSyncExternalStore(subscribeDesktop, () => matchMedia(desktopQuery).matches, () => false);
  return <div className={`studio-light studio-light-${side}${quiet ? ' studio-light-quiet' : ''}`} aria-hidden="true">
    {desktop && !reducedMotion && !saveData ? <MovingLight /> : <span className="studio-light-wash" />}
  </div>;
}
