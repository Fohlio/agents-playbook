/**
 * Dashboard Feature - Public API
 *
 * Following FSD (Feature-Sliced Design) principles:
 * - Only export what's needed by consumers
 * - Hide internal implementation details
 * - Use @/features/dashboard for all imports
 */

// ============================================================================
// Components (UI)
// ============================================================================
export { DashboardStats } from "./components/DashboardStats";
export { ActiveWorkflowsSection } from "./components/ActiveWorkflowsSection";
export { ActiveMiniPromptsSection } from "./components/ActiveMiniPromptsSection";
export { QuickActions } from "./components/QuickActions";

// ============================================================================
// API (Data Access Layer)
// ============================================================================
export {
  getDashboardStats,
  getActiveWorkflows,
  getActiveMiniPrompts,
  getWorkflows,
  getMiniPrompts,
  getRecentActivity,
} from "./lib/dashboard-service";

// ============================================================================
// Actions (Mutations)
// ============================================================================
export {
  activateWorkflow,
  deactivateWorkflow,
  deleteWorkflow,
  toggleWorkflowVisibility,
} from "./actions/workflow-actions";

export {
  activateMiniPrompt,
  deactivateMiniPrompt,
  deleteMiniPrompt,
  toggleMiniPromptVisibility,
} from "./actions/mini-prompt-actions";

// ============================================================================
// Types
// ============================================================================
export type {
  DashboardStats as DashboardStatsData,
  WorkflowWithUsage,
  MiniPromptWithUsage,
  ActivityItem,
} from "./lib/dashboard-service";
