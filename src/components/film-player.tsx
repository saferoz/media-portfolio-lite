'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowsOutSimpleIcon, ArrowsInSimpleIcon, CaretUpIcon, CaretDownIcon, ArrowClockwiseIcon, PauseIcon, PlayIcon, SpeakerHighIcon, SpeakerSlashIcon, XIcon } from '@phosphor-icons/react';
import { projects, type Project } from '@/lib/portfolio';
import { allowReelPrefetch, cachedReel, prepareReel, reelSource } from '@/lib/reel-cache';

const reels = projects.filter(item => item.category === 'Reels' && item.film);

function PlaybackTimeline({ videoRef, projectId }: { videoRef: React.RefObject<HTMLVideoElement | null>; projectId: string }) {
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const update = () => { setTime(video.currentTime); setDuration(Number.isFinite(video.duration) ? video.duration : 0); };
    update();
    video.addEventListener('timeupdate', update);
    video.addEventListener('loadedmetadata', update);
    return () => { video.removeEventListener('timeupdate', update); video.removeEventListener('loadedmetadata', update); };
  }, [videoRef, projectId]);
  return <><input aria-label="Seek film" type="range" min="0" max={duration} step="0.1" value={time} aria-valuetext={`${Math.floor(time)} of ${Math.floor(duration)} seconds`} onChange={event => { if (videoRef.current) videoRef.current.currentTime = Number(event.target.value); setTime(Number(event.target.value)); }} /><span className="playback-time">{Math.floor(time)} / {Math.floor(duration)}s</span></>;
}

function ReelPoster({ project, className = '' }: { project: Project; className?: string }) {
  const [failed, setFailed] = useState(false);
  return <div className={`reel-poster ${className}`} data-poster-project={project.id}>
    {failed ? <span>{project.title}</span> : <img src={project.poster} alt="" draggable={false} onError={() => setFailed(true)} />}
  </div>;
}

