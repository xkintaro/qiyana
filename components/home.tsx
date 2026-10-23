'use client';

import { useEffect, useState } from 'react';
import type { Dictionary } from '../i18n/dictionaries';
import { locales, languageNames, type Locale } from '../i18n/config';

const skinIds = ['0', '1', '2', '10', '11', '20', '21', '30', '40', '50', '51'] as const;

export default function Home({ locale, dictionary: t }: { locale: Locale; dictionary: Dictionary }) {
  const artworks = skinIds.map((id, index) => ({
    file: 'Qiyana_' + id + '.jpg',
    name: t.skins[id],
    tag: index === 0 ? t.gallery.original : t.gallery.collection + ' / ' + String(index).padStart(2, '0'),
  }));
  const switchLanguage = (event: React.MouseEvent<HTMLAnchorElement>, nextLocale: Locale) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.location.assign('/' + nextLocale + window.location.search + window.location.hash);
  };
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
  return <main className={"locale-" + locale}>
    <header className="nav"><a className="brand" href="#home" aria-label={t.nav.home}><span className="sigil">♛</span> QIYANA<span className="brand-dot">.</span></a><nav aria-label={t.nav.label}><a href="#queen">{t.nav.queen}</a><a href="#spotlight">{t.nav.spotlight} <span className="tiny-dot" /></a><a href="#gallery">{t.nav.gallery}</a><div className="language-switch" role="group" aria-label={t.nav.language}>{locales.map(lang => <a key={lang} href={"/" + lang} hrefLang={lang} lang={lang} aria-current={lang === locale ? "page" : undefined} aria-label={languageNames[lang]} onClick={event => switchLanguage(event, lang)}>{lang.toUpperCase()}</a>)}</div></nav></header>
    <section className="hero" id="home"><img className="hero-image" src="/images/hero.webp" alt={t.hero.alt} fetchPriority="high" /><div className="hero-shade" /><div className="hero-content"><p className="eyebrow"><span /> {t.hero.eyebrow}</p><h1>{t.hero.title}<br/><span>{t.hero.accent}</span></h1><p className="hero-description">{t.hero.description}</p><a className="button" href="#spotlight">{t.hero.enter} <span>↗</span></a><div className="hero-caption"><span className="mini-line" /> {t.hero.caption}</div></div><div className="hero-bottom"><span>{t.hero.arrival}</span><a href="#queen">{t.hero.scroll} <span>↓</span></a><span className="vertical-note">{t.hero.vertical}</span></div></section>
    <div className="ticker" aria-hidden="true"><span>{t.ticker.elements}</span><b>✦</b><span>{t.ticker.empress}</span><b>✦</b><span>{t.ticker.rules}</span><b>✦</b><span>{t.ticker.elements}</span><b>✦</b></div>
    <section className="queen section" id="queen"><div><p className="eyebrow muted">{t.queen.eyebrow}</p><h2>{t.queen.title}<br/>{t.queen.lead}<em>{t.queen.accent}</em></h2></div><div className="queen-copy"><p>{t.queen.intro}</p><p className="subtle">{t.queen.description}</p><div className="queen-facts"><span><b>{t.queen.region}</b>{t.queen.regionLabel}</span><span><b>{t.queen.role}</b>{t.queen.roleLabel}</span><span><b>∞</b>{t.queen.aura}</span></div></div></section>
    <section className="spotlight section" id="spotlight"><div className="spotlight-art"><img src="/images/portrait.webp" alt={t.spotlight.alt} loading="lazy"/><span className="image-corner">{t.spotlight.character}</span><span className="art-index">Q / 001</span></div><div className="spotlight-copy"><p className="eyebrow"><span/> {t.spotlight.eyebrow}</p><h2>{t.spotlight.title}<br/>{t.spotlight.lead}<em>{t.spotlight.accent}</em></h2><p>{t.spotlight.description}</p><div className="palette"><i/><i/><i/><span>{t.spotlight.palette}</span></div><button className={'button love ' + (liked ? 'is-loved' : '')} onClick={love}>{liked ? t.spotlight.loved : t.spotlight.love} <span>{liked ? '♥' : '♡'}</span></button><span className="spotlight-foot">{t.spotlight.foot}</span></div></section>
    <section className="gallery section" id="gallery"><div className="section-heading"><div><p className="eyebrow muted">{t.gallery.eyebrow}</p><h2>{t.gallery.title}<br/><em>{t.gallery.accent}</em></h2></div></div><div className="gallery-grid">{artworks.slice(0, expanded ? artworks.length : 6).map((art, index) => <button className="art-card" key={art.file} onClick={() => setActive(index)} aria-label={t.gallery.expand.replace("{name}", art.name)}><div className="art-image"><img src={'/images/' + art.file} alt={art.name} loading="lazy"/><span className="expand-icon">↗</span></div><div className="art-meta"><span>{art.tag}</span><span>{String(index + 1).padStart(2, '0')}</span></div><h3>{art.name}</h3></button>)}</div><button className="load-more" onClick={() => setExpanded(!expanded)}>{expanded ? t.gallery.less : t.gallery.more} <span>{expanded ? '−' : '+'}</span><small>{expanded ? '11 / 11' : '06 / 11'}</small></button></section>
    <section className="dedication" id="dedication"><span className="dedication-star">✦</span><p className="eyebrow muted">{t.dedication.eyebrow}</p><h2>{t.dedication.title}<br/><em>{t.dedication.accent}</em></h2><p>{t.dedication.description}</p><a href="#home">{t.dedication.back} ↑</a></section>
    <footer><a className="brand" href="#home">QIYANA<span className="brand-dot">.</span></a><p>© 2026</p></footer>
    {active !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label={t.gallery.dialog} onClick={() => setActive(null)}><button className="close" autoFocus onClick={() => setActive(null)} aria-label={t.gallery.close}>✕</button><button className="previous" aria-label={t.gallery.previous} onClick={e => { e.stopPropagation(); setActive((active - 1 + artworks.length) % artworks.length); }}>←</button><figure onClick={e => e.stopPropagation()}><img src={'/images/' + artworks[active].file} alt={artworks[active].name}/><figcaption><span>{artworks[active].name}</span><span>{active + 1} / {artworks.length}</span><a href={'/images/' + artworks[active].file} download>{t.gallery.download} ↓</a></figcaption></figure><button className="next" aria-label={t.gallery.next} onClick={e => { e.stopPropagation(); setActive((active + 1) % artworks.length); }}>→</button></div>}
  </main>;
}
