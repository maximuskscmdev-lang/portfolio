/**
 * HeroSection.tsx
 * ================
 *
 * PURPOSE:
 * Renders the full-screen hero section with a real-time physics-based chain simulation
 * AND an interactive editor mode for repositioning anchor points and tuning chain params.
 *
 * KEY FEATURES:
 * - Canvas-based rendering: Portrait image + verlet-physics chains at 60fps.
 * - Chain Links: Uses 'chain-link.png' to render realistic segments.
 * - Verlet integration physics: Chains of particles with gravity and mouse repulsion.
 * - Editor mode (press E): Drag anchor points, adjust segment length, and configure 
 *   segment counts for EACH chain independently.
 * - Auto-save: Changes are POSTed to /api/save-hero-config.
 *
 * PHYSICS CONSTANTS:
 * - GRAVITY (0.32): Downward acceleration per frame.
 * - DAMPING (0.985): Velocity retention per frame.
 * - CONSTRAINT_ITERATIONS (10): Passes for distance constraint solver.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/* ── Physics constants ─────────────────────────────────────── */
const GRAVITY = 0.32;
const DAMPING = 0.985;
const CONSTRAINT_ITERATIONS = 5;
const MOUSE_RADIUS_FACTOR = 0.12;
const MOUSE_FORCE = 3;

/* ── Source image info ─────────────────────────────────────── */
const IMG_W = 1024;
const IMG_H = 295;

const LETTERS = ['I', 'A', 'M', 'M', 'A', 'X', 'I', 'M', 'U', 'S'];

/* ── Config type & defaults ────────────────────────────────── */
interface HeroConfig {
  fingerTips: { xf: number; yf: number; segments: number }[];
  segLengthFactor: number;
}

const DEFAULT_CONFIG: HeroConfig = {
  fingerTips: [
    { xf: 0.15, yf: 0.5, segments: 6 },
    { xf: 0.22, yf: 0.5, segments: 6 },
    { xf: 0.30, yf: 0.5, segments: 6 },
    { xf: 0.38, yf: 0.5, segments: 6 },
    { xf: 0.45, yf: 0.5, segments: 6 },
    { xf: 0.55, yf: 0.5, segments: 6 },
    { xf: 0.62, yf: 0.5, segments: 6 },
    { xf: 0.70, yf: 0.5, segments: 6 },
    { xf: 0.78, yf: 0.5, segments: 6 },
    { xf: 0.85, yf: 0.5, segments: 6 }
  ],
  segLengthFactor: 0.022,
};

/* ── Types ─────────────────────────────────────────────────── */
interface Particle {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  pinned: boolean;
}

interface PhysicsChain {
  particles: Particle[];
  letter: string;
}

