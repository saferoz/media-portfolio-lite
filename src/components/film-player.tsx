'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowClockwiseIcon, PauseIcon, PlayIcon, SpeakerHighIcon, SpeakerSlashIcon, XIcon } from '@phosphor-icons/react';
import type { Project } from '@/lib/portfolio';

export default function FilmPlayer({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'paused' | 'blocked' | 'error'>('loading');

  const immersive = project.immersive === true;
  const controlsRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  function revealControls() {
    if (!immersive) return;
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused && !controlsRef.current?.querySelector(':focus-visible')) setControlsVisible(false);
    }, 2400);
  }

  useEffect(() => () => clearTimeout(hideTimer.current), []);

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

  return <dialog className={`film-dialog ${immersive ? 'is-immersive' : ''}`} ref={dialogRef} aria-label={immersive ? project.title : undefined} aria-labelledby={immersive ? undefined : 'film-title'} onPointerMove={revealControls} onPointerDown={revealControls} onKeyDown={revealControls} onFocusCapture={revealControls} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="player-shell">
      {immersive ? <button className="player-close immersive-close" ref={closeRef} aria-label="Close film" onClick={onClose}><XIcon size={25} /></button> : <div className="player-heading"><div><h2 id="film-title">{project.title}</h2><p>{project.contribution}</p>{project.credits && <p className="player-credit">{project.credits}</p>}</div><button className="player-close" ref={closeRef} aria-label="Close film" onClick={onClose}><XIcon size={25} /></button></div>}
      <div className={`player-screen ${project.aspect === 'portrait' ? 'portrait-player' : ''}`}>
        <video ref={videoRef} src={project.film} poster={project.poster} controls={!immersive} playsInline preload="none" aria-label={`${project.title} full film`} onPlaying={() => { setStatus('playing'); revealControls(); }} onTimeUpdate={immersive ? () => setTime(videoRef.current?.currentTime ?? 0) : undefined} onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)} onVolumeChange={() => setMuted(videoRef.current?.muted ?? false)} onWaiting={() => setStatus('loading')} onPause={() => setStatus(current => current === 'error' ? 'error' : 'paused')} onError={() => setStatus('error')} onEnded={() => setStatus('paused')}>
          {project.captions && <track kind="captions" src={project.captions} srcLang="en" label="English" default />}
        </video>
        {status === 'loading' && <div className="player-status" role="status">Loading film<span className="loading-ellipsis">…</span></div>}
        {status === 'blocked' && <button className="player-retry" onClick={() => play()}><PlayIcon size={20} weight="fill" /> Play film</button>}
        {status === 'error' && <div className="player-error" role="alert"><p>The film couldn’t load.</p><button onClick={() => play(true)}><ArrowClockwiseIcon size={18} /> Try again</button></div>}
        {immersive && <div ref={controlsRef} className={`immersive-controls ${controlsVisible || status !== 'playing' ? 'is-visible' : ''}`} onBlurCapture={revealControls} role="group" aria-label="Playback controls">
          <button aria-label={status === 'playing' ? 'Pause film' : 'Play film'} onClick={() => { if (videoRef.current?.paused) void play(); else videoRef.current?.pause(); }}>{status === 'playing' ? <PauseIcon size={22} weight="fill" /> : <PlayIcon size={22} weight="fill" />}</button>
          <input aria-label="Seek film" type="range" min="0" max={Number.isFinite(duration) ? duration : 0} step="0.1" value={time} aria-valuetext={`${Math.floor(time)} of ${Math.floor(duration)} seconds`} onChange={event => { if (videoRef.current) videoRef.current.currentTime = Number(event.target.value); setTime(Number(event.target.value)); }} />
          <span className="playback-time">{Math.floor(time)} / {Math.floor(duration)}s</span>
          <button aria-label={muted ? 'Unmute film' : 'Mute film'} onClick={() => { if (videoRef.current) videoRef.current.muted = !videoRef.current.muted; }}>{muted ? <SpeakerSlashIcon size={22} /> : <SpeakerHighIcon size={22} />}</button>
        </div>}
      </div>
      {!immersive && <div className="player-footer"><span>{project.category}</span><span>Raden Hanifa</span><span className="escape-hint">Esc to close</span></div>}
    </div>
  </dialog>;
}
