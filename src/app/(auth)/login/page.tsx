"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import Link from "next/link";
import { Input, Button, FormField, Alert, Checkbox } from "@/shared/ui/atoms";

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
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe ? "true" : "false",
        redirect: false,
      });

      if (result?.error) {
        // Generic error message for security (don't reveal if user exists)
        setError("Invalid credentials");
      } else if (result?.ok) {
        router.push("/dashboard");
      }
    } catch {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 bg-white p-8 rounded-lg shadow-base">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back to Agents Playbook
        </p>
      </div>

      {error && (
        <Alert variant="error">{error}</Alert>
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
            {...register("email")}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          required
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={!!errors.password}
            fullWidth
            {...register("password")}
          />
        </FormField>

        <Checkbox
          id="rememberMe"
          label="Remember me for 90 days"
          {...register("rememberMe")}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-gray-600">Don&apos;t have an account? </span>
        <Link
          href="/auth/register"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
