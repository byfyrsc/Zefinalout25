import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useTouchFeedback } from "@/hooks/useTouchFeedback";

const touchButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90 active:bg-primary/80 active:scale-95",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80 active:scale-95",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:scale-95",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70 active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
        floating: "bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:bg-primary/90 active:shadow-md active:scale-95 rounded-full",
      },
      size: {
        default: "h-10 px-4 py-2 min-w-[44px]", // Ensure minimum touch target
        sm: "h-9 rounded-md px-3 min-w-[44px]",
        lg: "h-11 rounded-md px-8 min-w-[44px]",
        icon: "h-10 w-10 min-w-[44px] min-h-[44px]", // Perfect square touch target
        fab: "h-14 w-14 min-w-[56px] min-h-[56px] rounded-full", // Large FAB
      },
      haptic: {
        none: "",
        light: "",
        medium: "",
        heavy: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      haptic: "light",
    },
  }
);

export interface TouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof touchButtonVariants> {
  asChild?: boolean;
}

const TouchButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, variant, size, haptic, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const { triggerHaptic } = useTouchFeedback();

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback
      if (haptic && haptic !== "none") {
        triggerHaptic({ type: haptic });
      }

      // Call original onClick
      onClick?.(e);
    }, [onClick, haptic, triggerHaptic]);

    return (
      <Comp
        className={cn(touchButtonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
TouchButton.displayName = "TouchButton";

export { TouchButton, touchButtonVariants };