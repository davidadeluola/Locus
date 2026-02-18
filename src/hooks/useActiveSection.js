import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to track which section is currently in view
 * Returns the id of the active section
 */
export const useActiveSection = () => {
  const [activeSection, setActiveSection] = useState('home');
  const ticking = useRef(false);

  useEffect(() => {
    const sections = [
      { id: 'home', element: document.getElementById('home') },
      { id: 'how-it-works', element: document.getElementById('how-it-works') },
      { id: 'features', element: document.getElementById('features') },
      { id: 'faqs', element: document.getElementById('faqs') },
    ];

    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 100;

          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            if (section.element) {
              const rect = section.element.getBoundingClientRect();
              const sectionTop = rect.top + window.scrollY;

              if (scrollPosition >= sectionTop) {
                setActiveSection(section.id);
                break;
              }
            }
          }
          ticking.current = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return activeSection;
};
