import { format, formatDistance } from 'date-fns';

/**
 * Format date to "MMM dd, yyyy" format
 * 
 * @param date - Date object or ISO string to format
 * @returns Formatted date string (e.g., "Jan 15, 2025")
 * 
 * @example
 * ```ts
 * formatDate(new Date('2025-01-15'))
 * // => 'Jan 15, 2025'
 * 
 * formatDate('2025-01-15T10:30:00Z')
 * // => 'Jan 15, 2025'
 * ```
 */
export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

/**
 * Format date to relative time with "ago" suffix
 * 
 * @param date - Date object or ISO string to format
 * @returns Relative time string (e.g., "2 hours ago", "3 days ago")
 * 
 * @example
 * ```ts
 * formatRelativeDate(new Date(Date.now() - 3600000))
 * // => 'about 1 hour ago'
 * 
 * formatRelativeDate(new Date(Date.now() - 86400000 * 3))
 * // => '3 days ago'
 * ```
 */
export function formatRelativeDate(date: Date | string): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

/**
 * Format date for datetime-local input fields
 * 
 * Converts a date to the format required by HTML5 datetime-local inputs: yyyy-MM-ddTHH:mm
 * 
 * @param date - Date object or ISO string to format
 * @returns Formatted date string for input[type="datetime-local"]
 * 
 * @example
 * ```ts
 * formatDateTimeLocal(new Date('2025-01-15T14:30:00'))
 * // => '2025-01-15T14:30'
 * ```
 */
export function formatDateTimeLocal(date: Date | string): string {
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
}

