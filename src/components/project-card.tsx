'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRightIcon, PlayIcon, SpeakerSlashIcon } from '@phosphor-icons/react';
import { categoryLabel, type Project } from '@/lib/portfolio';
import { usePortfolio } from './portfolio-runtime';

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const { activePreview, setPreview, playingFilm, openFilm, reducedMotion, saveData } = usePortfolio();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const active = activePreview === project.id && !playingFilm && !reducedMotion && !saveData;

  function stopPreview() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    videoRef.current?.pause();
    setPreviewReady(false);
    if (activePreview === project.id) setPreview(null);
  }

  function schedulePreview() {
    if (!project.preview || project.placeholder || previewFailed || reducedMotion || saveData || playingFilm || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { timerRef.current = null; setPreview(project.id); }, 150);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    if (active && project.preview) {
      video.src = project.preview;
      video.play().then(() => { if (cancelled) video.pause(); }).catch(() => { if (!cancelled) setPreviewReady(false); });
    } else {
      video.pause(); video.removeAttribute('src'); video.load(); setPreviewReady(false);
    }
    return () => { cancelled = true; video.pause(); video.removeAttribute('src'); video.load(); };
  }, [active, project.preview]);

  useEffect(() => {
    const reset = () => {
      if (document.hidden) {
        if (timerRef.current) clearTimeout(timerRef.current);
        videoRef.current?.pause(); setPreview(null);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (activePreview === project.id) setPreview(null);
      }
    });
    if (cardRef.current) observer.observe(cardRef.current);
    document.addEventListener('visibilitychange', reset);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', reset); if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activePreview, project.id, setPreview]);

  const image = <>
    {!imageFailed && <Image src={project.poster} alt={project.placeholder ? `${project.description} — placeholder image, selection pending` : `${project.title} — ${project.description}`} fill sizes={featured ? '(max-width: 767px) 100vw, 90vw' : '(max-width: 600px) 100vw, (max-width: 1100px) 45vw, 24vw'} onError={() => setImageFailed(true)} />}
    {imageFailed && <span className="image-fallback">{project.title}</span>}
    {!project.placeholder && <video ref={videoRef} className={`card-preview ${active && previewReady ? 'is-ready' : ''}`} muted loop playsInline preload="none" aria-hidden="true" onPlaying={() => setPreviewReady(true)} onError={() => { setPreviewReady(false); setPreviewFailed(true); setPreview(null); }} />}
    <span className="card-shade" />
    {project.placeholder ? <span className="placeholder-label">{project.category === 'Color grading' ? 'Placeholder · grading selection to come' : 'Preview image · film to come'}</span> : <>
      <span className="project-film-label">{project.cardLabel ?? project.description} <span>{project.duration}</span></span>
      <span className="project-play" aria-hidden="true"><PlayIcon size={24} weight="fill" /></span>
      <span className="preview-hint">{active && previewReady ? <><SpeakerSlashIcon size={14} /> Previewing</> : <>Hover to preview <ArrowUpRightIcon size={15} /></>}</span>
    </>}
  </>;

  return <article className={`project-card ${featured ? 'featured-card' : ''} ${project.aspect === 'portrait' ? 'portrait-card' : ''} ${project.placeholder ? 'placeholder-card' : ''}`} ref={cardRef} data-project={project.id} data-reveal="card">
    {project.film && !project.placeholder ? <button className="project-visual" onPointerEnter={schedulePreview} onPointerMove={() => { if (!active && !timerRef.current) schedulePreview(); }} onPointerLeave={stopPreview} onClick={event => { stopPreview(); openFilm(project, event.currentTarget); }} aria-label={`Play ${project.title}`}>
      {image}
    </button> : <div className="project-visual">{image}</div>}
    <div className="project-caption"><div><h3>{project.title}</h3><p>{project.placeholder ? project.description : project.contribution}</p></div>{project.contribution !== categoryLabel(project.category) && <span className="project-category">{project.category === 'AI filmmaking' ? 'AI film' : categoryLabel(project.category)}</span>}</div>
    {project.projectHref && <Link className="project-detail-link" href={project.projectHref}>View project <ArrowUpRightIcon size={16} /></Link>}
  </article>;
}
