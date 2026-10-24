'use client';

import { useEffect, useRef, useState } from 'react';
import { artworkAssets } from '../lib/artworks';

const source = (index: number) => index === artworkAssets.length - 1
  ? '/images/lc5iafb6_20261024010904243.webp'
  : '/images/' + artworkAssets[index].file;

export default function BackgroundArtwork({ active }: { active: number }) {
  const [layers, setLayers] = useState([{ id: 0, index: active }]);
  const current = useRef(active);
  const sequence = useRef(0);

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

  return <>{layers.map((layer, index) => <img key={layer.id} className={`hero-image${layer.id > 0 ? ' background-reveal' : ''}`} src={source(layer.index)} alt={index === layers.length - 1 ? artworkAssets[layer.index].name : ''} aria-hidden={index < layers.length - 1} fetchPriority="high"/>)}</>;
}
