"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { registerSchema, type RegisterInput } from "@/shared/lib/validators/auth";
import { Input, Button, FormField, Alert, Link } from "@/shared/ui/atoms";
import { ROUTES } from "@/shared/routes";

/**
 * Registration Page
 *
 * Allows new users to create an account with email/password
 * Features:
 * - Form validation with Zod
 * - Password complexity requirements
 * - Auto-login after successful registration
 * - Redirect to /dashboard after registration
 */
export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('auth.register');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Register user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('registrationFailed'));
      }

      // Auto-login after successful registration using direct fetch
      // First, get CSRF token
      const csrfResponse = await fetch('/api/auth/csrf');
      const csrfData = await csrfResponse.json();

      // Then, submit credentials for auto-login
      const loginResponse = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: data.email,
          password: data.password,
          csrfToken: csrfData.csrfToken,
        }),
        credentials: 'same-origin',
      });

      // Check if auto-login succeeded
      const finalUrl = loginResponse.url;
      if (finalUrl.includes('/auth/login') && finalUrl.includes('error=')) {
        throw new Error(t('loginAfterRegisterFailed'));
      }

      // Redirect to dashboard
      window.location.href = ROUTES.DASHBOARD;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('registrationFailed'));
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 bg-white p-8 rounded-lg shadow-base">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('subtitle')}
        </p>
      </div>

      {error && (
        <Alert variant="error" testId="register-error-alert">{error}</Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          label={t('email')}
          htmlFor="email"
          required
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            error={!!errors.email}
            fullWidth
            testId="register-email-input"
            {...register("email")}
          />
        </FormField>

        <FormField
          label={t('username')}
          htmlFor="username"
          required
          error={errors.username?.message}
        >
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder={t('usernamePlaceholder')}
            error={!!errors.username}
            fullWidth
            testId="register-username-input"
            {...register("username")}
          />
        </FormField>

        <FormField
          label={t('password')}
          htmlFor="password"
          required
          error={errors.password?.message}
          helperText={t('passwordHelp')}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={t('passwordPlaceholder')}
            error={!!errors.password}
            fullWidth
            testId="register-password-input"
            {...register("password")}
          />
        </FormField>

        <FormField
          label={t('confirmPassword')}
          htmlFor="confirmPassword"
          required
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder={t('passwordPlaceholder')}
            error={!!errors.confirmPassword}
            fullWidth
            testId="register-confirm-password-input"
            {...register("confirmPassword")}
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
          testId="register-submit-button"
        >
          {isLoading ? t('submitting') : t('submit')}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-gray-600">{t('hasAccount')} </span>
        <Link href={ROUTES.LOGIN}>
          {t('signIn')}
        </Link>
      </div>
    </div>
  );
}
