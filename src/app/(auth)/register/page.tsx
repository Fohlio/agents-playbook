"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import Link from "next/link";
import { Input, Button, FormField, Alert } from "@/shared/ui/atoms";

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
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        throw new Error(result.error || "Registration failed");
      }

      // Auto-login after successful registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/");
      } else {
        throw new Error("Login failed after registration");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 bg-white p-8 rounded-lg shadow-base">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Start managing your AI agent workflows
        </p>
      </div>

      {error && (
        <Alert variant="error" testId="register-error-alert">{error}</Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          label="Email"
          htmlFor="email"
          required
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={!!errors.email}
            fullWidth
            testId="register-email-input"
            {...register("email")}
          />
        </FormField>

        <FormField
          label="Username"
          htmlFor="username"
          required
          error={errors.username?.message}
        >
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="johndoe"
            error={!!errors.username}
            fullWidth
            testId="register-username-input"
            {...register("username")}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          required
          error={errors.password?.message}
          helperText="Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character"
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={!!errors.password}
            fullWidth
            testId="register-password-input"
            {...register("password")}
          />
        </FormField>

        <FormField
          label="Confirm Password"
          htmlFor="confirmPassword"
          required
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
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
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <Link
          href="/login"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
