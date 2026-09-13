'use client';

import Image from 'next/image';
import { useId } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { ArrowsLeftRightIcon } from '@phosphor-icons/react';

export function GradingComparison({ priority = false, before = '/media/grading-before.webp', after = '/media/grading-after.webp', subject = 'a preflight check', label = 'Reveal original image' }: { priority?: boolean; before?: string; after?: string; subject?: string; label?: string }) {
  const helpId = useId();
  const position = useMotionValue(50);
  const clipPath = useTransform(position, value => `inset(0 ${100 - value}% 0 0)`);
  const handleLeft = useTransform(position, value => `${value}%`);
  return <>
    <div className="grade-comparison">
      <Image src={after} alt={`Final grade: ${subject}`} fill priority={priority} sizes="(max-width: 767px) 100vw, 90vw" />
      <motion.div className="grade-original" style={{ clipPath }}>
        <Image src={before} alt={`Original image: ${subject}, before color grading`} fill priority={priority} sizes="(max-width: 767px) 100vw, 90vw" />
      </motion.div>
      <span className="comparison-label original-label">Original</span><span className="comparison-label final-label">Final grade</span>
      <motion.span className="comparison-divider" style={{ left: handleLeft }} aria-hidden="true"><span><ArrowsLeftRightIcon size={23} /></span></motion.span>
      <input className="comparison-input" type="range" min="0" max="100" defaultValue="50" aria-label={label} aria-describedby={helpId} onInput={event => { const value = Number(event.currentTarget.value); position.set(value); event.currentTarget.setAttribute('aria-valuetext', `${value}% original image visible`); }} />
    </div>
    <div className="comparison-caption"><p id={helpId}>Drag to compare. Use arrow keys when focused.</p><span>Original image / Final grade</span></div>
  </>;
}
