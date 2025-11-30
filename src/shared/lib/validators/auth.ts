import { z } from "zod";

/**
 * Authentication Validation Schemas
 * 
 * Zod schemas for validating authentication-related inputs:
 * - Registration
 * - Login
 * - Profile updates
 * - Password changes
 * - API token operations
 */

/**
 * Password complexity validation result
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate password complexity requirements
 * @param password - Password to validate
 * @returns PasswordValidationResult - Validation result with errors
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePasswordComplexity(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Registration Schema
 * Validates user registration input
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens"
      ),
    password: z
      .string()
      .min(1, "Password is required"),
    confirmPassword: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login Schema
 * Validates user login input
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required"),
  rememberMe: z
    .boolean()
    .default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Update Username Schema
 * Validates username update input
 */
export const updateUsernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
});

export type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>;

/**
 * Change Password Schema
 * Validates password change input
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required"),
    confirmNewPassword: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Create API Token Schema
 * Validates API token creation input
 */
export const createTokenSchema = z.object({
  name: z
    .string()
    .min(1, "Token name is required")
    .max(100, "Token name must be at most 100 characters"),
});

export type CreateTokenInput = z.infer<typeof createTokenSchema>;

