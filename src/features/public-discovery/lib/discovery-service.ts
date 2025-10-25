import { prisma } from "@/lib/db/client";
import { Prisma } from "@prisma/client";
import {
  PublicWorkflowWithMeta,
  PublicMiniPromptWithMeta,
  PaginatedResult,
  DiscoveryQueryParams,
  WorkflowFilters,
  MiniPromptFilters,
  WorkflowSortOption,
  MiniPromptSortOption,
} from "../types";

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
  };

  // Build orderBy
  const orderBy = getWorkflowOrderBy(params.sort as WorkflowSortOption);

  // Execute query
  const [workflows, total] = await Promise.all([
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

  // Enrich with metadata
  const items: PublicWorkflowWithMeta[] = workflows.map((workflow) => ({
    ...workflow,
    isInUserLibrary: userId ? userReferences.has(workflow.id) : false,
    averageRating: 4.5, // TODO: Phase 3 - Replace with real ratings
    totalRatings: 23, // TODO: Phase 3 - Replace with real ratings
  }));

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
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
        { content: { contains: params.search, mode: "insensitive" } },
        { user: { username: { contains: params.search, mode: "insensitive" } } },
      ],
    }),
  };

  // Build orderBy
  const orderBy = getMiniPromptOrderBy(params.sort as MiniPromptSortOption);

  // Execute query
  const [miniPrompts, total] = await Promise.all([
    prisma.miniPrompt.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true },
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

  // Enrich with metadata
  const items: PublicMiniPromptWithMeta[] = miniPrompts.map((miniPrompt) => ({
    ...miniPrompt,
    isInUserLibrary: userId ? userReferences.has(miniPrompt.id) : false,
    averageRating: 4.5, // TODO: Phase 3 - Replace with real ratings
    totalRatings: 15, // TODO: Phase 3 - Replace with real ratings
  }));

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
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

  return { success: true, message: "Mini-prompt added to your library" };
}

// Helper functions
function getWorkflowOrderBy(
  sort?: WorkflowSortOption
): Prisma.WorkflowOrderByWithRelationInput {
  switch (sort) {
    case "popular":
    case "most_used":
      // TODO: Phase 3 - Order by actual usage stats
      return { createdAt: "desc" };
    case "highest_rated":
      // TODO: Phase 3 - Order by actual ratings
      return { createdAt: "desc" };
    case "recent":
    default:
      return { createdAt: "desc" };
  }
}

function getMiniPromptOrderBy(
  sort?: MiniPromptSortOption
): Prisma.MiniPromptOrderByWithRelationInput {
  switch (sort) {
    case "popular":
    case "most_used":
      // TODO: Phase 3 - Order by actual usage stats
      return { createdAt: "desc" };
    case "highest_rated":
      // TODO: Phase 3 - Order by actual ratings
      return { createdAt: "desc" };
    case "recent":
    default:
      return { createdAt: "desc" };
  }
}
