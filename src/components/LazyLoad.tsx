import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({ 
  children, 
  fallback = <div className="skeleton-loader" />,
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true
}) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce
  });

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      {isVisible ? children : fallback}
    </div>
  );
};