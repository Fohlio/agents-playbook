"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { loginSchema, type LoginInput } from "@/shared/lib/validators/auth";
import { Input, Button, FormField, Alert, Checkbox, Link } from "@/shared/ui/atoms";
import { ROUTES } from "@/shared/routes";

/**
 * Login Page
 * 
 * Allows existing users to sign in with email/password
 * Features:
 * - Form validation with Zod
 * - "Remember me" option (30-day vs 90-day session)
 * - Generic error messages for security
 * - Redirect to /dashboard after login
 */
export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('auth.login');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (session) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [session, router]);

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use direct fetch to avoid potential signIn client issues
      // First, get CSRF token
      const csrfResponse = await fetch('/api/auth/csrf');
      const csrfData = await csrfResponse.json();

      // Then, submit credentials - use redirect: 'follow' to let browser handle the redirect
      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe ? 'true' : 'false',
          csrfToken: csrfData.csrfToken,
        }),
        credentials: 'same-origin', // Include cookies
        // Don't specify redirect - let browser handle it
      });

      // After redirect completes, check the final URL
      const finalUrl = response.url;

      // If we ended up on the login page with an error, authentication failed
      if (finalUrl.includes('/auth/login') && finalUrl.includes('error=')) {
        setError(t('invalidCredentials'));
        setIsLoading(false);
        return;
      }

      // If we ended up on the login page without error, something went wrong
      if (finalUrl.includes('/auth/login')) {
        setError(t('loginError'));
        setIsLoading(false);
        return;
      }

      // If response is OK and we're not on login page, login succeeded
      // Redirect to dashboard
      window.location.href = ROUTES.DASHBOARD;
    } catch (err) {
      console.error('[Login] Error:', err);
      setError(t('loginError'));
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
        <Alert variant="error" testId="login-error-alert">{error}</Alert>
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
            testId="login-email-input"
            {...register("email")}
          />
        </FormField>

        <FormField
          label={t('password')}
          htmlFor="password"
          required
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder={t('passwordPlaceholder')}
            error={!!errors.password}
            fullWidth
            testId="login-password-input"
            {...register("password")}
          />
        </FormField>

        <Checkbox
          id="rememberMe"
          label={t('rememberMe')}
          testId="login-remember-me-checkbox"
          {...register("rememberMe")}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
          testId="login-submit-button"
        >
          {isLoading ? t('submitting') : t('submit')}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-gray-600">{t('noAccount')} </span>
        <Link href={ROUTES.REGISTER}>
          {t('signUp')}
        </Link>
      </div>
    </div>
  );
}
