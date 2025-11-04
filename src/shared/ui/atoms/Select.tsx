import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  error?: boolean;
  fullWidth?: boolean;
  testId?: string;
}

/**
 * Select Component
 *
 * Design system dropdown/select field with variants
 * - Supports error state with red border
 * - Full width option
 * - Optional label and placeholder
 * - Integrates with react-hook-form
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      value,
      onChange,
      options,
      label,
      placeholder,
      error,
      fullWidth,
      testId,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("space-y-2", fullWidth ? "w-full" : "")}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          data-testid={testId}
          className={cn(
            "rounded-md border px-3 py-2 shadow-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "bg-white text-gray-900",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-primary-500 focus:ring-primary-500",
            fullWidth ? "w-full" : "",
            "text-sm",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
