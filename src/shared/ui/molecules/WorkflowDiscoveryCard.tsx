"use client";

import { useState } from "react";
import { Card } from "@/shared/ui/atoms";
import { MarkdownContent } from "@/shared/ui/atoms/MarkdownContent";
import { ComplexityBadge } from "@/shared/ui/atoms/ComplexityBadge";
import { ConfirmDialog, Tooltip } from "@/shared/ui/molecules";
import { ROUTES } from "@/shared/routes";
import { PublicWorkflowWithMeta } from "@/features/public-discovery/types";
import { WorkflowPreviewModal } from "./WorkflowPreviewModal";
import { RatingDisplay } from "@/features/ratings/ui/RatingDisplay";
import { RatingDialog } from "@/features/ratings/ui/RatingDialog";
import { TagBadgeList } from "./TagBadgeList";

interface WorkflowDiscoveryCardProps {
  workflow: PublicWorkflowWithMeta & {
    tags?: { tag: { id: string; name: string; color: string | null } }[];
  };
  onImport: (id: string) => void;
  onRemove?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  isAuthenticated: boolean;
  isImporting?: boolean;
  currentUserId?: string;
}

export function WorkflowDiscoveryCard({
  workflow,
  onImport,
  onRemove,
  onDuplicate,
  isAuthenticated,
  isImporting,
  currentUserId,
}: WorkflowDiscoveryCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isActive, setIsActive] = useState(workflow.isActive);
  const [isPublic, setIsPublic] = useState(workflow.visibility === 'PUBLIC');
  const [currentRating, setCurrentRating] = useState<number | undefined>();
  const [localRating, setLocalRating] = useState<{ average: number | null; count: number }>({
    average: workflow.averageRating,
    count: workflow.totalRatings,
  });
  const isOwnWorkflow = Boolean(currentUserId && workflow.userId === currentUserId);

  const handleImportClick = () => {
    if (!isAuthenticated) {
      window.location.href = `${ROUTES.LOGIN}?returnUrl=${ROUTES.DISCOVER}`;
    } else {
      onImport(workflow.id);
    }
  };

  const handleRateClick = async () => {
    if (!isAuthenticated) {
      window.location.href = `${ROUTES.LOGIN}?returnUrl=${ROUTES.DISCOVER}`;
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/ratings/user?targetType=WORKFLOW&targetId=${workflow.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setCurrentRating(data.rating?.rating);
      }
    } catch (error) {
      console.error("Failed to fetch user rating:", error);
    }

    setIsRatingDialogOpen(true);
  };

  const handleSubmitRating = async (rating: number) => {
    const response = await fetch("/api/v1/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "WORKFLOW",
        targetId: workflow.id,
        rating,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit rating");
    }

    const data = await response.json();
    setLocalRating({
      average: data.stats.averageRating,
      count: data.stats.totalRatings,
    });
    setCurrentRating(rating);
  };

  const handleRemoveClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!onRemove) return;

    setIsRemoving(true);
    try {
      await onRemove(workflow.id);
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Failed to remove workflow:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleToggleActive = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newActiveState = e.target.checked;
    setIsActive(newActiveState);

    try {
      await fetch(`/api/workflows/${workflow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActiveState }),
      });
    } catch (error) {
      console.error('Failed to update workflow active state:', error);
      setIsActive(!newActiveState); // Revert on error
    }
  };

  const handleToggleVisibility = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVisibility = e.target.checked ? 'PUBLIC' : 'PRIVATE';
    setIsPublic(e.target.checked);

    try {
      await fetch(`/api/workflows/${workflow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVisibility }),
      });
    } catch (error) {
      console.error('Failed to update workflow visibility:', error);
      setIsPublic(!e.target.checked); // Revert on error
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDuplicate) return;

    setIsDuplicating(true);

    try {
      const response = await fetch(`/api/workflows/${workflow.id}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        onDuplicate(workflow.id); // Call parent callback to refresh
      }
    } catch (error) {
      console.error('Failed to duplicate workflow:', error);
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setIsPreviewOpen(true)}
        className="cursor-pointer h-full"
      >
        <Card
          testId={`workflow-card-${workflow.id}`}
          className="hover:shadow-lg transition-shadow h-full flex flex-col"
        >
          <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                {workflow.name}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-1">
              {localRating.average !== null && localRating.count > 0 && (
                <RatingDisplay
                  averageRating={localRating.average}
                  totalRatings={localRating.count}
                  size="sm"
                />
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
                className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed"
              />
            ) : (
              <p className="text-sm text-gray-400 italic mb-4 line-clamp-3 leading-relaxed">
                No description
              </p>
            )}
          </div>

          {workflow.tags && workflow.tags.length > 0 && (
            <div className="mb-3">
              <TagBadgeList tags={workflow.tags.map(wt => wt.tag)} />
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              @{workflow.user.username}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {workflow._count.stages} {workflow._count.stages === 1 ? 'stage' : 'stages'}
            </span>
            <span
              className="flex items-center gap-1"
              title={`${workflow.usageCount} users use this workflow`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {workflow.usageCount}
            </span>
          </div>

          {/* Actions Row - single unified row for all workflows */}
          {workflow.isInUserLibrary && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                {/* Active checkbox - shown for all library items */}
                <Tooltip content="When active, this workflow is available in MCP tools for AI assistants">
                  <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={handleToggleActive}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </Tooltip>

                {/* Public visibility checkbox - only for owned workflows */}
                {isOwnWorkflow && (
                  <Tooltip content="When public, this workflow is discoverable by other users">
                    <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={handleToggleVisibility}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Public</span>
                    </label>
                  </Tooltip>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {/* Rate button - only for non-owned workflows */}
                {!isOwnWorkflow && (
                  <Tooltip content="Rate this workflow to help others discover quality content">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRateClick();
                      }}
                      className="text-2xl text-gray-300 hover:text-yellow-400 transition-colors leading-none"
                      title="Rate this workflow"
                      data-testid={`rate-button-${workflow.id}`}
                    >
                      ☆
                    </button>
                  </Tooltip>
                )}

                {/* Edit button - only for owned workflows */}
                {isOwnWorkflow && (
                  <Tooltip content="Edit this workflow">
                    <a
                      href={`/dashboard/library/workflows/${workflow.id}/constructor`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      data-testid={`edit-button-${workflow.id}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </a>
                  </Tooltip>
                )}

                {/* Duplicate button - for all library items */}
                <Tooltip content="Duplicate this workflow">
                  <button
                    onClick={handleDuplicate}
                    disabled={isDuplicating}
                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    data-testid={`duplicate-button-${workflow.id}`}
                  >
                    {isDuplicating ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </Tooltip>

                {/* Delete/Remove button */}
                {isOwnWorkflow ? (
                  <Tooltip content="Delete this workflow">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveClick();
                      }}
                      disabled={isRemoving}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      data-testid={`remove-button-${workflow.id}`}
                    >
                      {isRemoving ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </Tooltip>
                ) : (
                  <Tooltip content="Remove from library">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveClick();
                      }}
                      disabled={isRemoving}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      data-testid={`remove-button-${workflow.id}`}
                    >
                      {isRemoving ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          )}

