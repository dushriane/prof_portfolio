import { useEffect, useRef, useCallback } from 'react';

// Custom hook for smooth scrolling
export const useSmoothScroll = () => {
  useEffect(() => {
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = target.getAttribute('href');
        const targetElement = document.querySelector(targetId!);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);
    return () => document.removeEventListener('click', handleSmoothScroll);
  }, []);
};

// Custom hook for intersection observer animations
export const useIntersectionObserver = (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      ...options
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, [callback, options]);

  return elementRef;
};

// Custom hook for scroll animations
export const useScrollAnimation = (animationClass: string = 'fade-in') => {
  const animationCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(animationClass);
      }
    });
  }, [animationClass]);

  const elementRef = useIntersectionObserver(animationCallback);
  return elementRef;
};

// Custom hook for hover effects
export const useHoverEffects = () => {
  useEffect(() => {
    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('hover-lift')) {
        target.style.transform = 'translateY(-5px) scale(1.02)';
      }
    };

    const handleMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('hover-lift')) {
        target.style.transform = 'translateY(0) scale(1)';
      }
    };

    document.addEventListener('mouseover', handleMouseEnter, true);
    document.addEventListener('mouseout', handleMouseLeave, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseEnter, true);
      document.removeEventListener('mouseout  ', handleMouseLeave, true);
    };
  }, []);
};

// Custom hook for loading state
export const usePageLoading = () => {
  useEffect(() => {
    const handleLoad = () => {
      document.body.classList.add('loaded');
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);
};

// Custom hook for outside click detection
export const useOutsideClick = (callback: () => void) => {
  const ref = useRef<HTMLElement>(null);

  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && event.target && !ref.current.contains(event.target as Node)) {
        memoizedCallback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [memoizedCallback]);

  return ref;
};
