'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRightIcon, PlayIcon, SpeakerSlashIcon } from '@phosphor-icons/react';
import { categories, projects, type Project, type WorkFilter } from '@/lib/portfolio';
import { usePortfolio } from './portfolio-runtime';
import { GradingComparison } from './grading-comparison';

function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
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
    timerRef.current = setTimeout(() => setPreview(project.id), 150);
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
      <span className="project-film-label">{project.category === 'AI filmmaking' ? project.category : 'F&B commercial'} <span>{project.duration}</span></span>
      <span className="project-play"><PlayIcon size={24} weight="fill" /><span>Play film</span></span>
      <span className="preview-hint">{active && previewReady ? <><SpeakerSlashIcon size={14} /> Previewing</> : <>Hover to preview <ArrowUpRightIcon size={15} /></>}</span>
    </>}
  </>;

  return <article className={`project-card ${featured ? 'featured-card' : ''} ${project.aspect === 'portrait' ? 'portrait-card' : ''} ${project.placeholder ? 'placeholder-card' : ''}`} ref={cardRef} data-project={project.id}>
    {project.film && !project.placeholder ? <button className="project-visual" onPointerEnter={schedulePreview} onPointerLeave={stopPreview} onClick={event => { stopPreview(); openFilm(project, event.currentTarget); }} aria-label={`Play ${project.title}`}>
      {image}
    </button> : <div className="project-visual">{image}</div>}
    <div className="project-caption"><div><h3>{project.title}</h3><p>{project.placeholder ? project.description : project.contribution}</p></div><span className="project-category">{project.category === 'AI filmmaking' ? 'AI film' : project.category}</span></div>
  </article>;
}

export function Work() {
  const [filter, setFilter] = useState<WorkFilter>('All work');
  const { setPreview } = usePortfolio();
  const filtered = filter === 'All work' ? projects : projects.filter(project => project.category === filter);
  const grading = <section className="grading-section" aria-labelledby="grading-heading">
    <div className="grading-heading"><h3 id="grading-heading">Color grading.</h3><p>Aviation, in a different light.</p></div>
    <GradingComparison />
    <Link className="grading-project-link" href="/color-grading">View color grading <ArrowUpRightIcon size={20} /></Link>
  </section>;
  return <section id="work" className="work-section page-width" aria-labelledby="work-heading">
    <div className="section-heading" data-reveal><h2 id="work-heading">Selected <span>work.</span></h2><p>Different formats.<br />The same eye for detail.</p></div>
    <div className="work-toolbar"><div className="work-filters" role="group" aria-label="Filter work by editing category">
      {categories.map(category => <button key={category} aria-pressed={filter === category} onClick={() => { setPreview(null); setFilter(category); }}>{category === 'Films' ? 'Films / YouTube' : category}</button>)}
    </div><span className="work-note">A selection, in progress</span></div>
    <div className={`work-grid ${filter !== 'All work' ? 'is-filtered' : ''}`}>
      {filter === 'All work' ? <>
        {projects.filter(project => project.category === 'AI filmmaking').map(project => <ProjectCard key={project.id} project={project} featured />)}
        <div className="reels-pair">{projects.filter(project => project.category === 'Reels' && !project.placeholder).map(project => <ProjectCard key={project.id} project={project} />)}</div>
        <div className="pending-work">{projects.filter(project => project.placeholder).map(project => <ProjectCard key={project.id} project={project} />)}</div>
        {grading}
      </> : filter === 'Color grading' ? grading : filtered.map(project => <ProjectCard key={project.id} project={project} featured={project.id === 'swiftsoft'} />)}
    </div>
    <p className="work-footnote">More films and breakdowns are on the way.</p>
  </section>;
}
