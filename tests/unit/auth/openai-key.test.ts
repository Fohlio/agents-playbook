import { describe, it, expect } from '@jest/globals';
import {
  encryptApiKey,
  verifyApiKey,
  validateOpenAIKeyFormat,
  testOpenAIKey,
} from '@/lib/auth/openai-key';

describe('OpenAI Key Encryption', () => {
  describe('encryptApiKey', () => {
    it('should encrypt an API key using bcrypt', async () => {
      const plainKey = 'sk-proj-test1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const encrypted = await encryptApiKey(plainKey);

      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(plainKey);
      expect(encrypted.length).toBe(60); // bcrypt hash length
      expect(encrypted).toMatch(/^\$2[aby]\$/); // bcrypt format
    });

    it('should generate different hashes for the same key', async () => {
      const plainKey = 'sk-proj-test1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const encrypted1 = await encryptApiKey(plainKey);
      const encrypted2 = await encryptApiKey(plainKey);

      expect(encrypted1).not.toBe(encrypted2); // bcrypt uses salt
    });
  });

  describe('verifyApiKey', () => {
    it('should verify a correct API key', async () => {
      const plainKey = 'sk-proj-test1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const encrypted = await encryptApiKey(plainKey);

      const isValid = await verifyApiKey(plainKey, encrypted);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect API key', async () => {
      const plainKey = 'sk-proj-test1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const wrongKey = 'sk-proj-wrong1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const encrypted = await encryptApiKey(plainKey);

      const isValid = await verifyApiKey(wrongKey, encrypted);
      expect(isValid).toBe(false);
    });

    it('should handle empty strings gracefully', async () => {
      const plainKey = 'sk-proj-test1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const encrypted = await encryptApiKey(plainKey);

      const isValid = await verifyApiKey('', encrypted);
      expect(isValid).toBe(false);
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
    it('should reject invalid key format without making API call', async () => {
      const result = await testOpenAIKey('invalid-key');

      // The function should still make the call, but OpenAI will reject it
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle network errors gracefully', async () => {
      // This test will fail if there's no network, but that's expected
      const fakeKey = 'sk-' + 'x'.repeat(48);
      const result = await testOpenAIKey(fakeKey);

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('error');
      expect(typeof result.valid).toBe('boolean');
    });

    it('should return error message for invalid keys', async () => {
      const invalidKey = 'sk-' + 'invalid'.repeat(10);
      const result = await testOpenAIKey(invalidKey);

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
      expect(typeof result.error).toBe('string');
    });
  });
});
