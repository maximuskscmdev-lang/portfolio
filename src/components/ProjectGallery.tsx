import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '../data/projects';
import type { ProjectCategory, Project } from '../data/projects';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';

const CATEGORIES: ('All' | ProjectCategory)[] = [
  'All',
  'Main Showcase',
  'Large Scale',
  'JEE Prep',
  'Big Tools',
  'Small Tools',
  'Specialized Android'
];

export const ProjectGallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'All' | ProjectCategory>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    let list = projects;
    if (activeCategory === 'Main Showcase') {
      list = projects.filter(p => p.isMainShowcase);
    } else if (activeCategory !== 'All') {
      list = projects.filter(p => p.category === activeCategory);
    }
    
    if (activeCategory === 'All') {
      return [...list].sort((a, b) => (b.isMainShowcase ? 1 : 0) - (a.isMainShowcase ? 1 : 0));
    }
    return list;
  }, [activeCategory]);

  return (
    <>
      <section id="projects" style={{ padding: '4rem 0', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2rem' }}
        >
          All <span className="text-gradient">Works</span>
        </motion.h2>
        
        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '3rem',
          }}
        >
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className="glass interactive"
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '2rem',
                border: 'none',
                fontWeight: 600,
                color: activeCategory === category ? 'var(--bg-color)' : 'var(--text-color)',
                background: activeCategory === category ? 'var(--text-color)' : 'var(--glass-bg)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                 if (activeCategory !== category) {
                   (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                 }
              }}
              onMouseLeave={e => {
                 (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeCategory}
            layout
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            exit="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="bento-grid"
          >
          {(() => {
            let mainCount = 0;
            return filteredProjects.map((project, index) => {
              let spanClass = 'bento-item-span-1x1';
              
              if (project.isMainShowcase) {
                 if (mainCount === 0) {
                   spanClass = 'bento-item-span-2x2'; // First one is the hero
                 } else if (mainCount === 1) {
                   spanClass = 'bento-item-span-2x1'; // Second one is wide
                 } else {
                   spanClass = 'bento-item-span-1x2'; // Third one is tall
                 }
                 mainCount++;
              } else if (project.category === 'Large Scale' || project.category === 'Big Tools') {
                 spanClass = 'bento-item-span-2x1';
              } else {
                 const pattern = index % 5;
                 if (pattern === 0) spanClass = 'bento-item-span-1x2';
                 else if (pattern === 3) spanClass = 'bento-item-span-2x1';
                 else spanClass = 'bento-item-span-1x1';
              }

            return (
              <ProjectCard 
                key={project.id} 
                project={project} 
                className={spanClass}
                onClick={(p) => {
                   if(p.isMainShowcase) setSelectedProject(p);
                }} 
              />
            );
            });
          })()}
        </motion.div>
        </AnimatePresence>
      </section>

      {/* Project Modal */}
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
};
