export type PlaygroundMedia =
  | { type: 'video'; src: string; poster?: string }
  | { type: 'image'; src: string };

export type PlaygroundItem = {
  id: string;
  media: PlaygroundMedia;
  /** Native aspect ratio of the mobile mockup (width / height). */
  aspect: `${number}/${number}`;
};

export const PLAYGROUND_VIDEO_ITEMS: PlaygroundItem[] = [
  {
    id: 'voiceCoach',
    aspect: '444/960',
    media: {
      type: 'video',
      src: '/playground/videos/2tUv4Phgglg0Cvb9dLfZYDnN1k.mp4',
      poster: '/playground/posters/2tUv4Phgglg0Cvb9dLfZYDnN1k.jpg',
    },
  },
  {
    id: 'coachingThread',
    aspect: '201/251',
    media: {
      type: 'video',
      src: '/playground/videos/fg4QJdetrVJSbCHrLYVUQRIslDY.mp4',
      poster: '/playground/posters/fg4QJdetrVJSbCHrLYVUQRIslDY.jpg',
    },
  },
  {
    id: 'albumArt',
    aspect: '303/652',
    media: {
      type: 'video',
      src: '/playground/videos/maZXnm2ux8JggjeO4tsKhqrm3N8.mp4',
      poster: '/playground/posters/maZXnm2ux8JggjeO4tsKhqrm3N8.jpg',
    },
  },
  {
    id: 'monthsDial',
    aspect: '1/1',
    media: {
      type: 'video',
      src: '/playground/videos/yJt7alfhHy2jaubTL6fRxMwNBcA.mp4',
      poster: '/playground/posters/yJt7alfhHy2jaubTL6fRxMwNBcA.jpg',
    },
  },
];

export const PLAYGROUND_LUXBREW_ITEMS: PlaygroundItem[] = [
  {
    id: 'luxbrewReveal',
    aspect: '9/16',
    media: {
      type: 'image',
      src: '/playground/images/LrzylaRRhfx7AzdCGc1bxBKOlHU.png.webp',
    },
  },
  {
    id: 'luxbrewSetup',
    aspect: '9/16',
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
    media: {
      type: 'image',
      src: '/playground/images/U5hgOhXxKvYc1nt3YV72QvZY.png.webp',
    },
  },
  {
    id: 'gentlePaywall',
    aspect: '9/16',
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
