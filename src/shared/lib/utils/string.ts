/**
 * Truncate string to specified length with ellipsis
 * 
 * @param str - String to truncate
 * @param length - Maximum length before truncation
 * @returns Truncated string with '...' suffix if needed
 * 
 * @example
 * ```ts
 * truncate('This is a long text', 10)
 * // => 'This is a ...'
 * 
 * truncate('Short', 10)
 * // => 'Short'
 * ```
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Generate initials from full name for avatar fallback
 * 
 * Takes the first letter of each word, up to 2 letters maximum.
 * 
 * @param name - Full name to convert to initials
 * @returns Uppercase initials (max 2 characters)
 * 
 * @example
 * ```ts
 * getInitials('John Doe')
 * // => 'JD'
 * 
 * getInitials('John')
 * // => 'J'
 * 
 * getInitials('John Michael Doe')
 * // => 'JM'
 * ```
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Convert string to kebab-case format
 * 
 * Useful for generating slugs, CSS class names, and URL-friendly strings.
 * 
 * @param str - String to convert
 * @returns kebab-cased string
 * 
 * @example
 * ```ts
 * kebabCase('UserProfile')
 * // => 'user-profile'
 * 
 * kebabCase('My Feature Name')
 * // => 'my-feature-name'
 * 
 * kebabCase('some_snake_case')
 * // => 'some-snake-case'
 * ```
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

