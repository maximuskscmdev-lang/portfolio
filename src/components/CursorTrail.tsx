import React, { useEffect, useRef } from 'react';
import WebGLFluid from '../lib/webgl-fluid';

export const CursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    WebGLFluid(canvas, {
      TRIGGER: 'hover',
      IMMEDIATE: true,
      SIM_RESOLUTION: 64,          // was 128 — halved for huge perf gain
      DYE_RESOLUTION: 512,         // was 1024 — halved, still looks great
      DENSITY_DISSIPATION: 8,
      VELOCITY_DISSIPATION: 4,
      PRESSURE: 0.1,
      PRESSURE_ITERATIONS: 20,    // was 40 — halved, barely visible difference
      CURL: 0.001,
      SPLAT_RADIUS: 0.02,
      SPLAT_FORCE: 3000,
      SHADING: false,              // was true — saves a full-screen shader pass
      COLORFUL: true,
      PAUSED: false,
      TRANSPARENT: true,
      BLOOM: false,
      SUNRAYS: false,              // explicitly disable sunrays pass
    });

    // Throttled event forwarding — 16ms ≈ 60fps cap instead of firehosing
    let lastForward = 0;
    const forwardEvent = (e: MouseEvent | TouchEvent) => {
      if (!e.isTrusted) return;

      const now = performance.now();
      if (now - lastForward < 16) return;
      lastForward = now;

      const target = e.target as HTMLElement;
      if (
        target &&
        target.closest &&
        (target.closest('.interactive') ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('.glass'))
      ) {
        return;
      }

      let clientX = 0, clientY = 0;
      if ('touches' in e) {
        if (e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        }
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const clone = new MouseEvent(e.type, {
        clientX,
        clientY,
        bubbles: false,
        cancelable: true,
      });
      canvas.dispatchEvent(clone);
    };

    const handleEvent = (e: Event) => forwardEvent(e as any);

    window.addEventListener('mousemove', handleEvent, { passive: true });
    window.addEventListener('mousedown', handleEvent);
    window.addEventListener('mouseup', handleEvent);
    window.addEventListener('touchstart', handleEvent, { passive: true });
    window.addEventListener('touchmove', handleEvent, { passive: true });
    window.addEventListener('touchend', handleEvent);

    return () => {
      window.removeEventListener('mousemove', handleEvent);
      window.removeEventListener('mousedown', handleEvent);
      window.removeEventListener('mouseup', handleEvent);
      window.removeEventListener('touchstart', handleEvent);
      window.removeEventListener('touchmove', handleEvent);
      window.removeEventListener('touchend', handleEvent);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        willChange: 'contents',
      }}
    />
  );
};
