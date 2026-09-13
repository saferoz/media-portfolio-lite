'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDownRightIcon, ArrowUpRightIcon, PauseIcon, PlayIcon } from '@phosphor-icons/react';
import { useScroll, useTransform, motion } from 'motion/react';
import { getProject, heroShotIds } from '@/lib/portfolio';
import { usePortfolio } from './portfolio-runtime';

export function Hero() {
  const container = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { activePreview, playingFilm, openFilm, reducedMotion, saveData } = usePortfolio();
  const [inView, setInView] = useState(true);
  const [visibleTab, setVisibleTab] = useState(true);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [source, setSource] = useState<string>();
  const [shot, setShot] = useState(0);
  const currentProject = getProject(heroShotIds[ready && !reducedMotion && !saveData ? shot : 0]);
  const shotCredit = currentProject.category === 'AI filmmaking' ? 'AI concept · Seedance 2.0' : currentProject.id === 'diriyah' ? 'Color grading' : currentProject.id === 'jury-cake' ? 'Planning, cinematography & edit' : 'Direction, cinematography & edit';
  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end start'] });
  const transform = useTransform(scrollYProgress, [0, 1], ['translateY(0%) scale(1.025)', 'translateY(22%) scale(1.085)']);

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65, 1], [1, 1, 0.25]);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(element);
    const onVisibility = () => setVisibleTab(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  useEffect(() => {
    if (reducedMotion || saveData || !inView) return;
    const timer = setTimeout(() => setSource(matchMedia('(max-width: 767px)').matches ? '/media/hero-montage-mobile.mp4' : '/media/hero-montage-desktop.mp4'), 350);
    return () => clearTimeout(timer);
  }, [reducedMotion, saveData, inView]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const allowed = !reducedMotion && !saveData && inView && visibleTab && !paused && !activePreview && !playingFilm;
    let cancelled = false;
    if (allowed && source) video.play().then(() => { if (cancelled) video.pause(); }).catch(() => setReady(false));
    else video.pause();
    return () => { cancelled = true; video.pause(); };
  }, [source, inView, visibleTab, paused, activePreview, playingFilm, reducedMotion, saveData]);

  return (
    <section className="hero" id="top" ref={container} aria-labelledby="hero-heading">
      <span id="nav-sentinel" aria-hidden="true" />
      <motion.div className="hero-media" style={reducedMotion ? undefined : { transform }}>
        <picture><source media="(max-width: 767px)" srcSet="/media/hero-montage-mobile-poster.webp" /><img src="/media/hero-montage-poster.webp" alt="A cinematic product shot from Jury Chocolate, filmed and edited by Raden Hanifa" width="1600" height="900" fetchPriority="high" loading="eager" className="hero-poster" /></picture>
        <video ref={videoRef} src={source} className={`hero-video ${ready && !reducedMotion && !saveData ? 'is-ready' : ''}`} muted loop playsInline preload="none" aria-hidden="true" onTimeUpdate={event => setShot(Math.min(4, Math.floor(event.currentTarget.currentTime / 2)))} onPlaying={() => setReady(true)} onError={() => setReady(false)} />
      </motion.div>
      <div className="hero-shade" />
      <motion.div className="hero-content page-width" style={reducedMotion ? undefined : { y: contentY, opacity: contentOpacity }}>
        <div className="hero-heading-wrap">
          <h1 id="hero-heading"><span>Stories.</span><span>Made to <em>move.</em></span></h1>
          <p className="hero-description">Video editor & multimedia creative.<br />A cinematic eye. From idea to final frame.</p>
          <a className="hero-cta" href="#work">Explore work <ArrowDownRightIcon size={23} /></a>
        </div>
        <button className="hero-feature" onClick={event => openFilm(currentProject, event.currentTarget)} aria-label={`Play ${currentProject.title} film`}>
          <span className="small-play"><PlayIcon weight="fill" size={14} /></span>
          <span><span className="hero-feature-title">{currentProject.title}</span><span className="hero-feature-meta">{shotCredit}</span></span>
          <ArrowUpRightIcon size={19} />
        </button>
      </motion.div>
      <button className="hero-mobile-credit" onClick={event => openFilm(currentProject, event.currentTarget)} aria-label={`Play ${currentProject.title}`}><span>{currentProject.title}</span><span>{shotCredit}</span></button>
      <div className="hero-bottom page-width">
        <p>Editing <span>/</span> Cinematography <span>/</span> AI filmmaking</p>
        {!reducedMotion && !saveData && source && <button className="background-toggle" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Resume background video' : 'Pause background video'}>{paused ? <PlayIcon size={13} weight="fill" /> : <PauseIcon size={13} weight="fill" />}<span>{paused ? 'Resume' : 'Pause'} background</span></button>}
      </div>
    </section>
  );
}
