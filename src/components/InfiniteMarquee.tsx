import React from 'react';
import { motion } from 'framer-motion';

export const InfiniteMarquee: React.FC = () => {
  const text = "SOFTWARE ENGINEER • UI/UX DESIGNER • CREATOR • ANDROID DEV • ";
  
  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid var(--glass-border)',
      borderBottom: '1px solid var(--glass-border)',
      color: 'var(--text-color)',
      padding: '0.8rem 0',
      position: 'relative',
      margin: '4rem 0',
      zIndex: 10,
    }}>
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 20
        }}
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          width: 'fit-content',
        }}
      >
        <span style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.1em', paddingRight: '2rem', opacity: 0.8 }}>{text}</span>
        <span style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.1em', paddingRight: '2rem', opacity: 0.8 }}>{text}</span>
        <span style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.1em', paddingRight: '2rem', opacity: 0.8 }}>{text}</span>
        <span style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.1em', paddingRight: '2rem', opacity: 0.8 }}>{text}</span>
      </motion.div>
    </div>
  );
};
