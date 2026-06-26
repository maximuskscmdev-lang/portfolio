import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '../data/projects';
import { X, ExternalLink, GitBranch } from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(20px)',
            background: 'var(--glass-bg)',
            padding: '2rem',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              width: '100%',
              maxWidth: '1000px',
              maxHeight: '90vh',
              background: 'var(--bg-color)',
              borderRadius: '2rem',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid var(--glass-border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image Placeholder */}
            <div style={{
              width: '100%',
              height: '300px',
              background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
               <h2 style={{ fontSize: '4rem', color: '#fff', fontWeight: 800, opacity: 0.8 }}>
                 {project.title} Mockup
               </h2>
               <button
                  onClick={onClose}
                  className="interactive"
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'none',
                  }}
               >
                 <X size={24} />
               </button>
            </div>

            {/* Content */}
            <div style={{ padding: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: 800 }}>{project.title}</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a href="#" className="interactive" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><GitBranch size={20} /> Repo</a>
                  <a href="#" className="interactive" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--accent-1)' }}><ExternalLink size={20} /> Live</a>
                </div>
              </div>

              <p style={{ fontSize: '1.2rem', lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: '2rem' }}>
                {project.description} 
                <br/><br/>
                This is a detailed view of {project.title}. Here you can place larger screenshots, talk about the architecture, the challenges faced, and the specific role you played in developing this project. 
              </p>

              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Technologies Used</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {project.tags.map(tag => (
                  <span key={tag} style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    background: 'var(--selection-bg)',
                    color: 'var(--accent-1)',
                    fontWeight: 600,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Additional Mockup grid placeholder */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem' }}>
                 <div style={{ height: '200px', background: 'var(--glass-bg)', borderRadius: '1rem', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mockup 1</span>
                 </div>
                 <div style={{ height: '200px', background: 'var(--glass-bg)', borderRadius: '1rem', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mockup 2</span>
                 </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
