import * as bcrypt from 'bcrypt';

// Re-export password validation from shared
export { validatePasswordComplexity, type PasswordValidationResult } from '@/shared/lib/validators/auth';

/**
 * Salt rounds for bcrypt (cost factor 12 = OWASP recommended for 2024+)
 */
const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Promise<string> - Bcrypt hash (60 characters)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Bcrypt hash to compare against
 * @returns Promise<boolean> - true if password matches hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

