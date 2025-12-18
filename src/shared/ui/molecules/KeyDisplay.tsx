'use client';

import { CopyButton } from '@/shared/ui/molecules/CopyButton';

interface KeyDisplayProps {
  keyValue: string | null | undefined;
  className?: string;
  label?: string;
}

/**
 * KeyDisplay Component
 * 
 * Displays a unique key with copy functionality
 * Used for showing workflow and mini-prompt keys in preview/edit modes
 */
export function KeyDisplay({ keyValue, className = '', label = 'Key' }: KeyDisplayProps) {
  if (!keyValue) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-medium text-gray-500">{label}:</span>
      <code className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-800 rounded border border-gray-200">
        {keyValue}
      </code>
      <CopyButton
        textToCopy={keyValue}
        label=""
        variant="secondary"
        size="sm"
        testId={`copy-key-${keyValue}`}
        className="!p-1 !h-6 !min-h-6"
      />
    </div>
  );
}
