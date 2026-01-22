import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/server/auth/auth";
import ProfileSection from "./ProfileSection";
import PasswordSection from "./PasswordSection";
import { ApiTokensSection } from "@/features/api-tokens";
import { OpenAIKeySettings } from "@/features/ai-assistant/components/OpenAIKeySettings";
import { ROUTES } from "@/shared/routes";

/**
 * Settings Page - Cyberpunk Style
 *
 * User profile management, password changes, and API token management
 */
export default async function SettingsPage() {
  const session = await auth();
  const t = await getTranslations("settings");

  if (!session) {
    redirect(ROUTES.LOGIN);
  }

  const header = t("header");

  return (
    <div className="max-w-4xl mx-auto space-y-8" data-testid="settings-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-1">
          <span
            className="cyber-text-glitch"
            data-text={header}
            style={{
              color: "#00ffff",
              textShadow: "0 0 10px #00ffff, 0 0 20px #00ffff40",
            }}
          >
            {header}
          </span>
        </h1>
        <p className="text-cyan-100/60 font-mono text-sm uppercase tracking-wider">
          {t("subtitle")}
        </p>
      </div>

      {/* Profile Section */}
      <ProfileSection user={session.user} />

      {/* Password Section */}
      <PasswordSection />

      {/* OpenAI API Key Section */}
      <OpenAIKeySettings />

      {/* API Tokens Section */}
      <ApiTokensSection />
    </div>
  );
}
