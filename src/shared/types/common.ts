import type { ReactNode } from 'react';

/**
 * Standard size variants for components
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Standard visual variants for components
 */
export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

/**
 * Semantic color variants for alerts, badges, and status indicators
 */
export type SemanticColor = 'info' | 'success' | 'warning' | 'error';

/**
 * Base props that most components accept
 */
export interface BaseComponentProps {
  /** Additional CSS classes to apply */
  className?: string;
  /** Child elements */
  children?: ReactNode;
}

/**
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Async state management interface
 * 
 * @template T - The type of data being loaded
 */
export interface AsyncState<T> {
  /** The loaded data, null if not yet loaded or error */
  data: T | null;
  /** Whether data is currently being loaded */
  loading: boolean;
  /** Error object if loading failed */
  error: Error | null;
}

