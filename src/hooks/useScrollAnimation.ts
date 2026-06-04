import { useEffect, useRef } from 'react';

/**
 * Custom hook para animar elementos cuando entran al viewport.
 * Usa IntersectionObserver para detectar visibilidad.
 *
 * @param animationClass - Clase CSS de animación a aplicar (default: 'animate-fade-in-up')
 * @param threshold - Porcentaje de visibilidad para activar (default: 0.1)
 */
export function useScrollAnimation(
  animationClass: string = 'animate-fade-in-up',
  threshold: number = 0.1
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Empezar invisible
    element.style.opacity = '0';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add(animationClass);
          element.style.opacity = '';
          observer.unobserve(element); // Solo animar una vez
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [animationClass, threshold]);

  return ref;
}

/**
 * Hook para animar múltiples children con stagger (delay incremental).
 * Retorna un ref para el contenedor — los children directos se animan con delay.
 */
export function useStaggerAnimation(
  animationClass: string = 'animate-fade-in-up',
  delayMs: number = 150,
  threshold: number = 0.1
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    children.forEach((child) => {
      child.style.opacity = '0';
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child, index) => {
            child.style.animationDelay = `${index * delayMs}ms`;
            child.classList.add(animationClass);
            child.style.opacity = '';
          });
          observer.unobserve(container);
        }
      },
      { threshold }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [animationClass, delayMs, threshold]);

  return ref;
}
