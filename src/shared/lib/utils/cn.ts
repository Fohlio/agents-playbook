import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution
 * 
 * This utility combines `clsx` for conditional class handling and `tailwind-merge`
 * for resolving Tailwind class conflicts. Use this for all className props to ensure
 * proper class merging and override behavior.
 * 
 * @param inputs - Class names, objects, or arrays to merge
 * @returns Merged class string with conflicts resolved
 * 
 * @example
 * ```tsx
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500')
 * // => 'px-4 py-2 bg-blue-500'
 * 
 * // Conditional classes
 * cn('px-4', isActive && 'bg-blue-500', isDisabled && 'opacity-50')
 * 
 * // Resolves conflicts (last class wins)
 * cn('px-4', 'px-8')
 * // => 'px-8'
 * 
 * // Component with custom className prop
 * cn('base-classes', className)
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

