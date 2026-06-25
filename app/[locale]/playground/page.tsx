'use client';
import { TopBar, MobileBottomNav } from '@/components/top-bar';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

const videoFiles = [
  {
    src: '/playground/videos/2tUv4Phgglg0Cvb9dLfZYDnN1k.mp4',
    alt: 'Video explorations 1',
  },
  {
    src: '/playground/videos/fg4QJdetrVJSbCHrLYVUQRIslDY.mp4',
    alt: 'Video explorations 2',
  },
  {
    src: '/playground/videos/maZXnm2ux8JggjeO4tsKhqrm3N8.mp4',
    alt: 'Video explorations 3',
  },
  {
    src: '/playground/videos/yJt7alfhHy2jaubTL6fRxMwNBcA.mp4',
    alt: 'Video explorations 4',
  },
];

const imageFiles = [
  {
    src: '/playground/images/LrzylaRRhfx7AzdCGc1bxBKOlHU.png.webp',
    alt: 'Still frame 1',
  },
  {
    src: '/playground/images/U5hgOhXxKvYc1nt3YV72QvZY.png.webp',
    alt: 'Still frame 2',
  },
  {
    src: '/playground/images/onp7iUn9nQjsWz8wBNQRTZKBbk.png.webp',
    alt: 'Still frame 3',
  },
  {
    src: '/playground/images/tw5Wd8XWuFR8yA2PPUoIHs47X8.png.webp',
    alt: 'Still frame 4',
  },
];

export default function PlaygroundPage() {
  const router = useRouter();
  const t = useTranslations('playground');

  return (
    <div className="min-h-screen bg-card text-foreground">
      <TopBar onHomeClick={() => router.push('/')} />
      <main className="pt-14 pb-24 px-2 md:px-6 lg:px-8 animate-fade-in-blur">
        <div className="mx-auto max-w-7xl space-y-10 mt-6 md:mt-8">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.36em] text-muted-foreground">{t('label')}</p>
          </div>
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(0,1fr)]">
            {videoFiles.map((video) => (
              <div
                key={video.src}
                className="flex h-full w-full overflow-hidden rounded-3xl border border-border/60 bg-black/60 shadow-[0_25px_65px_-30px_rgba(0,0,0,0.9)] backdrop-blur"
              >
                <video
                  className="h-full w-full object-cover"
                  src={video.src}
                  aria-label={video.alt}
                  controls
                  loop
                  playsInline
                  muted
                />
              </div>
            ))}
          </section>

          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(0,1fr)]">
            {imageFiles.map((image) => (
              <div
                key={image.src}
                className="flex h-full w-full overflow-hidden rounded-3xl border border-border/60 bg-secondary/10 shadow-[0_25px_65px_-30px_rgba(0,0,0,0.9)]"
              >
                <img
                  className="h-full w-full object-cover"
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                />
              </div>
            ))}
          </section>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
