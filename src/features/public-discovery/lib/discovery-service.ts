import { prisma } from "@/lib/db/client";
import { Prisma, TargetType } from "@prisma/client";
import {
  PublicWorkflowWithMeta,
  PublicMiniPromptWithMeta,
  PaginatedResult,
  DiscoveryQueryParams,
  WorkflowSortOption,
  MiniPromptSortOption,
  WorkflowFilters,
  MiniPromptFilters,
} from "../types";
import { getRatingStatsForMultiple } from "@/features/ratings/lib/rating-service";

const DEFAULT_PAGE_SIZE = 20;

/**
 * Get public workflows with pagination, filtering, and search
 */
export async function getPublicWorkflows(
  params: DiscoveryQueryParams,
  userId?: string
): Promise<PaginatedResult<PublicWorkflowWithMeta>> {
  const page = params.page || 1;
  const limit = params.limit || DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.WorkflowWhereInput = {
    visibility: "PUBLIC",
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
        { user: { username: { contains: params.search, mode: "insensitive" } } },
      ],
    }),
    ...((params.filters as WorkflowFilters)?.tagIds && (params.filters as WorkflowFilters).tagIds!.length > 0 && {
      tags: {
        some: {
          tagId: { in: (params.filters as WorkflowFilters).tagIds }
        }
      }
    }),
  };

  // Build orderBy
  const orderBy = getWorkflowOrderBy(params.sort as WorkflowSortOption);

  // Execute query
  const [workflows] = await Promise.all([
    prisma.workflow.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true },
        },
        stages: {
          include: {
            miniPrompts: {
              include: {
                miniPrompt: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            stages: true,
            references: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.workflow.count({ where }),
  ]);

  // Check if workflows are in user's library
  let userReferences: Set<string> = new Set();
  if (userId) {
    const refs = await prisma.workflowReference.findMany({
      where: { userId },
      select: { workflowId: true },
    });
    userReferences = new Set(refs.map((r) => r.workflowId));
  }

  // Fetch rating stats and usage stats
  const workflowIds = workflows.map((w) => w.id);
  const [ratingStatsMap, usageStatsMap] = await Promise.all([
    getRatingStatsForMultiple("WORKFLOW", workflowIds),
    getUsageStatsForMultiple("WORKFLOW", workflowIds),
  ]);

  // Enrich with metadata
  let items: PublicWorkflowWithMeta[] = workflows.map((workflow) => ({
    ...workflow,
    isInUserLibrary: userId ? userReferences.has(workflow.id) : false,
    averageRating: ratingStatsMap[workflow.id]?.averageRating || null,
    totalRatings: ratingStatsMap[workflow.id]?.totalRatings || 0,
    usageCount: usageStatsMap[workflow.id]?.usageCount || workflow._count.references,
  }));

  // Apply post-fetch filters
  if (params.filters) {
    const workflowFilters = params.filters as WorkflowFilters;
    items = items.filter((workflow) => {
      // Rating filter
      if (workflowFilters.rating) {
        const minRating = workflowFilters.rating === "4+" ? 4 : 3;
        if (!workflow.averageRating || workflow.averageRating < minRating) {
          return false;
        }
      }

      // Usage filter
      if (workflowFilters.minUsage) {
        const minUsage = parseInt(workflowFilters.minUsage);
        if (workflow.usageCount < minUsage) {
          return false;
        }
      }

      // Stage count filter
      if (workflowFilters.phaseCount) {
        const stageCount = workflow._count.stages;
        if (workflowFilters.phaseCount === "1-3" && (stageCount < 1 || stageCount > 3)) {
          return false;
        }
        if (workflowFilters.phaseCount === "4-5" && (stageCount < 4 || stageCount > 5)) {
          return false;
        }
        if (workflowFilters.phaseCount === "6+" && stageCount < 6) {
          return false;
        }
      }

      // Complexity filter
      if (workflowFilters.complexity) {
        if (workflow.complexity !== workflowFilters.complexity) {
          return false;
        }
      }

      return true;
    });
  }

  return {
    items,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

/**
 * Get public mini-prompts with pagination, filtering, and search
 */
export async function getPublicMiniPrompts(
  params: DiscoveryQueryParams,
  userId?: string
): Promise<PaginatedResult<PublicMiniPromptWithMeta>> {
  const page = params.page || 1;
  const limit = params.limit || DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.MiniPromptWhereInput = {
    visibility: "PUBLIC",
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
        { content: { contains: params.search, mode: "insensitive" } },
        { user: { username: { contains: params.search, mode: "insensitive" } } },
      ],
    }),
    ...((params.filters as MiniPromptFilters)?.tagIds && (params.filters as MiniPromptFilters).tagIds!.length > 0 && {
      tags: {
        some: {
          tagId: { in: (params.filters as MiniPromptFilters).tagIds }
        }
      }
    }),
  };

  // Build orderBy
  const orderBy = getMiniPromptOrderBy(params.sort as MiniPromptSortOption);

  // Execute query
  const [miniPrompts] = await Promise.all([
    prisma.miniPrompt.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true },
        },
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            stageMiniPrompts: true,
            references: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.miniPrompt.count({ where }),
  ]);

  // Check if mini-prompts are in user's library
  let userReferences: Set<string> = new Set();
  if (userId) {
    const refs = await prisma.miniPromptReference.findMany({
      where: { userId },
      select: { miniPromptId: true },
    });
    userReferences = new Set(refs.map((r) => r.miniPromptId));
  }

  // Fetch rating stats and usage stats
  const miniPromptIds = miniPrompts.map((m) => m.id);
  const [ratingStatsMap, usageStatsMap] = await Promise.all([
    getRatingStatsForMultiple("MINI_PROMPT", miniPromptIds),
    getUsageStatsForMultiple("MINI_PROMPT", miniPromptIds),
  ]);

  // Enrich with metadata
  let items: PublicMiniPromptWithMeta[] = miniPrompts.map((miniPrompt) => ({
    ...miniPrompt,
    isInUserLibrary: userId ? userReferences.has(miniPrompt.id) : false,
    averageRating: ratingStatsMap[miniPrompt.id]?.averageRating || null,
    totalRatings: ratingStatsMap[miniPrompt.id]?.totalRatings || 0,
    usageCount: usageStatsMap[miniPrompt.id]?.usageCount || miniPrompt._count.stageMiniPrompts,
  }));

  // Apply post-fetch filters
  if (params.filters) {
    const miniPromptFilters = params.filters as MiniPromptFilters;
    items = items.filter((miniPrompt) => {
      // Rating filter
      if (miniPromptFilters.rating) {
        const minRating = miniPromptFilters.rating === "4+" ? 4 : 3;
        if (!miniPrompt.averageRating || miniPrompt.averageRating < minRating) {
          return false;
        }
      }

      // Usage filter
      if (miniPromptFilters.minUsage) {
        const minUsage = parseInt(miniPromptFilters.minUsage);
        if (miniPrompt.usageCount < minUsage) {
          return false;
        }
      }

      return true;
    });
  }

  return {
    items,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

/**
 * Import workflow to user's library (create reference)
 */
export async function importWorkflow(
  workflowId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  // Verify workflow exists and is public
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, visibility: "PUBLIC" },
  });

  if (!workflow) {
    throw new Error("Workflow not found or not public");
  }

  // Check if already in library
  const existing = await prisma.workflowReference.findUnique({
    where: {
      userId_workflowId: { userId, workflowId },
    },
  });

  if (existing) {
    return { success: false, message: "Workflow already in your library" };
  }

  // Create reference
  await prisma.workflowReference.create({
    data: { userId, workflowId },
  });

  // Update usage stats
  await incrementUsageStats("WORKFLOW", workflowId);

  return { success: true, message: "Workflow added to your library" };
}

