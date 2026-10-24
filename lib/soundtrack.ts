export type LyricLine = { time: number; text: string };
export type PlaybackState = { time: number; playing: boolean };

export type Track = { title: string; artist: string; src: string; instrumental: boolean; caption: [string, string]; lyrics: LyricLine[] };

export const tracks: Track[] = [{
  title: 'worry',
  artist: 'instrumental · ultra slowed',
  src: '/audio/worry-instrumental-ultra-slowed.mp3',
  instrumental: true,
  caption: ['No words needed.', 'Just the feeling.'],
  lyrics: [],
}, {
  title: "I Don't Care",
  artist: 'VIOLENT VIRA',
  src: '/audio/violent-vira-i-dont-care.mp3',
  instrumental: false,
  caption: ['Let it take over.', 'Stay in her world.'],
  lyrics: [],
}, {
  title: 'Saccharine',
  artist: 'VIOLENT VIRA',
  src: '/audio/violent-vira-saccharine.mp3',
  instrumental: false,
  caption: ['A little sweetness.', 'A darker side.'],
  lyrics: [],
}];
