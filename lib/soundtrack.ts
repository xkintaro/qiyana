export type LyricLine = { time: number; text: string };
export type PlaybackState = { time: number; playing: boolean };

export type Track = { title: string; artist: string; src: string; instrumental: boolean; lyrics: LyricLine[] };

export const tracks: Track[] = [{
  title: 'worry',
  artist: 'instrumental · ultra slowed',
  src: '/audio/worry-instrumental-ultra-slowed.mp3',
  instrumental: true,
  lyrics: [],
}, {
  title: "I Don't Care",
  artist: 'VIOLENT VIRA',
  src: '/audio/violent-vira-i-dont-care.mp3',
  instrumental: false,
  lyrics: [],
}, {
  title: 'Saccharine',
  artist: 'VIOLENT VIRA',
  src: '/audio/violent-vira-saccharine.mp3',
  instrumental: false,
  lyrics: [],
}];
