import { Metadata } from "next";
import { MySharedItemsSection } from "@/features/sharing/components/MySharedItemsSection";

export const metadata: Metadata = {
  title: "My Shared Items | Agents Playbook",
  description: "Manage your shared workflows and mini-prompts",
};

/**
 * Sharing Management Page
 *
 * Dedicated page for managing shared items.
 * Displays all share links created by the user with management capabilities.
 */
export default function SharingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Shared Items</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your share links for workflows and mini-prompts
        </p>
      </div>

      <MySharedItemsSection />
    </div>
  );
}

