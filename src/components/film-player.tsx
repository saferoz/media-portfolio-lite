'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowsOutSimpleIcon, ArrowsInSimpleIcon, CaretUpIcon, CaretDownIcon, ArrowClockwiseIcon, PauseIcon, PlayIcon, SpeakerHighIcon, SpeakerSlashIcon, XIcon } from '@phosphor-icons/react';
import { projects, type Project } from '@/lib/portfolio';

export default function FilmPlayer({ project: initialProject, onClose }: { project: Project; onClose: () => void }) {
  const [project, setProject] = useState(initialProject);
  const [expanded, setExpanded] = useState(false);
  const isReel = initialProject.category === 'Reels';
  const reels = projects.filter(item => item.category === 'Reels' && item.film);
  const reelIndex = reels.findIndex(item => item.id === project.id);
  const screenRef = useRef<HTMLDivElement>(null);
  const previousBounds = useRef<DOMRect | null>(null);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const wheel = useRef({ total: 0, last: 0, lockedUntil: 0 });
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'paused' | 'blocked' | 'error'>('loading');

  const immersive = project.immersive === true || expanded;
  const customControls = immersive || isReel;
  const transitionBusy = useRef(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  function revealControls() {
    if (!customControls) return;
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused && !controlsRef.current?.querySelector(':focus-visible')) setControlsVisible(false);
    }, 2400);
  }

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    document.documentElement.classList.add('film-open');
    dialog.showModal();
    const close = closeRef.current;
    const closeOnTouch = (event: TouchEvent) => { event.preventDefault(); onClose(); };
    close?.addEventListener('touchend', closeOnTouch, { passive: false });
    if (initialProject.category !== 'Reels') closeRef.current?.focus({ preventScroll: true });
    else dialog.focus({ preventScroll: true });
    return () => { close?.removeEventListener('touchend', closeOnTouch); dialog.close(); document.documentElement.classList.remove('film-open'); };
  }, [onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let disposed = false;
    setStatus('loading'); setTime(0); setDuration(0); setControlsVisible(false);
    video.src = project.film!;
    video.play().catch(error => {
      if (!disposed && error?.name !== 'AbortError') setStatus(error?.name === 'NotAllowedError' ? 'blocked' : 'error');
    });
    const onVisibility = () => { if (document.hidden) video.pause(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      disposed = true; video.pause(); video.removeAttribute('src'); video.load();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [project.id, project.film]);

  useLayoutEffect(() => {
    const before = previousBounds.current;
    const screen = screenRef.current;
    previousBounds.current = null;
    if (!before || !screen || reduce()) return;
    const after = screen.getBoundingClientRect();
    screen.animate([
      { transformOrigin: 'top left', transform: `translate(${before.x - after.x}px, ${before.y - after.y}px) scale(${before.width / after.width}, ${before.height / after.height})` },
      { transformOrigin: 'top left', transform: 'none' },
    ], { duration: 260, easing: 'cubic-bezier(.23,1,.32,1)' });
  }, [expanded]);

  function toggleExpanded(animate: boolean) {
    previousBounds.current = animate ? screenRef.current?.getBoundingClientRect() ?? null : null;
    setExpanded(value => !value);
    setControlsVisible(true);
  }

  function nextReel(direction: number, animate = true) {
    const next = reels[reelIndex + direction];
    if (!expanded || !next) return;
    if (transitionBusy.current) return;
    const screen = screenRef.current;
    const video = videoRef.current;
    if (!screen || !video) return;
    setControlsVisible(false);
    if (!animate || reduce()) { video.pause(); setProject(next); return; }
    // Keep only a still of the outgoing frame: no second streaming video.
    const snapshot = document.createElement('canvas');
    snapshot.width = video.videoWidth || 540; snapshot.height = video.videoHeight || 960;
    try { snapshot.getContext('2d')?.drawImage(video, 0, 0, snapshot.width, snapshot.height); } catch { /* Poster remains underneath if no decoded frame is available. */ }
    snapshot.className = 'reel-outgoing';
    screen.parentElement?.append(snapshot);
    video.pause(); setProject(next);
    transitionBusy.current = true;
    const options = { duration: 280, easing: 'cubic-bezier(.23,1,.32,1)' };
    const outgoing = snapshot.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-direction * 100}%)` }], options);
    screen.getAnimations().forEach(a => a.cancel());
    const incoming = screen.animate([{ transform: `translateY(${direction * 100}%)` }, { transform: 'translateY(0)' }], options);
    void Promise.allSettled([outgoing.finished, incoming.finished]).then(() => { snapshot.remove(); transitionBusy.current = false; });
  }

  function onWheel(event: React.WheelEvent) {
    if (!expanded || (event.target as HTMLElement).closest('button, input')) return;
    const now = performance.now();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (Math.abs(delta) < Math.abs(event.deltaX) || now < wheel.current.lockedUntil) return;
    if (now - wheel.current.last > 180 || Math.sign(delta) !== Math.sign(wheel.current.total)) wheel.current.total = 0;
    wheel.current.last = now; wheel.current.total += delta;
    if (Math.abs(wheel.current.total) > 55) {
      nextReel(Math.sign(wheel.current.total));
      wheel.current.total = 0; wheel.current.lockedUntil = now + 650;
    }
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!expanded || !video) return;
    const start = (event: TouchEvent) => { gesture.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; };
    const cancel = () => { gesture.current = null; };
    const end = (event: TouchEvent) => {
      const origin = gesture.current;
      gesture.current = null;
      if (!origin) return;
      // Own touch completion so a swipe never becomes a delayed click on the next Reel.
      event.preventDefault();
      const dx = event.changedTouches[0].clientX - origin.x;
      const dy = event.changedTouches[0].clientY - origin.y;
      if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.3) nextReel(dy < 0 ? 1 : -1);
      else if (Math.hypot(dx, dy) < 12) { if (video.paused) void play(); else video.pause(); }
    };
    video.addEventListener('touchstart', start, { passive: true });
    video.addEventListener('touchend', end, { passive: false });
    video.addEventListener('touchcancel', cancel);
    return () => { video.removeEventListener('touchstart', start); video.removeEventListener('touchend', end); video.removeEventListener('touchcancel', cancel); };
  }, [expanded, project.id]);

  async function play(retry = false) {
    const video = videoRef.current;
    if (!video) return;
    setStatus('loading');
    if (retry) { video.src = project.film!; video.load(); }
    try { await video.play(); } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setStatus('error'); }
  }

  return <dialog className={`film-dialog ${immersive ? 'is-immersive' : ''} ${expanded ? 'is-reel-view' : ''} ${controlsVisible ? 'controls-active' : ''}`} tabIndex={-1} ref={dialogRef} aria-label={immersive ? project.title : undefined} aria-labelledby={immersive ? undefined : 'film-title'} onPointerMove={revealControls} onPointerDown={revealControls} onWheel={onWheel} onKeyDown={event => { revealControls(); if (expanded && !(event.target as HTMLElement).closest('input') && ['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); nextReel(event.key === 'ArrowDown' ? 1 : -1, false); } }} onFocusCapture={event => { if (event.target !== dialogRef.current) revealControls(); }} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="player-shell">
      <div className={immersive ? 'immersive-toolbar' : 'player-heading'}>
        {!immersive && <div><h2 id="film-title">{project.title}</h2><p>{project.contribution}</p>{project.credits && <p className="player-credit">{project.credits}</p>}</div>}
        <div className="player-actions">
          {isReel && <button className="reel-expand" aria-label={expanded ? 'Show reel details' : 'Expand reel'} onClick={event => toggleExpanded(event.detail !== 0)}>{expanded ? <ArrowsInSimpleIcon size={20} /> : <ArrowsOutSimpleIcon size={20} />}<span>{expanded ? 'Details' : 'Reel view'}</span></button>}
          <button className="player-close" ref={closeRef} aria-label="Close film" onClick={onClose}><XIcon size={20} /></button>
        </div>
      </div>
      <div ref={screenRef} className={`player-screen ${project.aspect === 'portrait' ? 'portrait-player' : ''}`}>
        <video ref={videoRef} loop={expanded} poster={project.poster} controls={!customControls} playsInline preload="none" aria-label={`${project.title} full film`} onClick={() => { if (isReel) { revealControls(); if (videoRef.current?.paused) void play(); else videoRef.current?.pause(); } }} onPlaying={() => { setStatus('playing'); }} onTimeUpdate={customControls ? () => setTime(videoRef.current?.currentTime ?? 0) : undefined} onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)} onVolumeChange={() => setMuted(videoRef.current?.muted ?? false)} onWaiting={() => setStatus('loading')} onPause={() => setStatus(current => current === 'error' ? 'error' : 'paused')} onError={() => setStatus('error')} onEnded={() => setStatus('paused')}>
          {project.captions && <track kind="captions" src={project.captions} srcLang="en" label="English" default />}
        </video>
        {status === 'loading' && <div className="player-status" role="status">Loading film<span className="loading-ellipsis">…</span></div>}
        {status === 'blocked' && <button className="player-retry" onClick={() => play()}><PlayIcon size={20} weight="fill" /> Play film</button>}
        {status === 'error' && <div className="player-error" role="alert"><p>The film couldn’t load.</p><button onClick={() => play(true)}><ArrowClockwiseIcon size={18} /> Try again</button></div>}
        {customControls && <div ref={controlsRef} className={`immersive-controls ${controlsVisible || status === 'paused' || status === 'blocked' ? 'is-visible' : ''}`} onBlurCapture={revealControls} role="group" aria-label="Playback controls">
          <button aria-label={status === 'playing' ? 'Pause film' : 'Play film'} onClick={() => { if (videoRef.current?.paused) void play(); else videoRef.current?.pause(); }}>{status === 'playing' ? <PauseIcon size={22} weight="fill" /> : <PlayIcon size={22} weight="fill" />}</button>
          <input aria-label="Seek film" type="range" min="0" max={Number.isFinite(duration) ? duration : 0} step="0.1" value={time} aria-valuetext={`${Math.floor(time)} of ${Math.floor(duration)} seconds`} onChange={event => { if (videoRef.current) videoRef.current.currentTime = Number(event.target.value); setTime(Number(event.target.value)); }} />
          <span className="playback-time">{Math.floor(time)} / {Math.floor(duration)}s</span>
          <button aria-label={muted ? 'Unmute film' : 'Mute film'} onClick={() => { if (videoRef.current) videoRef.current.muted = !videoRef.current.muted; }}>{muted ? <SpeakerSlashIcon size={22} /> : <SpeakerHighIcon size={22} />}</button>
        </div>}
      </div>
      {expanded && <><div className="reel-context" aria-live="polite"><span>{reelIndex + 1} / {reels.length}</span><p>{project.title}</p></div><div className="reel-navigation" role="group" aria-label="Browse reels"><button aria-label="Previous reel" disabled={reelIndex <= 0} onClick={event => nextReel(-1, event.detail !== 0)}><CaretUpIcon size={24} /></button><button aria-label="Next reel" disabled={reelIndex === reels.length - 1} onClick={event => nextReel(1, event.detail !== 0)}><CaretDownIcon size={24} /></button></div></>}
      {!immersive && <div className="player-footer"><span>{project.category}</span><span>Raden Hanifa</span><span className="escape-hint">Esc to close</span></div>}
    </div>
  </dialog>;
}
