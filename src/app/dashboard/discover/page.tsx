import { auth } from "@/server/auth/auth";
import { Tabs } from "@/shared/ui/molecules/Tabs";
import { WorkflowsDiscoverySection } from "@/views/discover/components/WorkflowsDiscoverySection";
import { MiniPromptsDiscoverySection } from "@/views/discover/components/MiniPromptsDiscoverySection";

export default async function DiscoverPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover</h1>
        <p className="text-gray-600 mt-2">
          Browse and import public workflows and mini-prompts from the community
        </p>
      </div>

      <Tabs
        defaultTab="workflows"
        tabs={[
          {
            id: "workflows",
            label: "Workflows",
            content: <WorkflowsDiscoverySection isAuthenticated={isAuthenticated} currentUserId={userId} />,
          },
          {
            id: "mini-prompts",
            label: "Mini-Prompts",
            content: <MiniPromptsDiscoverySection isAuthenticated={isAuthenticated} currentUserId={userId} />,
          },
        ]}
      />
    </div>
  );
}
