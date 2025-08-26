import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLElement>, boolean] => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { triggerOnce = false, ...observerOptions } = options;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const isElementIntersecting = entry.isIntersecting;
      
      if (triggerOnce && isElementIntersecting) {
        setIsIntersecting(true);
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      } else {
        setIsIntersecting(isElementIntersecting);
      }
    }, observerOptions);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [triggerOnce, observerOptions]);

  return [ref, isIntersecting];
};

// Hook for tracking scroll progress
export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxHeight > 0 ? (scrolled / maxHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); 

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return progress;
};

// Hook for tracking element visibility percentage
export const useVisibilityPercentage = () => {
  const [visibilityPercentage, setVisibilityPercentage] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const percentage = Math.round(entry.intersectionRatio * 100);
        setVisibilityPercentage(percentage);
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100)
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

  return [ref, visibilityPercentage] as const;
};

// Hook for animated counting
export const useCountUp = (
  end: number,
  start: number = 0,
  duration: number = 2000,
  triggerValue: boolean = false
) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!triggerValue) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const currentCount = start + (end - start) * progress;
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [triggerValue, start, end, duration]);

  return count;
};

// Hook for lazy image loading
export const useLazyImage = (src: string, placeholderSrc?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholderSrc || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (!isVisible) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
  }, [src, isVisible]);

  return { ref, imageSrc, isLoaded };
};