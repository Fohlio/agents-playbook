import { z } from 'zod';
import { load as parseYaml } from 'js-yaml';
import { validatePasswordComplexity } from '../auth/password';

/**
 * Zod Validation Schemas for Database Operations
 * These schemas provide runtime validation for API inputs
 */

// ============================================================================
// Enums
// ============================================================================

export const UserTierSchema = z.enum(['FREE', 'PREMIUM']);
export const UserRoleSchema = z.enum(['USER', 'ADMIN']);
export const VisibilitySchema = z.enum(['PUBLIC', 'PRIVATE']);
export const TargetTypeSchema = z.enum(['WORKFLOW', 'MINI_PROMPT']);

// Common phases (for reference, but users can define custom ones)
export const COMMON_PHASES = [
  'analysis',
  'design-architecture',
  'planning',
  'implementation',
  'testing-review',
] as const;

// Phase schema - allows any string, but suggests common phases
export const PhaseSchema = z
  .string()
  .min(1, 'Phase is required')
  .max(100, 'Phase must not exceed 100 characters')
  .regex(/^[a-z0-9-]+$/, 'Phase must be lowercase with hyphens (e.g., "my-custom-phase")');

// ============================================================================
// User Schemas
// ============================================================================

export const userCreateSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z.string().refine(
    (password) => validatePasswordComplexity(password).valid,
    (password) => ({
      message: validatePasswordComplexity(password).errors.join(', '),
    })
  ),
  tier: UserTierSchema.optional(),
  role: UserRoleSchema.optional(),
});

export const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(50).optional(),
  tier: UserTierSchema.optional(),
  role: UserRoleSchema.optional(),
});

// ============================================================================
// API Token Schemas
// ============================================================================

export const apiTokenCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Token name is required')
    .max(100, 'Token name must not exceed 100 characters'),
});

// ============================================================================
// Workflow Schemas
// ============================================================================

export const workflowCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Workflow name is required')
    .max(255, 'Workflow name must not exceed 255 characters'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  yamlContent: z.string().min(1, 'YAML content is required').refine(
    (yaml) => {
      try {
        // Basic YAML validation - try to parse
        parseYaml(yaml);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid YAML syntax' }
  ),
  visibility: VisibilitySchema.optional(),
  isActive: z.boolean().optional(),
});

export const workflowUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  yamlContent: z.string().min(1).refine(
    (yaml) => {
      try {
        parseYaml(yaml);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid YAML syntax' }
  ).optional(),
  visibility: VisibilitySchema.optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// Mini-Prompt Schemas
// ============================================================================

export const miniPromptCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Mini-prompt name is required')
    .max(255, 'Mini-prompt name must not exceed 255 characters'),
  content: z.string().min(1, 'Content is required'),
  phase: PhaseSchema, // User-definable phase (e.g., "analysis", "my-custom-phase")
  visibility: VisibilitySchema.optional(),
});

export const miniPromptUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  phase: PhaseSchema.optional(),
  visibility: VisibilitySchema.optional(),
});

// ============================================================================
// Rating Schemas
// ============================================================================

export const ratingCreateSchema = z.object({
  targetType: TargetTypeSchema,
  targetId: z.string().uuid('Invalid target ID format'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must not exceed 5'),
  comment: z.string().max(1000, 'Comment must not exceed 1000 characters').optional(),
});

export const ratingUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format Zod validation errors for user-friendly display
 * @param error - ZodError object
 * @returns Formatted error object
 */
export function formatZodErrors(error: z.ZodError): {
  errors: Array<{ field: string; message: string }>;
} {
  return {
    errors: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

/**
 * Validate UUID format
 * @param id - String to validate
 * @returns boolean
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// ============================================================================
// Type Exports
// ============================================================================

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type ApiTokenCreateInput = z.infer<typeof apiTokenCreateSchema>;
export type WorkflowCreateInput = z.infer<typeof workflowCreateSchema>;
export type WorkflowUpdateInput = z.infer<typeof workflowUpdateSchema>;
export type MiniPromptCreateInput = z.infer<typeof miniPromptCreateSchema>;
export type MiniPromptUpdateInput = z.infer<typeof miniPromptUpdateSchema>;
export type RatingCreateInput = z.infer<typeof ratingCreateSchema>;
export type RatingUpdateInput = z.infer<typeof ratingUpdateSchema>;

