import { redirect } from "next/navigation";
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
 * Dashboard Page
 *
 * Main landing page after user authentication.
 * Displays user statistics, active workflows, active mini-prompts, and quick actions.
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  // Fetch all dashboard data in parallel
  const [stats, activeWorkflows, activeMiniPrompts] = await Promise.all([
    getDashboardStats(session.user.id),
    getActiveWorkflows(session.user.id),
    getActiveMiniPrompts(session.user.id),
  ]);

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your workflows and mini-prompts</p>
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
