import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
  testId?: string;
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
  ({ className, error, fullWidth, testId, ...props }, ref) => {
    return (
      <input
        ref={ref}
        data-testid={testId}
        className={cn(
          "rounded-md border px-3 py-2 shadow-sm transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "bg-white text-gray-900 placeholder:text-gray-400",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-200 focus:border-primary-500 focus:ring-primary-500 focus:shadow-md",
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

