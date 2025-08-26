import React from 'react';
import { useIntersectionObserver, useCountUp } from '../hooks/useIntersectionObserver';

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = ''
}) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.5,
    triggerOnce: true
  });

  const count = useCountUp(end, start, duration, isVisible);

  const displayValue = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.floor(count).toString();

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};