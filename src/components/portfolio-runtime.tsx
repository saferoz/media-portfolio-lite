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
        const onModal = () => document.documentElement.classList.contains('film-open') ? scroll.stop() : scroll.start();
        const observer = new MutationObserver(onModal);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        onModal();
        destroy = () => { observer.disconnect(); scroll.destroy(); scrollRef.current = null; };
      });
    }
    return () => { disposed = true; destroy?.(); };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const animations = new Map<HTMLElement, Animation>();
    const cancellations: Array<() => void> = [];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        observer.unobserve(element);
        const animation = animations.get(element);
        // Fast jumps and keyboard navigation should land on readable content.
        if (entry.boundingClientRect.top < 0 || element.matches(':hover, :focus-within')) animation?.cancel();
        else animation?.play();
      }
    }, { threshold: .1 });
    targets.forEach(element => {
      if (element.getBoundingClientRect().top < innerHeight) return;
      const visual = element.dataset.reveal === 'card' || element.dataset.reveal === 'image';
      const target = visual ? element.querySelector<HTMLElement>('.project-visual > img, :scope > img') : element;
      if (!target) return;
      // Prepare the first frame offscreen; no visible-then-hidden stagger flash.
      // Image motion stays inside its frame, away from captions and hit targets.
      const animation = target.animate(visual
        ? [{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }]
        : [{ opacity: .3, transform: 'translateY(28px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: visual ? 850 : 600, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' });
      animation.pause();
      animations.set(element, animation);
      const stop = () => { observer.unobserve(element); animation.cancel(); };
      element.addEventListener('pointerenter', stop, { once: true });
      element.addEventListener('focusin', stop, { once: true });
      cancellations.push(() => { element.removeEventListener('pointerenter', stop); element.removeEventListener('focusin', stop); });
      void animation.finished.then(() => animation.cancel(), () => {}).finally(() => animations.delete(element));
      observer.observe(element);
    });
    return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); cancellations.forEach(cancel => cancel()); };

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
