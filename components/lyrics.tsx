'use client';

import { Minus, Plus, Music2 } from 'lucide-react';
import { useState } from 'react';
import { soundtrack, type PlaybackState } from '../lib/soundtrack';

export default function Lyrics({ playback }: { playback: PlaybackState }) {
  const [visible, setVisible] = useState(true);
  let index = -1;
  soundtrack.lyrics.forEach((line, i) => { if (line.time <= playback.time) index = i; });
  const instrumental = soundtrack.lyrics.length === 0;
  return <div className={`lyrics-display ${playback.playing ? 'is-playing' : ''}`} role="region" aria-label="Lyrics">
    <button className="lyrics-label" onClick={() => setVisible(!visible)} aria-expanded={visible} aria-controls="lyrics-lines"><span className="lyrics-indicator"/> {instrumental ? 'INSTRUMENTAL SESSION' : 'LIVE LYRICS'} <span>{visible ? <Minus size={12} strokeWidth={1.5} aria-hidden="true"/> : <Plus size={12} strokeWidth={1.5} aria-hidden="true"/>}</span></button>
    <div id="lyrics-lines" hidden={!visible}>
      {instrumental ? <><p className="lyrics-ghost">No words needed.</p><p className="lyrics-current">Just the feeling.</p></> : <div className="synced-lines" key={index}><p className="lyrics-ghost">{soundtrack.lyrics[index - 1]?.text || <Music2 size={24} strokeWidth={1.5} aria-hidden="true"/>}</p><p className="lyrics-current">{soundtrack.lyrics[index]?.text || <Music2 size={24} strokeWidth={1.5} aria-hidden="true"/>}</p><p className="lyrics-ghost">{soundtrack.lyrics[index + 1]?.text || <Music2 size={24} strokeWidth={1.5} aria-hidden="true"/>}</p></div>}
    </div>
  </div>;
}
