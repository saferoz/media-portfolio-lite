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

function MovingLight({ cinematic = false }: { cinematic?: boolean }) {
  const target = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target, offset: ['start end', 'end start'] });
  const transform = useTransform(scrollYProgress, [0, 1], cinematic
    ? ['translate(-40px, -12px) rotate(-2deg)', 'translate(40px, 12px) rotate(2deg)']
    : ['translateY(-12px)', 'translateY(12px)']);
  const opacity = useTransform(scrollYProgress, [0, .5, 1], cinematic ? [.45, 1, .55] : [1, 1, 1]);
  return <motion.span ref={target} className="studio-light-wash" style={{ transform, opacity }} />;
}

export function StudioLight({ side = 'left', quiet = false, cinematic = false }: { side?: 'left' | 'right'; quiet?: boolean; cinematic?: boolean }) {
  const { reducedMotion, saveData } = usePortfolio();
  const desktop = useSyncExternalStore(subscribeDesktop, () => matchMedia(desktopQuery).matches, () => false);
  return <div className={`studio-light studio-light-${side}${quiet ? ' studio-light-quiet' : ''}${cinematic ? ' studio-light-cinematic' : ''}`} aria-hidden="true">
    {desktop && !reducedMotion && !saveData ? <MovingLight cinematic={cinematic} /> : <span className="studio-light-wash" />}
  </div>;
}
