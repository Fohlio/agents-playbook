/**
 * MIME type detection utilities
 */

const TEXT_MIME_TYPES = new Set([
  'application/json',
  'application/javascript',
  'application/typescript',
  'application/xml',
  'application/yaml',
  'application/x-yaml',
]);

/**
 * Check if a MIME type represents an image
 */
export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if a MIME type represents text content that can be previewed
 */
export function isTextMimeType(mimeType: string): boolean {
  return mimeType.startsWith('text/') || TEXT_MIME_TYPES.has(mimeType);
}

/**
 * Categorize a MIME type for icon selection
 */
export type MimeCategory = 'image' | 'text' | 'binary';

export function getMimeCategory(mimeType: string): MimeCategory {
  if (isImageMimeType(mimeType)) return 'image';
  if (isTextMimeType(mimeType)) return 'text';
  return 'binary';
}
