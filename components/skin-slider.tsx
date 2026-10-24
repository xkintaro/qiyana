'use client';

import { useEffect, useRef } from 'react';
import { artworkAssets } from '../lib/artworks';

export default function SkinSlider({ active, onChange }: { active: number; onChange: (index: number) => void }) {
  const strip = useRef<HTMLDivElement>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const step = (direction: number) => onChange((active + direction + artworkAssets.length) % artworkAssets.length);
  useEffect(() => {
    const track = strip.current;
    const button = thumbs.current[active];
    if (track && button) track.scrollTo({ left: button.offsetLeft - (track.clientWidth - button.clientWidth) / 2, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [active]);
  return <section className="skin-slider" aria-label="Choose background skin" onKeyDown={event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1); }
  }}>
    <div className="skin-slider-heading"><span>SET THE SCENE</span><span>{String(active + 1).padStart(2, '0')} / {artworkAssets.length}</span></div>
    <div className="skin-slider-row">
      <button className="skin-arrow" aria-label="Previous background skin" onClick={() => step(-1)}>←</button>
      <div className="skin-strip" ref={strip}>{artworkAssets.map((art, index) => <button ref={element => { thumbs.current[index] = element; }} key={art.file} className="skin-thumb" aria-label={`Set background to ${art.name}`} aria-pressed={active === index} title={art.name} onClick={() => onChange(index)}><img src={'/images/' + art.file} alt="" loading="lazy"/></button>)}</div>
      <button className="skin-arrow" aria-label="Next background skin" onClick={() => step(1)}>→</button>
    </div>
    <p className="skin-slider-name" aria-live="polite">{artworkAssets[active].name}</p>
  </section>;
}
