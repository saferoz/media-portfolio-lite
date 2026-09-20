'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import type Lenis from 'lenis';
import type { Project } from '@/lib/portfolio';

const FilmPlayer = dynamic(() => import('./film-player'), { ssr: false });

type Runtime = {
  activePreview: string | null;
  setPreview: (id: string | null) => void;
  playingFilm: boolean;
  settleScroll: () => void;
  openFilm: (project: Project, trigger: HTMLElement) => void;
  reducedMotion: boolean;
  saveData: boolean;
};
const RuntimeContext = createContext<Runtime | null>(null);

const reducedQuery = '(prefers-reduced-motion: reduce)';
function subscribeReduced(callback: () => void) {
  const query = matchMedia(reducedQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

export function PortfolioRuntime({ children }: { children: React.ReactNode }) {
  const reducedMotion = useSyncExternalStore(subscribeReduced, () => matchMedia(reducedQuery).matches, () => true);
  const [saveData, setSaveData] = useState(true);
  const [activePreview, setPreview] = useState<string | null>(null);
  const [film, setFilm] = useState<Project | null>(null);
  const scrollRef = useRef<Lenis | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean; effectiveType?: string } }).connection;
    const update = () => setSaveData(Boolean(connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')));
    update();
    connection?.addEventListener('change', update);
    return () => connection?.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let disposed = false;
    let destroy: (() => void) | undefined;
    if (matchMedia('(pointer: fine)').matches) {
      import('lenis').then(({ default: Lenis }) => {
        if (disposed) return;
        const scroll = new Lenis({ autoRaf: true, lerp: 0.085, smoothWheel: true, syncTouch: false, anchors: true, prevent: node => node.closest('[role="dialog"]') !== null });
        scrollRef.current = scroll;
        // Direct browser input takes ownership from pending wheel interpolation.
        const interrupt = () => {
          if (!scroll.isStopped) scroll.scrollTo(window.scrollY, { immediate: true });
        };
        const onPointer = (event: PointerEvent) => { if (event.button === 0) interrupt(); };
        const onKey = (event: KeyboardEvent) => {
          if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable], [role="dialog"]')) return;
          if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) interrupt();
        };
        window.addEventListener('pointerdown', onPointer, true);
        window.addEventListener('keydown', onKey, true);
        const onModal = () => document.documentElement.classList.contains('film-open') ? scroll.stop() : scroll.start();
        const observer = new MutationObserver(onModal);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        onModal();
        destroy = () => {
          window.removeEventListener('pointerdown', onPointer, true);
          window.removeEventListener('keydown', onKey, true);
          observer.disconnect(); scroll.destroy(); scrollRef.current = null;
        };
      });
    }
    return () => { disposed = true; destroy?.(); };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const animations = new Map<HTMLElement, Animation[]>();
    const cancellations: Array<() => void> = [];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        observer.unobserve(element);
        const group = animations.get(element);
        // Fast jumps and keyboard navigation should land on readable content.
        if (entry.boundingClientRect.top < 0 || element.matches(':hover, :focus-within')) group?.forEach(animation => animation.cancel());
        else group?.forEach(animation => animation.play());
      }
    }, { threshold: .1 });
    targets.forEach(element => {
      if (element.getBoundingClientRect().top < innerHeight) return;
      const kind = element.dataset.reveal;
      const visual = kind === 'card' || kind === 'image' || kind === 'portrait';
      const targets = kind === 'lines' ? Array.from(element.querySelectorAll<HTMLElement>('.reveal-line > span'))
        : [visual ? element.querySelector<HTMLElement>('.project-visual > img, :scope > img') : kind === 'signature' ? element.querySelector<HTMLElement>('.wordmark') : element];
      // Prepare the first frame offscreen; no visible-then-hidden stagger flash.
      // Image motion stays inside its frame, away from captions and hit targets.
      const group = targets.filter((target): target is HTMLElement => !!target).map((target, index) => {
        const frames = kind === 'lines' || kind === 'signature'
          ? [{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }]
          : kind === 'portrait'
            ? [{ transform: 'scale(1.08)', clipPath: 'inset(8% 0 8% 0)' }, { transform: 'scale(1)', clipPath: 'inset(0% 0 0% 0)' }]
            : visual ? [{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }]
            : [{ opacity: .3, transform: `translateY(${matchMedia('(max-width: 767px)').matches ? 16 : 28}px)` }, { opacity: 1, transform: 'translateY(0)' }];
        const animation = target.animate(frames, { duration: visual || kind === 'signature' ? 850 : 600, delay: kind === 'lines' ? index * 80 : 0, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' });
        animation.pause();
        return animation;
      });
      animations.set(element, group);
      const stop = () => { observer.unobserve(element); group.forEach(animation => animation.cancel()); };
      element.addEventListener('pointerenter', stop, { once: true });
      element.addEventListener('focusin', stop, { once: true });
      cancellations.push(() => { element.removeEventListener('pointerenter', stop); element.removeEventListener('focusin', stop); });
      void Promise.allSettled(group.map(animation => animation.finished)).then(() => { group.forEach(animation => animation.cancel()); animations.delete(element); });
      observer.observe(element);
    });
    return () => { observer.disconnect(); animations.forEach(group => group.forEach(animation => animation.cancel())); cancellations.forEach(cancel => cancel()); };

  }, [reducedMotion]);

  const settleScroll = useCallback(() => {
    const top = window.scrollY;
    scrollRef.current?.scrollTo(top, { immediate: true });
    window.scrollTo({ top, behavior: 'instant' });
  }, []);

  const openFilm = useCallback((project: Project, trigger: HTMLElement) => {
    if (!project.film || project.placeholder) return;
    triggerRef.current = trigger;
    setPreview(null);
    // Stop media synchronously before the modal mounts, including an in-flight hover preview.
    document.querySelectorAll('video').forEach(video => video.pause());
    setFilm(project);
  }, []);
  const closeFilm = useCallback(() => {
    setFilm(null);
    requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  }, []);

  const value = useMemo(() => ({ activePreview, setPreview, settleScroll, playingFilm: !!film, openFilm, reducedMotion, saveData }), [activePreview, film, openFilm, reducedMotion, saveData, settleScroll]);
  return <RuntimeContext.Provider value={value}>{children}{film && <FilmPlayer project={film} onClose={closeFilm} />}</RuntimeContext.Provider>;
}

export function usePortfolio() {
  const value = useContext(RuntimeContext);
  if (!value) throw new Error('Portfolio components require PortfolioRuntime');
  return value;
}
