import React, { useState, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage = ({
  src,
  alt,
  className,
  fallback = '/placeholder.svg',
  placeholder,
  onLoad,
  onError
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
    rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
  });

  // Start loading when in view
  React.useEffect(() => {
    if (inView && !imageSrc && !hasError) {
      // Use modern image formats if supported
      const modernSrc = getOptimizedImageSrc(src);
      setImageSrc(modernSrc);
    }
  }, [inView, src, imageSrc, hasError]);

  const getOptimizedImageSrc = (originalSrc: string): string => {
    // In a real implementation, you might:
    // 1. Check for WebP/AVIF support
    // 2. Add responsive sizing parameters
    // 3. Use a CDN with automatic optimization
    
    // For now, return the original source
    return originalSrc;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
      setHasError(false); // Reset error state to try fallback
    } else {
      onError?.();
    }
  };

  const defaultPlaceholder = (
    <Skeleton className={cn("w-full h-full", className)} />
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {!inView || (!isLoaded && !hasError) ? (
        placeholder || defaultPlaceholder
      ) : null}
      
      {imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          style={{
            position: !isLoaded ? 'absolute' : 'static',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
      )}
      
      {hasError && imageSrc === fallback && (
        <div className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground text-sm",
          className
        )}>
          Failed to load image
        </div>
      )}
    </div>
  );
};