import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import ProfileSection from "./ProfileSection";
import PasswordSection from "./PasswordSection";
import ApiTokensSection from "./ApiTokensSection";
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900" data-testid="settings-heading">Settings</h1>
        <p className="mt-2 text-sm text-gray-600" data-testid="settings-description">
          Manage your profile, password, and API tokens
        </p>
      </div>

      {/* Profile Section */}
      <ProfileSection user={session.user} />

      {/* Password Section */}
      <PasswordSection />

      {/* API Tokens Section */}
      <ApiTokensSection />
    </div>
  );
}
