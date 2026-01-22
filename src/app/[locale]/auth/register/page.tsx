"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  registerSchema,
  type RegisterInput,
} from "@/shared/lib/validators/auth";
import { ROUTES } from "@/shared/routes";

type PasswordStrengthLevel = "none" | "weak" | "fair" | "good" | "strong";

interface PasswordStrength {
  score: number;
  label: PasswordStrengthLevel;
  color: string;
}

/**
 * Registration Page - Cyberpunk Style
 *
 * Allows new users to create an account with email/password
 * Features:
 * - Form validation with Zod
 * - Password complexity requirements with strength indicator
 * - Auto-login after successful registration
 * - Redirect to /dashboard after registration
 */
export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("auth.register");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  // Calculate password strength
  const passwordStrength = useMemo((): PasswordStrength => {
    if (!password) return { score: 0, label: "none", color: "cyan-500/20" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: "weak", color: "pink-500" };
    if (score <= 3) return { score, label: "fair", color: "yellow-500" };
    if (score <= 4) return { score, label: "good", color: "cyan-500" };
    return { score, label: "strong", color: "green-500" };
  }, [password]);

  const getStrengthColor = (color: string): string => {
    const colorMap: Record<string, string> = {
      "pink-500": "#ff0066",
      "green-500": "#00ff66",
      "cyan-500": "#00ffff",
      "yellow-500": "#ffff00",
    };
    return colorMap[color] || "rgba(0, 255, 255, 0.2)";
  };

  const getStrengthTextClass = (color: string): string => {
    const classMap: Record<string, string> = {
      "pink-500": "text-pink-400",
      "green-500": "text-green-400",
      "cyan-500": "text-cyan-400",
      "yellow-500": "text-yellow-400",
    };
    return classMap[color] || "text-cyan-400";
  };

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
        throw new Error(result.error || t("registrationFailed"));
      }

      // Auto-login after successful registration using direct fetch
      // First, get CSRF token
      const csrfResponse = await fetch("/api/auth/csrf");
      const csrfData = await csrfResponse.json();

      // Then, submit credentials for auto-login
      const loginResponse = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: data.email,
          password: data.password,
          csrfToken: csrfData.csrfToken,
        }),
        credentials: "same-origin",
      });

      // Check if auto-login succeeded
      const finalUrl = loginResponse.url;
      if (finalUrl.includes("/auth/login") && finalUrl.includes("error=")) {
        throw new Error(t("loginAfterRegisterFailed"));
      }

      // Redirect to dashboard
      window.location.href = ROUTES.DASHBOARD;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("registrationFailed"));
      setIsLoading(false);
    }
  };

  return (
    <div
      className="bg-[#0a0a0f]/90 backdrop-blur-sm border border-pink-500/30 p-8 shadow-[0_0_50px_rgba(255,0,102,0.1)]"
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-2">
          <span
            className="cyber-text-glitch cyber-text-pink"
            data-text={t("header")}
          >
            {t("header")}
          </span>
        </h1>
        <p className="text-sm text-cyan-100/60 font-mono">{t("subtitle")}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="mb-6 p-4 bg-pink-500/10 border border-pink-500/50 text-pink-400 font-mono text-sm"
          data-testid="register-error-alert"
        >
          <span className="text-pink-500">&gt;</span> ERROR: {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-mono uppercase tracking-wider text-cyan-400 mb-2"
          >
            {t("email")} <span className="text-pink-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500">
              @
            </span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              data-testid="register-email-input"
              className={`w-full bg-[#050508] border ${errors.email ? "border-pink-500" : "border-cyan-500/30"} text-white pl-10 pr-4 py-3 font-mono text-sm placeholder:text-cyan-100/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all`}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-pink-400 font-mono">
              &gt; {errors.email.message}
            </p>
          )}
        </div>

        {/* Username Field */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-mono uppercase tracking-wider text-cyan-400 mb-2"
          >
            {t("username")} <span className="text-pink-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500 font-mono">
              $
            </span>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder={t("usernamePlaceholder")}
              data-testid="register-username-input"
              className={`w-full bg-[#050508] border ${errors.username ? "border-pink-500" : "border-pink-500/30"} text-white pl-10 pr-4 py-3 font-mono text-sm placeholder:text-cyan-100/30 focus:outline-none focus:border-pink-400 focus:shadow-[0_0_15px_rgba(255,0,102,0.2)] transition-all`}
              {...register("username")}
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-xs text-pink-400 font-mono">
              &gt; {errors.username.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-mono uppercase tracking-wider text-cyan-400 mb-2"
          >
            {t("password")} <span className="text-pink-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </span>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder={t("passwordPlaceholder")}
              data-testid="register-password-input"
              className={`w-full bg-[#050508] border ${errors.password ? "border-pink-500" : "border-cyan-500/30"} text-white pl-10 pr-4 py-3 font-mono text-sm placeholder:text-cyan-100/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all`}
              {...register("password")}
            />
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className="h-1 flex-1 transition-all"
                    style={{
                      boxShadow:
                        level <= passwordStrength.score
                          ? `0 0 5px ${getStrengthColor(passwordStrength.color)}`
                          : "none",
                      backgroundColor:
                        level <= passwordStrength.score
                          ? getStrengthColor(passwordStrength.color)
                          : "rgba(0, 255, 255, 0.2)",
                    }}
                  ></div>
                ))}
              </div>
              <p
                className={`text-xs font-mono ${getStrengthTextClass(passwordStrength.color)}`}
              >
                {t("passwordStrength.label")}:{" "}
                {t(`passwordStrength.${passwordStrength.label}`)}
              </p>
            </div>
          )}

          <p className="mt-1 text-xs text-cyan-100/40 font-mono">
            {t("passwordHelp")}
          </p>
          {errors.password && (
            <p className="mt-1 text-xs text-pink-400 font-mono">
              &gt; {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-mono uppercase tracking-wider text-cyan-400 mb-2"
          >
            {t("confirmPassword")} <span className="text-pink-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder={t("passwordPlaceholder")}
              data-testid="register-confirm-password-input"
              className={`w-full bg-[#050508] border ${errors.confirmPassword ? "border-pink-500" : "border-cyan-500/30"} text-white pl-10 pr-4 py-3 font-mono text-sm placeholder:text-cyan-100/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all`}
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-pink-400 font-mono">
              &gt; {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            required
            className="mt-1 w-4 h-4 bg-[#050508] border border-pink-500/50 rounded-none checked:bg-pink-500 focus:ring-0 focus:ring-offset-0"
          />
          <label
            htmlFor="terms"
            className="ml-3 text-sm text-cyan-100/60 font-mono"
          >
            {t("acceptTerms")}{" "}
            <span className="text-pink-400 hover:text-pink-300 cursor-pointer">
              [{t("protocolTerms")}]
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          data-testid="register-submit-button"
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_30px_rgba(255,0,102,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t("submitting")}
            </span>
          ) : (
            <>{t("submitButton")} &gt;</>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <span className="text-sm text-cyan-100/40 font-mono">
          {t("hasAccount")}{" "}
        </span>
        <Link
          href={ROUTES.LOGIN}
          className="text-sm text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
        >
          [{t("signIn").toUpperCase()}]
        </Link>
      </div>

      {/* Security Badge */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-green-400/60">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span>{t("secureRegistration")}</span>
      </div>
    </div>
  );
}
