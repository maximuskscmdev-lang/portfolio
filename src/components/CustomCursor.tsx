import React, { useEffect, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number | null = null;
    let curX = 0, curY = 0;

    const moveCursor = (e: MouseEvent) => {
      curX = e.clientX;
      curY = e.clientY;

      // Use rAF to batch DOM writes — avoids layout thrashing on every mousemove
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          if (cursorRef.current) {
            cursorRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;
          }
          rafId = null;
        });
      }
    };

    window.addEventListener('mousemove', moveCursor, { passive: true });

    // Add hovering effect on interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.interactive')
      ) {
        cursorRef.current?.classList.add('hovering');
      }
    };

    const handleMouseOut = () => {
      cursorRef.current?.classList.remove('hovering');
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-pointer" style={{ willChange: 'transform' }}>
      <div className="crosshair-h" />
      <div className="crosshair-v" />
    </div>
  );
};
