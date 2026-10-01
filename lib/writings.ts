/**
 * Home Writing entries. Index list shows year / title / DD/MM.
 * Video and image live inside the story body as blocks.
 *
 * Suggested paths once you have files:
 *   { type: 'video', src: '/photos/writings/stroke.mp4' }
 *   { type: 'image', src: '/photos/writings/stroke.webp' }
 */
export type WritingBlock =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'video'; src: string; endAt?: number; poster?: string; label?: string }
  | { type: 'image'; src: string; alt?: string };

export type Writing = {
  id: string;
  title: string;
  /** Short blurb under the title on the story page. */
  description: string;
  /** Full date for the story header, e.g. "29 September, 2026". */
  dateLabel: string;
  /** Calendar year for the index column. */
  year: number;
  /** Day/month for the index, e.g. "29/09". */
  dateShort: string;
  /** Product / site link shown on the story page. */
  href?: string;
  /** Medium article. Opens in a new tab (also used when externalOnly). */
  mediumUrl?: string;
  /**
   * Index click opens mediumUrl (or href) instead of an in-app story.
   * Use for pieces that only live on Medium.
   */
  externalOnly?: boolean;
  body: WritingBlock[];
};

export const WRITINGS: Writing[] = [
  {
    id: 'stroke',
    title: 'Stroke',
    description:
      'A browser studio for vectors, motion and 3D. One canvas from draw to animate to export.',
    dateLabel: '29 September, 2026',
    year: 2026,
    dateShort: '29/09',
    href: 'https://stroke.design',
    body: [
      {
        type: 'p',
        text: 'Stroke is a browser studio for vectors, motion and 3D. You draw real paths, animate them on a timeline, extrude them into lit solids, and export GIF, MP4, Lottie or SVG from the same file. Free includes the exports. Pro buys more AI and storage, not the right to ship.',
      },
      { type: 'video', src: '/videos/stroke.mp4', endAt: 25, poster: '/videos/stroke-poster.jpg', label: 'Stroke product overview' },
      {
        type: 'p',
        text: 'Shader fills (swirl, warp, mesh, paper, dither) live on the path as fills, not as a separate effect stack glued on at the end. When a shader is animated, video export re-rasterises it per frame so the motion shows up in the file. Still effect filters on a static fill stay still. Redoing every frame would cost double for no gain.',
      },
      {
        type: 'p',
        text: 'I kept ending up in the same place. An icon in Figma, motion in something else, a Lottie from a third step that didn’t quite match what I’d previewed. For a three-second bounce the pipeline felt longer than the work.',
      },
      {
        type: 'p',
        text: 'So I built Stroke as one canvas. Drawing, animating and extruding share a project file. Export runs the same engine the editor uses to play back. That sounds like a slogan. In practice it means you don’t redraw the art to animate it, and you don’t re-author the motion to leave with a file.',
      },
      { type: 'h', text: 'Open it' },
      {
        type: 'p',
        text: 'Go to stroke.design and open the app. Guests work in the browser; sign in when you want cloud sync, the agent, or export.',
      },
      {
        type: 'p',
        text: 'There’s a board of canvases, think artboards that pan and zoom together. Empty board: left-drag draws a dotted marquee to select; two-finger trackpad (or right-drag) pans; scroll or pinch zooms. Each canvas has layers, groups, and a size (24, 32, 48, or custom). Icons are authored for a small grid and scale cleanly when you change it.',
      },
      {
        type: 'p',
        text: 'Three modes sit on the same artwork: Design (pen, brushes, shapes, text, masks, images, video layers, shader fills), Animate (timeline, presets, custom clips, motion paths, path morph, trails), and 3D (extrude paths into solids, materials and light, export as a Three.js page or snippet). You switch modes; you don’t switch files.',
      },
      { type: 'h', text: 'Drawing' },
      {
        type: 'p',
        text: 'Everything you draw is a real vector path. Pen and freehand stay editable. Text stays text in SVG export. There’s a large icon library if you’d rather start from something than from nothing.',
      },
      {
        type: 'p',
        text: 'The board can hold several canvases. Animate one, animate all, batch-export the lot into a ZIP. That matters when you’re shipping a set of related marks rather than a single hero.',
      },
      { type: 'video', src: '/videos/stroke-draw.mp4', poster: '/videos/stroke-draw-poster.jpg', label: 'Stroke drawing demo' },
      { type: 'h', text: 'Motion' },
      {
        type: 'p',
        text: 'Motion in Stroke is a catalogue of presets, Fade in, Draw on, Pop, Shake, Orbit, Trail, Move, Path Morph, and sixty-odd more, plus a Custom preset for free from→to values.',
      },
      {
        type: 'p',
        text: 'Each preset is a function of time. It returns properties: translate, scale, rotation, opacity, blur, draw progress, tint, trails. You drop a clip on a track. A track is a layer, a group, or the whole icon. Clips have a start, a duration, an easing (named, or a cubic you bend by hand), and optional repeat.',
      },
      {
        type: 'p',
        text: 'Overlapping clips compose in a fixed way: offsets add, scale and opacity multiply, draw-on takes the most undrawn. You don’t wire a graph. You stack clips and the engine resolves them.',
      },
      {
        type: 'p',
        text: 'The important part is where that engine lives. It’s plain TypeScript, no React. The live preview, the GIF encoder, the video encoder and the Lottie exporter all call the same evaluator. Preview and export stay honest because there’s only one clock.',
      },
      { type: 'video', src: '/videos/stroke-motion.mp4', poster: '/videos/stroke-motion-poster.jpg', label: 'Stroke animation demo' },
      { type: 'h', text: 'Motion paths' },
      {
        type: 'p',
        text: 'A Move clip can follow a curve instead of a straight offset. Travel is measured along the length of the path, so speed stays even through bends. Multi-point paths are smoothed so corners don’t kink unless you want them to. While you edit, a floating centre sits on the curve until you pin it, hover, click, commit, so the path isn’t nailed down before you’ve decided.',
      },
      { type: 'h', text: 'Morph and trails' },
      {
        type: 'p',
        text: 'Path Morph interpolates the live shape toward a target captured at the playhead. Line presets (Trail, Comet, Ping-Pong and the rest) emit travelling stroke pieces that render in the editor, in SVG, and as trimmed strokes in Lottie.',
      },
      {
        type: 'p',
        text: 'Distances are authored for a 32-unit canvas and scale with size, so the same Pop feels right on 24 or 48.',
      },
      { type: 'h', text: '3D' },
      {
        type: 'p',
        text: 'Any path can be extruded into a lit solid. Materials and lighting are adjustable in the 3D view. Export is a standalone HTML page or drop-in Three.js code, useful when the icon needs to live in a scene, not only as a flat file.',
      },
      {
        type: 'p',
        text: 'Flat image export from 3D view captures the lit solid. SVG export stays the flat vectors. You’re choosing which reading of the same artwork to take out the door.',
      },
      { type: 'video', src: '/videos/stroke-3d.mp4', poster: '/videos/stroke-3d-poster.jpg', label: 'Stroke 3D demo' },
      { type: 'h', text: 'Export' },
      {
        type: 'p',
        text: 'One dialog, three tabs: Image, Video, 3D. SVG stays true vector with text as text. PNG, JPG and WebP raster at size × scale (0.5×–4×), with PNG able to keep transparency. GIF uses a shared palette, light dither, and delta frames when opaque, and you can cancel mid-render. MP4 and WebM use WebCodecs when available, default 60fps up to 120, with alpha going to VP9 WebM. Frames export a PNG sequence as a ZIP with full alpha. Lottie is JSON sampled from the same engine at 30fps. Batch ships every animated canvas with the same settings in one ZIP. 3D leaves as an HTML page or Three.js snippet.',
      },
      {
        type: 'p',
        text: 'Free includes GIF, video, Lottie, transparent WebM, frames and batch, no watermark, up to 4K in the UI. You sign in to export. That’s a gate, not a quality tier.',
      },
      {
        type: 'p',
        text: 'Lottie is honest about its limits. Blur and vertical skew don’t map fully; soft glows often become wider strokes. Still stretches collapse so the JSON doesn’t bloat with empty keyframes. What you get is standard Lottie (v: 5.7.0) from your vectors, without an After Effects round-trip.',
      },
      { type: 'image', src: '/videos/export.jpg', alt: 'Stroke export dialog' },
      { type: 'h', text: 'The agent' },
      {
        type: 'p',
        text: 'There’s an AI agent that reads the canvas and can draw or apply animation into the project. It works on the same model you edit by hand, not a parallel “AI canvas” you can’t open later.',
      },
      {
        type: 'p',
        text: 'Free gets 25 requests a month. Pro (£12/month) gets 500, plus 10 GB cloud storage instead of 100 MB. Export formats and animation length match Free. The paid plan is headroom, not unlocking HD.',
      },
      { type: 'h', text: 'Making it yours (without a settings novel)' },
      {
        type: 'p',
        text: 'Stroke is opinionated on purpose. Open a canvas, draw, drop a preset, export. The defaults are meant to be shippable.',
      },
      {
        type: 'p',
        text: 'What you do tune, when you need to: canvas size and grid for icon work; tracks (animate a layer, a group, or the whole mark); easing (pick a name or bend the curve); motion path (when a straight Move isn’t the motion); export size, fps, alpha, scope (one canvas or all).',
      },
      {
        type: 'p',
        text: 'If you want a fully modular whiteboard kit, tldraw or Excalidraw are a better fit. Stroke is a studio for finishing marks: draw, move, extrude, leave with a file.',
      },
      { type: 'h', text: 'What’s under it' },
      {
        type: 'p',
        text: 'For the curious, not required to use it: Next.js and React for the app. TypeScript for the animation core. Three.js for solids. IndexedDB for guest projects; Neon for cloud. NextAuth and Stripe for accounts and Pro. Vitest and Playwright for the bits that break if preview and export drift.',
      },
      {
        type: 'p',
        text: 'The architecture fits on one line: paths + clips → animation engine → editor · GIF/MP4 · Lottie · 3D. Everything else is adapters.',
      },
      { type: 'h', text: 'What it isn’t' },
      {
        type: 'p',
        text: 'Not After Effects in a tab. Not a team asset CDN. Not perfect Lottie parity for every effect. Not a free forever AI firehose.',
      },
      {
        type: 'p',
        text: 'Those are deliberate. The strength is a closed loop that stays small: one file from pen to ship, and Free means you can finish.',
      },
      {
        type: 'p',
        text: 'I called it Stroke because that’s the unit of work, a path you draw, then move, then send out. For now it does the thing I made it for: the next time an icon needs motion, I don’t leave the canvas to get it.',
      },
      {
        type: 'p',
        text: 'I’ll let you draw your own conclusions.',
      },
    ],
  },
  {
    id: 'dew',
    title: 'Dew',
    description:
      'Why AI needs a face: building a Duolingo-inspired AI character with Rive, Whisper, and Swift.',
    dateLabel: '26 May, 2025',
    year: 2025,
    dateShort: '26/05',
    mediumUrl:
      'https://medium.com/@devadhathanmd18/why-ai-needs-a-face-building-dew-my-duolingo-inspired-ai-character-2d4e56f94772',
    externalOnly: true,
    body: [],
  },
];

export function getWritingById(id: string): Writing | undefined {
  return WRITINGS.find((w) => w.id === id);
}

/** Newest year first; within a year, keep authored order. */
export function writingsSorted(): Writing[] {
  return [...WRITINGS].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return 0;
  });
}
