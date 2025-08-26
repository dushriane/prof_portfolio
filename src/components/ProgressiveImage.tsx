import React from 'react';
import { useLazyImage } from '../hooks/useIntersectionObserver';

interface ProgressiveImageProps {
  src: string;
  placeholderSrc?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  placeholderSrc,
  alt,
  className = '',
  style = {}
}) => {
  const { ref, imageSrc, isLoaded } = useLazyImage(src, placeholderSrc);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className} style={style}>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          style={{
            opacity: isLoaded ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}
    </div>
  );
};