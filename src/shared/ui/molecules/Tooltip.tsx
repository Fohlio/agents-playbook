'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils/cn';

export interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

/**
 * Tooltip Component
 *
 * Displays contextual help on hover
 * Built on Radix UI Tooltip primitives
 *
 * @param content - Tooltip text or React nodes
 * @param children - Element to attach tooltip to
 * @param side - Tooltip position (default: top)
 * @param className - Additional CSS classes for tooltip content
 */
export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>
        {children}
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          className={cn(
            "z-50 rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg",
            "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "max-w-xs",
            className
          )}
          sideOffset={5}
        >
          {content}
          <RadixTooltip.Arrow className="fill-gray-900" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
