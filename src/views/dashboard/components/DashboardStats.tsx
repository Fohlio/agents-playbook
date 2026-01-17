'use client';

import { useTranslations } from "next-intl";
import { StatCard } from "@/shared/ui/molecules";

export interface DashboardStatsData {
  totalWorkflows: number;
  totalMiniPrompts: number;
  activeWorkflows: number;
  publicItems: number;
}

interface DashboardStatsProps {
  stats: DashboardStatsData;
  userTier?: string;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const t = useTranslations('dashboard.stats');

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        label={t('totalWorkflows')}
        value={stats.totalWorkflows}
        testId="stat-total-workflows"
        tooltip={t('totalWorkflowsTooltip')}
      />

      <StatCard
        label={t('activeWorkflows')}
        value={stats.activeWorkflows}
        testId="stat-active-workflows"
        tooltip={t('activeWorkflowsTooltip')}
      />

      <StatCard
        label={t('miniPrompts')}
        value={stats.totalMiniPrompts}
        testId="stat-mini-prompts"
        tooltip={t('miniPromptsTooltip')}
      />

      <StatCard
        label={t('publicItems')}
        value={stats.publicItems}
        testId="stat-public-items"
        tooltip={t('publicItemsTooltip')}
      />
    </div>
  );
}
