'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';

/**
 * TooltipProvider Component
 *
 * Wraps application with Radix UI Tooltip provider
 * Configures global tooltip behavior:
 * - delayDuration: 300ms hover before showing
 * - skipDelayDuration: 100ms after first tooltip shown
 */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={300} skipDelayDuration={100}>
      {children}
    </RadixTooltip.Provider>
  );
}
