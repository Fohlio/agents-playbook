import React from 'react';
import { cn } from '@/shared/lib/utils/cn';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  testId?: string;
}

export default function Toggle({
  checked,
  onChange,
  label,
  className,
  testId,
}: ToggleProps) {
  return (
    <label className={cn('relative inline-flex items-center cursor-pointer', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
        data-testid={testId}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
      {label && (
        <span className="ms-3 text-sm font-medium text-text-primary">
          {label}
        </span>
      )}
    </label>
  );
}
