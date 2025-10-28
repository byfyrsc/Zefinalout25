import * as React from "react";
import { Plus } from "lucide-react";
import { TouchButton } from "@/components/ui/touch-button";
import { cn } from "@/lib/utils";

interface FABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  variant?: "default" | "primary" | "secondary";
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  className?: string;
}

const positionClasses = {
  "bottom-right": "fixed bottom-20 right-6 md:bottom-6 md:right-6",
  "bottom-left": "fixed bottom-20 left-6 md:bottom-6 md:left-6", 
  "bottom-center": "fixed bottom-20 left-1/2 transform -translate-x-1/2 md:bottom-6",
};

export function FloatingActionButton({ 
  onClick, 
  icon = <Plus className="h-6 w-6" />, 
  label,
  variant = "primary",
  position = "bottom-right",
  className 
}: FABProps) {
  return (
    <TouchButton
      variant="floating"
      size="fab"
      onClick={onClick}
      haptic="medium"
      className={cn(
        positionClasses[position],
        "z-50 shadow-lg hover:shadow-xl transition-all duration-300",
        "animate-scale-in",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        className
      )}
      aria-label={label || "Ação principal"}
    >
      {icon}
      {label && (
        <span className="ml-2 text-sm font-medium hidden md:inline">
          {label}
        </span>
      )}
    </TouchButton>
  );
}