'use client';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div
      className={`logo ${className}`}
      style={{
        width: '16px',
        height: '18px',
        display: 'block',
        overflow: 'visible',
        aspectRatio: '0.91 / 1',
        backgroundImage: 'url(/photos/plant.png)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        position: 'relative',
        borderRadius: '0px',
      }}
    />
  );
}
