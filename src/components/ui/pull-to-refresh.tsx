import * as React from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTouchFeedback } from "@/hooks/useTouchFeedback";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  disabled = false,
  className
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [canRefresh, setCanRefresh] = React.useState(false);
  const startY = React.useRef<number>(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { triggerHaptic } = useTouchFeedback();

  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    startY.current = e.touches[0].clientY;
  }, [disabled, isRefreshing]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || startY.current === 0) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
      
      if (distance >= threshold && !canRefresh) {
        setCanRefresh(true);
        triggerHaptic({ type: "medium" });
      } else if (distance < threshold && canRefresh) {
        setCanRefresh(false);
      }
    }
  }, [disabled, isRefreshing, threshold, canRefresh, triggerHaptic]);

  const handleTouchEnd = React.useCallback(async () => {
    if (disabled || isRefreshing) return;
    
    if (canRefresh && pullDistance >= threshold) {
      setIsRefreshing(true);
      triggerHaptic({ type: "heavy" });
      
      try {
        await onRefresh();
      } catch (error) {
        console.error("Refresh failed:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setCanRefresh(false);
    startY.current = 0;
  }, [disabled, isRefreshing, canRefresh, pullDistance, threshold, onRefresh, triggerHaptic]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const refreshProgress = Math.min(pullDistance / threshold, 1);
  const iconRotation = refreshProgress * 180;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        transform: `translateY(${Math.min(pullDistance * 0.5, 40)}px)`,
        transition: isRefreshing || pullDistance === 0 ? "transform 0.3s ease-out" : "none"
      }}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center",
          "bg-background/80 backdrop-blur-sm border-b transition-all duration-200",
          pullDistance > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: `${Math.min(pullDistance * 0.5, 40)}px`,
          transform: `translateY(${-Math.min(pullDistance * 0.5, 40)}px)`
        }}
      >
        <RefreshCw
          className={cn(
            "h-5 w-5 transition-all duration-200",
            canRefresh ? "text-primary" : "text-muted-foreground",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: `rotate(${iconRotation}deg)`,
            opacity: refreshProgress
          }}
        />
      </div>

      {children}
    </div>
  );
}