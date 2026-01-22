import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/server/auth/auth";
import { ROUTES } from "@/shared/routes";
import {
  getDashboardStats,
  getActiveWorkflows,
  getActiveMiniPrompts,
  DashboardStats,
  ActiveWorkflowsSection,
  ActiveMiniPromptsSection,
  QuickActions,
} from "@/views/dashboard";

/**
 * Dashboard Page - Cyberpunk Command Center
 *
 * Main landing page after user authentication.
 * Displays user statistics, active workflows, active mini-prompts, and quick actions.
 */
export default async function DashboardPage() {
  const session = await auth();
  const t = await getTranslations('dashboard');

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  // Fetch all dashboard data in parallel
  const [stats, activeWorkflows, activeMiniPrompts] = await Promise.all([
    getDashboardStats(session.user.id),
    getActiveWorkflows(session.user.id),
    getActiveMiniPrompts(session.user.id),
  ]);

  const header = t('header');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with glitch effect */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">
            <span className="cyber-text-glitch" data-text={header} style={{ color: '#00ffff', textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff40' }}>
              {header}
            </span>
          </h1>
          <p className="text-cyan-100/60 font-mono text-sm uppercase tracking-wider">
            {t('subtitle')}
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Statistics */}
      <DashboardStats stats={stats} userTier={session.user.tier || "FREE"} />

      {/* Active Workflows */}
      <ActiveWorkflowsSection workflows={activeWorkflows} />

      {/* Active Mini-Prompts */}
      <ActiveMiniPromptsSection miniPrompts={activeMiniPrompts} />
    </div>
  );
}
