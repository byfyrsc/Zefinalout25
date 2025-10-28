import * as React from "react";
import { cn } from "@/lib/utils";
import { useSwipeGestures } from "@/hooks/useSwipeGestures";
import { useTouchFeedback } from "@/hooks/useTouchFeedback";
import { Card } from "@/components/ui/card";

interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  color: "success" | "warning" | "destructive" | "primary";
}

interface SwipeableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onSwipeThresholdReached?: (direction: "left" | "right") => void;
  swipeThreshold?: number;
  disabled?: boolean;
}

const colorClasses = {
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  primary: "bg-primary text-primary-foreground",
};

export const SwipeableCard = React.forwardRef<HTMLDivElement, SwipeableCardProps>(
  ({ 
    children, 
    className, 
    leftAction, 
    rightAction, 
    onSwipeThresholdReached,
    swipeThreshold = 100,
    disabled = false,
    ...props 
  }, ref) => {
    const [translateX, setTranslateX] = React.useState(0);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [actionTriggered, setActionTriggered] = React.useState<"left" | "right" | null>(null);
    const { triggerHaptic } = useTouchFeedback();

    const resetPosition = React.useCallback(() => {
      setIsAnimating(true);
      setTranslateX(0);
      setTimeout(() => {
        setIsAnimating(false);
        setActionTriggered(null);
      }, 200);
    }, []);

    const swipeRef = useSwipeGestures({
      onSwipeLeft: () => {
        if (disabled || !rightAction) return;
        
        triggerHaptic({ type: "medium" });
        setActionTriggered("right");
        rightAction.action();
        onSwipeThresholdReached?.("left");
        
        setTimeout(resetPosition, 100);
      },
      onSwipeRight: () => {
        if (disabled || !leftAction) return;
        
        triggerHaptic({ type: "medium" });
        setActionTriggered("left");
        leftAction.action();
        onSwipeThresholdReached?.("right");
        
        setTimeout(resetPosition, 100);
      }
    }, {
      threshold: swipeThreshold,
      velocity: 0.3,
    });

    // Combine refs
    React.useImperativeHandle(ref, () => swipeRef.current as HTMLDivElement);

    return (
      <div className="relative overflow-hidden rounded-lg">
        {/* Background actions */}
        {leftAction && (
          <div className={cn(
            "absolute inset-y-0 left-0 flex items-center justify-start pl-4 w-24",
            colorClasses[leftAction.color],
            "opacity-0 transition-opacity duration-200",
            actionTriggered === "left" && "opacity-100"
          )}>
            <div className="flex flex-col items-center gap-1">
              {leftAction.icon}
              <span className="text-xs font-medium">{leftAction.label}</span>
            </div>
          </div>
        )}
        
        {rightAction && (
          <div className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-end pr-4 w-24",
            colorClasses[rightAction.color],
            "opacity-0 transition-opacity duration-200",
            actionTriggered === "right" && "opacity-100"
          )}>
            <div className="flex flex-col items-center gap-1">
              {rightAction.icon}
              <span className="text-xs font-medium">{rightAction.label}</span>
            </div>
          </div>
        )}

        {/* Swipeable card content */}
        <div
          ref={swipeRef}
          className={cn(
            "transition-transform duration-200 ease-out rounded-lg border bg-card text-card-foreground shadow-sm",
            disabled && "cursor-not-allowed opacity-70",
            isAnimating && "transition-transform duration-200",
            className
          )}
          style={{
            transform: `translateX(${translateX}px)`,
          }}
          {...props}
        >
          {children}
        </div>

        {/* Swipe indicators */}
        {(leftAction || rightAction) && !disabled && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {leftAction && (
              <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
            )}
            {rightAction && (
              <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
            )}
          </div>
        )}
      </div>
    );
  }
);

SwipeableCard.displayName = "SwipeableCard";