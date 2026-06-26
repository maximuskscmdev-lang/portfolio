import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { Project } from '../data/projects';
import { ExternalLink, GitBranch, ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = React.memo(({ project, onClick, className = '' }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      layoutId={`card-container-${project.id}`}
      className={className}
      style={{
        perspective: 1000,
        height: '100%',
        cursor: 'none',
      }}
      whileHover={{ zIndex: 50 }}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
      }}
      onClick={() => onClick(project)}
    >
      <motion.div
        className="glass interactive"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          padding: '2rem',
          borderRadius: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          height: '100%',
          boxShadow: '0 4px 30px var(--glass-shadow)',
          willChange: 'transform',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transform: "translateZ(30px)" }}>
          <motion.h3 layoutId={`title-${project.id}`} style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {project.title}
          </motion.h3>
          <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
            <a href="#" className="interactive" style={{ opacity: 0.6, transition: 'opacity 0.2s' }} onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}><GitBranch size={20} /></a>
            <a href="#" className="interactive" style={{ opacity: 0.6, transition: 'opacity 0.2s' }} onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}><ExternalLink size={20} /></a>
          </div>
        </div>
        
        <p style={{ color: 'var(--text-muted)', flex: 1, lineHeight: 1.6, transform: "translateZ(20px)" }}>
          {project.description}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', transform: "translateZ(40px)" }}>
          {project.tags.map(tag => (
            <span key={tag} style={{
              fontSize: '0.8rem',
              padding: '0.3rem 0.8rem',
              borderRadius: '1rem',
              backgroundColor: 'var(--selection-bg)',
              color: 'var(--accent-1)',
              fontWeight: 600,
            }}>
              {tag}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', transform: "translateZ(50px)" }}>
          <button 
            className="interactive"
            onClick={(e) => {
              e.stopPropagation();
              onClick(project);
            }}
            style={{
              width: '100%',
              padding: '0.8rem 1.5rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 15px var(--glass-shadow)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Experience the Journey <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});

ProjectCard.displayName = 'ProjectCard';