/* ── Component ─────────────────────────────────────────────── */
export const HeroSection: React.FC = () => {
  /* ── React state ─────────────────────────────────────────── */
  const [editMode, setEditMode] = useState(false);
  const [config, setConfig] = useState<HeroConfig>(DEFAULT_CONFIG);
  const [saveStatus, setSaveStatus] = useState('');
  const [editorMinimized, setEditorMinimized] = useState(false);

  /* ── Refs ────────────────────────────────────────────────── */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chainsRef = useRef<PhysicsChain[]>([]);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageLoadedRef = useRef(false);

  const linkImageRef = useRef<HTMLImageElement | null>(null);
  const linkLoadedRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoLoadedRef = useRef(false);
  const hoverStateRef = useRef<'stopped' | 'forward' | 'finished'>('stopped');
  const framesRef = useRef<ImageBitmap[]>([]);
  const frameIndexRef = useRef(0);
  const framesReadyRef = useRef(false);

  const mouseRef = useRef({ x: -9999, y: -9999 });
  const containerRef = useRef<HTMLElement>(null);
  const sleepTimerRef = useRef(60);
  const needsDrawRef = useRef(true);
  const boundsRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const segLenRef = useRef(20);
  const isVisibleRef = useRef(true);

  const configRef = useRef<HeroConfig>(DEFAULT_CONFIG);
  const draggingRef = useRef(-1);
  const editModeRef = useRef(false);
  const initChainsFnRef = useRef<((cw: number, ch: number) => void) | null>(null);
  const fastForwardRef = useRef<(() => void) | null>(null);

  /* Magnetic button */
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);
  const springX = useSpring(motionX, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(motionY, { stiffness: 150, damping: 15, mass: 0.1 });

  /* Sync refs */
  useEffect(() => { editModeRef.current = editMode; }, [editMode]);
  useEffect(() => { configRef.current = config; }, [config]);

  const updateConfig = useCallback((newConfig: HeroConfig) => {
    configRef.current = newConfig;
    setConfig(newConfig);
  }, []);

  const saveConfig = useCallback(async (cfg: HeroConfig) => {
    try {
      const res = await fetch('/api/save-hero-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      if (res.ok) {
        setSaveStatus('✓ Saved');
        setTimeout(() => setSaveStatus(''), 1500);
      } else {
        const data = await res.json();
        setSaveStatus(`✗ ${data.error || 'Save failed'}`);
      }
    } catch {
      setSaveStatus('✗ Server unreachable');
    }
  }, []);

  /* Load config */
  useEffect(() => {
    fetch('/hero-config.json')
      .then((r) => r.json())
      .then((data: Partial<HeroConfig>) => {
        if (data.fingerTips && Array.isArray(data.fingerTips)) {
          // ensure backwards compatibility with old configs
          const tips = data.fingerTips.map(t => ({
            ...t,
            segments: t.segments ?? 6
          }));
          const fullConfig = { ...DEFAULT_CONFIG, ...data, fingerTips: tips };
          updateConfig(fullConfig);
          setTimeout(() => {
            if (initChainsFnRef.current) {
              initChainsFnRef.current(window.innerWidth, window.innerHeight);
            }
          }, 50);
        }
      })
      .catch(() => { });
  }, [updateConfig]);

  /* Keyboard */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'e' || e.key === 'E') {
        setEditMode((m) => !m);
      }
      if (e.key === 'r' || e.key === 'R') {
        if (fastForwardRef.current) {
          fastForwardRef.current();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* ── Canvas setup & physics ──────────────────────────────── */
  useEffect(() => {
    return; // Commented out the physics and the video part as requested
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* Cache values that don't change per-frame */
    let cachedDpr = window.devicePixelRatio || 1;
    let cachedW = window.innerWidth;
    let cachedH = window.innerHeight;

    const video = document.createElement('video');
    video.src = '/hero-hover.mp4';
    video.muted = true;
    video.playsInline = true;
    video.loop = false;
    video.preload = 'auto';
    video.style.position = 'absolute';
    video.style.opacity = '0.000001';
    video.style.pointerEvents = 'none';
    video.style.width = '1px';
    video.style.height = '1px';
    document.body.appendChild(video);

    /* ── Pre-capture every frame into ImageBitmap array ─────── */
    const captureAllFrames = async () => {
      const fps = 30; // assumed frame rate
      const step = 1 / fps;
      const frames: ImageBitmap[] = [];
      const capCanvas = document.createElement('canvas');
      const capCtx = capCanvas.getContext('2d')!;

      // Wait for metadata so we know duration + dimensions
      await new Promise<void>((resolve) => {
        if (video.readyState >= 1) return resolve();
        video.addEventListener('loadedmetadata', () => resolve(), { once: true });
      });

      capCanvas.width = video.videoWidth;
      capCanvas.height = video.videoHeight;
      const duration = video.duration;

      // Seek to each time position and capture the frame
      for (let t = 0; t < duration; t += step) {
        video.currentTime = t;
        await new Promise<void>((resolve) => {
          video.addEventListener('seeked', () => resolve(), { once: true });
        });
        capCtx.clearRect(0, 0, capCanvas.width, capCanvas.height);
        capCtx.drawImage(video, 0, 0);
        const bmp = await createImageBitmap(capCanvas);
        frames.push(bmp);
      }

      // Capture the very last frame
      video.currentTime = duration;
      await new Promise<void>((resolve) => {
        video.addEventListener('seeked', () => resolve(), { once: true });
      });
      capCtx.clearRect(0, 0, capCanvas.width, capCanvas.height);
      capCtx.drawImage(video, 0, 0);
      const lastBmp = await createImageBitmap(capCanvas);
      frames.push(lastBmp);

      framesRef.current = frames;
      frameIndexRef.current = 0;
      framesReadyRef.current = true;
      videoLoadedRef.current = true;
      video.currentTime = 0;
      needsDrawRef.current = true;
      console.log(`[HeroVideo] Pre-captured ${frames.length} frames`);
    };

    video.addEventListener('canplaythrough', () => {
      if (!framesReadyRef.current && !videoLoadedRef.current) {
        captureAllFrames();
      }
    }, { once: true });
    video.load();
    videoRef.current = video;

    /* Load images */
    const img = new Image();
    img.src = '/hero-bg.png';
    img.onload = () => {
      imageRef.current = img;
      imageLoadedRef.current = true;
    };

    const linkImg = new Image();
    linkImg.src = '/chain-thread.png';
    linkImg.onload = () => {
      linkImageRef.current = linkImg;
      linkLoadedRef.current = true;
    };

    const calcBounds = (cw: number, ch: number) => {
      const imgAspect = IMG_W / IMG_H;
      const cvAspect = cw / ch;
      let rw: number, rh: number, ox: number, oy: number;
      if (cvAspect > imgAspect) {
        rh = ch; rw = ch * imgAspect;
        ox = (cw - rw) / 2; oy = 0;
      } else {
        rw = cw; rh = cw / imgAspect;
        ox = 0; oy = (ch - rh) / 2;
      }

      // Scale down the entire assembly so it's not massive
      const scaleFactor = 0.65;
      const finalW = rw * scaleFactor;
      const finalH = rh * scaleFactor;
      const finalX = ox + (rw - finalW) / 2;
      const finalY = oy + (rh - finalH) / 2;

      return { x: finalX, y: finalY, w: finalW, h: finalH };
    };

    const initChains = (cw: number, ch: number) => {
      sleepTimerRef.current = 60;
      needsDrawRef.current = true;
      const b = calcBounds(cw, ch);
      boundsRef.current = b;
      const cfg = configRef.current;
      const segLen = b.h * cfg.segLengthFactor;
      segLenRef.current = segLen;

      chainsRef.current = cfg.fingerTips.map((tip, i) => {
        const ax = b.x + tip.xf * b.w;
        const ay = b.y + tip.yf * b.h;
        const particles: Particle[] = [];
        const segs = tip.segments ?? 6;
        for (let j = 0; j <= segs; j++) {
          particles.push({
            x: ax,
            y: ay + j * segLen,
            oldX: ax,
            oldY: ay + j * segLen,
            pinned: j === 0,
          });
        }
        return { particles, letter: LETTERS[i] || '?' };
      });
    };
    initChainsFnRef.current = initChains;

    const handleResize = () => {
      sleepTimerRef.current = 60;
      needsDrawRef.current = true;
      cachedDpr = window.devicePixelRatio || 1;
      cachedW = window.innerWidth;
      cachedH = window.innerHeight;
      canvas.width = cachedW * cachedDpr;
      canvas.height = cachedH * cachedDpr;
      canvas.style.width = cachedW + 'px';
      canvas.style.height = cachedH + 'px';
      initChains(cachedW, cachedH);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    /* Throttle mousemove to ~60fps to avoid firehosing */
    let lastMouseMove = 0;
    const onMouseMove = (e: MouseEvent) => {
      // Skip all processing when hero is not in view
      if (!isVisibleRef.current) return;

      const now = performance.now();
      if (now - lastMouseMove < 16) return;
      lastMouseMove = now;
      sleepTimerRef.current = 60;
      needsDrawRef.current = true;

      const b = boundsRef.current;
      const v = videoRef.current;
      let isHovering = false;
      // Let's make the hover zone more forgiving. If video isn't fully loaded, use bounds b
      if (v) {
        const vAspect = (v.videoWidth || 1) / (v.videoHeight || 1);
        const vW = b.w * 0.8;
        const vH = vW / vAspect;
        const vX = b.x + (b.w - vW) / 2;
        const vY = b.y - (vH * 0.6);

        const minX = Math.min(b.x, vX);
        const maxX = Math.max(b.x + b.w, vX + vW);
        const minY = Math.min(b.y, vY);
        const maxY = Math.max(b.y + b.h, vY + vH);

        if (e.clientX >= minX && e.clientX <= maxX && e.clientY >= minY && e.clientY <= maxY) {
          isHovering = true;
        }
      }

      if (isHovering && hoverStateRef.current !== 'forward' && hoverStateRef.current !== 'finished') {
        hoverStateRef.current = 'forward';
        if (videoRef.current && framesReadyRef.current) {
          // Sync video.currentTime to wherever the frame index left off
          const totalFrames = framesRef.current.length;
          const dur = videoRef.current.duration || 1;
          const resumeTime = (frameIndexRef.current / Math.max(1, totalFrames - 1)) * dur;
          videoRef.current.currentTime = resumeTime;
          videoRef.current.playbackRate = 1;
          if (videoRef.current.ended || videoRef.current.currentTime >= dur - 0.05) {
            hoverStateRef.current = 'finished';
          } else {
            videoRef.current.play().catch(e => console.error("Play error:", e));
          }
        }
      }
      if (draggingRef.current >= 0 && editModeRef.current) {
        const chain = chainsRef.current[draggingRef.current];
        if (chain) {
          const p = chain.particles[0];
          p.x = e.clientX;
          p.y = e.clientY;
          p.oldX = e.clientX;
          p.oldY = e.clientY;
          const b = boundsRef.current;
          const xf = Math.max(0, Math.min(1, (e.clientX - b.x) / b.w));
          const yf = Math.max(0, Math.min(1, (e.clientY - b.y) / b.h));
          const newTips = [...configRef.current.fingerTips];
          newTips[draggingRef.current] = { ...newTips[draggingRef.current], xf, yf };
          const newConfig = { ...configRef.current, fingerTips: newTips };
          configRef.current = newConfig;
          setConfig(newConfig);
        }
        return;
      }
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isVisibleRef.current) return;
      sleepTimerRef.current = 60;
      needsDrawRef.current = true;
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
      }
    };
    const onPointerLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('mouseleave', onPointerLeave);

    const onMouseDown = (e: MouseEvent) => {
      if (!editModeRef.current) return;
      const hitRadius = 20;
      for (let i = 0; i < chainsRef.current.length; i++) {
        const p = chainsRef.current[i].particles[0];
        const dx = e.clientX - p.x;
        const dy = e.clientY - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < hitRadius) {
          draggingRef.current = i;
          mouseRef.current.x = -9999;
          mouseRef.current.y = -9999;
          e.preventDefault();
          return;
        }
      }
    };

    const onMouseUp = () => {
      if (draggingRef.current >= 0) {
        saveConfigFromRef();
        draggingRef.current = -1;
      }
    };
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    const saveConfigFromRef = () => {
      fetch('/api/save-hero-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configRef.current),
      })
        .then((r) => {
          if (r.ok) {
            setSaveStatus('✓ Auto-saved');
            setTimeout(() => setSaveStatus(''), 1500);
          }
        })
        .catch(() => { });
    };

    const simulate = () => {
      if (sleepTimerRef.current <= 0) return;

      const segLen = segLenRef.current;
      const mRadius = boundsRef.current.h * MOUSE_RADIUS_FACTOR;
      const isDragging = draggingRef.current >= 0;
      let totalMotion = 0;

      for (let ci = 0; ci < chainsRef.current.length; ci++) {
        const chain = chainsRef.current[ci];
        for (let pi = 0; pi < chain.particles.length; pi++) {
          const p = chain.particles[pi];
          if (p.pinned) continue;

          const vx = (p.x - p.oldX) * DAMPING;
          const vy = (p.y - p.oldY) * DAMPING;
          totalMotion += Math.abs(vx) + Math.abs(vy);
          p.oldX = p.x;
          p.oldY = p.y;
          p.x += vx;
          p.y += vy + GRAVITY;

          if (!isDragging) {
            const dx = p.x - mouseRef.current.x;
            const dy = p.y - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mRadius && dist > 0) {
              totalMotion += 10;
              const force = ((mRadius - dist) / mRadius) * MOUSE_FORCE;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }
        }

        for (let iter = 0; iter < CONSTRAINT_ITERATIONS; iter++) {
          for (let i = 0; i < chain.particles.length - 1; i++) {
            const a = chain.particles[i];
            const b = chain.particles[i + 1];
            const ddx = b.x - a.x;
            const ddy = b.y - a.y;
            const d = Math.sqrt(ddx * ddx + ddy * ddy);
            if (d === 0) continue;
            const diff = ((segLen - d) / d) * 0.5;
            const ox = ddx * diff;
            const oy = ddy * diff;
            if (!a.pinned) { a.x -= ox; a.y -= oy; }
            if (!b.pinned) { b.x += ox; b.y += oy; }
          }
        }
      }
      if (totalMotion < 0.5) { sleepTimerRef.current--; } else { sleepTimerRef.current = 60; }
    };

    const fastForward = () => {
      sleepTimerRef.current = 60;
      const oldX = mouseRef.current.x;
      const oldY = mouseRef.current.y;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
      for (let i = 0; i < 400; i++) {
        simulate();
      }
      mouseRef.current.x = oldX;
      mouseRef.current.y = oldY;
      needsDrawRef.current = true;
    };
    fastForwardRef.current = fastForward;

    const draw = () => {
      const dpr = cachedDpr;
      const w = cachedW;
      const h = cachedH;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (imageRef.current && imageLoadedRef.current) {
        const b = boundsRef.current;
        ctx.drawImage(imageRef.current, b.x, b.y, b.w, b.h);
      }

      if (framesReadyRef.current && framesRef.current.length > 0) {
        const b = boundsRef.current;
        const v = videoRef.current;
        const vAspect = (v?.videoWidth || 1) / (v?.videoHeight || 1);
        const vW = b.w * 0.8;
        const vH = vW / vAspect;
        const vX = b.x + (b.w - vW) / 2;
        const vY = b.y - (vH * 0.6); // Match hit detection

        let drawSource: CanvasImageSource;
        if (hoverStateRef.current === 'stopped' || hoverStateRef.current === 'finished') {
          // Use cached frame for idle / finished — perfectly smooth
          const idx = Math.min(frameIndexRef.current, framesRef.current.length - 1);
          drawSource = framesRef.current[idx];
        } else {
          // Forward: use live video (native playback is already smooth)
          drawSource = v!;
          // Keep frame index in sync for seamless handoff
          const dur = v?.duration || 1;
          const totalFrames = framesRef.current.length;
          frameIndexRef.current = Math.round(((v?.currentTime || 0) / dur) * (totalFrames - 1));
        }

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(drawSource, vX, vY, vW, vH);
        ctx.restore();
      }

      const isDark = document.documentElement.dataset.theme === 'dark' || !document.documentElement.dataset.theme;
      const textColor = isDark ? '#f8fafc' : '#0f172a';
      const scale = Math.max(boundsRef.current.h / IMG_H, 0.3);
      const isEditing = editModeRef.current;

      if (isEditing) {
        const b = boundsRef.current;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 80, 80, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.setLineDash([]);
        ctx.restore();
      }

      for (let ci = 0; ci < chainsRef.current.length; ci++) {
        const chain = chainsRef.current[ci];
        const pts = chain.particles;
        if (pts.length < 2) continue;

        /* Draw chain links using png */
        if (linkImageRef.current && linkLoadedRef.current) {
          for (let i = 0; i < pts.length - 1; i++) {
            const p1 = pts[i];
            const p2 = pts[i + 1];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Subtract PI/2 because atan2 is angle from X axis, but link image is vertical
            const angle = Math.atan2(dy, dx) - Math.PI / 2;
            const cx = (p1.x + p2.x) / 2;
            const cy = (p1.y + p2.y) / 2;



            // Adjust size to fit gap slightly overlapping
            const linkH = dist * 1.1;
            const linkW = 5 * scale;

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            ctx.setTransform(cos * dpr, sin * dpr, -sin * dpr, cos * dpr, cx * dpr, cy * dpr);

            ctx.drawImage(linkImageRef.current, -linkW / 2, -linkH / 2, linkW, linkH);
          }
        }

        /* Letter at chain end */
        const last = pts[pts.length - 1];
        const secondLast = pts[pts.length - 2];
        const angle = Math.atan2(last.y - secondLast.y, last.x - secondLast.x) - Math.PI / 2;

        // Adjusted font size to prevent overlapping
        const fontSize = Math.max(24, 50 * scale);

        const cosL = Math.cos(angle);
        const sinL = Math.sin(angle);
        ctx.setTransform(cosL * dpr, sinL * dpr, -sinL * dpr, cosL * dpr, last.x * dpr, (last.y + 10 * scale) * dpr);

        ctx.font = `900 ${fontSize}px 'Outfit', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = textColor;
        ctx.fillText(chain.letter, 0, 0);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        /* Editor handle */
        if (isEditing) {
          const p = pts[0];
          const handleR = 14;
          const isActive = draggingRef.current === ci;

          ctx.beginPath();
          ctx.arc(p.x, p.y, handleR, 0, Math.PI * 2);
          ctx.strokeStyle = isActive ? 'rgba(56, 189, 248, 1)' : 'rgba(56, 189, 248, 0.7)';
          ctx.lineWidth = isActive ? 3 : 2;
          ctx.stroke();
          ctx.fillStyle = isActive ? 'rgba(56, 189, 248, 0.3)' : 'rgba(56, 189, 248, 0.15)';
          ctx.fill();

          ctx.font = 'bold 11px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(chain.letter, p.x, p.y);
        }
      }

      if (isEditing) {
        ctx.save();
        ctx.font = 'bold 13px Outfit, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
        ctx.fillText('EDIT MODE — drag anchor points | press E to exit', w - 16, 16);
        ctx.restore();
      }
    };

    let animFrameId: number | null = null;

    const loop = () => {
      if (!isVisibleRef.current) {
        animFrameId = null;
        return;
      }

      if (hoverStateRef.current === 'forward' && videoRef.current) {
        const dur = videoRef.current.duration || 1;
        const totalFrames = framesRef.current.length;
        if (videoRef.current.currentTime >= dur - 0.05) {
          videoRef.current.pause();
          videoRef.current.currentTime = dur - 0.05;
          frameIndexRef.current = totalFrames - 1;
          hoverStateRef.current = 'finished';
          needsDrawRef.current = true;
        } else if (!videoRef.current.paused && !videoRef.current.ended) {
          needsDrawRef.current = true;
        }
      }

      if (sleepTimerRef.current > 0) {
        simulate();
        needsDrawRef.current = true;
      }

      if (needsDrawRef.current || editModeRef.current) {
        draw();
        needsDrawRef.current = false;
      }

      animFrameId = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver((entries) => {
      const nowVisible = entries[0].isIntersecting;
      isVisibleRef.current = nowVisible;

      if (nowVisible) {
        // Resuming — restart the animation loop
        needsDrawRef.current = true;
        sleepTimerRef.current = 60;
        if (!animFrameId) animFrameId = requestAnimationFrame(loop);
      } else {
        // Leaving view — fully stop all processing
        if (animFrameId) {
          cancelAnimationFrame(animFrameId);
          animFrameId = null;
        }
        // Pause video playback
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
        }
        // Reset hover state if it was playing, but keep it finished if it's done
        if (hoverStateRef.current === 'forward') {
          hoverStateRef.current = 'stopped';
        }
        // Park the mouse so chains don't react to a stale position
        mouseRef.current.x = -9999;
        mouseRef.current.y = -9999;
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (containerRef.current) observer.unobserve(containerRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('mouseleave', onPointerLeave);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      if (videoRef.current && videoRef.current.parentNode) {
        videoRef.current.parentNode.removeChild(videoRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Editor Handlers ─────────────────────────────────────── */
  const handleChainSegmentChange = useCallback(
    (index: number, value: number) => {
      const newTips = [...configRef.current.fingerTips];
      newTips[index] = { ...newTips[index], segments: value };
      const newConfig = { ...configRef.current, fingerTips: newTips };
      updateConfig(newConfig);
      saveConfig(newConfig);
      if (initChainsFnRef.current) {
        initChainsFnRef.current(window.innerWidth, window.innerHeight);
      }
    },
    [updateConfig, saveConfig]
  );

  const handleSegLengthChange = useCallback(
    (value: number) => {
      const newConfig = { ...configRef.current, segLengthFactor: value };
      updateConfig(newConfig);
      saveConfig(newConfig);
      if (initChainsFnRef.current) {
        initChainsFnRef.current(window.innerWidth, window.innerHeight);
      }
    },
    [updateConfig, saveConfig]
  );

  /* ── Magnetic button ─────────────────────────────────────── */
  const handleButtonMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    motionX.set((e.clientX - (rect.left + rect.width / 2)) * 0.2);
    motionY.set((e.clientY - (rect.top + rect.height / 2)) * 0.2);
  };
  const handleButtonMouseLeave = () => {
    motionX.set(0);
    motionY.set(0);
  };

  /* ── Styles ──────────────────────────────────────────────── */
  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: 40,
    right: 16,
    zIndex: 10000,
    background: 'rgba(15, 23, 42, 0.92)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: 12,
    padding: '16px 20px',
    color: '#e2e8f0',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 13,
    minWidth: 320,
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    pointerEvents: 'auto',
  };

  const sliderStyle: React.CSSProperties = {
    width: '100%',
    accentColor: '#38bdf8',
    cursor: 'pointer',
  };

  return (
    <>
      {/* 
      <section
        ref={containerRef}
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
          marginLeft: 'calc(-50vw + 50%)',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            willChange: 'contents',
            cursor: editMode ? 'crosshair' : 'none',
          }}
        />
      </section>
      */}

      {editMode && (
        <motion.div
          drag
          dragMomentum={false}
          style={panelStyle}
          className="hide-scrollbar"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editorMinimized ? 0 : 16, cursor: 'grab' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: 15 }}>🎮 Chain Editor</span>
              {saveStatus && (
                <span style={{ fontSize: 11, color: saveStatus.startsWith('✓') ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                  {saveStatus}
                </span>
              )}
            </div>
            <button
              onClick={() => setEditorMinimized(!editorMinimized)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
                padding: '0 4px',
                fontWeight: 'bold',
              }}
              title={editorMinimized ? "Maximize" : "Minimize"}
            >
              {editorMinimized ? '+' : '−'}
            </button>
          </div>

          {!editorMinimized && (
            <>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Individual Chains
                </div>

                {config.fingerTips.map((tip, i) => (
                  <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#38bdf8', fontWeight: 900, fontSize: 16, width: 20 }}>{LETTERS[i]}</span>
                        <span style={{ color: '#cbd5e1', fontSize: 11, fontFamily: 'monospace' }}>
                          x:{tip.xf.toFixed(3)} y:{tip.yf.toFixed(3)}
                        </span>
                      </div>
                      <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {tip.segments ?? 6} segs
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      step={1}
                      value={tip.segments ?? 6}
                      onChange={(e) => handleChainSegmentChange(i, Number(e.target.value))}
                      style={sliderStyle}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, color: '#94a3b8' }}>Global Segment Length</label>
                  <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{config.segLengthFactor.toFixed(4)}</span>
                </div>
                <input
                  type="range"
                  min={0.001}
                  max={0.06}
                  step={0.001}
                  value={config.segLengthFactor}
                  onChange={(e) => handleSegLengthChange(Number(e.target.value))}
                  style={sliderStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => saveConfig(config)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    borderRadius: 8,
                    color: '#38bdf8',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = 'rgba(56, 189, 248, 0.25)')}
                  onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = 'rgba(56, 189, 248, 0.15)')}
                >
                  💾 Force Save
                </button>
                <button
                  onClick={() => {
                    if (fastForwardRef.current) {
                      fastForwardRef.current();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    background: 'rgba(248, 113, 113, 0.15)',
                    border: '1px solid rgba(248, 113, 113, 0.4)',
                    borderRadius: 8,
                    color: '#f87171',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = 'rgba(248, 113, 113, 0.25)')}
                  onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = 'rgba(248, 113, 113, 0.15)')}
                >
                  ⏹ Stop Motion
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}

      <section
        style={{
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '4rem',
          alignItems: 'center',
          padding: '4rem 5%',
          position: 'relative',
          zIndex: 1,
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Crafting <br />
            <span className="text-gradient">Digital Experiences</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
              color: 'var(--text-muted)',
              maxWidth: '540px',
              marginBottom: '2.5rem',
              lineHeight: 1.7,
              fontWeight: 400,
            }}
          >
            I am a software engineer specializing in large-scale platforms,
            specialized Android apps, and aesthetic tools. Explore my portfolio of
            13 unique projects.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ display: 'flex', gap: '1rem' }}
          >
            <motion.a
              ref={buttonRef}
              href="#projects"
              className="glass interactive"
              style={{
                padding: '0.875rem 2rem',
                borderRadius: '2rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                x: springX,
                y: springY,
                fontSize: '0.95rem',
                letterSpacing: '0.01em',
              }}
              onMouseMove={handleButtonMouseMove}
              onMouseLeave={handleButtonMouseLeave}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Projects
            </motion.a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Placeholder for portrait */}
          <div
            style={{
              width: '100%',
              maxWidth: '450px',
              aspectRatio: '4/5',
              borderRadius: '24px',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              fontSize: '1rem',
              fontWeight: 500,
              letterSpacing: '0.05em',
            }}
          >
            [ YOUR PORTRAIT HERE ]
          </div>
        </motion.div>
      </section>
    </>
  );
};
