"use client";

import Link from "next/link";
import { Card } from "@/shared/ui/atoms";
import { MarkdownContent } from "@/shared/ui/atoms/MarkdownContent";
import { ComplexityBadge } from "@/shared/ui/atoms/ComplexityBadge";
import { UsageHint } from "@/shared/ui/atoms/UsageHint";
import { CardActionsMenu } from "./CardActionsMenu";
import { TagBadgeList } from "./TagBadgeList";
import { ModelBadgeList } from "./ModelBadgeList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { WorkflowComplexity } from "@prisma/client";

/**
 * Data structure for workflow display
 * This is a simplified view model for the UI component
 */
export interface WorkflowCardData {
  id: string;
  name: string;
  description: string | null;
  complexity: WorkflowComplexity | null;
  user: {
    username: string | null;
  };
  stagesCount: number;
  usageCount: number;
  tags?: Array<{ id: string; name: string; color: string | null }>;
  models?: Array<{ id: string; name: string; slug?: string; category: 'LLM' | 'IMAGE' }>;
  rating?: {
    average: number | null;
    count: number;
  };
}

/**
 * State values managed externally and passed to the card
 */
export interface WorkflowCardState {
  isActive: boolean;
  isPublic: boolean;
  isDuplicating?: boolean;
  isRemoving?: boolean;
  isImporting?: boolean;
}

/**
 * Visibility flags for different actions
 */
export interface WorkflowCardVisibility {
  showActive?: boolean;
  showPublic?: boolean;
  showShare?: boolean;
  showRate?: boolean;
  showEdit?: boolean;
  showDuplicate?: boolean;
  showRemove?: boolean;
  showImport?: boolean;
  showUsageHint?: boolean;
  isOwned?: boolean;
}

/**
 * Callback handlers for all card actions
 */
export interface WorkflowCardHandlers {
  onCardClick?: () => void;
  onToggleActive?: (checked: boolean) => void;
  onTogglePublic?: (checked: boolean) => void;
  onShare?: () => void;
  onRate?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onRemove?: () => void;
  onImport?: () => void;
}

export interface WorkflowDiscoveryCardProps {
  workflow: WorkflowCardData;
  state: WorkflowCardState;
  visibility: WorkflowCardVisibility;
  handlers: WorkflowCardHandlers;
  editHref?: string;
  testId?: string;
}

/**
 * WorkflowDiscoveryCard - Pure UI Component
 *
 * A presentation-only card component for displaying workflow information.
 * All business logic (API calls, state management) should be handled by
 * a parent container/widget component.
 *
 * FSD Layer: shared/ui/molecules
 * - No imports from features/
 * - No internal API calls
 * - All data and handlers passed as props
 */
export function WorkflowDiscoveryCard({
  workflow,
  state,
  visibility,
  handlers,
  editHref,
  testId,
}: WorkflowDiscoveryCardProps) {
  const cardTestId = testId || `workflow-${workflow.id}`;

  const handleEditClick = () => {
    if (handlers.onEdit) {
      handlers.onEdit();
    }
  };

  return (
    <div
      onClick={handlers.onCardClick}
      className="cursor-pointer h-full group relative"
    >
      {/* Eye icon hover indicator - top left */}
      <div
        className="
          absolute top-3 left-3 z-10
          opacity-0 group-hover:opacity-100 
          transition-opacity duration-200
          pointer-events-none
          hidden md:block
        "
        data-testid={`${cardTestId}-hover`}
      >
        <div className="bg-white/95 p-1.5 rounded-full shadow-sm">
          <VisibilityIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        </div>
      </div>

      {/* Three-dots menu - top right */}
      <div
        className="absolute top-3 right-3 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <CardActionsMenu
          isActive={state.isActive}
          isPublic={state.isPublic}
          onToggleActive={handlers.onToggleActive}
          onTogglePublic={handlers.onTogglePublic}
          onShare={handlers.onShare}
          onRate={handlers.onRate}
          onEdit={editHref ? undefined : handleEditClick}
          onDuplicate={handlers.onDuplicate}
          onRemove={handlers.onRemove}
          onImport={handlers.onImport}
          showActive={visibility.showActive}
          showPublic={visibility.showPublic}
          showShare={visibility.showShare}
          showRate={visibility.showRate}
          showEdit={visibility.showEdit && !editHref}
          showDuplicate={visibility.showDuplicate}
          showRemove={visibility.showRemove}
          showImport={visibility.showImport}
          isDuplicating={state.isDuplicating}
          isRemoving={state.isRemoving}
          isImporting={state.isImporting}
          isOwned={visibility.isOwned}
          testId={cardTestId}
        />
        {/* Edit link - rendered separately to use Next.js Link */}
        {visibility.showEdit && editHref && (
          <Link
            href={editHref}
            onClick={(e) => e.stopPropagation()}
            className="sr-only"
            data-testid={`${cardTestId}-edit-link`}
          >
            Edit
          </Link>
        )}
      </div>

      <Card
        testId={`workflow-card-${workflow.id}`}
        className="hover:shadow-lg transition-shadow h-full flex flex-col"
      >
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3 pr-8">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-cyan-100 hover:text-cyan-400 transition-colors">
                {workflow.name}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-1">
              {workflow.rating &&
                workflow.rating.average !== null &&
                workflow.rating.count > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium text-cyan-100">
                      {workflow.rating.average.toFixed(1)}
                    </span>
                    <span className="text-cyan-100/50">
                      ({workflow.rating.count})
                    </span>
                  </div>
                )}
              {workflow.complexity && (
                <ComplexityBadge complexity={workflow.complexity} size="sm" />
              )}
            </div>
          </div>

          <div className="flex-1">
            {workflow.description ? (
              <MarkdownContent
                content={workflow.description}
                className="text-sm text-cyan-100/70 mb-4 line-clamp-3 leading-relaxed"
              />
            ) : (
              <p className="text-sm text-cyan-100/50 italic mb-4 line-clamp-3 leading-relaxed">
                No description
              </p>
            )}
          </div>

          {workflow.tags && workflow.tags.length > 0 && (
            <div className="mb-2">
              <TagBadgeList tags={workflow.tags} />
            </div>
          )}

          {workflow.models && workflow.models.length > 0 && (
            <div className="mb-3">
              <ModelBadgeList models={workflow.models} />
            </div>
          )}

          {visibility.showUsageHint && (
            <div className="mb-3" onClick={(e) => e.stopPropagation()}>
              <UsageHint workflowName={workflow.name} />
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-cyan-100/60">
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              @{workflow.user.username || "unknown"}
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {workflow.stagesCount}{" "}
              {workflow.stagesCount === 1 ? "stage" : "stages"}
            </span>
            <span
              className="flex items-center gap-1"
              title={`${workflow.usageCount} users use this workflow`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {workflow.usageCount}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
