'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dictionary } from '../i18n/dictionaries';

const formatTime = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;

export default function MusicPlayer({ text }: { text: Dictionary['music'] }) {
  const audio = useRef<HTMLAudioElement>(null);
  const closing = useRef(false);
  const playButton = useRef<HTMLButtonElement>(null);
  const [intro, setIntro] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [seconds, setSeconds] = useState(5);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(.35);
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState<'blocked' | 'error' | null>(null);

  useEffect(() => {
    const element = audio.current;
    // Metadata may finish loading before React attaches media event handlers.
    if (element && Number.isFinite(element.duration)) setDuration(element.duration);
  }, []);

  const play = useCallback(() => {
    const element = audio.current;
    if (!element) return;
    setStatus(null);
    if (element.error) element.load();
    // Gesture calls play immediately; timer calls let the browser decide autoplay.
    void element.play().catch(error => {
      setStatus(error?.name === 'NotAllowedError' ? 'blocked' : 'error');
    });
  }, []);

  const dismiss = useCallback((withMusic: boolean) => {
    if (closing.current) return;
    closing.current = true;
    if (withMusic) play();
    setLeaving(true);
  }, [play]);

  useEffect(() => {
    const interval = window.setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000);
    const timeout = window.setTimeout(() => dismiss(true), 5000);
    return () => { window.clearInterval(interval); window.clearTimeout(timeout); };
  }, [dismiss]);

  useEffect(() => {
    if (status !== 'blocked') return;
    // A rejected timer attempt must be retried inside a real user gesture.
    // No synthetic clicks or muted autoplay tricks can grant sound permission.
    const retryOnPointer = (event: PointerEvent) => {
      // Let the play button's click handler own its gesture to avoid toggling twice.
      if (event.target instanceof Element && event.target.closest('.music-toggle')) return;
      play();
    };
    const retryOnKey = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest('button, a, input, select, textarea')) return;
      if (event.code === 'Space' || event.key === 'Enter') {
        event.preventDefault();
        play();
      }
    };
    window.addEventListener('pointerdown', retryOnPointer, { once: true });
    window.addEventListener('keydown', retryOnKey);
    return () => {
      window.removeEventListener('pointerdown', retryOnPointer);
      window.removeEventListener('keydown', retryOnKey);
    };
  }, [status, play]);

  useEffect(() => {
    if (!intro) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); dismiss(false); }
      else if ((event.code === 'Space' || event.key === 'Enter') && event.target === document.body) {
        event.preventDefault(); dismiss(true);
      }
    };
    window.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', keydown); };
  }, [intro, dismiss]);

  useEffect(() => {
    if (!leaving) return;
    const timeout = window.setTimeout(() => {
      setIntro(false);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [leaving]);

  useEffect(() => {
    if (!intro && closing.current) playButton.current?.focus({ preventScroll: true });
  }, [intro]);

  useEffect(() => {
    if (audio.current) { audio.current.volume = volume; audio.current.muted = muted; }
  }, [volume, muted]);

  return <>
    <audio ref={audio} src="/audio/worry-instrumental-ultra-slowed.mp3" preload="metadata" loop
      onPlay={() => { setPlaying(true); setStatus(null); }} onPause={() => setPlaying(false)}
      onTimeUpdate={event => setPosition(event.currentTarget.currentTime)}
      onLoadedMetadata={event => { const value = event.currentTarget.duration; setDuration(Number.isFinite(value) ? value : 0); }}
      onDurationChange={event => { const value = event.currentTarget.duration; setDuration(Number.isFinite(value) ? value : 0); }}
      onError={() => { setPlaying(false); setStatus('error'); }} />

    <aside className={`music-player ${expanded ? 'is-expanded' : ''}`} aria-label={text.label} inert={intro}>
      <div className="music-summary">
        <button ref={playButton} className="music-toggle" aria-label={playing ? text.pause : text.play}
          onClick={() => playing ? audio.current?.pause() : play()}><span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span></button>
        <div className="music-track"><strong>{text.track}</strong><span>{text.artist}</span></div>
        <div className={`music-bars ${playing ? 'is-playing' : ''}`} aria-hidden="true"><i/><i/><i/><i/></div>
        <button className="music-resize" aria-expanded={expanded} aria-controls="music-details" aria-label={expanded ? text.collapse : text.expand}
          onClick={() => setExpanded(!expanded)}>{expanded ? '−' : '+'}</button>
      </div>
      <div id="music-details" hidden={!expanded}>
        <label className="music-progress"><span className="sr-only">{text.seek}</span><input type="range" min="0" max={duration || 1} step=".1" value={Math.min(position, duration || 1)} disabled={!duration}
          onChange={event => { const value = Number(event.target.value); if (audio.current) audio.current.currentTime = value; setPosition(value); }}/></label>
        <div className="music-times"><span>{formatTime(position)}</span><span>{formatTime(duration)}</span></div>
        <div className="music-volume"><button aria-label={muted ? text.unmute : text.mute} aria-pressed={muted} onClick={() => setMuted(!muted)}>{muted ? '○' : '◉'}</button>
          <label><span className="sr-only">{text.volume}</span><input type="range" min="0" max="1" step=".01" value={muted ? 0 : volume} onChange={event => { setVolume(Number(event.target.value)); setMuted(false); }}/></label><span>{Math.round((muted ? 0 : volume) * 100)}%</span></div>
      </div>
      {status && <p className="music-status" role="status">{text[status]}</p>}
    </aside>

    {intro && <div className={`music-intro ${leaving ? 'is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label={text.introLabel}>
      <button className="music-enter" autoFocus disabled={leaving} onClick={() => dismiss(true)} onKeyDown={event => { if (event.key === 'Tab' && event.shiftKey) { event.preventDefault(); document.querySelector<HTMLButtonElement>('.intro-silent')?.focus(); } }}>
        <span className="intro-orbit" aria-hidden="true">♫</span>
        <span className="eyebrow">{text.eyebrow}</span>
        <span className="intro-title">{text.title}</span>
        <span className="intro-action">{text.enter}<span aria-hidden="true"> ↗</span></span>
        <span className="intro-hint">{text.hint}</span>
        <span className="intro-countdown">{text.remaining.replace('{seconds}', String(seconds))}</span>
      </button>
      <button className="intro-silent" disabled={leaving} onClick={() => dismiss(false)} onKeyDown={event => { if (event.key === 'Tab' && !event.shiftKey) { event.preventDefault(); document.querySelector<HTMLButtonElement>('.music-enter')?.focus(); } }}>{text.silent}</button>
    </div>}
  </>;
}
