import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  fullWidth?: boolean;
  testId?: string;
}

/**
 * Textarea Component
 * 
 * Design system textarea field with variants
 * - Supports error state with red border
 * - Full width option
 * - Integrates with react-hook-form
 * - Consistent styling with Input component
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, fullWidth, testId, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-testid={testId}
        className={cn(
          'rounded-md border px-3 py-2 shadow-sm transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'bg-white text-gray-900 placeholder:text-gray-400',
          'resize-y',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500 focus:shadow-md',
          fullWidth ? 'w-full' : '',
          'text-sm',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;

