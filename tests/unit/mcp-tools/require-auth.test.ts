/**
 * Unit tests for require-auth helper
 * Tests the core authentication gate for MCP tools
 */

import { describe, it, expect } from '@jest/globals';
import { requireAuth, mcpError, mcpSuccess } from '@/server/mcp-tools-db/require-auth';

describe('require-auth helper', () => {
  describe('requireAuth', () => {
    describe('Happy Path Tests', () => {
      it('should return auth success with userId when valid userId is provided', () => {
        const result = requireAuth('user-123');

        expect(result.authenticated).toBe(true);
        if (result.authenticated) {
          expect(result.userId).toBe('user-123');
        }
      });

      it('should return auth success for any non-null userId string', () => {
        const result = requireAuth('any-valid-id');

        expect(result.authenticated).toBe(true);
        if (result.authenticated) {
          expect(result.userId).toBe('any-valid-id');
        }
      });

      it('should preserve userId exactly as provided', () => {
        const uuidLikeId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
        const result = requireAuth(uuidLikeId);

        expect(result.authenticated).toBe(true);
        if (result.authenticated) {
          expect(result.userId).toBe(uuidLikeId);
        }
      });
    });

    describe('Authentication Failure Tests', () => {
      it('should return warning response when userId is null', () => {
        const result = requireAuth(null);

        expect(result.authenticated).toBe(false);
        if (!result.authenticated) {
          expect(result.response).toBeDefined();
          expect(result.response.content).toHaveLength(1);
          expect(result.response.content[0].type).toBe('text');
        }
      });

      it('should return warning response when userId is undefined (coerced to null)', () => {
        const result = requireAuth(undefined as unknown as string | null);

        expect(result.authenticated).toBe(false);
        if (!result.authenticated) {
          expect(result.response).toBeDefined();
        }
      });

      it('should include instructions for obtaining token in warning message', () => {
        const result = requireAuth(null);

        expect(result.authenticated).toBe(false);
        if (!result.authenticated) {
          const messageText = result.response.content[0].text;
          expect(messageText).toContain('Go to your dashboard settings');
          expect(messageText).toContain('Generate an API token');
          expect(messageText).toContain('Authentication required');
        }
      });
    });

    describe('Edge Cases', () => {
      it('should treat empty string userId as valid (truthy check)', () => {
        // Empty string is falsy in JavaScript, so it should be treated as invalid
        const result = requireAuth('');

        expect(result.authenticated).toBe(false);
      });

      it('should treat whitespace-only userId as valid (no trimming)', () => {
        // Whitespace is truthy, so it passes the check
        const result = requireAuth('   ');

        expect(result.authenticated).toBe(true);
        if (result.authenticated) {
          expect(result.userId).toBe('   ');
        }
      });

      it('should handle very long userId strings', () => {
        const longId = 'a'.repeat(1000);
        const result = requireAuth(longId);

        expect(result.authenticated).toBe(true);
        if (result.authenticated) {
          expect(result.userId).toBe(longId);
        }
      });

      it('should handle userId with special characters', () => {
        const specialId = 'user@domain.com#123!';
        const result = requireAuth(specialId);

        expect(result.authenticated).toBe(true);
        if (result.authenticated) {
          expect(result.userId).toBe(specialId);
        }
      });
    });
  });

  describe('mcpError', () => {
    it('should return properly formatted error response', () => {
      const result = mcpError('Something went wrong');

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('Error: Something went wrong');
    });

    it('should prefix message with "Error: "', () => {
      const result = mcpError('Test message');

      expect(result.content[0].text).toStartWith('Error: ');
    });

    it('should handle empty error message', () => {
      const result = mcpError('');

      expect(result.content[0].text).toBe('Error: ');
    });

    it('should handle special characters in error message', () => {
      const result = mcpError('Failed: <script>alert(1)</script>');

      expect(result.content[0].text).toContain('<script>');
    });
  });

  describe('mcpSuccess', () => {
    it('should return properly formatted success response with JSON data', () => {
      const data = { id: '123', name: 'Test' };
      const result = mcpSuccess(data);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toEqual(data);
    });

    it('should format JSON with indentation (pretty print)', () => {
      const data = { nested: { value: 1 } };
      const result = mcpSuccess(data);

      expect(result.content[0].text).toContain('\n');
    });

    it('should handle array data', () => {
      const data = [1, 2, 3];
      const result = mcpSuccess(data);

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toEqual(data);
    });

    it('should handle null data', () => {
      const result = mcpSuccess(null);

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toBeNull();
    });

    it('should handle primitive string data', () => {
      const result = mcpSuccess('simple string');

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toBe('simple string');
    });

    it('should handle complex nested objects', () => {
      const data = {
        workflow: {
          id: 'wf-1',
          stages: [
            { name: 'Stage 1', prompts: [{ content: 'Test' }] },
          ],
        },
        meta: { total: 1 },
      };
      const result = mcpSuccess(data);

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toEqual(data);
    });
  });
});

// Custom matcher for string prefix check
expect.extend({
  toStartWith(received: string, prefix: string) {
    const pass = received.startsWith(prefix);
    if (pass) {
      return {
        message: () => `expected "${received}" not to start with "${prefix}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected "${received}" to start with "${prefix}"`,
        pass: false,
      };
    }
  },
});

// Type declaration for custom matcher
declare global {
  namespace jest {
    interface Matchers<R> {
      toStartWith(prefix: string): R;
    }
  }
}
