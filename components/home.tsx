'use client';

import { useEffect, useRef, useState } from 'react';
import { artworkAssets } from '../lib/artworks';
import MusicPlayer from './music-player';
import SectionModal from './section-modal';
import SkinSlider from './skin-slider';
import BackgroundArtwork from './background-artwork';

type Panel = 'queen' | 'spotlight' | 'gallery';

export default function Home() {
  const experience = useRef<HTMLElement>(null);
  const focusToggle = useRef<HTMLButtonElement>(null);
  const exitFocus = useRef<HTMLButtonElement>(null);
  const customization = useRef<HTMLDivElement>(null);
  const mobileNavigation = useRef<HTMLDivElement>(null);
  const fullscreenOwned = useRef(false);
  const restoreFocus = useRef(false);
  const [focusMode, setFocusMode] = useState(false);
  const [activeSkin, setActiveSkin] = useState(artworkAssets.length - 1);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const leaveFocusMode = () => {
    setFocusMode(false);
    fullscreenOwned.current = false;
    if (document.fullscreenElement === experience.current) void document.exitFullscreen().catch(() => {});
  };
  const enterFocusMode = () => {
    mobileNavigation.current?.hidePopover();
    customization.current?.hidePopover();
    restoreFocus.current = true;
    setFocusMode(true);
    const element = experience.current;
    if (element?.requestFullscreen && document.fullscreenEnabled) {
      fullscreenOwned.current = true;
      void element.requestFullscreen().catch(() => { fullscreenOwned.current = false; });
    }
  };
  useEffect(() => {
    if (focusMode) exitFocus.current?.focus({ preventScroll: true });
    else if (restoreFocus.current) focusToggle.current?.focus({ preventScroll: true });
  }, [focusMode]);
  useEffect(() => {
    const onFullscreenChange = () => {
      if (fullscreenOwned.current && document.fullscreenElement !== experience.current) {
        fullscreenOwned.current = false;
        setFocusMode(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setFocusMode(false);
      fullscreenOwned.current = false;
      if (document.fullscreenElement === experience.current) void document.exitFullscreen().catch(() => {});
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('keydown', onKey);
    };
  }, []);
  useEffect(() => { try { setLiked(localStorage.getItem('qiyana-loved') === 'true'); } catch {} }, []);
  useEffect(() => {
    if (panel !== 'gallery' || selected === null) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setSelected(value => value === null ? null : (value + 1) % artworkAssets.length);
      if (event.key === 'ArrowLeft') setSelected(value => value === null ? null : (value - 1 + artworkAssets.length) % artworkAssets.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [panel, selected]);
  const openPanel = (next: Panel) => { mobileNavigation.current?.hidePopover(); customization.current?.hidePopover(); setSelected(null); setPanel(next); };
  const love = () => { setLiked(!liked); try { localStorage.setItem('qiyana-loved', String(!liked)); } catch {} };

  return <main ref={experience} className={`experience${focusMode ? ' is-focus-mode' : ''}`}>
    <div className="hero-scene" inert={panel !== null}>
      <BackgroundArtwork active={activeSkin}/>
      <div className="hero-shade"/>
      <header className="nav" inert={focusMode} aria-hidden={focusMode}><a className="brand" href="/" aria-label="Qiyana home">QIYANA<span>.</span></a><nav className="desktop-navigation" aria-label="Main navigation">
        <button onClick={() => openPanel('queen')} aria-haspopup="dialog">THE EMPRESS</button>
        <button onClick={() => openPanel('spotlight')} aria-haspopup="dialog">SPOTLIGHT <span className="tiny-dot"/></button>
        <button onClick={() => openPanel('gallery')} aria-haspopup="dialog">GALLERY <span className="nav-count">11</span></button>
        <button className="customize-toggle" popoverTarget="customization-menu" aria-label="Customize appearance" title="Customize appearance"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="var(--bg)"/><circle cx="15" cy="17" r="3" fill="var(--bg)"/></svg></button>
        <button ref={focusToggle} className="focus-toggle" onClick={enterFocusMode} aria-label="View artwork fullscreen" title="View artwork fullscreen"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/></svg></button>
      </nav><button className="mobile-menu-toggle" popoverTarget="mobile-navigation" aria-label="Open navigation menu"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button></header>
      <div ref={mobileNavigation} id="mobile-navigation" className="mobile-navigation" popover="auto" role="dialog" aria-labelledby="mobile-navigation-title">
        <div className="customization-header"><span id="mobile-navigation-title">EXPLORE HER WORLD</span><button popoverTarget="mobile-navigation" popoverTargetAction="hide" aria-label="Close navigation menu">✕</button></div>
        <nav aria-label="Mobile navigation">
          <button onClick={() => openPanel('queen')}>THE EMPRESS <span>01 ↗</span></button>
          <button onClick={() => openPanel('spotlight')}>SPOTLIGHT <span>02 ↗</span></button>
          <button onClick={() => openPanel('gallery')}>GALLERY <span>03 ↗</span></button>
          <button onClick={() => { mobileNavigation.current?.hidePopover(); customization.current?.showPopover(); }}>CUSTOMIZE <span>✧</span></button>
          <button onClick={enterFocusMode}>VIEW ARTWORK <span>⛶</span></button>
        </nav>
      </div>
      <div ref={customization} id="customization-menu" className="customization-menu" popover="auto" role="dialog" aria-labelledby="customization-title">
        <div className="customization-header"><span id="customization-title">CUSTOMIZE</span><button popoverTarget="customization-menu" popoverTargetAction="hide" aria-label="Close customization">✕</button></div>
        <p>Make her world your own.</p>
        <SkinSlider active={activeSkin} onChange={setActiveSkin}/>
      </div>
      <section className="hero" aria-labelledby={focusMode ? undefined : 'hero-title'} aria-label={focusMode ? 'Qiyana artwork and music' : undefined}>
        <div className="hero-content" inert={focusMode} aria-hidden={focusMode}><p className="eyebrow"><span/> BEYOND IXTAL</p><h1 id="hero-title">HER WORLD.<br/><span>HER RULES.</span></h1><p className="hero-description">Some take the stage.<br/>She is the stage.</p>
          <button className="button" onClick={() => openPanel('spotlight')}>ENTER HER UNIVERSE <span>↗</span></button>
          <div className="hero-caption"><span/> EMPRESS OF THE ELEMENTS</div>
        </div>
        <MusicPlayer/>
      </section>
      {focusMode && <button ref={exitFocus} className="exit-focus" onClick={leaveFocusMode} aria-label="Exit fullscreen artwork view" title="Exit artwork view (Esc)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 8h5V3M21 8h-5V3M16 21v-5h5M3 16h5v5"/></svg><span>ESC</span></button>}
    </div>
    {panel && <SectionModal kind={panel} title={panel === 'queen' ? '01 / THE EMPRESS' : panel === 'spotlight' ? '02 / IN THE SPOTLIGHT' : '03 / THE COLLECTION'} onClose={() => setPanel(null)}>
      {panel === 'queen' && <div className="queen-panel">
        <div className="queen-visual"><img src={'/images/' + artworkAssets[0].file} alt="Qiyana, Empress of the Elements"/><span>IXTAL’S FINEST.</span></div>
        <div className="queen-copy"><p className="eyebrow">BORN TO RULE</p><h2>A little ego.<br/>A lot of <em>Qiyana.</em></h2><p className="queen-lead">The elements at her fingertips.<br/>All eyes on her.</p><p className="subtle">From Ixtal to the Rift, Qiyana makes an entrance. Confident. Unapologetic. Unforgettable. This little universe is dedicated to every side of her.</p>
        <div className="queen-facts"><span><b>IXTAL</b>HOMELAND</span><span><b>ASSASSIN</b>PLAYSTYLE</span><span><b>∞</b>AURA</span></div><p className="queen-signature">So many champions.<br/><em>Only one Qiyana.</em></p></div>
      </div>}
      {panel === 'spotlight' && <div className="spotlight-panel">
        <div className="spotlight-art"><img src="/images/do53hvfc_20261024010904162.webp" alt="True Damage Know My Name Qiyana portrait"/><span>THE MAIN CHARACTER / Q.001</span></div>
        <div className="spotlight-copy"><p className="eyebrow"><span/> OUR CURRENT OBSESSION</p><h2>New look.<br/>Same <em>queen.</em></h2><p className="skin-name">TRUE DAMAGE KNOW MY NAME QIYANA</p><p className="subtle">That blue hair. That look. That attitude.<br/>Some skins are more than a new look;<br/>they’re another reason to fall in love.</p><div className="palette"><i/><i/><i/><span>NEON BLUE / MIDNIGHT PURPLE / PINK</span></div><button className={'button love ' + (liked ? 'is-loved' : '')} onClick={love} aria-pressed={liked}>{liked ? 'SHE STOLE OUR HEART' : 'LEAVE YOUR HEART'} <span>{liked ? '♥' : '♡'}</span></button><span className="spotlight-foot">100% QIYANA. 0% MODESTY.</span></div>
      </div>}
      {panel === 'gallery' && <div className="gallery-panel">
        {selected === null ? <><div className="gallery-heading"><h2>One queen.<br/><em>Many universes.</em></h2><span>THE COMPLETE COLLECTION / 11</span></div><div className="gallery-grid">{artworkAssets.map((art, index) => <button className="art-card" key={art.file} onClick={() => setSelected(index)} aria-label={`Enlarge ${art.name}`}><div className="art-image"><img src={'/images/' + art.file} alt={art.name} loading="lazy"/><span>↗</span></div><div className="art-meta"><span>{index === 0 ? 'ORIGINAL' : 'COLLECTION'}</span><span>{String(index + 1).padStart(2, '0')}</span></div><h3>{art.name}</h3></button>)}</div></> : <div className="art-viewer">
          <button className="back-to-grid" onClick={() => setSelected(null)}>← ALL SKINS</button>
          <figure><img src={'/images/' + artworkAssets[selected].file} alt={artworkAssets[selected].name}/><figcaption><div><span className="eyebrow">{String(selected + 1).padStart(2, '0')} / 11</span><h3>{artworkAssets[selected].name}</h3></div><a href={'/images/' + artworkAssets[selected].file} download>DOWNLOAD ↓</a></figcaption></figure>
          <div className="viewer-controls"><button aria-label="Previous artwork" onClick={() => setSelected((selected - 1 + artworkAssets.length) % artworkAssets.length)}>← PREVIOUS</button><button aria-label="Next artwork" onClick={() => setSelected((selected + 1) % artworkAssets.length)}>NEXT →</button></div>
        </div>}
      </div>}
    </SectionModal>}
  </main>;
}
