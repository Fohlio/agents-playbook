import { prisma } from "@/lib/db/client";
import { Workflow, MiniPrompt } from "@prisma/client";

export interface DashboardStats {
  totalWorkflows: number;
  totalMiniPrompts: number;
  activeWorkflows: number;
  publicItems: number;
}

export interface WorkflowWithUsage extends Workflow {
  _count: {
    stages: number;
  };
  tags?: Array<{ tag: { id: string; name: string; } }>;
}

export interface MiniPromptWithUsage extends MiniPrompt {
  _count: {
    stageMiniPrompts: number;
  };
}

export interface ActivityItem {
  id: string;
  type: "workflow" | "mini_prompt";
  action: "created" | "updated" | "activated";
  targetId: string;
  targetName: string;
  timestamp: Date;
}

/**
 * Get dashboard statistics for user
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [totalWorkflows, totalMiniPrompts, activeWorkflows, publicWorkflows, publicMiniPrompts] =
    await Promise.all([
      prisma.workflow.count({ where: { userId } }),
      prisma.miniPrompt.count({ where: { userId } }),
      prisma.workflow.count({ where: { userId, isActive: true } }),
      prisma.workflow.count({ where: { userId, visibility: "PUBLIC" } }),
      prisma.miniPrompt.count({ where: { userId, visibility: "PUBLIC" } }),
    ]);

  return {
    totalWorkflows,
    totalMiniPrompts,
    activeWorkflows,
    publicItems: publicWorkflows + publicMiniPrompts,
  };
}

/**
 * Get active workflows for user
 * Includes both owned and referenced (imported) workflows
 */
export async function getActiveWorkflows(userId: string): Promise<WorkflowWithUsage[]> {
  // Get owned active workflows
  const ownedWorkflows = await prisma.workflow.findMany({
    where: { userId, isActive: true },
    include: {
      _count: {
        select: { stages: true },
      },
      tags: {
        select: {
          tag: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  // Get referenced active workflows
  const referencedWorkflows = await prisma.workflowReference.findMany({
    where: {
      userId,
      workflow: { isActive: true }
    },
    include: {
      workflow: {
        include: {
          _count: {
            select: { stages: true },
          },
          tags: {
            select: {
              tag: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  });

  // Combine and deduplicate
  const allWorkflows = [
    ...ownedWorkflows,
    ...referencedWorkflows.map(ref => ref.workflow),
  ];

  const uniqueWorkflows = Array.from(
    new Map(allWorkflows.map((w) => [w.id, w])).values()
  ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return uniqueWorkflows;
}

/**
 * Get active mini-prompts for user
 * Includes both owned and referenced (imported) mini-prompts
 */
export async function getActiveMiniPrompts(userId: string): Promise<MiniPromptWithUsage[]> {
  // Get owned active mini-prompts
  const ownedMiniPrompts = await prisma.miniPrompt.findMany({
    where: { userId, isActive: true },
    include: {
      _count: {
        select: { stageMiniPrompts: true },
      },
    },
  });

  // Get referenced active mini-prompts
  const referencedMiniPrompts = await prisma.miniPromptReference.findMany({
    where: {
      userId,
      miniPrompt: { isActive: true }
    },
    include: {
      miniPrompt: {
        include: {
          _count: {
            select: { stageMiniPrompts: true },
          },
        },
      },
    },
  });

  // Combine and deduplicate
  const allMiniPrompts = [
    ...ownedMiniPrompts,
    ...referencedMiniPrompts.map(ref => ref.miniPrompt),
  ];

  const uniqueMiniPrompts = Array.from(
    new Map(allMiniPrompts.map((m) => [m.id, m])).values()
  ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return uniqueMiniPrompts;
}

/**
 * Get all workflows for user with optional filters
 */
export async function getWorkflows(
  userId: string,
  filters?: { isActive?: boolean; visibility?: "PUBLIC" | "PRIVATE" }
): Promise<WorkflowWithUsage[]> {
  return prisma.workflow.findMany({
    where: { userId, ...filters },
    include: {
      _count: {
        select: { stages: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Get mini-prompts for user
 */
export async function getMiniPrompts(userId: string): Promise<MiniPromptWithUsage[]> {
  return prisma.miniPrompt.findMany({
    where: { userId },
    include: {
      _count: {
        select: { stageMiniPrompts: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Get recent activity for user (last 10 items)
 * Based on created/updated timestamps from workflows and mini-prompts
 */
export async function getRecentActivity(userId: string): Promise<ActivityItem[]> {
  const [workflows, miniPrompts] = await Promise.all([
    prisma.workflow.findMany({
      where: { userId },
      select: { id: true, name: true, createdAt: true, updatedAt: true, isActive: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.miniPrompt.findMany({
      where: { userId },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  const activities: ActivityItem[] = [];

  workflows.forEach((w) => {
    activities.push({
      id: `workflow-${w.id}`,
      type: "workflow",
      action: w.createdAt.getTime() === w.updatedAt.getTime() ? "created" : w.isActive ? "activated" : "updated",
      targetId: w.id,
      targetName: w.name,
      timestamp: w.updatedAt,
    });
  });

  miniPrompts.forEach((m) => {
    activities.push({
      id: `mini-prompt-${m.id}`,
      type: "mini_prompt",
      action: m.createdAt.getTime() === m.updatedAt.getTime() ? "created" : "updated",
      targetId: m.id,
      targetName: m.name,
      timestamp: m.updatedAt,
    });
  });

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);
}

