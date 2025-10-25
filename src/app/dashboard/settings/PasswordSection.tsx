"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Button, FormField, Alert } from "@/shared/ui/atoms";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(1, "New password is required"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type PasswordInput = z.infer<typeof passwordSchema>;

/**
 * PasswordSection Component
 *
 * Allows users to change their password
 * Features:
 * - Current password verification
 * - New password with confirmation
 * - Password complexity validation
 */
export default function PasswordSection() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/v1/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to change password");
      }

      setSuccess("Password changed successfully");
      reset(); // Clear form fields
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-base p-6" data-testid="password-section">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900" data-testid="password-heading">Change Password</h2>
          <p className="mt-1 text-sm text-gray-600" data-testid="password-description">
            Update your password to keep your account secure
          </p>
        </div>

        {error && <Alert variant="error" testId="password-error-alert">{error}</Alert>}
        {success && <Alert variant="success" testId="password-success-alert">{success}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Password */}
          <FormField
            label="Current Password"
            htmlFor="currentPassword"
            required
            error={errors.currentPassword?.message}
          >
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={!!errors.currentPassword}
              fullWidth
              testId="password-current-input"
              {...register("currentPassword")}
            />
          </FormField>

          {/* New Password */}
          <FormField
            label="New Password"
            htmlFor="newPassword"
            required
            error={errors.newPassword?.message}
            helperText="Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character"
          >
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              error={!!errors.newPassword}
              fullWidth
              testId="password-new-input"
              {...register("newPassword")}
            />
          </FormField>

          {/* Confirm New Password */}
          <FormField
            label="Confirm New Password"
            htmlFor="confirmNewPassword"
            required
            error={errors.confirmNewPassword?.message}
          >
            <Input
              id="confirmNewPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              error={!!errors.confirmNewPassword}
              fullWidth
              testId="password-confirm-input"
              {...register("confirmNewPassword")}
            />
          </FormField>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              testId="password-save-button"
            >
              {isLoading ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
