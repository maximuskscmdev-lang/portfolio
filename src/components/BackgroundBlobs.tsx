import React, { useEffect, useCallback } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

export const BackgroundBlobs: React.FC = () => {
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  useEffect(() => {
    // Throttle to ~30fps — blobs are slow-moving, no need for 60fps tracking
    let lastUpdate = 0;
    const throttledMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastUpdate < 33) return; // ~30fps
      lastUpdate = now;
      handleMouseMove(e);
    };

    window.addEventListener('mousemove', throttledMove, { passive: true });
    return () => window.removeEventListener('mousemove', throttledMove);
  }, [handleMouseMove]);

  // Use smooth springs to give the blobs a slow, liquid feel when following the mouse
  const springX = useSpring(mouseX, { stiffness: 20, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 20, damping: 20 });

  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Blob 1 moves significantly opposite to the mouse
  const xOffset1 = useTransform(springX, [0, windowWidth], [250, -250]);
  const yOffset1 = useTransform(springY, [0, windowHeight], [250, -250]);
  
  // Blob 2 moves with the mouse significantly
  const xOffset2 = useTransform(springX, [0, windowWidth], [-350, 350]);
  const yOffset2 = useTransform(springY, [0, windowHeight], [-350, 350]);

  return (
    <div className="bg-blobs">
      <motion.div 
        className="blob blob-1"
        style={{
          x: xOffset1,
          y: yOffset1,
          willChange: 'transform',
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="blob blob-2"
        style={{
          x: xOffset2,
          y: yOffset2,
          willChange: 'transform',
        }}
        animate={{
          scale: [1, 1.4, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};
