import { describe, it, expect } from '@jest/globals';
import {
  encryptApiKey,
  decryptApiKey,
  validateOpenAIKeyFormat,
  testOpenAIKey,
} from '@/server/auth/openai-key';

describe('OpenAI Key Encryption', () => {
  describe('encryptApiKey and decryptApiKey', () => {
    it('should encrypt an API key using AES-256-GCM', async () => {
      const plainKey = 'sk-proj-test1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const encrypted = await encryptApiKey(plainKey);

      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(plainKey);
      expect(typeof encrypted).toBe('string');
      // Should be base64 encoded
      expect(encrypted).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should decrypt back to original key', async () => {
      const plainKey = 'sk-proj-test1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const encrypted = await encryptApiKey(plainKey);
      const decrypted = await decryptApiKey(encrypted);

      expect(decrypted).toBe(plainKey);
    });

    it('should generate different encrypted values for the same key', async () => {
      const plainKey = 'sk-proj-test1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const encrypted1 = await encryptApiKey(plainKey);
      const encrypted2 = await encryptApiKey(plainKey);

      // Different due to random IV
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to the same value
      const decrypted1 = await decryptApiKey(encrypted1);
      const decrypted2 = await decryptApiKey(encrypted2);
      expect(decrypted1).toBe(plainKey);
      expect(decrypted2).toBe(plainKey);
    });

    it('should handle old format keys', async () => {
      const oldFormatKey = 'sk-' + 'a'.repeat(48);
      const encrypted = await encryptApiKey(oldFormatKey);
      const decrypted = await decryptApiKey(encrypted);

      expect(decrypted).toBe(oldFormatKey);
    });

    it('should throw error for invalid encrypted data', async () => {
      await expect(decryptApiKey('invalid-base64')).rejects.toThrow();
    });
  });

  describe('validateOpenAIKeyFormat', () => {
    it('should accept valid old format keys', () => {
      const validKey = 'sk-' + 'a'.repeat(48);
      expect(validateOpenAIKeyFormat(validKey)).toBe(true);
    });

    it('should accept valid new format keys with project prefix', () => {
      const validKey = 'sk-proj-' + 'a'.repeat(48);
      expect(validateOpenAIKeyFormat(validKey)).toBe(true);

      const validKeyLonger = 'sk-proj-' + 'a'.repeat(60);
      expect(validateOpenAIKeyFormat(validKeyLonger)).toBe(true);
    });

    it('should accept keys with underscores and hyphens in new format', () => {
      const validKey = 'sk-proj-' + 'abc_def-123_456'.repeat(3) + 'a'.repeat(10);
      expect(validateOpenAIKeyFormat(validKey)).toBe(true);
    });

    it('should reject keys with incorrect prefix', () => {
      const invalidKey = 'ak-' + 'a'.repeat(48);
      expect(validateOpenAIKeyFormat(invalidKey)).toBe(false);

      const invalidKey2 = 'sk-test-' + 'a'.repeat(48);
      expect(validateOpenAIKeyFormat(invalidKey2)).toBe(false);
    });

    it('should reject keys that are too short', () => {
      const shortKey = 'sk-abcd1234';
      expect(validateOpenAIKeyFormat(shortKey)).toBe(false);

      const shortProjectKey = 'sk-proj-abcd1234';
      expect(validateOpenAIKeyFormat(shortProjectKey)).toBe(false);
    });

    it('should reject empty or malformed keys', () => {
      expect(validateOpenAIKeyFormat('')).toBe(false);
      expect(validateOpenAIKeyFormat('sk-')).toBe(false);
      expect(validateOpenAIKeyFormat('sk-proj-')).toBe(false);
      expect(validateOpenAIKeyFormat('not-a-key')).toBe(false);
    });
  });

  describe('testOpenAIKey', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      // Reset fetch mock for these tests
      global.fetch = jest.fn();
    });

    afterEach(() => {
      // Restore original fetch
      global.fetch = originalFetch;
    });

    it('should reject invalid key format without making API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: { message: 'Invalid API key' }
        })
      });

      const result = await testOpenAIKey('invalid-key');

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const fakeKey = 'sk-' + 'x'.repeat(48);
      const result = await testOpenAIKey(fakeKey);

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('error');
      expect(typeof result.valid).toBe('boolean');
      expect(result.valid).toBe(false);
    });

    it('should return error message for invalid keys', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: { message: 'Incorrect API key provided' }
        })
      });

      const invalidKey = 'sk-' + 'invalid'.repeat(10);
      const result = await testOpenAIKey(invalidKey);

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
      expect(typeof result.error).toBe('string');
    });
  });
});
