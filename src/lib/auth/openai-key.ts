import * as bcrypt from 'bcrypt';

/**
 * Salt rounds for bcrypt (cost factor 12 = OWASP recommended for 2024+)
 */
const SALT_ROUNDS = 12;

/**
 * Encrypt an OpenAI API key using bcrypt
 * @param apiKey - Plain text OpenAI API key
 * @returns Promise<string> - Bcrypt hash (60 characters)
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, SALT_ROUNDS);
}

/**
 * Verify an OpenAI API key against an encrypted hash
 * @param plainKey - Plain text API key provided by user
 * @param encryptedKey - Encrypted key from database
 * @returns Promise<boolean> - true if key matches hash
 */
export async function verifyApiKey(
  plainKey: string,
  encryptedKey: string
): Promise<boolean> {
  return bcrypt.compare(plainKey, encryptedKey);
}

/**
 * Validate OpenAI API key format
 * @param key - API key to validate
 * @returns boolean - true if key matches expected format
 *
 * Expected format: sk-proj-[A-Za-z0-9_-]{48,} or sk-[A-Za-z0-9]{48}
 * Note: OpenAI has updated format to include project identifiers
 */
export function validateOpenAIKeyFormat(key: string): boolean {
  // Support both old and new OpenAI key formats
  const oldFormat = /^sk-[A-Za-z0-9]{48}$/;
  const newFormat = /^sk-proj-[A-Za-z0-9_-]{48,}$/;

  return oldFormat.test(key) || newFormat.test(key);
}

/**
 * Test OpenAI API key by making a simple API call
 * @param apiKey - Plain text OpenAI API key
 * @returns Promise<{ valid: boolean; error?: string }> - Validation result
 */
export async function testOpenAIKey(
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { valid: true };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      valid: false,
      error: errorData.error?.message || `Invalid API key (status: ${response.status})`,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to test API key',
    };
  }
}
