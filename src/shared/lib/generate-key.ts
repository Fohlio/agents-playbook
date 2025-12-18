import crypto from 'crypto';
import { sanitizeKey } from '@/shared/lib/validators/key';

/**
 * Generates a unique key (hash) based on the input name and timestamp.
 * Format: lowercase alphanumeric and hyphens, max 100 characters
 * 
 * @param name - The base name to generate key from
 * @returns A unique key string
 * 
 * @example
 * generateUniqueKey("My Workflow") // => "my-workflow-a3f2e1"
 */
export function generateUniqueKey(name: string): string {
  // Sanitize the name using existing utility
  const normalized = sanitizeKey(name).substring(0, 80); // Leave room for hash suffix

  // Generate a short hash from name + timestamp for uniqueness
  const hash = crypto
    .createHash('sha256')
    .update(`${name}-${Date.now()}-${Math.random()}`)
    .digest('hex')
    .substring(0, 8);

  // Combine normalized name with hash
  const key = normalized ? `${normalized}-${hash}` : hash;

  // Ensure it's within the 100 character limit
  return key.substring(0, 100);
}
