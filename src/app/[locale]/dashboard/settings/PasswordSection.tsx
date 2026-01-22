"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Card, CardHeader, CardActions } from "@/shared/ui/atoms";

type PasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

/**
 * PasswordSection Component - Cyberpunk Style
 */
export default function PasswordSection() {
  const t = useTranslations("settings.password");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create schema with translations
  const passwordSchema = useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(1, t("currentRequired")),
          newPassword: z.string().min(1, t("newRequired")),
          confirmNewPassword: z.string().min(1, t("confirmRequired")),
        })
        .refine((data) => data.newPassword === data.confirmNewPassword, {
          message: t("mismatch"),
          path: ["confirmNewPassword"],
        }),
    [t]
  );

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

      setSuccess(t("changed"));
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("changeFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClassName = (hasError: boolean): string =>
    `w-full px-4 py-2.5 bg-[#050508]/50 border font-mono text-sm text-cyan-100 placeholder:text-cyan-500/30 focus:outline-none transition-all ${
      hasError
        ? "border-pink-500/50 focus:border-pink-400 focus:shadow-[0_0_15px_rgba(255,0,102,0.2)]"
        : "border-cyan-500/50 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)]"
    }`;

  return (
    <Card testId="password-section">
      <CardHeader
        title={t("title")}
        description={t("subtitle")}
        testId="password-heading"
      />

      {error && (
        <div
          className="mb-4 p-3 bg-pink-500/10 border border-pink-500/50 text-pink-400 font-mono text-sm"
          data-testid="password-error-alert"
        >
          &gt; ERROR: {error}
        </div>
      )}
      {success && (
        <div
          className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-400 font-mono text-sm"
          data-testid="password-success-alert"
        >
          &gt; SUCCESS: {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2"
          >
            {t("currentPassword")} <span className="text-pink-400">*</span>
          </label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={getInputClassName(!!errors.currentPassword)}
            data-testid="password-current-input"
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-pink-400 font-mono">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2"
          >
            {t("newPassword")} <span className="text-pink-400">*</span>
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={getInputClassName(!!errors.newPassword)}
            data-testid="password-new-input"
            {...register("newPassword")}
          />
          <p className="mt-1 text-xs text-cyan-100/30 font-mono">
            {t("newPasswordHelp")}
          </p>
          {errors.newPassword && (
            <p className="mt-1 text-xs text-pink-400 font-mono">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label
            htmlFor="confirmNewPassword"
            className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2"
          >
            {t("confirmPassword")} <span className="text-pink-400">*</span>
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={getInputClassName(!!errors.confirmNewPassword)}
            data-testid="password-confirm-input"
            {...register("confirmNewPassword")}
          />
          {errors.confirmNewPassword && (
            <p className="mt-1 text-xs text-pink-400 font-mono">
              {errors.confirmNewPassword.message}
            </p>
          )}
        </div>

        <CardActions>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(255,0,102,0.4)] disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
            data-testid="password-save-button"
          >
            {isLoading ? t("changing") : t("changePassword")}
          </button>
        </CardActions>
      </form>
    </Card>
  );
}
