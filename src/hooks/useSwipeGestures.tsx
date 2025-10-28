import { useRef, useCallback, useEffect } from "react";

interface SwipeGestureConfig {
  threshold?: number;
  velocity?: number;
  preventDefault?: boolean;
}

interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export function useSwipeGestures(
  callbacks: SwipeCallbacks,
  config: SwipeGestureConfig = {}
) {
  const {
    threshold = 50,
    velocity = 0.3,
    preventDefault = true,
  } = config;

  const startPoint = useRef<TouchPoint | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventDefault) e.preventDefault();
    
    const touch = e.touches[0];
    startPoint.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, [preventDefault]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!startPoint.current) return;
    if (preventDefault) e.preventDefault();

    const touch = e.changedTouches[0];
    const endPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    const deltaX = endPoint.x - startPoint.current.x;
    const deltaY = endPoint.y - startPoint.current.y;
    const deltaTime = endPoint.time - startPoint.current.time;

    const velocityX = Math.abs(deltaX) / deltaTime;
    const velocityY = Math.abs(deltaY) / deltaTime;

    // Check if gesture meets threshold and velocity requirements
    if (Math.abs(deltaX) > threshold && velocityX > velocity) {
      if (deltaX > 0 && callbacks.onSwipeRight) {
        callbacks.onSwipeRight();
      } else if (deltaX < 0 && callbacks.onSwipeLeft) {
        callbacks.onSwipeLeft();
      }
    }

    if (Math.abs(deltaY) > threshold && velocityY > velocity) {
      if (deltaY > 0 && callbacks.onSwipeDown) {
        callbacks.onSwipeDown();
      } else if (deltaY < 0 && callbacks.onSwipeUp) {
        callbacks.onSwipeUp();
      }
    }

    startPoint.current = null;
  }, [callbacks, threshold, velocity, preventDefault]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return elementRef;
}