/**
 * Import mini-prompt to user's library (create reference)
 */
export async function importMiniPrompt(
  miniPromptId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  // Verify mini-prompt exists and is public
  const miniPrompt = await prisma.miniPrompt.findFirst({
    where: { id: miniPromptId, visibility: "PUBLIC" },
  });

  if (!miniPrompt) {
    throw new Error("Mini-prompt not found or not public");
  }

  // Check if already in library
  const existing = await prisma.miniPromptReference.findUnique({
    where: {
      userId_miniPromptId: { userId, miniPromptId },
    },
  });

  if (existing) {
    return { success: false, message: "Mini-prompt already in your library" };
  }

  // Create reference
  await prisma.miniPromptReference.create({
    data: { userId, miniPromptId },
  });

  // Update usage stats
  await incrementUsageStats("MINI_PROMPT", miniPromptId);

  return { success: true, message: "Mini-prompt added to your library" };
}

// Helper functions
function getWorkflowOrderBy(
  sort?: WorkflowSortOption
): Prisma.WorkflowOrderByWithRelationInput {
  switch (sort) {
    case "highest_rated":
      return { createdAt: "desc" };
    case "recent":
      return { createdAt: "desc" };
    case "popular":
    case "most_used":
    default:
      return { createdAt: "desc" };
  }
}

function getMiniPromptOrderBy(
  sort?: MiniPromptSortOption
): Prisma.MiniPromptOrderByWithRelationInput {
  switch (sort) {
    case "highest_rated":
      return { createdAt: "desc" };
    case "recent":
      return { createdAt: "desc" };
    case "popular":
    case "most_used":
    default:
      return { createdAt: "desc" };
  }
}

async function getUsageStatsForMultiple(
  targetType: TargetType,
  targetIds: string[]
): Promise<Record<string, { usageCount: number }>> {
  if (targetIds.length === 0) {
    return {};
  }

  const usageStats = await prisma.usageStats.findMany({
    where: {
      targetType,
      targetId: {
        in: targetIds,
      },
    },
    select: {
      targetId: true,
      usageCount: true,
    },
  });

  const statsMap: Record<string, { usageCount: number }> = {};
  for (const stat of usageStats) {
    statsMap[stat.targetId] = {
      usageCount: stat.usageCount,
    };
  }

  return statsMap;
}

async function incrementUsageStats(
  targetType: TargetType,
  targetId: string
): Promise<void> {
  await prisma.usageStats.upsert({
    where: {
      targetType_targetId: {
        targetType,
        targetId,
      },
    },
    create: {
      targetType,
      targetId,
      usageCount: 1,
      uniqueUsersCount: 1,
      lastUsedAt: new Date(),
    },
    update: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });
}
