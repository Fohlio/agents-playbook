import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";

export interface FormFieldProps {
  label: string | ReactNode;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  className?: string;
}

/**
 * FormField Component
 * 
 * Wrapper component for form inputs with:
 * - Label with required indicator
 * - Error message display
 * - Helper text display
 * - Consistent spacing and styling
 */
export default function FormField({
  label,
  htmlFor,
  required,
  error,
  helperText,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {!error && helperText && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

