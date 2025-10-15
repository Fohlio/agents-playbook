import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

/**
 * Input Component
 * 
 * Design system input field with variants
 * - Supports error state with red border
 * - Full width option
 * - Integrates with react-hook-form
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, fullWidth, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "rounded-md border px-3 py-2 shadow-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-primary-500 focus:ring-primary-500",
          fullWidth ? "w-full" : "",
          "text-sm",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;

