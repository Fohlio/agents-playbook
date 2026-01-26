/**
 * Shared formatting utilities
 */

/**
 * Format a byte count into a human-readable file size string.
 *
 * @example
 * formatFileSize(0) // '0 B'
 * formatFileSize(1024) // '1.0 KB'
 * formatFileSize(1536000) // '1.5 MB'
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
