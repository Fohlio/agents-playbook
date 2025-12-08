/**
 * Key/Slug Validation Utilities
 * 
 * Validates unique identifiers used for MCP lookups and URL-safe keys.
 * Keys must be lowercase, alphanumeric with hyphens only.
 */

/**
 * Key validation result
 */
export interface KeyValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a key format for MCP lookups
 * 
 * Requirements:
 * - 2-100 characters in length
 * - Lowercase letters (a-z)
 * - Numbers (0-9)
 * - Hyphens (-)
 * - No spaces or special characters
 * - Cannot start or end with a hyphen
 * - No consecutive hyphens
 * 
 * @param key - The key to validate
 * @returns boolean - True if valid
 * 
 * @example
 * isValidKey('memory-board') // true
 * isValidKey('code-review-checklist') // true
 * isValidKey('a1-b2-c3') // true
 * isValidKey('') // false - too short
 * isValidKey('a') // false - too short
 * isValidKey('Memory-Board') // false - uppercase
 * isValidKey('memory board') // false - space
 * isValidKey('-memory-board') // false - starts with hyphen
 * isValidKey('memory--board') // false - consecutive hyphens
 */
export function isValidKey(key: string): boolean {
  // Check length
  if (key.length < 2 || key.length > 100) {
    return false;
  }
  
  // Check basic pattern: lowercase alphanumeric and hyphens only
  if (!/^[a-z0-9-]+$/.test(key)) {
    return false;
  }
  
  // Cannot start or end with hyphen
  if (key.startsWith('-') || key.endsWith('-')) {
    return false;
  }
  
  // No consecutive hyphens
  if (/--/.test(key)) {
    return false;
  }
  
  return true;
}

/**
 * Validate a key and return detailed error message
 * 
 * @param key - The key to validate
 * @returns KeyValidationResult - Validation result with error message if invalid
 * 
 * @example
 * validateKey('memory-board') // { valid: true }
 * validateKey('Memory') // { valid: false, error: 'Key must contain only lowercase letters, numbers, and hyphens' }
 */
export function validateKey(key: string): KeyValidationResult {
  if (key.length < 2) {
    return { valid: false, error: 'Key must be at least 2 characters' };
  }
  
  if (key.length > 100) {
    return { valid: false, error: 'Key must be at most 100 characters' };
  }
  
  if (!/^[a-z0-9-]+$/.test(key)) {
    return { valid: false, error: 'Key must contain only lowercase letters, numbers, and hyphens' };
  }
  
  if (key.startsWith('-')) {
    return { valid: false, error: 'Key cannot start with a hyphen' };
  }
  
  if (key.endsWith('-')) {
    return { valid: false, error: 'Key cannot end with a hyphen' };
  }
  
  if (/--/.test(key)) {
    return { valid: false, error: 'Key cannot contain consecutive hyphens' };
  }
  
  return { valid: true };
}

/**
 * Sanitize a string into a valid key format
 * 
 * @param input - String to convert to a key
 * @returns string - Sanitized key (may still need validation)
 * 
 * @example
 * sanitizeKey('Memory Board') // 'memory-board'
 * sanitizeKey('Code Review Checklist!') // 'code-review-checklist'
 */
export function sanitizeKey(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '')     // Remove invalid characters
    .replace(/-+/g, '-')            // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
}
