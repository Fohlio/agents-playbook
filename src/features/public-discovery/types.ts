import { Workflow, MiniPrompt, User, WorkflowStage, StageMiniPrompt } from "@prisma/client";

// Workflow with author and metadata
export interface PublicWorkflowWithMeta extends Workflow {
  user: Pick<User, "id" | "username">;
  stages?: (WorkflowStage & {
    miniPrompts: (StageMiniPrompt & {
      miniPrompt: MiniPrompt;
    })[];
  })[];
  _count: {
    stages: number;
    references: number; // Usage count placeholder
  };
  isInUserLibrary?: boolean;
  averageRating?: number; // TODO: Phase 3 - Replace with real ratings from Rating table
  totalRatings?: number; // TODO: Phase 3 - Replace with real ratings from Rating table
}

// Mini-prompt with author and metadata
export interface PublicMiniPromptWithMeta extends MiniPrompt {
  user: Pick<User, "id" | "username">;
  _count: {
    stageMiniPrompts: number; // Usage count placeholder
    references: number;
  };
  isInUserLibrary?: boolean;
  averageRating?: number; // TODO: Phase 3 - Replace with real ratings from Rating table
  totalRatings?: number; // TODO: Phase 3 - Replace with real ratings from Rating table
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
}

export interface MiniPromptFilters {
  rating?: "4+" | "3+";
}

export interface DiscoveryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: WorkflowSortOption | MiniPromptSortOption;
  filters?: WorkflowFilters | MiniPromptFilters;
}
