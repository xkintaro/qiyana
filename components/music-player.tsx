'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, VolumeX, Volume2, Music2, ArrowUpRight, AudioLines, SkipBack, SkipForward, ListMusic, X, Repeat, Repeat1 } from 'lucide-react';
import { tracks } from '../lib/soundtrack';
import Lyrics from './lyrics';

const formatTime = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
const AUDIO_SETTINGS_KEY = 'qiyana-audio-settings';

export default function MusicPlayer() {
  const audio = useRef<HTMLAudioElement>(null);
  const closing = useRef(false);
  const playButton = useRef<HTMLButtonElement>(null);
  const volumeControl = useRef<HTMLDivElement>(null);
  const playlistControl = useRef<HTMLDivElement>(null);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [activeTrack, setActiveTrack] = useState(0);
  const [repeatOne, setRepeatOne] = useState(false);
  const soundtrack = tracks[activeTrack];
  const scrubbing = useRef(false);
  const seekTarget = useRef(0);
  const resumeAfterSeek = useRef(false);
  const settlingSeek = useRef(false);
  const fadeFrame = useRef<number | null>(null);
  const seekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desiredVolume = useRef(.35);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);
  const [intro, setIntro] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(.35);
  const [muted, setMuted] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [status, setStatus] = useState<'blocked' | 'error' | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (saved) {
        const settings: unknown = JSON.parse(saved);
        if (settings && typeof settings === 'object') {
          const { volume, muted } = settings as { volume?: unknown; muted?: unknown };
          if (typeof volume === 'number' && Number.isFinite(volume) && volume >= 0 && volume <= 1) setVolume(volume);
          if (typeof muted === 'boolean') setMuted(muted);
        }
      }
    } catch { /* Keep the defaults if storage is unavailable or invalid. */ }
    setSettingsLoaded(true);
  }, []);

  useEffect(() => {
    // Wait for restoration before saving so defaults cannot overwrite a saved level.
    if (!settingsLoaded) return;
    try { localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify({ volume, muted })); } catch {}
  }, [volume, muted, settingsLoaded]);

  useEffect(() => {
    if (!volumeOpen && !playlistOpen) return;
    const close = (event: PointerEvent) => {
      if (event.target instanceof Node && !volumeControl.current?.contains(event.target)) setVolumeOpen(false);
      if (event.target instanceof Node && !playlistControl.current?.contains(event.target)) setPlaylistOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [volumeOpen, playlistOpen]);


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
    // Start inside the user gesture, before the exit animation.
    void element.play().catch(error => {
      if (error?.name === 'AbortError') return; // A newer track selection can cancel this request.
      setStatus(error?.name === 'NotAllowedError' ? 'blocked' : 'error');
    });
  }, []);

  const selectTrack = (index: number, startPlaying = !audio.current?.paused) => {
    const element = audio.current;
    if (!element) return;
    if (fadeFrame.current !== null) cancelAnimationFrame(fadeFrame.current);
    if (seekTimer.current) clearTimeout(seekTimer.current);
    fadeFrame.current = null;
    seekTimer.current = null;
    scrubbing.current = false;
    settlingSeek.current = false;
    resumeAfterSeek.current = false;
    const next = (index + tracks.length) % tracks.length;
    element.pause();
    element.volume = desiredVolume.current;
    setActiveTrack(next);
    setPosition(0);
    setSeekPreview(null);
    setDuration(0);
    setStatus(null);
    element.src = tracks[next].src;
    element.load();
    if (startPlaying) play();
  };

  const finishSeek = useCallback(() => {
    const element = audio.current;
    if (!element || scrubbing.current || !settlingSeek.current) return;
    settlingSeek.current = false;
    if (!resumeAfterSeek.current) { element.volume = desiredVolume.current; return; }
    resumeAfterSeek.current = false;
    // Resume only after decoding the chosen position, with a short volume ramp.
    element.volume = 0;
    const started = performance.now();
    const fade = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - started) / 150));
      element.volume = desiredVolume.current * progress;
      fadeFrame.current = progress < 1 ? requestAnimationFrame(fade) : null;
    };
    play();
    fadeFrame.current = requestAnimationFrame(fade);
  }, [play]);

  const beginSeek = () => {
    const element = audio.current;
    if (!element || scrubbing.current || !duration) return;
    if (fadeFrame.current !== null) cancelAnimationFrame(fadeFrame.current);
    fadeFrame.current = null;
    resumeAfterSeek.current = !element.paused || resumeAfterSeek.current;
    settlingSeek.current = false;
    scrubbing.current = true;
    seekTarget.current = element.currentTime;
    setSeekPreview(element.currentTime);
    element.pause();
    element.volume = 0;
  };

  const commitSeek = () => {
    const element = audio.current;
    if (!element || !scrubbing.current) return;
    if (seekTimer.current) clearTimeout(seekTimer.current);
    seekTimer.current = null;
    scrubbing.current = false;
    settlingSeek.current = true;
    const target = Math.max(0, Math.min(seekTarget.current, duration));
    setPosition(target);
    setSeekPreview(null);
    if (Math.abs(element.currentTime - target) < .01 && !element.seeking) finishSeek();
    else element.currentTime = target;
  };

  useEffect(() => () => {
    if (fadeFrame.current !== null) cancelAnimationFrame(fadeFrame.current);
    if (seekTimer.current) clearTimeout(seekTimer.current);
  }, []);

  const dismiss = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    play();
    setLeaving(true);
  }, [play]);

  useEffect(() => {
    if (status !== 'blocked') return;
    // Retry a rejected playback request inside a real user gesture.
    // No synthetic clicks or muted autoplay tricks can grant sound permission.
    const retryOnPointer = (event: PointerEvent) => {
      // Let the play button's click handler own its gesture to avoid toggling twice.
      if (event.target instanceof Element && event.target.closest('.music-toggle, .music-progress')) return;
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
      if ((event.code === 'Space' || event.key === 'Enter') && event.target === document.body) {
        event.preventDefault(); dismiss();
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
    desiredVolume.current = volume;
    if (audio.current) {
      if (!scrubbing.current && !settlingSeek.current && fadeFrame.current === null) audio.current.volume = volume;
      audio.current.muted = muted;
    }
  }, [volume, muted]);

  return <>
    <audio ref={audio} src={tracks[0].src} preload="metadata" loop={repeatOne}
      onEnded={() => selectTrack(activeTrack + 1, true)}
      onPlay={() => { setPlaying(true); setStatus(null); }} onPause={() => setPlaying(false)}
      onTimeUpdate={event => { if (!scrubbing.current && !settlingSeek.current) setPosition(event.currentTarget.currentTime); }}
      onSeeked={finishSeek}
      onLoadedMetadata={event => { const value = event.currentTarget.duration; setDuration(Number.isFinite(value) ? value : 0); }}
      onDurationChange={event => { const value = event.currentTarget.duration; setDuration(Number.isFinite(value) ? value : 0); }}
      onError={() => { setPlaying(false); setStatus('error'); }} />

    <aside className="hero-lyrics music-player" aria-label="Music and lyrics" inert={intro}>
      <Lyrics track={soundtrack} playback={{ time: seekPreview ?? position, playing }}/>
      <div className="music-summary">
        <button ref={playButton} className="music-toggle" aria-label={playing ? "Pause music" : "Play music"}
          onClick={() => playing ? audio.current?.pause() : play()}><span aria-hidden="true">{playing ? <Pause size={14} strokeWidth={1.5} aria-hidden="true"/> : <Play size={14} strokeWidth={1.5} aria-hidden="true" fill="currentColor"/>}</span></button>
        <div className="music-track" aria-live="polite"><strong>{soundtrack.title}</strong><span>{soundtrack.artist}</span></div>
        <div className="music-skip-controls"><button aria-label="Previous track" onClick={() => selectTrack(activeTrack - 1)}><SkipBack size={15} strokeWidth={1.5} aria-hidden="true"/></button><button aria-label="Next track" onClick={() => selectTrack(activeTrack + 1)}><SkipForward size={15} strokeWidth={1.5} aria-hidden="true"/></button></div>
        <div className="music-volume-control" ref={volumeControl} onKeyDown={event => { if (event.key === 'Escape') { setVolumeOpen(false); event.currentTarget.querySelector<HTMLButtonElement>('.volume-trigger')?.focus(); } }}>
          <button className="volume-trigger" aria-label="Adjust volume" aria-expanded={volumeOpen} aria-controls="volume-popover" onClick={() => setVolumeOpen(!volumeOpen)}>{muted || volume === 0 ? <VolumeX size={16} strokeWidth={1.5} aria-hidden="true"/> : <Volume2 size={16} strokeWidth={1.5} aria-hidden="true"/>}</button>
          {volumeOpen && <div className="music-volume" id="volume-popover"><button aria-label={muted ? 'Unmute' : 'Mute'} aria-pressed={muted} onClick={() => setMuted(!muted)}>{muted ? <VolumeX size={16} strokeWidth={1.5} aria-hidden="true"/> : <Volume2 size={16} strokeWidth={1.5} aria-hidden="true"/>}</button><label><span className="sr-only">Volume</span><input type="range" min="0" max="1" step=".01" value={muted ? 0 : volume} onChange={event => { setVolume(Number(event.target.value)); setMuted(false); }}/></label><span>{Math.round((muted ? 0 : volume) * 100)}%</span></div>}
        </div>
      </div>
      <div className="music-library-row">
        <div ref={playlistControl} className="music-library" onKeyDown={event => { if (event.key === 'Escape') { setPlaylistOpen(false); event.currentTarget.querySelector<HTMLButtonElement>('.playlist-trigger')?.focus(); } }}>
          <button className="playlist-trigger" aria-expanded={playlistOpen} aria-controls="music-playlist" onClick={() => { setPlaylistOpen(!playlistOpen); setVolumeOpen(false); }}><ListMusic size={15} strokeWidth={1.5} aria-hidden="true"/> PLAYLIST <span>{activeTrack + 1} / {tracks.length}</span></button>
          {playlistOpen && <section id="music-playlist" className="music-playlist" aria-label="Playlist"><div className="playlist-heading"><span>YOUR SOUNDTRACK</span><button aria-label="Close playlist" onClick={() => setPlaylistOpen(false)}><X size={15} strokeWidth={1.5} aria-hidden="true"/></button></div><ol>{tracks.map((track, index) => <li key={track.src}><button aria-label={`Play ${track.title} by ${track.artist}`} aria-current={index === activeTrack ? 'true' : undefined} onClick={() => { selectTrack(index, true); setPlaylistOpen(false); }}><span className="playlist-number">{index === activeTrack && playing ? <AudioLines size={16} strokeWidth={1.5} aria-hidden="true"/> : String(index + 1).padStart(2, '0')}</span><span><strong>{track.title}</strong><small>{track.artist}</small></span><Play size={13} strokeWidth={1.5} aria-hidden="true"/></button></li>)}</ol></section>}
        </div>
        <button className="music-repeat" aria-label="Repeat current track" aria-pressed={repeatOne} title={repeatOne ? 'Repeating this track' : 'Playing all tracks in order'} onClick={() => setRepeatOne(!repeatOne)}>{repeatOne ? <Repeat1 size={15} strokeWidth={1.5} aria-hidden="true"/> : <Repeat size={15} strokeWidth={1.5} aria-hidden="true"/>}</button>
      </div>
      <div id="music-details">
        <label className="music-progress"><span className="sr-only">{"Track position"}</span><input type="range" min="0" max={duration || 1} step=".1" value={Math.min(seekPreview ?? position, duration || 1)} disabled={!duration}
          onPointerDown={event => { beginSeek(); event.currentTarget.setPointerCapture(event.pointerId); }}
          onPointerUp={commitSeek} onPointerCancel={commitSeek} onLostPointerCapture={commitSeek} onBlur={commitSeek}
          onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) beginSeek(); }}
          onKeyUp={commitSeek}
          onChange={event => {
            const value = Number(event.target.value);
            // Assistive controls may change a range without pointer/key events.
            const standalone = !scrubbing.current;
            if (standalone) beginSeek();
            seekTarget.current = value;
            setSeekPreview(value);
            if (standalone) seekTimer.current = setTimeout(commitSeek, 180);
          }}/></label>
        <div className="music-times"><span>{formatTime(seekPreview ?? position)}</span><span>{formatTime(duration)}</span></div>
      </div>
      {status && <p className="music-status" role="status">{(status === 'blocked' ? "Click anywhere or press Space to enable music." : "Audio unavailable. Try again.")}</p>}
    </aside>

    {intro && <div className={`music-intro ${leaving ? 'is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label={"Enter Qiyana’s universe"}>
      <button className="music-enter" autoFocus disabled={leaving} onClick={dismiss} onKeyDown={event => { if (event.key === 'Tab') event.preventDefault(); }}>
        <span className="intro-orbit" aria-hidden="true"><Music2 size={30} strokeWidth={1.5} aria-hidden="true"/></span>
        <span className="eyebrow">{"SET THE MOOD"}</span>
        <span className="intro-title">{"Her world. Your soundtrack."}</span>
        <span className="intro-action">{"Click anywhere or press Space"}<span aria-hidden="true"> <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true"/></span></span>
        <span className="intro-hint">{"Enter with music. Make yourself at home."}</span>
      </button>
    </div>}
  </>;
}
