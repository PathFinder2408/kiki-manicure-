import { useCallback, useRef } from 'react';

/**
 * Hook para efecto Tilt 3D en cards.
 * La tarjeta se inclina suavemente siguiendo la posición del mouse.
 * Efecto premium tipo Apple.
 */
export function useTilt3D(maxTilt: number = 8, scale: number = 1.02) {
  const ref = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;

      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }

      requestRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
        el.style.transition = 'transform 0.1s ease-out';
      });
    },
    [maxTilt, scale]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    el.style.transition = 'transform 0.5s ease-out';
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
}
