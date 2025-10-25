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
      />

      <StatCard
        label="Active Workflows"
        value={isFreeTier ? `${stats.activeWorkflows} / 5` : stats.activeWorkflows}
        subtext={limitReached ? "Limit reached" : undefined}
        variant={limitReached ? "danger" : "default"}
        testId="stat-active-workflows"
      />

      <StatCard
        label="Mini-Prompts"
        value={stats.totalMiniPrompts}
        testId="stat-mini-prompts"
      />

      <StatCard
        label="Public Items"
        value={stats.publicItems}
        testId="stat-public-items"
      />
    </div>
  );
}
