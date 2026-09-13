'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, ArrowsOutSimpleIcon, XIcon } from '@phosphor-icons/react';
import { usePortfolio } from './portfolio-runtime';


export type GalleryStill = { src: string; title: string; description: string };
const defaultStills: GalleryStill[] = [
  { src: '/media/grading-night.webp', title: 'Twilight on the apron', description: 'Three final-graded frames, from preflight to the cockpit.' },
  { src: '/media/grading-process.webp', title: 'From log to the final look', description: '8-bit log, Rec.709 and the final grade, as supplied in the original breakdown.' },
  { src: '/media/grading-day.webp', title: 'Above the clouds', description: 'Warm highlights, skin tones and the color of open sky.' },
  { src: '/media/grading-flight.webp', title: 'A look that holds together', description: 'A second sequence of daylight frames from the film.' },
];

export function GradingGallery({ items = defaultStills, label = 'Color grading stills', compact = false }: { items?: GalleryStill[]; label?: string; compact?: boolean }) {
  const stills = items;
  const galleryId = useId();
  const { reducedMotion } = usePortfolio();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [enlarged, setEnlarged] = useState<number | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  function goTo(index: number, instant = false) {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (!track || !slide) return;
    track.scrollTo({ left: slide.offsetLeft, behavior: reducedMotion || instant ? 'instant' : 'smooth' });
  }

  function syncActive() {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;
      let closest = 0;
      Array.from(track.children).forEach((slide, index) => {
        if (Math.abs((slide as HTMLElement).offsetLeft - track.scrollLeft) < Math.abs((track.children[closest] as HTMLElement).offsetLeft - track.scrollLeft)) closest = index;
      });
      setActive(closest);
    });
  }

  return <div className={`stills-carousel ${compact ? 'bts-carousel' : ''}`} role="region" aria-roledescription="carousel" aria-label={label}>
    <div className="stills-track" id={galleryId} ref={trackRef} onScroll={syncActive} data-lenis-prevent-wheel>
      {stills.map((still, index) => <div className="still-slide" key={still.src} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${stills.length}: ${still.title}`}>
        <button className="still-enlarge" tabIndex={index === active ? 0 : -1} aria-label={`Enlarge ${still.title}`} onClick={event => { openerRef.current = event.currentTarget; setEnlarged(index); }}>
          <Image src={still.src} alt={still.description} fill sizes="(max-width: 767px) 100vw, 65vw" />
          <span><ArrowsOutSimpleIcon size={18} /> Enlarge still</span>
        </button>
      </div>)}
    </div>
    <div className="gallery-caption">
      <div aria-live="polite" aria-atomic="true"><p className="gallery-title">{stills[active].title}</p><p className="gallery-description">{stills[active].description}</p></div>
      {stills.length > 1 && <div className="gallery-controls"><span className="gallery-count">{active + 1} / {stills.length}</span><button aria-label="Previous still" aria-controls={galleryId} disabled={active === 0} onClick={event => goTo(active - 1, event.detail === 0)}><ArrowLeftIcon size={20} /></button><button aria-label="Next still" aria-controls={galleryId} disabled={active === stills.length - 1} onClick={event => goTo(active + 1, event.detail === 0)}><ArrowRightIcon size={20} /></button></div>}
    </div>
    {stills.length > 1 && <div className="gallery-thumbnails" role="group" aria-label="Choose a still">
      {stills.map((still, index) => <button key={still.src} aria-label={`Show ${still.title}`} aria-pressed={active === index} onClick={event => goTo(index, event.detail === 0)}><Image src={still.src} alt="" fill sizes="120px" /><span>{index + 1}</span></button>)}
    </div>}
    {enlarged !== null && <StillLightbox still={stills[enlarged]} onClose={() => { setEnlarged(null); requestAnimationFrame(() => openerRef.current?.focus({ preventScroll: true })); }} />}
  </div>;
}

function StillLightbox({ still, onClose }: { still: GalleryStill; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    document.documentElement.classList.add('film-open');
    dialog?.showModal();
    return () => { dialog?.close(); document.documentElement.classList.remove('film-open'); };
  }, []);
  return <dialog className="still-dialog" ref={ref} aria-label={still.title} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="still-dialog-heading"><p>{still.title}</p><button autoFocus aria-label="Close enlarged still" onClick={onClose}><XIcon size={24} /></button></div>
    <div className="still-dialog-image"><Image src={still.src} alt={still.description} fill sizes="100vw" /></div>
  </dialog>;
}
