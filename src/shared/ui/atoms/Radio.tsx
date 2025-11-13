import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/utils/cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  testId?: string;
}

/**
 * Radio Component
 * 
 * Design system radio button with optional label
 * - Integrates with react-hook-form
 * - Accessible with proper labeling
 * - Styled to match design system
 */
const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className, id, testId, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          ref={ref}
          id={id}
          type="radio"
          data-testid={testId}
          className={cn(
            'h-4 w-4 text-primary-600',
            'focus:ring-2 focus:ring-primary-500 focus:ring-offset-0',
            'transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-50',
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

Radio.displayName = 'Radio';

export default Radio;

