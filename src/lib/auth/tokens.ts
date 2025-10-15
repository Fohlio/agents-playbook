import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

/**
 * Generated API token result
 */
export interface GeneratedToken {
  plainToken: string;    // Show to user once (44 characters base64)
  hashedToken: string;   // Store in database (60 characters bcrypt)
  expiresAt: Date;       // Expiration timestamp (90 days from now)
}

/**
 * Generate a new API token
 * @returns Promise<GeneratedToken> - Plain token, hashed token, and expiration
 * 
 * Flow:
 * 1. Generate 32 random bytes
 * 2. Convert to base64 string (44 characters)
 * 3. Hash with bcrypt for storage
 * 4. Calculate expiration (90 days)
 */
export async function generateApiToken(): Promise<GeneratedToken> {
  // Generate cryptographically secure random token
  const buffer = randomBytes(32);
  const plainToken = buffer.toString('base64');
  
  // Hash token for database storage
  const hashedToken = await bcrypt.hash(plainToken, 12);
  
  // Calculate expiration date (90 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);
  
  return {
    plainToken,
    hashedToken,
    expiresAt,
  };
}

/**
 * Verify an API token against a hash
 * @param plainToken - Token provided by user
 * @param hashedToken - Hashed token from database
 * @returns Promise<boolean> - true if token matches hash
 */
export async function verifyApiToken(
  plainToken: string,
  hashedToken: string
): Promise<boolean> {
  return bcrypt.compare(plainToken, hashedToken);
}

/**
 * Check if a token has expired
 * @param expiresAt - Expiration timestamp
 * @returns boolean - true if token has expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

