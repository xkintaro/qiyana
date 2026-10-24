'use client';

import { useEffect, useRef, useState } from 'react';
import { artworkAssets } from '../lib/artworks';
import { frameArtwork } from '../lib/artwork-framing';

const source = (index: number) => index === artworkAssets.length - 1
  ? '/images/lc5iafb6_20261024010904243.webp'
  : '/images/' + artworkAssets[index].file;

export default function BackgroundArtwork({ active }: { active: number }) {
  const [layers, setLayers] = useState([{ id: 0, index: active }]);
  const current = useRef(active);
  const sequence = useRef(0);
  const container = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setViewport({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (current.current === active) return;
    let cancelled = false;
    const image = new Image();
    image.src = source(active);
    // Keep the existing scene until the next image is decoded, avoiding flashes.
    void image.decode().then(() => {
      if (cancelled) return;
      current.current = active;
      const layer = { id: ++sequence.current, index: active };
      setLayers(previous => [...previous, layer]);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [active]);

  useEffect(() => {
    if (layers.length < 2) return;
    // Retain overlapping fades during rapid navigation; remove them once settled.
    const timer = window.setTimeout(() => setLayers(previous => previous.slice(-1)), 650);
    return () => window.clearTimeout(timer);
  }, [layers]);

  return <div className="hero-artwork" ref={container} style={{ backgroundImage: `url("${source(layers[layers.length - 1].index)}")` }}>{layers.map((layer, index) => {
    const art = artworkAssets[layer.index];
    const dimensions = layer.index === artworkAssets.length - 1 ? { width: 1280, height: 720 } : { width: 1215, height: 717 };
    const framing = frameArtwork(art.face, dimensions, viewport);
    return <img key={layer.id} className={`hero-image${layer.id > 0 ? ' background-reveal' : ''}`} style={viewport.width ? { width: dimensions.width * framing.scale, height: dimensions.height * framing.scale, left: framing.x, top: framing.y } : { objectPosition: `${(art.face.x + art.face.width / 2) * 100}% ${(art.face.y + art.face.height / 2) * 100}%` }} src={source(layer.index)} alt={index === layers.length - 1 ? art.name : ''} aria-hidden={index < layers.length - 1} fetchPriority="high"/>;
  })}</div>;
}