{/* Import button for workflows not in library */}
          {!workflow.isInUserLibrary && isAuthenticated && (
            <div className="flex items-center justify-end gap-2">
              <Tooltip content="Rate this workflow to help others discover quality content">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRateClick();
                  }}
                  className="text-2xl text-gray-300 hover:text-yellow-400 transition-colors leading-none"
                  title="Rate this workflow"
                  data-testid={`rate-button-${workflow.id}`}
                >
                  ☆
                </button>
              </Tooltip>
              <Tooltip content="Add this workflow to your personal library and use it with AI assistants">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImportClick();
                  }}
                  disabled={isImporting}
                  className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid={`import-button-${workflow.id}`}
                >
                  {isImporting ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </button>
              </Tooltip>
            </div>
          )}
          </div>
        </Card>
      </div>

      <WorkflowPreviewModal
        workflow={workflow}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onImport={handleImportClick}
        isAuthenticated={isAuthenticated}
        isImporting={isImporting}
        isOwnWorkflow={isOwnWorkflow}
      />

      <RatingDialog
        isOpen={isRatingDialogOpen}
        onClose={() => setIsRatingDialogOpen(false)}
        targetType="WORKFLOW"
        targetId={workflow.id}
        targetName={workflow.name}
        currentRating={currentRating}
        onSubmit={handleSubmitRating}
      />

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmRemove}
        title="Remove from Library"
        message={`Are you sure you want to remove "${workflow.name}" from your library?`}
        confirmLabel="Remove"
        variant="danger"
        loading={isRemoving}
        testId={`confirm-remove-${workflow.id}`}
      />
    </>
  );
}
