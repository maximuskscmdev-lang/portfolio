import React from 'react';

/**
 * NoiseOverlay — uses a static CSS background-image instead of an inline SVG filter.
 * The SVG noise is baked into a tiny repeating tile via a data-URI, so the browser
 * rasterises it once and composites via the GPU (no per-frame filter work).
 * Reduced from z-index 9998 to 9990 to stay below modals.
 */
export const NoiseOverlay: React.FC = React.memo(() => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9990,
        opacity: 0.04,
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px',
        mixBlendMode: 'overlay',
        willChange: 'auto',
        contain: 'strict',
      }}
    />
  );
});

NoiseOverlay.displayName = 'NoiseOverlay';
