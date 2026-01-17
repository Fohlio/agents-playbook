import { auth } from "@/server/auth/auth";
import { getTranslations } from "next-intl/server";
import { Tabs } from "@/shared/ui/molecules/Tabs";
import { WorkflowsDiscoverySection } from "@/views/discover/components/WorkflowsDiscoverySection";
import { MiniPromptsDiscoverySection } from "@/views/discover/components/MiniPromptsDiscoverySection";

export default async function DiscoverPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id;
  const t = await getTranslations("discover");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-600 mt-2">
          {t("subtitle")}
        </p>
      </div>

      <Tabs
        defaultTab="workflows"
        tabs={[
          {
            id: "workflows",
            label: t("filters.sortBy") === "Sort By" ? "Workflows" : "Воркфлоу",
            content: <WorkflowsDiscoverySection isAuthenticated={isAuthenticated} currentUserId={userId} />,
          },
          {
            id: "mini-prompts",
            label: t("filters.sortBy") === "Sort By" ? "Mini-Prompts" : "Мини-промпты",
            content: <MiniPromptsDiscoverySection isAuthenticated={isAuthenticated} currentUserId={userId} />,
          },
        ]}
      />
    </div>
  );
}
