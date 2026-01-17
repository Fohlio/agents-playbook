"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Input, Button, FormField, Alert, Badge, Card, CardHeader, CardActions } from "@/shared/ui/atoms";
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
 * ProfileSection Component
 *
 * Allows users to:
 * - View email (read-only)
 * - Edit username
 * - View tier badge (FREE/PREMIUM)
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

      // Update session with new username
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

      {error && <Alert variant="error" testId="profile-error-alert">{error}</Alert>}
      {success && <Alert variant="success" testId="profile-success-alert">{success}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email (read-only) */}
          <FormField label={t("email")} htmlFor="email">
            <Input
              id="email"
              type="email"
              value={user.email || ""}
              disabled
              fullWidth
              testId="profile-email-input"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t("emailCannotChange")}
            </p>
          </FormField>

          {/* Username (editable) */}
          <FormField
            label={t("username")}
            htmlFor="username"
            required
            error={errors.username?.message}
          >
            <Input
              id="username"
              type="text"
              placeholder={t("usernamePlaceholder")}
              error={!!errors.username}
              fullWidth
              testId="profile-username-input"
              {...register("username")}
            />
          </FormField>

          {/* Tier Badge */}
          <FormField label={t("accountTier")} htmlFor="tier">
            <div>
              <Badge variant="primary" testId="profile-tier-badge">
                {user.tier || "FREE"}
              </Badge>
            </div>
          </FormField>

          <CardActions>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              testId="profile-save-button"
            >
              {isLoading ? t("saving") : t("saveChanges")}
            </Button>
          </CardActions>
        </form>
    </Card>
  );
}