export default function FilmPlayer({ project: initialProject, onClose }: { project: Project; onClose: () => void }) {
  const [project, setProject] = useState(initialProject);
  const [expanded, setExpanded] = useState(() => initialProject.category === 'Reels' && matchMedia('(max-width: 767px)').matches);
  const isReel = initialProject.category === 'Reels';
  const reelIndex = reels.findIndex(item => item.id === project.id);
  const screenRef = useRef<HTMLDivElement>(null);
  const previousBounds = useRef<DOMRect | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number; time: number; lastY: number; lastTime: number; velocity: number; delta: number } | null>(null);
  const transition = useRef<Animation | null>(null);
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
  const [muted, setMuted] = useState(false);
  const [readyProject, setReadyProject] = useState<string | null>(null);
  const [prepared, setPrepared] = useState<{ id: string; url: string } | null>(null);
  const muteRef = useRef(false);

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
    let objectUrl: string | undefined;
    let frame: number | undefined;
    setStatus('loading'); setControlsVisible(false); setReadyProject(null);
    video.muted = muteRef.current;
    const revealFrame = () => {
      if (disposed) return;
      if (typeof video.requestVideoFrameCallback === 'function') frame = video.requestVideoFrameCallback(() => { if (!disposed) setReadyProject(project.id); });
      else if (video.readyState >= 2) setReadyProject(project.id);
    };
    video.addEventListener('playing', revealFrame);
    void (async () => {
      const blob = isReel ? await cachedReel(project.film!) : undefined;
      if (disposed) return;
      objectUrl = blob ? URL.createObjectURL(blob) : undefined;
      video.src = objectUrl ?? (isReel ? reelSource(project.film!) : project.film!);
      try { await video.play(); }
      catch (error) {
        if (!disposed && error instanceof DOMException && error.name !== 'AbortError') setStatus(error.name === 'NotAllowedError' ? 'blocked' : 'error');
      }
    })();
    const onVisibility = () => { if (document.hidden) video.pause(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      disposed = true; video.removeEventListener('playing', revealFrame);
      if (frame !== undefined) video.cancelVideoFrameCallback(frame);
      video.pause(); video.removeAttribute('src'); video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [project.id, project.film]);

  useEffect(() => {
    const video = videoRef.current;
    const next = reels[reelIndex + 1];
    if (!expanded || !next?.film || !video) return;
    let disposed = false;
    let controller: AbortController | undefined;
    let objectUrl: string | undefined;
    let finished = false;
    const cancel = () => { controller?.abort(); controller = undefined; };
    const prepare = () => {
      if (disposed || finished || controller || video.paused || video.readyState < 3 || !allowReelPrefetch()) return;
      const end = Array.from({ length: video.buffered.length }, (_, index) => index).find(index => video.buffered.start(index) <= video.currentTime && video.buffered.end(index) >= video.currentTime);
      if (end === undefined || video.buffered.end(end) - video.currentTime < Math.min(8, video.duration - video.currentTime) - .2) return;
      const request = new AbortController();
      controller = request;
      void prepareReel(next.film!, request.signal).then(blob => {
        if (disposed || request.signal.aborted) return;
        finished = true;
        if (blob) { objectUrl = URL.createObjectURL(blob); setPrepared({ id: next.id, url: objectUrl }); }
      });
    };
    const visibility = () => { if (document.hidden) cancel(); else prepare(); };
    const connection = (navigator as Navigator & { connection?: EventTarget }).connection;
    const network = () => { if (!allowReelPrefetch()) cancel(); else prepare(); };
    video.addEventListener('timeupdate', prepare); video.addEventListener('progress', prepare); video.addEventListener('playing', prepare);
    video.addEventListener('waiting', cancel);
    document.addEventListener('visibilitychange', visibility); connection?.addEventListener('change', network);
    prepare();
    return () => {
      disposed = true; cancel();
      video.removeEventListener('timeupdate', prepare); video.removeEventListener('progress', prepare); video.removeEventListener('playing', prepare);
      video.removeEventListener('waiting', cancel);
      document.removeEventListener('visibilitychange', visibility); connection?.removeEventListener('change', network);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setPrepared(null);
    };
  }, [expanded, reelIndex]);

  useLayoutEffect(() => {
    transition.current?.cancel();
    transition.current = null;
    transitionBusy.current = false;
    if (trackRef.current) trackRef.current.style.transform = 'none';
    return () => { transition.current?.cancel(); };
  }, [project.id, expanded]);

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
    if (transitionBusy.current && animate) return;
    if (!animate) { transition.current?.cancel(); transitionBusy.current = false; }
    const screen = trackRef.current;
    const video = videoRef.current;
    if (!screen || !video) return;
    setControlsVisible(false);
    if (!animate || reduce()) { video.pause(); setProject(next); return; }
    // Move the actual outgoing panel alongside the destination's own poster.
    video.pause();
    transitionBusy.current = true;
    const current = getComputedStyle(screen).transform;
    transition.current?.cancel();
    const animation = screen.animate([{ transform: current }, { transform: `translateY(${-direction * 100}%)` }], { duration: 280, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' });
    transition.current = animation;
    void animation.finished.then(() => setProject(next), () => { transitionBusy.current = false; });
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
    const track = trackRef.current;
    if (!expanded || !video || !track) return;
    const settle = () => {
      const from = getComputedStyle(track).transform;
      transition.current?.cancel();
      track.style.transform = 'none';
      if (!reduce()) transition.current = track.animate([{ transform: from }, { transform: 'none' }], { duration: 250, easing: 'cubic-bezier(.23,1,.32,1)' });
      transitionBusy.current = false;
    };
    const start = (event: TouchEvent) => {
      if ((event.target as HTMLElement).closest('button, input') || event.touches.length !== 1) { gesture.current = null; settle(); return; }
      const offset = new DOMMatrixReadOnly(getComputedStyle(track).transform).m42;
      transition.current?.cancel(); transitionBusy.current = false;
      track.style.transform = `translateY(${offset}px)`;
      const touch = event.touches[0], now = performance.now();
      gesture.current = { x: touch.clientX, y: touch.clientY - offset, time: now, lastY: touch.clientY, lastTime: now, velocity: 0, delta: offset };
    };
    const move = (event: TouchEvent) => {
      const origin = gesture.current;
      if (!origin) return;
      if (event.touches.length !== 1) { gesture.current = null; settle(); return; }
      const touch = event.touches[0], now = performance.now();
      const dy = touch.clientY - origin.y;
      if (Math.abs(dy) < Math.abs(touch.clientX - origin.x) * 1.3) return;
      event.preventDefault();
      origin.velocity = (touch.clientY - origin.lastY) / Math.max(1, now - origin.lastTime);
      origin.lastY = touch.clientY; origin.lastTime = now; origin.delta = dy;
      const bounded = !reels[reelIndex + (dy < 0 ? 1 : -1)] ? dy * .18 : Math.max(-track.clientHeight, Math.min(track.clientHeight, dy));
      if (!reduce()) track.style.transform = `translateY(${bounded}px)`;
    };
    const cancel = () => { gesture.current = null; settle(); };
    const end = (event: TouchEvent) => {
      const origin = gesture.current;
      gesture.current = null;
      if (!origin) return;
      // Own touch completion so a swipe never becomes a delayed click on the next Reel.
      event.preventDefault();
      const dx = event.changedTouches[0].clientX - origin.x;
      const dy = event.changedTouches[0].clientY - origin.y;
      const velocity = performance.now() - origin.lastTime < 100 ? origin.velocity : 0;
      const direction = dy < 0 ? 1 : -1;
      if (reels[reelIndex + direction] && Math.abs(dy) > Math.abs(dx) * 1.3 && (Math.abs(dy) >= track.clientHeight * .2 || (Math.abs(dy) >= 30 && Math.abs(velocity) > .5))) nextReel(direction);
      else { settle(); if (Math.hypot(dx, dy) < 12) { if (video.paused) void play(); else video.pause(); } }
    };
    track.addEventListener('touchstart', start, { passive: true });
    track.addEventListener('touchmove', move, { passive: false });
    track.addEventListener('touchend', end, { passive: false });
    track.addEventListener('touchcancel', cancel);
    return () => { track.removeEventListener('touchstart', start); track.removeEventListener('touchmove', move); track.removeEventListener('touchend', end); track.removeEventListener('touchcancel', cancel); };
  }, [expanded, project.id]);

  async function play(retry = false) {
    const video = videoRef.current;
    if (!video) return;
    setStatus('loading');
    if (retry) { video.src = isReel ? reelSource(project.film!) : project.film!; video.load(); }
    try { await video.play(); } catch (error) { if (video === videoRef.current && !(error instanceof DOMException && error.name === 'AbortError')) setStatus(error instanceof DOMException && error.name === 'NotAllowedError' ? 'blocked' : 'error'); }
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
      <div className="reel-track" ref={trackRef}>
      {expanded && reels[reelIndex - 1] && <div className="reel-neighbor reel-previous" aria-hidden="true" key={reels[reelIndex - 1].id}><ReelPoster project={reels[reelIndex - 1]} /></div>}
      <div key="active-screen" ref={screenRef} className={`player-screen ${project.aspect === 'portrait' ? 'portrait-player' : ''}`} data-active-project={project.id}>
        <video key={`video-${project.id}`} ref={videoRef} loop={expanded} poster={project.poster} controls={!customControls} playsInline preload="none" aria-label={`${project.title} full film`} onClick={() => { if (isReel) { revealControls(); if (videoRef.current?.paused) void play(); else videoRef.current?.pause(); } }} onPlaying={event => { if (event.currentTarget === videoRef.current) setStatus('playing'); }} onVolumeChange={event => { if (event.currentTarget !== videoRef.current) return; muteRef.current = event.currentTarget.muted; setMuted(muteRef.current); }} onWaiting={event => { if (event.currentTarget === videoRef.current) setStatus('loading'); }} onPause={event => { if (event.currentTarget === videoRef.current) setStatus(current => current === 'error' ? 'error' : 'paused'); }} onError={event => { if (event.currentTarget === videoRef.current) setStatus('error'); }} onEnded={event => { if (event.currentTarget === videoRef.current) setStatus('paused'); }}>
          {project.captions && <track kind="captions" src={project.captions} srcLang="en" label="English" default />}
        </video>
        {isReel && readyProject !== project.id && <ReelPoster key={project.id} project={project} className="active-reel-poster" />}
        {status === 'loading' && <div className="player-status" role="status">Loading film<span className="loading-ellipsis">…</span></div>}
        {status === 'blocked' && <button className="player-retry" onClick={() => play()}><PlayIcon size={20} weight="fill" /> Play film</button>}
        {status === 'error' && <div className="player-error" role="alert"><p>The film couldn’t load.</p><button onClick={() => play(true)}><ArrowClockwiseIcon size={18} /> Try again</button></div>}
        {customControls && <div ref={controlsRef} className={`immersive-controls ${controlsVisible || status === 'paused' || status === 'blocked' ? 'is-visible' : ''}`} onBlurCapture={revealControls} role="group" aria-label="Playback controls">
          <button aria-label={status === 'playing' ? 'Pause film' : 'Play film'} onClick={() => { if (videoRef.current?.paused) void play(); else videoRef.current?.pause(); }}>{status === 'playing' ? <PauseIcon size={22} weight="fill" /> : <PlayIcon size={22} weight="fill" />}</button>
          <PlaybackTimeline videoRef={videoRef} projectId={project.id} />
          <button aria-label={muted ? 'Unmute film' : 'Mute film'} onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            // Persist synchronously: navigation can precede the volumechange event.
            muteRef.current = !video.muted;
            video.muted = muteRef.current;
            setMuted(muteRef.current);
          }}>{muted ? <SpeakerSlashIcon size={22} /> : <SpeakerHighIcon size={22} />}</button>
        </div>}
      </div>
      {expanded && reels[reelIndex + 1] && <div className="reel-neighbor reel-next" aria-hidden="true" key={reels[reelIndex + 1].id}><ReelPoster project={reels[reelIndex + 1]} />{prepared?.id === reels[reelIndex + 1].id && <video className="prepared-reel" src={prepared.url} muted playsInline preload="auto" />}</div>}
      </div>
      {expanded && <><div className="reel-context" aria-live="polite"><span>{reelIndex + 1} / {reels.length}</span><p>{project.title}</p></div><div className="reel-navigation" role="group" aria-label="Browse reels"><button aria-label="Previous reel" disabled={reelIndex <= 0} onClick={event => nextReel(-1, event.detail !== 0)}><CaretUpIcon size={24} /></button><button aria-label="Next reel" disabled={reelIndex === reels.length - 1} onClick={event => nextReel(1, event.detail !== 0)}><CaretDownIcon size={24} /></button></div></>}
      {!immersive && <div className="player-footer"><span>{project.category}</span><span>Raden Hanifa</span><span className="escape-hint">Esc to close</span></div>}
    </div>
  </dialog>;
}
