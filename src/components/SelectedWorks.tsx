import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { projects } from '../data/projects';
import { ExternalLink, GitBranch, Play, Smartphone, Monitor, Code } from 'lucide-react';

const FEATURED_IDS = ['Habit-Quest', 'stugenz-final', 'video-editor', 'NET_prep', 'RepoFinder'];

// Helper to get an icon based on category/tags
const getProjectIcon = (tags: string[]) => {
  if (tags.includes('Android') || tags.includes('React Native')) return <Smartphone size={80} strokeWidth={1} />;
  if (tags.includes('Video') || tags.includes('Media')) return <Play size={80} strokeWidth={1} />;
  if (tags.includes('Web') || tags.includes('Platform')) return <Monitor size={80} strokeWidth={1} />;
  return <Code size={80} strokeWidth={1} />;
};

export const SelectedWorks: React.FC = () => {
  // Filter and order the projects based on FEATURED_IDS
  const featuredProjects = FEATURED_IDS.map(id => projects.find(p => p.id === id)).filter(Boolean);

  return (
    <div style={{ position: 'relative', width: '100%', zIndex: 20 }}>
      {featuredProjects.map((project, index) => {
        if (!project) return null;
        return (
          <FeaturedProjectSection 
            key={project.id} 
            project={project} 
            index={index} 
          />
        );
      })}
    </div>
  );
};

interface SectionProps {
  project: any;
  index: number;
}

const FeaturedProjectSection: React.FC<SectionProps> = ({ project, index }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isEven = index % 2 === 0;

  // We use useScroll to track when this specific section is sticking to the top
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"] // tracks the journey from bottom of screen to top
  });

  // Parallax effects for the media placeholder
  const yImage = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  
  // Parallax for text
  const yText = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacityText = useTransform(scrollYProgress, [0.5, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: '100%',
        zIndex: 20 + index, // Incremental zIndex ensures the curtain reveal effect
        backgroundColor: 'var(--bg-color)', // Solid background to cover previous section
        borderTop: '1px solid var(--glass-border)',
        boxShadow: '0 -20px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Background Blob for this specific section */}
      <div style={{
        position: 'absolute',
        top: isEven ? '-10%' : '50%',
        left: isEven ? '-10%' : '60%',
        width: '60vw',
        height: '60vw',
        background: isEven ? 'var(--accent-1)' : 'var(--accent-2)',
        opacity: 0.05,
        filter: 'blur(150px)',
        borderRadius: '50%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: isEven ? 'row' : 'row-reverse', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%',
          gap: '4rem'
        }}>
          
          {/* Media Area (Placeholder for Mockups/Videos) */}
          <motion.div 
            style={{ 
              flex: '1.2', // takes up ~60% of the space
              height: '70vh',
              y: yImage,
              scale: scaleImage,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
             <div className="glass interactive" style={{
                width: '100%',
                height: '100%',
                borderRadius: '2rem',
                border: '1px solid var(--glass-border)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                overflow: 'hidden'
             }}>
                {/* Decorative wireframe elements inside placeholder */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, backgroundImage: 'linear-gradient(var(--text-color) 1px, transparent 1px), linear-gradient(90deg, var(--text-color) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ amount: 0.8 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  style={{ color: 'var(--text-muted)' }}
                >
                  {getProjectIcon(project.tags)}
                </motion.div>

                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.8 }}
                  transition={{ delay: 0.4 }}
                  style={{ marginTop: '2rem', fontSize: '1.5rem', color: 'var(--text-muted)', letterSpacing: '0.2rem', textTransform: 'uppercase' }}
                >
                  Media Placeholder
                </motion.h3>
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)', opacity: 0.6 }}>Replace with actual mockup/video</p>
             </div>
          </motion.div>

          {/* Text & Content Area */}
          <motion.div 
            style={{ 
              flex: '0.8', 
              y: yText,
              opacity: opacityText,
              padding: '2rem 0'
            }}
          >
             <motion.span 
               initial={{ opacity: 0, x: isEven ? -20 : 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ amount: 0.8 }}
               transition={{ delay: 0.2 }}
               style={{ color: 'var(--accent-1)', fontWeight: 700, letterSpacing: '0.15rem', textTransform: 'uppercase' }}
             >
               Featured Project 0{index + 1}
             </motion.span>

             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ amount: 0.8 }}
               transition={{ delay: 0.3 }}
               style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.1, marginTop: '1rem', marginBottom: '2rem' }}
             >
               {project.title}
             </motion.h2>

             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ amount: 0.8 }}
               transition={{ delay: 0.4 }}
               style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '2rem' }}
             >
               {project.tags.map((tag: string) => (
                 <span key={tag} style={{
                   padding: '0.5rem 1rem',
                   borderRadius: '2rem',
                   background: 'var(--selection-bg)',
                   color: 'var(--text-color)',
                   fontWeight: 600,
                   fontSize: '0.9rem'
                 }}>
                   {tag}
                 </span>
               ))}
             </motion.div>

             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ amount: 0.8 }}
               transition={{ delay: 0.5 }}
               style={{ fontSize: '1.25rem', lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: '3rem' }}
             >
               {project.description}
             </motion.p>

             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ amount: 0.8 }}
               transition={{ delay: 0.6 }}
               style={{ display: 'flex', gap: '1.5rem' }}
             >
               {project.githubUrl && (
                 <a href={project.githubUrl} target="_blank" rel="noreferrer" className="glass interactive" style={{
                   padding: '1rem 2rem',
                   borderRadius: '3rem',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.8rem',
                   fontWeight: 700,
                   transition: 'all 0.3s ease',
                 }}>
                   <GitBranch size={20} /> View Source
                 </a>
               )}
               <a href="#" className="interactive" style={{
                 padding: '1rem 2rem',
                 borderRadius: '3rem',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '0.8rem',
                 fontWeight: 700,
                 background: 'var(--text-color)',
                 color: 'var(--bg-color)',
                 transition: 'all 0.3s ease',
               }}>
                 <ExternalLink size={20} /> Live Demo
               </a>
             </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};
