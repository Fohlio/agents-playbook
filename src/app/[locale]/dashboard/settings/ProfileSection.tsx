"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Card, CardHeader, CardActions } from "@/shared/ui/atoms";
import { useSession } from "next-auth/react";

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
});

type UsernameInput = z.infer<typeof usernameSchema>;

interface ProfileSectionProps {
  user: {
    id?: string;
    email?: string | null;
    username?: string | null;
    tier?: string | null;
  };
}

/**
 * ProfileSection Component - Cyberpunk Style
 */
export default function ProfileSection({ user }: ProfileSectionProps) {
  const t = useTranslations("settings.profile");
  const { update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsernameInput>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: user.username || "",
    },
  });

  const onSubmit = async (data: UsernameInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update username");
      }

      setSuccess(t("updated"));

      await update({
        ...user,
        username: data.username,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card testId="profile-section">
      <CardHeader
        title={t("title")}
        description={t("subtitle")}
        testId="profile-heading"
      />

      {error && (
        <div className="mb-4 p-3 bg-pink-500/10 border border-pink-500/50 text-pink-400 font-mono text-sm" data-testid="profile-error-alert">
          &gt; ERROR: {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-400 font-mono text-sm" data-testid="profile-success-alert">
          &gt; SUCCESS: {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email (read-only) */}
        <div>
          <label htmlFor="email" className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            value={user.email || ""}
            disabled
            className="w-full px-4 py-2.5 bg-[#050508]/50 border border-cyan-500/30 text-cyan-100/50 font-mono text-sm"
            data-testid="profile-email-input"
          />
          <p className="mt-1 text-xs text-cyan-100/30 font-mono">
            {t("emailCannotChange")}
          </p>
        </div>

        {/* Username (editable) */}
        <div>
          <label htmlFor="username" className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            {t("username")} <span className="text-pink-400">*</span>
          </label>
          <input
            id="username"
            type="text"
            placeholder={t("usernamePlaceholder")}
            className={`w-full px-4 py-2.5 bg-[#050508]/50 border font-mono text-sm text-cyan-100 placeholder:text-cyan-500/30 focus:outline-none transition-all ${
              errors.username 
                ? 'border-pink-500/50 focus:border-pink-400 focus:shadow-[0_0_15px_rgba(255,0,102,0.2)]' 
                : 'border-cyan-500/50 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)]'
            }`}
            data-testid="profile-username-input"
            {...register("username")}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-pink-400 font-mono">{errors.username.message}</p>
          )}
        </div>

        {/* Tier Badge */}
        <div>
          <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            {t("accountTier")}
          </label>
          <div>
            <span 
              className="px-3 py-1 text-xs font-mono bg-purple-500/20 text-purple-400 border border-purple-500/50 uppercase"
              data-testid="profile-tier-badge"
            >
              {user.tier || "FREE"}
            </span>
          </div>
        </div>

        <CardActions>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            data-testid="profile-save-button"
          >
            {isLoading ? t("saving") : t("saveChanges")}
          </button>
        </CardActions>
      </form>
    </Card>
  );
}
