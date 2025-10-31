import { StatCard } from "@/shared/ui/molecules";

export interface DashboardStatsData {
  totalWorkflows: number;
  totalMiniPrompts: number;
  activeWorkflows: number;
  publicItems: number;
}

interface DashboardStatsProps {
  stats: DashboardStatsData;
  userTier: string;
}

export function DashboardStats({ stats, userTier }: DashboardStatsProps) {
  const isFreeTier = userTier === "FREE";
  const limitReached = isFreeTier && stats.activeWorkflows >= 5;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        label="Total Workflows"
        value={stats.totalWorkflows}
        testId="stat-total-workflows"
        tooltip="Total number of workflows in your library (active and inactive)"
      />

      <StatCard
        label="Active Workflows"
        value={isFreeTier ? `${stats.activeWorkflows} / 5` : stats.activeWorkflows}
        subtext={limitReached ? "Limit reached" : undefined}
        variant={limitReached ? "danger" : "default"}
        testId="stat-active-workflows"
        tooltip={
          isFreeTier
            ? "Active workflows available in MCP server. FREE tier limit: 5 workflows. Upgrade to PREMIUM for unlimited."
            : "Active workflows available in MCP server. PREMIUM tier: unlimited active workflows."
        }
      />

      <StatCard
        label="Mini-Prompts"
        value={stats.totalMiniPrompts}
        testId="stat-mini-prompts"
        tooltip="Reusable prompt templates that can be used across multiple workflows"
      />

      <StatCard
        label="Public Items"
        value={stats.publicItems}
        testId="stat-public-items"
        tooltip="Number of your workflows and mini-prompts visible to the community"
      />
    </div>
  );
}
