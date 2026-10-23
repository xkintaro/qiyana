'use client';

import { useEffect, useState } from 'react';
import { artworkAssets } from '../lib/artworks';
import MusicPlayer from './music-player';

export default function Home() {
  const artworks = artworkAssets.map(({ name, file }, index) => ({
    file,
    name,
    tag: index === 0 ? "ORIGINAL" : "COLLECTION" + ' / ' + String(index).padStart(2, '0'),
  }));
  const [active, setActive] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  useEffect(() => { setLiked(localStorage.getItem('qiyana-loved') === 'true'); }, []);
  useEffect(() => {
    if (active === null) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); if (e.key === 'ArrowRight') setActive(v => v === null ? null : (v + 1) % artworks.length); if (e.key === 'ArrowLeft') setActive(v => v === null ? null : (v - 1 + artworks.length) % artworks.length); };
    document.addEventListener('keydown', handler); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = previous; };
  }, [active]);
  const love = () => { setLiked(!liked); localStorage.setItem('qiyana-loved', String(!liked)); };
  return <main>
    <MusicPlayer />
    <header className="nav"><a className="brand" href="#home" aria-label={"Qiyana home"}>QIYANA<span className="brand-dot">.</span></a><nav aria-label={"Main navigation"}><a href="#queen">{"THE EMPRESS"}</a><a href="#spotlight">{"SPOTLIGHT"} <span className="tiny-dot" /></a><a href="#gallery">{"GALLERY"}</a></nav></header>
    <section className="hero" id="home"><img className="hero-image" src="/images/lc5iafb6_20261024010904243.webp" alt={"Qiyana surrounded by neon blue and pink light"} fetchPriority="high" /><div className="hero-shade" /><div className="hero-content"><p className="eyebrow"><span /> {"BEYOND IXTAL"}</p><h1>{"HER WORLD."}<br/><span>{"HER RULES."}</span></h1><p className="hero-description">{"Some take the stage.\nShe is the stage."}</p><a className="button" href="#spotlight">{"ENTER HER UNIVERSE"} <span>↗</span></a><div className="hero-caption"><span className="mini-line" /> {"EMPRESS OF THE ELEMENTS"}</div></div><div className="hero-bottom"><span>{"01 — THE QUEEN HAS ARRIVED"}</span><a href="#queen">{"SCROLL TO EXPLORE"} <span>↓</span></a><span className="vertical-note">{"QIYANA / FAN UNIVERSE"}</span></div></section>
    <div className="ticker" aria-hidden="true"><span>{"WATER. EARTH. GRASS."}</span><b>✦</b><span>{"ALL HAIL THE EMPRESS."}</span><b>✦</b><span>{"HER WORLD. HER RULES."}</span><b>✦</b><span>{"WATER. EARTH. GRASS."}</span><b>✦</b></div>
    <section className="queen section" id="queen"><div><p className="eyebrow muted">{"01 / THE ONLY ONE ON THE THRONE"}</p><h2>{"A little ego."}<br/>{"A lot of "}<em>{"Qiyana."}</em></h2></div><div className="queen-copy"><p>{"An attitude that reaches from Ixtal to the Rift.\nThe elements at her fingertips,\nall eyes on her."}</p><p className="subtle">{"Confident. Unapologetic. Unforgettable. This little universe is dedicated to every side of Qiyana and the energy that makes us fall for her all over again."}</p><div className="queen-facts"><span><b>{"IXTAL"}</b>{"HOMELAND"}</span><span><b>{"ASSASSIN"}</b>{"PLAYSTYLE"}</span><span><b>∞</b>{"AURA"}</span></div></div></section>
    <section className="spotlight section" id="spotlight"><div className="spotlight-art"><img src="/images/do53hvfc_20261024010904162.webp" alt={"True Damage Know My Name Qiyana portrait"} loading="lazy"/><span className="image-corner">{"THE MAIN CHARACTER"}</span><span className="art-index">Q / 001</span></div><div className="spotlight-copy"><p className="eyebrow"><span/> {"OUR CURRENT OBSESSION"}</p><h2>{"New look."}<br/>{"Same "}<em>{"queen."}</em></h2><p>{"That blue hair. That look. That attitude.\nSome skins are more than a new look;\nthey're another reason to fall in love."}</p><div className="palette"><i/><i/><i/><span>{"NEON BLUE / MIDNIGHT PURPLE / PINK"}</span></div><button className={'button love ' + (liked ? 'is-loved' : '')} onClick={love}>{liked ? "SHE STOLE OUR HEART" : "LEAVE YOUR HEART"} <span>{liked ? '♥' : '♡'}</span></button><span className="spotlight-foot">{"100% QIYANA. 0% MODESTY."}</span></div></section>
    <section className="gallery section" id="gallery"><div className="section-heading"><div><p className="eyebrow muted">{"02 / EVERY LOOK, ANOTHER WORLD"}</p><h2>{"One queen."}<br/><em>{"Many universes."}</em></h2></div></div><div className="gallery-grid">{artworks.slice(0, expanded ? artworks.length : 6).map((art, index) => <button className="art-card" key={art.file} onClick={() => setActive(index)} aria-label={`Enlarge ${art.name}`}><div className="art-image"><img src={'/images/' + art.file} alt={art.name} loading="lazy"/><span className="expand-icon">↗</span></div><div className="art-meta"><span>{art.tag}</span><span>{String(index + 1).padStart(2, '0')}</span></div><h3>{art.name}</h3></button>)}</div><button className="load-more" onClick={() => setExpanded(!expanded)}>{expanded ? "SHOW LESS" : "EXPLORE THE FULL COLLECTION"} <span>{expanded ? '−' : '+'}</span><small>{expanded ? '11 / 11' : '06 / 11'}</small></button></section>
    <section className="dedication" id="dedication"><span className="dedication-star">✦</span><p className="eyebrow muted">{"JUST A LITTLE OBSESSED."}</p><h2>{"So many champions on the Rift."}<br/><em>{"But only one Qiyana."}</em></h2><p>{"It started with a skin. It became a universe."}</p><a href="#home">{"BACK TO THE THRONE"} ↑</a></section>
    <footer><a className="brand" href="#home">QIYANA<span className="brand-dot">.</span></a><p>© 2026</p></footer>
    {active !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label={"Qiyana artwork gallery"} onClick={() => setActive(null)}><button className="close" autoFocus onClick={() => setActive(null)} aria-label={"Close gallery"}>✕</button><button className="previous" aria-label={"Previous artwork"} onClick={e => { e.stopPropagation(); setActive((active - 1 + artworks.length) % artworks.length); }}>←</button><figure onClick={e => e.stopPropagation()}><img src={'/images/' + artworks[active].file} alt={artworks[active].name}/><figcaption><span>{artworks[active].name}</span><span>{active + 1} / {artworks.length}</span><a href={'/images/' + artworks[active].file} download>{"DOWNLOAD ARTWORK"} ↓</a></figcaption></figure><button className="next" aria-label={"Next artwork"} onClick={e => { e.stopPropagation(); setActive((active + 1) % artworks.length); }}>→</button></div>}
  </main>;
}
