import * as crypto from 'crypto';

/**
 * Encryption configuration
 */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Get encryption key from environment
 * Falls back to a deterministic key derived from NEXTAUTH_SECRET if ENCRYPTION_KEY is not set
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  
  if (!envKey) {
    throw new Error('ENCRYPTION_KEY or NEXTAUTH_SECRET must be set in environment variables');
  }

  // Use PBKDF2 to derive a 32-byte key from the secret
  return crypto.pbkdf2Sync(envKey, 'openai-key-salt', 100000, 32, 'sha256');
}

/**
 * Encrypt an OpenAI API key using AES-256-GCM
 * @param apiKey - Plain text OpenAI API key
 * @returns Promise<string> - Encrypted key (base64 encoded with IV and auth tag)
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(apiKey, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV + auth tag + encrypted data
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'base64')
    ]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('Error encrypting API key:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypt an OpenAI API key
 * @param encryptedKey - Encrypted key from database
 * @returns Promise<string> - Plain text OpenAI API key
 */
export async function decryptApiKey(encryptedKey: string): Promise<string> {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedKey, 'base64');
    
    // Extract IV, auth tag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting API key:', error);
    throw new Error('Failed to decrypt API key');
  }
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
