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

