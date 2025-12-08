import { isValidKey, validateKey, sanitizeKey, type KeyValidationResult } from '../key';

describe('Key Validation Utilities', () => {
  describe('isValidKey', () => {
    describe('valid keys', () => {
      it.each([
        ['ab', 'minimum length (2 chars)'],
        ['memory-board', 'typical key with hyphen'],
        ['code-review-checklist', 'multiple hyphens'],
        ['a1-b2-c3', 'alphanumeric with hyphens'],
        ['test123', 'alphanumeric no hyphens'],
        ['abc', 'short key'],
        ['a'.repeat(100), 'maximum length (100 chars)'],
        ['my-prompt', 'simple hyphenated key'],
        ['123', 'numbers only'],
        ['a-1-b-2', 'alternating letters and numbers'],
      ])('should accept "%s" (%s)', (key) => {
        expect(isValidKey(key)).toBe(true);
      });
    });

    describe('invalid keys', () => {
      it.each([
        ['', 'empty string'],
        ['a', 'too short (1 char)'],
        ['a'.repeat(101), 'too long (101 chars)'],
        ['Memory-Board', 'uppercase letters'],
        ['UPPERCASE', 'all uppercase'],
        ['memory board', 'contains space'],
        ['memory_board', 'contains underscore'],
        ['memory.board', 'contains period'],
        ['memory@board', 'contains special char @'],
        ['memory#board', 'contains special char #'],
        ['-memory-board', 'starts with hyphen'],
        ['memory-board-', 'ends with hyphen'],
        ['-', 'only hyphen'],
        ['--', 'only hyphens'],
        ['memory--board', 'consecutive hyphens'],
        ['a--b', 'consecutive hyphens in middle'],
        ['test---key', 'triple hyphens'],
        ['émoji', 'unicode characters'],
        ['ключ', 'cyrillic characters'],
        ['键', 'chinese characters'],
      ])('should reject "%s" (%s)', (key) => {
        expect(isValidKey(key)).toBe(false);
      });
    });
  });

  describe('validateKey', () => {
    describe('valid keys', () => {
      it('should return valid result for correct key', () => {
        const result = validateKey('memory-board');
        expect(result).toEqual({ valid: true });
      });

      it('should return valid result for minimum length key', () => {
        const result = validateKey('ab');
        expect(result).toEqual({ valid: true });
      });

      it('should return valid result for maximum length key', () => {
        const result = validateKey('a'.repeat(100));
        expect(result).toEqual({ valid: true });
      });
    });

    describe('invalid keys with specific errors', () => {
      it('should return error for too short key', () => {
        const result = validateKey('a');
        expect(result).toEqual<KeyValidationResult>({
          valid: false,
          error: 'Key must be at least 2 characters',
        });
      });

      it('should return error for empty key', () => {
        const result = validateKey('');
        expect(result).toEqual<KeyValidationResult>({
          valid: false,
          error: 'Key must be at least 2 characters',
        });
      });

      it('should return error for too long key', () => {
        const result = validateKey('a'.repeat(101));
        expect(result).toEqual<KeyValidationResult>({
          valid: false,
          error: 'Key must be at most 100 characters',
        });
      });

      it('should return error for uppercase letters', () => {
        const result = validateKey('Memory-Board');
        expect(result).toEqual<KeyValidationResult>({
          valid: false,
          error: 'Key must contain only lowercase letters, numbers, and hyphens',
        });
      });

      it('should return error for spaces', () => {
        const result = validateKey('memory board');
        expect(result).toEqual<KeyValidationResult>({
          valid: false,
          error: 'Key must contain only lowercase letters, numbers, and hyphens',
        });
      });

      it('should return error for special characters', () => {
        const result = validateKey('memory_board');
        expect(result).toEqual<KeyValidationResult>({
          valid: false,
          error: 'Key must contain only lowercase letters, numbers, and hyphens',
        });
      });

      it('should return error for leading hyphen', () => {
        const result = validateKey('-memory-board');
        expect(result).toEqual<KeyValidationResult>({
          valid: false,
          error: 'Key cannot start with a hyphen',
        });
      });

      it('should return error for trailing hyphen', () => {
        const result = validateKey('memory-board-');
        expect(result).toEqual<KeyValidationResult>({
          valid: false,
          error: 'Key cannot end with a hyphen',
        });
      });

      it('should return error for consecutive hyphens', () => {
        const result = validateKey('memory--board');
        expect(result).toEqual<KeyValidationResult>({
          valid: false,
          error: 'Key cannot contain consecutive hyphens',
        });
      });
    });
  });

  describe('sanitizeKey', () => {
    it.each([
      ['Memory Board', 'memory-board', 'converts to lowercase and replaces spaces'],
      ['Code Review Checklist', 'code-review-checklist', 'handles multiple spaces'],
      ['Code  Review', 'code-review', 'handles double spaces'],
      ['  Memory Board  ', 'memory-board', 'trims whitespace'],
      ['Memory_Board', 'memoryboard', 'removes underscores'],
      ['Memory.Board', 'memoryboard', 'removes periods'],
      ['Memory@Board!', 'memoryboard', 'removes special characters'],
      ['--Memory--Board--', 'memory-board', 'cleans up multiple hyphens'],
      ['-Memory-Board-', 'memory-board', 'removes leading/trailing hyphens'],
      ['UPPERCASE', 'uppercase', 'converts uppercase'],
      ['test123', 'test123', 'keeps alphanumeric'],
      ['Test 123 Key!', 'test-123-key', 'complex case'],
      ['', '', 'handles empty string'],
      ['   ', '', 'handles whitespace only'],
    ])('sanitizeKey("%s") should return "%s" (%s)', (input, expected) => {
      expect(sanitizeKey(input)).toBe(expected);
    });

    it('should produce keys that pass validation (when non-empty)', () => {
      const testInputs = [
        'Memory Board',
        'Code Review Checklist',
        'My Super Prompt!',
        'Test 123',
      ];

      for (const input of testInputs) {
        const sanitized = sanitizeKey(input);
        if (sanitized.length >= 2) {
          expect(isValidKey(sanitized)).toBe(true);
        }
      }
    });
  });
});
