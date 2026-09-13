'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowClockwiseIcon, PlayIcon, XIcon } from '@phosphor-icons/react';
import type { Project } from '@/lib/portfolio';

export default function FilmPlayer({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'paused' | 'blocked' | 'error'>('loading');

  useEffect(() => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    if (!dialog || !video) return;
    let disposed = false;
    document.documentElement.classList.add('film-open');
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    video.play().catch(error => {
      if (!disposed && error?.name !== 'AbortError') setStatus(error?.name === 'NotAllowedError' ? 'blocked' : 'error');
    });
    const onVisibility = () => { if (document.hidden) video.pause(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      disposed = true; video.pause(); video.removeAttribute('src'); video.load();
      dialog.close(); document.documentElement.classList.remove('film-open');
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [project.id]);

  async function play(retry = false) {
    const video = videoRef.current;
    if (!video) return;
    setStatus('loading');
    if (retry) { video.src = project.film!; video.load(); }
    try { await video.play(); } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setStatus('error'); }
  }

  return <dialog className="film-dialog" ref={dialogRef} aria-labelledby="film-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="player-shell">
      <div className="player-heading"><div><h2 id="film-title">{project.title}</h2><p>{project.contribution}</p>{project.credits && <p className="player-credit">{project.credits}</p>}</div><button className="player-close" ref={closeRef} aria-label="Close film" onClick={onClose}><XIcon size={25} /></button></div>
      <div className={`player-screen ${project.aspect === 'portrait' ? 'portrait-player' : ''}`}>
        <video ref={videoRef} src={project.film} poster={project.poster} controls playsInline preload="none" aria-label={`${project.title} full film`} onPlaying={() => setStatus('playing')} onWaiting={() => setStatus('loading')} onPause={() => setStatus(current => current === 'error' ? 'error' : 'paused')} onError={() => setStatus('error')} onEnded={() => setStatus('paused')}>
          {project.captions && <track kind="captions" src={project.captions} srcLang="en" label="English" default />}
        </video>
        {status === 'loading' && <div className="player-status" role="status">Loading film<span className="loading-ellipsis">…</span></div>}
        {status === 'blocked' && <button className="player-retry" onClick={() => play()}><PlayIcon size={20} weight="fill" /> Play film</button>}
        {status === 'error' && <div className="player-error" role="alert"><p>The film couldn’t load.</p><button onClick={() => play(true)}><ArrowClockwiseIcon size={18} /> Try again</button></div>}
      </div>
      <div className="player-footer"><span>{project.category}</span><span>Raden Hanifa</span><span className="escape-hint">Esc to close</span></div>
    </div>
  </dialog>;
}
