import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  threshold?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  direction = 'up',
  threshold = 0.1,
  className = ''
}) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold,
    triggerOnce: true
  });

  const getTransform = () => {
    const transforms = {
      up: 'translateY(30px)',
      down: 'translateY(-30px)',
      left: 'translateX(30px)',
      right: 'translateX(-30px)'
    };
    return transforms[direction];
  };

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate(0)' : getTransform(),
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} style={style} className={className}>
      {children}
    </div>
  );
};