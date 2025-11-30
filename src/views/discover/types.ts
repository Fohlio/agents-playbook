import { Workflow, MiniPrompt, User, WorkflowStage, StageMiniPrompt, WorkflowComplexity, Model, ModelCategory } from "@prisma/client";

// Model type for cards
export interface ModelForCard {
  id: string;
  name: string;
  slug: string;
  category: ModelCategory;
}

// Workflow with author and metadata
export interface PublicWorkflowWithMeta extends Workflow {
  user: Pick<User, "id" | "username">;
  stages?: (WorkflowStage & {
    miniPrompts: (StageMiniPrompt & {
      miniPrompt: MiniPrompt;
    })[];
  })[];
  models?: { model: Model }[];
  _count: {
    stages: number;
    references: number;
  };
  isInUserLibrary?: boolean;
  averageRating: number | null;
  totalRatings: number;
  usageCount: number;
}

// Mini-prompt with author and metadata
export interface PublicMiniPromptWithMeta extends MiniPrompt {
  user: Pick<User, "id" | "username">;
  models?: { model: Model }[];
  _count: {
    stageMiniPrompts: number;
    references: number;
  };
  isInUserLibrary?: boolean;
  averageRating: number | null;
  totalRatings: number;
  usageCount: number;
}

// Pagination result
export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter and sort options
export type WorkflowSortOption =
  | "recent"
  | "popular"
  | "highest_rated"
  | "most_used";

export type MiniPromptSortOption =
  | "recent"
  | "popular"
  | "highest_rated"
  | "most_used";

export interface WorkflowFilters {
  rating?: "4+" | "3+";
  phaseCount?: "1-3" | "4-5" | "6+";
  complexity?: WorkflowComplexity;
  minUsage?: "10" | "50";
  tagIds?: string[];
  modelIds?: string[];
}

export interface MiniPromptFilters {
  rating?: "4+" | "3+";
  minUsage?: "10" | "50";
  tagIds?: string[];
  modelIds?: string[];
}

export interface DiscoveryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: WorkflowSortOption | MiniPromptSortOption;
  filters?: WorkflowFilters | MiniPromptFilters;
}
