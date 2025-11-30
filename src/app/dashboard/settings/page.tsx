import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import ProfileSection from "./ProfileSection";
import PasswordSection from "./PasswordSection";
import { ApiTokensSection } from "@/features/api-tokens";
import { OpenAIKeySettings } from "@/features/ai-assistant/components/OpenAIKeySettings";
import { ROUTES } from "@/shared/routes";

/**
 * Settings Page
 *
 * User profile management, password changes, and API token management
 * Requires authentication - redirects to /login if not authenticated
 */
export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8" data-testid="settings-page">
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
