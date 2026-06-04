import { useRef, forwardRef } from 'react';
import { Card } from '@/components/ui/card';
import { useTilt3D } from '@/hooks/useTilt3D';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card con efecto tilt 3D al mover el mouse.
 * Envuelve el componente Card de shadcn con el hook useTilt3D.
 */
const TiltCard = ({ children, className = '' }: TiltCardProps) => {
  const { ref, handleMouseMove, handleMouseLeave } = useTilt3D(6, 1.02);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Card className={className}>
        {children}
      </Card>
    </div>
  );
};

export default TiltCard;
