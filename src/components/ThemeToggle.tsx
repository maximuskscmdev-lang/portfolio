import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="glass"
      style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        zIndex: 100,
        color: 'var(--text-color)',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
        document.querySelector('.custom-pointer')?.classList.add('hovering');
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        document.querySelector('.custom-pointer')?.classList.remove('hovering');
      }}
    >
      {isDark ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
};
