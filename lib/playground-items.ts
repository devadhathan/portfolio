export type PlaygroundMedia =
  | { type: 'video'; src: string; poster?: string }
  | { type: 'image'; src: string };

export type PlaygroundStackId = 'whisper' | 'swiftui' | 'rive' | 'xcode';

export type PlaygroundItem = {
  id: string;
  media: PlaygroundMedia;
  /** Native aspect ratio of the media (width / height). */
  aspect: `${number}/${number}`;
  /** Phone bezel vs flat rounded card in the grid / detail. */
  frame: 'phone' | 'flat';
  /** Optional tech stack shown as logos in the detail panel. */
  stack?: PlaygroundStackId[];
  /** Uppercase footer stack line for CRAFT-style cards (e.g. "SWIFTUI + RIVE"). */
  stackLabel: string;
};

export const PLAYGROUND_VIDEO_ITEMS: PlaygroundItem[] = [
  {
    id: 'dewAi',
    aspect: '444/960',
    frame: 'phone',
    stack: ['whisper', 'swiftui', 'rive', 'xcode'],
    stackLabel: 'WHISPER + SWIFTUI + RIVE + XCODE',
    media: {
      type: 'video',
      src: '/playground/videos/2tUv4Phgglg0Cvb9dLfZYDnN1k.mp4',
      poster: '/playground/posters/2tUv4Phgglg0Cvb9dLfZYDnN1k.jpg',
    },
  },
  {
    id: 'monthsDial',
    aspect: '634/1368',
    frame: 'flat',
    stackLabel: 'GESTURES + MOTION',
    media: {
      type: 'video',
      src: '/playground/videos/months-dial-2026-07-30.mp4',
      poster: '/playground/posters/months-dial-2026-07-30.jpg',
    },
  },
  {
    id: 'albumArt',
    aspect: '303/652',
    frame: 'phone',
    stackLabel: 'METAL SHADERS',
    media: {
      type: 'video',
      src: '/playground/videos/maZXnm2ux8JggjeO4tsKhqrm3N8.mp4',
      poster: '/playground/posters/maZXnm2ux8JggjeO4tsKhqrm3N8.jpg',
    },
  },
  {
    id: 'coachingThread',
    aspect: '201/251',
    frame: 'phone',
    stackLabel: 'CLAUDE API',
    media: {
      type: 'video',
      src: '/playground/videos/fg4QJdetrVJSbCHrLYVUQRIslDY.mp4',
      poster: '/playground/posters/fg4QJdetrVJSbCHrLYVUQRIslDY.jpg',
    },
  },
];

export const PLAYGROUND_LUXBREW_ITEMS: PlaygroundItem[] = [
  {
    id: 'luxbrewReveal',
    aspect: '9/16',
    frame: 'phone',
    stackLabel: '3D + ART DIRECTION',
    media: {
      type: 'image',
      src: '/playground/images/LrzylaRRhfx7AzdCGc1bxBKOlHU.png.webp',
    },
  },
  {
    id: 'luxbrewSetup',
    aspect: '9/16',
    frame: 'phone',
    stackLabel: 'ONBOARDING + UX WRITING',
    media: {
      type: 'image',
      src: '/playground/images/tw5Wd8XWuFR8yA2PPUoIHs47X8.png.webp',
    },
  },
];

export const PLAYGROUND_PERPLEXITY_ITEMS: PlaygroundItem[] = [
  {
    id: 'perplexityHome',
    aspect: '9/16',
    frame: 'phone',
    stackLabel: 'MOTION + ILLUSTRATION',
    media: {
      type: 'image',
      src: '/playground/images/U5hgOhXxKvYc1nt3YV72QvZY.png.webp',
    },
  },
  {
    id: 'gentlePaywall',
    aspect: '9/16',
    frame: 'phone',
    stackLabel: 'ILLUSTRATION',
    media: {
      type: 'image',
      src: '/playground/images/onp7iUn9nQjsWz8wBNQRTZKBbk.png.webp',
    },
  },
];

export const PLAYGROUND_ITEMS: PlaygroundItem[] = [
  ...PLAYGROUND_VIDEO_ITEMS,
  ...PLAYGROUND_LUXBREW_ITEMS,
  ...PLAYGROUND_PERPLEXITY_ITEMS,
];
