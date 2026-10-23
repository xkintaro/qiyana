export type LyricLine = { time: number; text: string };
export type PlaybackState = { time: number; playing: boolean };

export const soundtrack = {
  title: 'worry',
  artist: 'instrumental · ultra slowed',
  src: '/audio/worry-instrumental-ultra-slowed.mp3',
  // No vocals in this recording. Future lyric timestamps use recording seconds.
  lyrics: [] as LyricLine[],
};
