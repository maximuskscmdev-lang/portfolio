import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { BookOpen, Code, Smartphone, Rocket, Target, Zap } from 'lucide-react';

const TIMELINE_DATA = [
  {
    year: '2022',
    title: 'The Foundation',
    description: 'Started by building small, focused utilities like Timer Tool and Errtrack. Learning the ropes of UI and state management.',
    icon: <Code size={24} />,
    color: 'var(--accent-1)',
    align: 'left'
  },
  {
    year: '2023',
    title: 'Balancing Exams & Code',
    description: 'Needed a way to manage intense exam preparation. Built Titanos, HabitsJEE, NET Prep, and Proj-JEE to track routines and study efficiently.',
    icon: <BookOpen size={24} />,
    color: 'var(--accent-2)',
    align: 'right'
  },
  {
    year: 'Early 2024',
    title: 'Scaling Up',
    description: 'Ventured into large-scale platforms. Developed Stugenz and Projedu, focusing on robust architecture and scalable web solutions.',
    icon: <Rocket size={24} />,
    color: 'var(--accent-3)',
    align: 'left'
  },
  {
    year: 'Late 2024',
    title: 'Pushing Boundaries',
    description: 'Expanded into rich media and background services. Built a full Video Editor on the web, an Audiobook converter, and the specialized Android app "Listen".',
    icon: <Zap size={24} />,
    color: '#a855f7',
    align: 'right'
  },
  {
    year: '2025',
    title: 'The Masterpiece',
    description: 'Synthesizing everything into HabitQuest: A full-blown React Native app with gamification, AI integration, and social features.',
    icon: <Smartphone size={24} />,
    color: '#ec4899',
    align: 'left'
  },
  {
    year: 'Present',
    title: 'Always Building',
    description: 'Continuously refining Big Tools like Product Scout, Repo Finder, and managing intensive workflows with War Room. The journey never stops.',
    icon: <Target size={24} />,
    color: 'var(--text-color)',
    align: 'right'
  }
];

export const TimelineSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress within this component
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center']
  });

  // Smooth out the scroll progress for the drawing line
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001
  });

  return (
    <section 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        padding: '6rem 0', 
        minHeight: '100vh',
        overflow: 'hidden',
        zIndex: 10
      }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '6rem' }}
        >
          <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }}>
            The <span className="text-gradient">Evolution</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            A timeline of building, failing, learning, and shipping. From tiny scripts to full-blown platforms.
          </p>
        </motion.div>

        <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Center SVG Line that draws itself */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '4px',
            transform: 'translateX(-50%)',
            background: 'var(--glass-border)',
            borderRadius: '2px',
            zIndex: 0,
          }} className="timeline-line-bg" />
          
          <motion.div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '4px',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(to bottom, var(--accent-1), var(--accent-2), #a855f7, #ec4899)',
            borderRadius: '2px',
            zIndex: 1,
            scaleY: smoothProgress,
            transformOrigin: 'top center',
            boxShadow: '0 0 20px var(--accent-1)'
          }} className="timeline-line-active" />

          {/* Timeline Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            {TIMELINE_DATA.map((item, index) => {
              const isLeft = index % 2 === 0;
              
              return (
                <TimelineNode 
                  key={index} 
                  item={item} 
                  isLeft={isLeft} 
                  index={index}
                />
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

const TimelineNode: React.FC<{ item: any, isLeft: boolean, index: number }> = ({ item, isLeft, index }) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Parallax effect for each node based on scroll
  const { scrollYProgress } = useScroll({
    target: nodeRef,
    offset: ['start end', 'end start']
  });
  
  const yOffset = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div 
      ref={nodeRef}
      style={{ 
        display: 'flex', 
        justifyContent: isLeft ? 'flex-start' : 'flex-end',
        width: '100%',
        position: 'relative',
        y: yOffset,
        opacity: opacity
      }}
      className={`timeline-node ${isLeft ? 'left-node' : 'right-node'}`}
    >
      {/* The glowing dot on the timeline */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ delay: 0.2, type: 'spring' }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'var(--bg-color)',
          border: `4px solid ${item.color}`,
          zIndex: 5,
          boxShadow: `0 0 15px ${item.color}80`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        className="timeline-dot"
      >
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
      </motion.div>

      {/* The Content Card */}
      <motion.div
        initial={{ x: isLeft ? -50 : 50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ 
          type: 'spring', 
          stiffness: 100, 
          damping: 20, 
          delay: 0.1 
        }}
        whileHover={{ 
          scale: 1.02, 
          y: -5,
          boxShadow: `0 15px 35px ${item.color}20` 
        }}
        className="glass interactive"
        style={{
          width: 'calc(50% - 40px)', // 50% minus padding for the center line
          padding: '2rem',
          borderRadius: '1.5rem',
          borderLeft: isLeft ? `4px solid ${item.color}` : '1px solid var(--glass-border)',
          borderRight: !isLeft ? `4px solid ${item.color}` : '1px solid var(--glass-border)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Ambient background glow inside card */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: isLeft ? '-20%' : 'auto',
          left: !isLeft ? '-20%' : 'auto',
          width: '150px',
          height: '150px',
          background: item.color,
          filter: 'blur(80px)',
          opacity: 0.15,
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '1rem', 
              background: `${item.color}15`, 
              color: item.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {item.icon}
            </div>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: item.color, letterSpacing: '2px', textTransform: 'uppercase' }}>
                {item.year}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{item.title}</h3>
            </div>
          </div>
          
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem' }}>
            {item.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// We add a tiny bit of CSS to make it responsive on mobile
const styles = `
@media (max-width: 768px) {
  .timeline-line-bg, .timeline-line-active {
    left: 20px !important;
  }
  .timeline-dot {
    left: 20px !important;
  }
  .timeline-node {
    justify-content: flex-end !important;
  }
  .timeline-node > .glass {
    width: calc(100% - 60px) !important;
    border-left: 4px solid var(--accent-1) !important;
    border-right: 1px solid var(--glass-border) !important;
  }
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
