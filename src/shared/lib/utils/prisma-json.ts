import type { JsonValue } from '@prisma/client/runtime/library';
import type { Prisma } from '@prisma/client';

/**
 * Converts Prisma JsonValue to string array.
 * Returns undefined if the value is null, undefined, or not an array of strings.
 */
export function jsonValueToStringArray(
  value: JsonValue | null | undefined
): string[] | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return undefined;
}

/**
 * Converts string array to Prisma InputJsonValue for use in create/update operations.
 * Returns undefined only if the value is null or undefined (not if it's an empty array).
 * Empty arrays are valid and should be saved (they represent an explicit empty order).
 */
export function stringArrayToJsonValue(
  value: string[] | undefined | null
): Prisma.InputJsonValue | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  // Empty array is valid - return it as-is
  return value;
}

