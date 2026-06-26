import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CustomCursor } from './components/CustomCursor';
import { CursorTrail } from './components/CursorTrail';
import { ThemeToggle } from './components/ThemeToggle';
import { HeroSection } from './components/HeroSection';
import { ProjectGallery } from './components/ProjectGallery';
import { NoiseOverlay } from './components/NoiseOverlay';
import { InfiniteMarquee } from './components/InfiniteMarquee';
import { BackgroundBlobs } from './components/BackgroundBlobs';

function App() {
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;
    
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        const y = window.scrollY;
        const h = window.innerHeight;
        
        // Only apply snapping when between the hero and the second section
        if (y > 10 && y < h - 10) {
          if (y > h * 0.6) {
            // Scrolled past 60%, snap down to the second section
            window.scrollTo({ top: h, behavior: 'smooth' });
          } else {
            // Snap back up to the top
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }, 150); // wait 150ms after scroll stops
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <>
      <NoiseOverlay />
      <BackgroundBlobs />
      
      <CursorTrail />
      <CustomCursor />
      <ThemeToggle />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="container"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 0,
        }}
      >
        <HeroSection />
      </motion.main>
      
      <div 
        style={{ 
          position: 'relative', 
          zIndex: 10, 
          backgroundColor: 'var(--bg-color)',
          boxShadow: '0 -20px 40px rgba(0,0,0,0.1)',
        }}
      >
        <InfiniteMarquee />
        
        <main className="container-fluid" style={{ paddingTop: '2rem' }}>
          <ProjectGallery />
        </main>

        <footer style={{
          textAlign: 'center',
          padding: '2rem 0',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--glass-border)',
          marginTop: '4rem',
          position: 'relative',
          zIndex: 1,
        }}>
          <p>&copy; {new Date().getFullYear()} Sankalp. Designed with custom glassmorphism & framer motion.</p>
        </footer>
      </div>
    </>
  );
}

export default App;
