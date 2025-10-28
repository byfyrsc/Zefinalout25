import { cn } from "@/lib/utils";
import { memo } from "react";

interface EnhancedSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button' | 'stat';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

const skeletonVariants = {
  default: "animate-pulse rounded-md bg-muted",
  card: "animate-pulse rounded-lg bg-gradient-to-br from-muted via-muted/80 to-muted/60 shadow-soft",
  text: "animate-pulse rounded bg-muted/70 h-4",
  avatar: "animate-pulse rounded-full bg-muted shrink-0",
  button: "animate-pulse rounded-lg bg-muted/80 shadow-sm",
  stat: "animate-pulse rounded-xl bg-gradient-to-br from-muted/90 via-muted/70 to-muted/50"
};

export const EnhancedSkeleton = memo(({
  className,
  variant = 'default',
  width,
  height,
  lines = 1,
  animate = true,
  ...props
}: EnhancedSkeletonProps) => {
  const baseClasses = skeletonVariants[variant];
  
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              !animate && "animate-none",
              i === lines - 1 && "w-3/4", // Last line shorter
              className
            )}
            style={{
              width: i === lines - 1 ? '75%' : width,
              height: height || '1rem'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        !animate && "animate-none",
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
});

EnhancedSkeleton.displayName = "EnhancedSkeleton";

// Preset skeleton layouts for common mobile patterns
export const SkeletonPresets = {
  Dashboard: () => (
    <div className="space-y-6 p-4">
      <EnhancedSkeleton variant="text" width="60%" height="2rem" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <EnhancedSkeleton key={i} variant="stat" height="5rem" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <EnhancedSkeleton key={i} variant="card" height="4rem" />
        ))}
      </div>
    </div>
  ),
  
  FeedbackList: () => (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-3">
          <EnhancedSkeleton variant="avatar" width="3rem" height="3rem" />
          <div className="flex-1 space-y-2">
            <EnhancedSkeleton variant="text" width="40%" height="1.25rem" />
            <EnhancedSkeleton variant="text" lines={2} />
            <div className="flex space-x-2">
              <EnhancedSkeleton variant="button" width="4rem" height="1.5rem" />
              <EnhancedSkeleton variant="button" width="3rem" height="1.5rem" />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
  
  Profile: () => (
    <div className="space-y-6 p-4">
      <div className="flex flex-col items-center space-y-4">
        <EnhancedSkeleton variant="avatar" width="6rem" height="6rem" />
        <EnhancedSkeleton variant="text" width="8rem" height="1.5rem" />
        <EnhancedSkeleton variant="text" width="12rem" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <EnhancedSkeleton variant="text" width="30%" />
            <EnhancedSkeleton variant="text" width="40%" />
          </div>
        ))}
      </div>
    </div>
  )
};