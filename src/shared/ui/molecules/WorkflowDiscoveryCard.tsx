"use client";

import { useState } from "react";
import { Card, Button, Badge } from "@/shared/ui/atoms";
import { ROUTES } from "@/shared/routes";
import { PublicWorkflowWithMeta } from "@/features/public-discovery/types";
import { WorkflowPreviewModal } from "./WorkflowPreviewModal";
import { RatingDisplay } from "@/features/ratings/ui/RatingDisplay";
import { RatingDialog } from "@/features/ratings/ui/RatingDialog";

interface WorkflowDiscoveryCardProps {
  workflow: PublicWorkflowWithMeta;
  onImport: (id: string) => void;
  isAuthenticated: boolean;
  isImporting?: boolean;
  currentUserId?: string;
}

export function WorkflowDiscoveryCard({
  workflow,
  onImport,
  isAuthenticated,
  isImporting,
  currentUserId,
}: WorkflowDiscoveryCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
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

  return (
    <>
      <div
        onClick={() => setIsPreviewOpen(true)}
        className="cursor-pointer"
      >
        <Card
          testId={`workflow-card-${workflow.id}`}
          className="hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              {workflow.name}
            </h3>
            {localRating.average !== null && localRating.count > 0 && (
              <RatingDisplay
                averageRating={localRating.average}
                totalRatings={localRating.count}
                size="sm"
                showCount={true}
              />
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {workflow.description || "No description available"}
          </p>

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

          {!isOwnWorkflow && (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRateClick();
                }}
                className="text-2xl text-gray-300 hover:text-yellow-400 transition-colors"
                title="Rate this workflow"
                data-testid={`rate-button-${workflow.id}`}
              >
                ☆
              </button>
              <Button
                variant={workflow.isInUserLibrary ? "secondary" : "primary"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImportClick();
                }}
                disabled={workflow.isInUserLibrary || isImporting}
                testId={`import-button-${workflow.id}`}
              >
                {workflow.isInUserLibrary
                  ? "In Library"
                  : isAuthenticated
                    ? "Add to Library"
                    : "Login to Import"}
              </Button>
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
    </>
  );
}
