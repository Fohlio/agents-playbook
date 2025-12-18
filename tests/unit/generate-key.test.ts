import { generateUniqueKey } from '@/shared/lib/generate-key';
import { isValidKey } from '@/shared/lib/validators/key';

describe('generateUniqueKey', () => {
  it('should generate a valid key from a simple name', () => {
    const key = generateUniqueKey('My Workflow');
    expect(isValidKey(key)).toBe(true);
    expect(key).toMatch(/^my-workflow-[a-f0-9]{8}$/);
  });

  it('should generate a valid key from a name with special characters', () => {
    const key = generateUniqueKey('Code Review & Testing!');
    expect(isValidKey(key)).toBe(true);
    expect(key).toMatch(/^code-review-testing-[a-f0-9]{8}$/);
  });

  it('should generate a valid key from a long name', () => {
    const longName = 'This is a very long workflow name that should be truncated to fit within the 100 character limit for keys';
    const key = generateUniqueKey(longName);
    expect(isValidKey(key)).toBe(true);
    expect(key.length).toBeLessThanOrEqual(100);
  });

  it('should generate unique keys for the same name', () => {
    const name = 'Test Workflow';
    const key1 = generateUniqueKey(name);
    const key2 = generateUniqueKey(name);
    
    expect(key1).not.toBe(key2);
    expect(isValidKey(key1)).toBe(true);
    expect(isValidKey(key2)).toBe(true);
  });

  it('should handle empty string', () => {
    const key = generateUniqueKey('');
    expect(isValidKey(key)).toBe(true);
    expect(key).toMatch(/^[a-f0-9]{8}$/); // Should be just the hash
  });

  it('should handle names with only special characters', () => {
    const key = generateUniqueKey('!@#$%^&*()');
    expect(isValidKey(key)).toBe(true);
    expect(key).toMatch(/^[a-f0-9]{8}$/); // Should be just the hash
  });

  it('should not start or end with hyphen', () => {
    const key = generateUniqueKey('-Test-');
    expect(isValidKey(key)).toBe(true);
    expect(key).not.toMatch(/^-/);
    expect(key).not.toMatch(/-$/);
  });

  it('should not have consecutive hyphens', () => {
    const key = generateUniqueKey('Test  Workflow');
    expect(isValidKey(key)).toBe(true);
    expect(key).not.toMatch(/--/);
  });

  it('should be lowercase', () => {
    const key = generateUniqueKey('TEST WORKFLOW');
    expect(key).toBe(key.toLowerCase());
  });
});
