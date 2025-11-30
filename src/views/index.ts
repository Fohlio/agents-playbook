// Pages layer - FSD (Feature-Sliced Design)
//
// Pages are complete page compositions that combine widgets, features, and shared components.
// Import directly from specific pages to avoid naming conflicts:
//
// import { DashboardStats } from "@/views/dashboard";
// import { WorkflowConstructor } from "@/views/workflow-constructor";
// import { WorkflowsDiscoverySection } from "@/views/discover";
// import { WorkflowsSection } from "@/views/library";
// import { GettingStartedWizard } from "@/views/getting-started";
//
// Note: We don't re-export everything here to avoid naming conflicts
// between pages that export similar functions (e.g., both dashboard and
// workflow-constructor have deleteWorkflow, deleteMiniPrompt, etc.)
