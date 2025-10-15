import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/utils/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

/**
 * Checkbox Component
 * 
 * Design system checkbox with optional label
 * - Integrates with react-hook-form
 * - Accessible with proper labeling
 * - Styled to match design system
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border-gray-300 text-primary-600",
            "focus:ring-2 focus:ring-primary-500 focus:ring-offset-0",
            "transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={id}
            className="ml-2 block text-sm text-gray-900 cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;

