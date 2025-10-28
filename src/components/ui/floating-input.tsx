import * as React from "react";
import { cn } from "@/lib/utils";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helper?: string;
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, error, helper, type = "text", ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    React.useEffect(() => {
      if (inputRef.current) {
        setHasValue(!!inputRef.current.value);
      }
    }, []);

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const isLabelFloating = isFocused || hasValue;

    return (
      <div className="relative w-full">
        <input
          ref={inputRef}
          type={type}
          className={cn(
            "flex h-12 w-full rounded-md border border-input bg-background px-3 pt-6 pb-2 text-sm",
            "ring-offset-background placeholder:text-transparent",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        
        {/* Floating Label */}
        <label
          className={cn(
            "absolute left-3 text-sm text-muted-foreground pointer-events-none",
            "transition-all duration-200 ease-out",
            isLabelFloating
              ? "top-1.5 text-xs font-medium"
              : "top-1/2 transform -translate-y-1/2",
            isFocused && "text-primary",
            error && "text-destructive"
          )}
        >
          {label}
        </label>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-xs text-destructive animate-slide-up">
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helper && !error && (
          <p className="mt-1 text-xs text-muted-foreground">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";