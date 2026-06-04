import { useEffect, useRef, useState } from 'react';

/**
 * Hook para parallax del hero.
 * Mueve el background a una velocidad diferente al hacer scroll.
 * Solo activo en desktop (desactiva en móvil por performance).
 */
export function useParallax(speed: number = 0.4) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Desactivar en móvil
    if (window.innerWidth < 768) return;

    const handleScroll = () => {
      const el = ref.current;
      if (!el) return;
      const scrollY = window.scrollY;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return ref;
}

/**
 * Hook para navbar inteligente.
 * Se esconde al hacer scroll hacia abajo, aparece al subir.
 */
export function useSmartNavbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY.current;
      const pastThreshold = currentScrollY > 80;

      setIsAtTop(currentScrollY < 10);

      if (pastThreshold) {
        setIsVisible(!scrollingDown);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { isVisible, isAtTop };
}
