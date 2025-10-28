import * as React from "react";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
  variant?: "default" | "warning" | "destructive";
}

const NotificationBadge = React.forwardRef<HTMLSpanElement, NotificationBadgeProps>(
  ({ count, className, variant = "default" }, ref) => {
    if (count === 0) return null;

    const getVariantStyles = () => {
      switch (variant) {
        case "warning":
          return "bg-warning text-warning-foreground";
        case "destructive":
          return "bg-destructive text-destructive-foreground";
        default:
          return "bg-primary text-primary-foreground";
      }
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-xs font-medium",
          "min-w-[1.25rem] h-5 px-1",
          getVariantStyles(),
          className
        )}
      >
        {count > 99 ? "99+" : count}
      </span>
    );
  }
);

NotificationBadge.displayName = "NotificationBadge";

export { NotificationBadge };