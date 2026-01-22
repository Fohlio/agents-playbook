"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/shared/lib/validators/auth";
import { ROUTES } from "@/shared/routes";

/**
 * Login Page - Cyberpunk Style
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
  const t = useTranslations("auth.login");

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
      const csrfResponse = await fetch("/api/auth/csrf");
      const csrfData = await csrfResponse.json();

      // Then, submit credentials - use redirect: 'follow' to let browser handle the redirect
      const response = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe ? "true" : "false",
          csrfToken: csrfData.csrfToken,
        }),
        credentials: "same-origin", // Include cookies
        // Don't specify redirect - let browser handle it
      });

      // After redirect completes, check the final URL
      const finalUrl = response.url;

      // If we ended up on the login page with an error, authentication failed
      if (finalUrl.includes("/auth/login") && finalUrl.includes("error=")) {
        setError(t("invalidCredentials"));
        setIsLoading(false);
        return;
      }

      // If we ended up on the login page without error, something went wrong
      if (finalUrl.includes("/auth/login")) {
        setError(t("loginError"));
        setIsLoading(false);
        return;
      }

      // If response is OK and we're not on login page, login succeeded
      // Redirect to dashboard
      window.location.href = ROUTES.DASHBOARD;
    } catch (err) {
      console.error("[Login] Error:", err);
      setError(t("loginError"));
      setIsLoading(false);
    }
  };

  return (
    <div
      className="bg-[#0a0a0f]/90 backdrop-blur-sm border border-cyan-500/30 p-8 shadow-[0_0_50px_rgba(0,255,255,0.1)]"
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-2">
          <span
            className="cyber-text-glitch cyber-text-cyan"
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
          data-testid="login-error-alert"
        >
          <span className="text-pink-500">&gt;</span> ERROR: {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              data-testid="login-email-input"
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
              autoComplete="current-password"
              placeholder={t("passwordPlaceholder")}
              data-testid="login-password-input"
              className={`w-full bg-[#050508] border ${errors.password ? "border-pink-500" : "border-cyan-500/30"} text-white pl-10 pr-4 py-3 font-mono text-sm placeholder:text-cyan-100/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all`}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-pink-400 font-mono">
              &gt; {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            data-testid="login-remember-me-checkbox"
            className="w-4 h-4 bg-[#050508] border border-cyan-500/50 rounded-none checked:bg-cyan-500 focus:ring-0 focus:ring-offset-0"
            {...register("rememberMe")}
          />
          <label
            htmlFor="rememberMe"
            className="ml-3 text-sm text-cyan-100/60 font-mono"
          >
            {t("rememberMe")}
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          data-testid="login-submit-button"
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
        <span className="px-4 text-xs font-mono text-cyan-500/50">
          {`// ${t("orConnectWith")} //`}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          disabled
          className="py-3 bg-[#050508] border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(0,255,255,0.2)] disabled:opacity-50 transition-all"
        >
          GitHub
        </button>
        <button
          type="button"
          disabled
          className="py-3 bg-[#050508] border border-pink-500/30 text-pink-400 font-mono text-xs uppercase hover:border-pink-400 hover:shadow-[0_0_10px_rgba(255,0,102,0.2)] disabled:opacity-50 transition-all"
        >
          Google
        </button>
        <button
          type="button"
          disabled
          className="py-3 bg-[#050508] border border-purple-500/30 text-purple-400 font-mono text-xs uppercase hover:border-purple-400 hover:shadow-[0_0_10px_rgba(204,0,255,0.2)] disabled:opacity-50 transition-all"
        >
          Discord
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <span className="text-sm text-cyan-100/40 font-mono">
          {t("noAccount")}{" "}
        </span>
        <Link
          href={ROUTES.REGISTER}
          className="text-sm text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
        >
          [{t("signUp").toUpperCase()}]
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
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>{t("encryptedConnection")}</span>
      </div>
    </div>
  );
}
