"use client";

import { Card } from "@/shared/ui/atoms";
import { CardActionsMenu } from "./CardActionsMenu";
import { TagBadgeList } from "./TagBadgeList";
import { ModelBadgeList } from "./ModelBadgeList";
import VisibilityIcon from "@mui/icons-material/Visibility";

/**
 * Data structure for mini-prompt display
 * This is a simplified view model for the UI component
 */
export interface MiniPromptCardData {
  id: string;
  name: string;
  description: string | null;
  user: {
    username: string | null;
  };
  workflowsCount: number;
  referencesCount: number;
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
export interface MiniPromptCardState {
  isActive: boolean;
  isPublic: boolean;
  isDuplicating?: boolean;
  isRemoving?: boolean;
  isImporting?: boolean;
}

/**
 * Visibility flags for different actions
 */
export interface MiniPromptCardVisibility {
  showActive?: boolean;
  showPublic?: boolean;
  showShare?: boolean;
  showRate?: boolean;
  showEdit?: boolean;
  showDuplicate?: boolean;
  showRemove?: boolean;
  showImport?: boolean;
  isOwned?: boolean;
}

/**
 * Callback handlers for all card actions
 */
export interface MiniPromptCardHandlers {
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

export interface MiniPromptDiscoveryCardProps {
  miniPrompt: MiniPromptCardData;
  state: MiniPromptCardState;
  visibility: MiniPromptCardVisibility;
  handlers: MiniPromptCardHandlers;
  testId?: string;
}

/**
 * MiniPromptDiscoveryCard - Pure UI Component
 *
 * A presentation-only card component for displaying mini-prompt information.
 * All business logic (API calls, state management) should be handled by
 * a parent container/widget component.
 *
 * FSD Layer: shared/ui/molecules
 * - No imports from features/
 * - No internal API calls
 * - All data and handlers passed as props
 */
export function MiniPromptDiscoveryCard({
  miniPrompt,
  state,
  visibility,
  handlers,
  testId,
}: MiniPromptDiscoveryCardProps) {
  const cardTestId = testId || `mini-prompt-${miniPrompt.id}`;

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
          onEdit={handlers.onEdit}
          onDuplicate={handlers.onDuplicate}
          onRemove={handlers.onRemove}
          onImport={handlers.onImport}
          showActive={visibility.showActive}
          showPublic={visibility.showPublic}
          showShare={visibility.showShare}
          showRate={visibility.showRate}
          showEdit={visibility.showEdit}
          showDuplicate={visibility.showDuplicate}
          showRemove={visibility.showRemove}
          showImport={visibility.showImport}
          isDuplicating={state.isDuplicating}
          isRemoving={state.isRemoving}
          isImporting={state.isImporting}
          isOwned={visibility.isOwned}
          testId={cardTestId}
        />
      </div>

      <Card
        testId={`mini-prompt-card-${miniPrompt.id}`}
        className="hover:shadow-lg transition-shadow h-full flex flex-col touch-manipulation"
      >
        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3 pr-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
              {miniPrompt.name}
            </h3>
            {miniPrompt.rating &&
              miniPrompt.rating.average !== null &&
              miniPrompt.rating.count > 0 && (
                <div className="flex items-center gap-1 text-sm flex-shrink-0">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium">
                    {miniPrompt.rating.average.toFixed(1)}
                  </span>
                  <span className="text-gray-400">
                    ({miniPrompt.rating.count})
                  </span>
                </div>
              )}
          </div>

          <div className="flex-1">
            {miniPrompt.description ? (
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                {miniPrompt.description}
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-gray-400 italic mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                No description
              </p>
            )}
          </div>

          {miniPrompt.tags && miniPrompt.tags.length > 0 && (
            <div className="mb-2">
              <TagBadgeList tags={miniPrompt.tags} />
            </div>
          )}

          {miniPrompt.models && miniPrompt.models.length > 0 && (
            <div className="mb-2 sm:mb-3">
              <ModelBadgeList models={miniPrompt.models} />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
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
              @{miniPrompt.user.username || "unknown"}
            </span>
            <span
              className="flex items-center gap-1"
              title={`Used in ${miniPrompt.workflowsCount} workflows`}
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {miniPrompt.workflowsCount}{" "}
              <span className="hidden sm:inline">
                {miniPrompt.workflowsCount === 1 ? "workflow" : "workflows"}
              </span>
            </span>
            <span
              className="flex items-center gap-1"
              title={`${miniPrompt.referencesCount} users added this to their library`}
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
              {miniPrompt.referencesCount}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
