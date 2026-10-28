export interface MusicClip {
  title: string;
  index?: number;
  startTime: number;
  duration: number;
  startPercentage: number;
}

export const DOJA_CAT_CLIPS: MusicClip[] = [
  {
    title: "Cards",
    index: 0,
    startTime: 0,
    duration: 30,
    startPercentage: 0,
  },
  {
    title: "Jealous Type",
    index: 1,
    startTime: 31,
    duration: 32,
    startPercentage: 0.0385,
  },
  {
    title: "AAAHH MEN!",
    index: 2,
    startTime: 63,
    duration: 30,
    startPercentage: 0.115,
  },
  {
    title: "Couples Therapy",
    index: 3,
    startTime: 93,
    duration: 30,
    startPercentage: 0.185,
  },
  {
    title: "Gorgeous",
    index: 4,
    startTime: 123,
    duration: 30,
    startPercentage: 0.283,
  },
  {
    title: "Stranger",
    index: 5,
    startTime: 153,
    duration: 31,
    startPercentage: 0.339,
  },
  {
    title: "All Mine",
    index: 6,
    startTime: 184,
    duration: 31,
    startPercentage: 0.395,
  },
  {
    title: "Take Me Dancing",
    index: 7,
    startTime: 215,
    duration: 34,
    startPercentage: 0.445,
  },
  {
    title: "Lipstain",
    index: 8,
    startTime: 249,
    duration: 32,
    startPercentage: 0.544,
  },
  {
    title: "Silly! Fun!",
    index: 9,
    startTime: 281,
    duration: 32,
    startPercentage: 0.593,
  },
  {
    title: "Acts Of Service",
    index: 10,
    startTime: 313,
    duration: 33,
    startPercentage: 0.657
  },
  {
    title: "Make It Up",
    index: 11,
    startTime: 346,
    duration: 33,
    startPercentage: 0.749,
  },
  {
    title: "One More Time",
    index: 12,
    startTime: 379,
    duration: 32,
    startPercentage: 0.814,
  },
  {
    title: "Happy",
    index: 13,
    startTime: 411,
    duration: 31,
    startPercentage: 0.9,
  },
  {
    title: "Come Back",
    index: 14,
    startTime: 442,
    duration: 29,
    startPercentage: 0.937,
  },
];

export const MUSIC_CONFIG = {
  filePath: "/assets/music/disco-clips/dojacat-merge-tracks-compressed.mp3",
  clips: DOJA_CAT_CLIPS,
  fadeInDuration: 1000, // ms
  fadeOutDuration: 1000, // ms
  defaultVolume: 0.7 as number,
} as const;