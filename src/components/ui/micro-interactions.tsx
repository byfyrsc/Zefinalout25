import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

// Animated feedback states
export const FeedbackState = ({ 
  state, 
  message, 
  onComplete 
}: { 
  state: 'success' | 'error' | 'warning' | 'info' | null;
  message?: string;
  onComplete?: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (state) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state, onComplete]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    success: "text-success",
    error: "text-destructive", 
    warning: "text-warning",
    info: "text-primary"
  };

  if (!state) return null;

  const Icon = icons[state];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-card rounded-lg shadow-strong px-4 py-3 flex items-center space-x-2 min-w-48"
        >
          <Icon className={cn("h-5 w-5", colors[state])} />
          {message && <span className="text-sm font-medium">{message}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Elastic button for touch interactions
interface ElasticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const ElasticButton = ({ 
  children, 
  onClick, 
  className,
  disabled,
  type = "button"
}: ElasticButtonProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(
        "transition-colors duration-200 active:brightness-90",
        className
      )}
    >
      {children}
    </motion.button>
  );
};

// Floating element with physics
export const FloatingElement = ({ 
  children, 
  delay = 0,
  className 
}: { 
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Stagger animation for lists
export const StaggeredList = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode[];
  className?: string;
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1 }
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Page transition wrapper
export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
};