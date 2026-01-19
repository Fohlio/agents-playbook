"use client";

import { useState, useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils/cn';

export interface OnboardingTooltipProps {
  /** Unique identifier for localStorage persistence */
  id: string;
  /** The content that triggers the tooltip */
  children: ReactNode;
  /** Tooltip message content */
  content: string;
  /** Whether to show the tooltip (can be used for conditional display) */
  show?: boolean;
  /** Position of the tooltip relative to the trigger */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing the tooltip (in ms) */
  delay?: number;
  /** Additional class names for the wrapper */
  className?: string;
}

/**
 * OnboardingTooltip Component
 *
 * Provides dismissible onboarding hints that persist their dismissed
 * state in localStorage. Great for guiding new users through features.
 *
 * Features:
 * - Persists dismissed state per user session
 * - Configurable position
 * - Optional delay before showing
 * - Can be conditionally displayed
 */
export function OnboardingTooltip({
  id,
  children,
  content,
  show = true,
  position = 'bottom',
  delay = 500,
  className,
}: OnboardingTooltipProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Start dismissed to prevent flash
  const [isVisible, setIsVisible] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const key = `onboarding_${id}`;
    const wasDismissed = localStorage.getItem(key) === 'true';
    setIsDismissed(wasDismissed);

    // Show tooltip after delay if not dismissed
    if (!wasDismissed && show) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [id, show, delay]);

  const dismiss = () => {
    const key = `onboarding_${id}`;
    localStorage.setItem(key, 'true');
    setIsDismissed(true);
    setIsVisible(false);
  };

  // Don't render tooltip if dismissed or hidden
  if (isDismissed || !show || !isVisible) {
    return <>{children}</>;
  }

  // Position styles
  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Arrow styles
  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-blue-600 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-blue-600 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-blue-600 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-blue-600 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {children}
      <div
        className={cn(
          'absolute z-50 animate-in fade-in slide-in-from-bottom-1 duration-200',
          positionStyles[position]
        )}
        role="tooltip"
      >
        <div className="bg-blue-600 text-white text-sm px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap">
          {content}
          <button
            onClick={dismiss}
            className="hover:opacity-70 transition-opacity p-0.5 rounded"
            aria-label="Dismiss tooltip"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {/* Arrow */}
        <div
          className={cn(
            'absolute w-0 h-0 border-[6px]',
            arrowStyles[position]
          )}
        />
      </div>
    </div>
  );
}

/**
 * OnboardingHighlight Component
 *
 * Highlights an element with a pulsing border and optional tooltip.
 * Used to draw attention to important features for new users.
 */
export function OnboardingHighlight({
  id,
  children,
  content,
  show = true,
  className,
}: OnboardingTooltipProps) {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const key = `onboarding_highlight_${id}`;
    const wasDismissed = localStorage.getItem(key) === 'true';
    setIsDismissed(wasDismissed);
  }, [id]);

  const dismiss = () => {
    const key = `onboarding_highlight_${id}`;
    localStorage.setItem(key, 'true');
    setIsDismissed(true);
  };

  if (isDismissed || !show) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative', className)}>
      {/* Pulsing ring effect */}
      <div className="absolute -inset-1 rounded-lg bg-blue-500/20 animate-pulse" />
      <div className="relative">{children}</div>

      {/* Tooltip */}
      {content && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50">
          <div className="bg-blue-600 text-white text-sm px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
            {content}
            <button
              onClick={dismiss}
              className="hover:opacity-70 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-blue-600" />
        </div>
      )}
    </div>
  );
}

/**
 * Hook to check if an onboarding tooltip has been dismissed
 */
export function useOnboardingDismissed(id: string): boolean {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const key = `onboarding_${id}`;
    setIsDismissed(localStorage.getItem(key) === 'true');
  }, [id]);

  return isDismissed;
}

/**
 * Hook to dismiss an onboarding tooltip programmatically
 */
export function useDismissOnboarding(id: string): () => void {
  return () => {
    const key = `onboarding_${id}`;
    localStorage.setItem(key, 'true');
  };
}

/**
 * Reset all onboarding tooltips (useful for testing or user preference)
 */
export function resetAllOnboarding(): void {
  if (typeof window === 'undefined') return;

  const keys = Object.keys(localStorage).filter(
    (key) => key.startsWith('onboarding_') || key.startsWith('onboarding_highlight_')
  );

  keys.forEach((key) => localStorage.removeItem(key));
}
