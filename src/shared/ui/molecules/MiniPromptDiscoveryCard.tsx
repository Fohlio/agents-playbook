"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, Button, Badge } from "@/shared/ui/atoms";
import { ROUTES } from "@/shared/routes";
import { PublicMiniPromptWithMeta } from "@/features/public-discovery/types";
import { MiniPromptEditorModal } from "@/features/workflow-constructor/components/MiniPromptEditorModal";
import { RatingDisplay } from "@/features/ratings/ui/RatingDisplay";
import { RatingDialog } from "@/features/ratings/ui/RatingDialog";

interface MiniPromptDiscoveryCardProps {
  miniPrompt: PublicMiniPromptWithMeta;
  onImport: (id: string) => void;
  isAuthenticated: boolean;
  isImporting?: boolean;
  currentUserId?: string;
}

export function MiniPromptDiscoveryCard({
  miniPrompt,
  onImport,
  isAuthenticated,
  isImporting,
  currentUserId,
}: MiniPromptDiscoveryCardProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState<number | undefined>();
  const [localRating, setLocalRating] = useState<{ average: number | null; count: number }>({
    average: miniPrompt.averageRating,
    count: miniPrompt.totalRatings,
  });
  const isOwnMiniPrompt = currentUserId && miniPrompt.userId === currentUserId;

  const handleImportClick = () => {
    if (!isAuthenticated) {
      window.location.href = `${ROUTES.LOGIN}?returnUrl=${ROUTES.DISCOVER}`;
    } else {
      onImport(miniPrompt.id);
    }
  };

  const handleRateClick = async () => {
    if (!isAuthenticated) {
      window.location.href = `${ROUTES.LOGIN}?returnUrl=${ROUTES.DISCOVER}`;
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/ratings/user?targetType=MINI_PROMPT&targetId=${miniPrompt.id}`
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
        targetType: "MINI_PROMPT",
        targetId: miniPrompt.id,
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

  // Get first 150 chars of content
  const preview =
    miniPrompt.content.slice(0, 150) +
    (miniPrompt.content.length > 150 ? "..." : "");

  return (
    <>
      <Card testId={`mini-prompt-card-${miniPrompt.id}`}>
        <div className="p-6 cursor-pointer" onClick={() => setIsViewOpen(true)}>
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {miniPrompt.name}
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

        <div className="prose prose-sm max-w-none text-sm text-gray-600 mb-4 line-clamp-3">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{preview}</ReactMarkdown>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>By @{miniPrompt.user.username}</span>
        </div>

        <div className="flex items-center justify-between">
          <div
            className="text-xs text-gray-500"
            title={`Used in ${miniPrompt.usageCount} workflows`}
          >
            <span>{miniPrompt.usageCount}</span>
          </div>

          {!isOwnMiniPrompt && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRateClick();
                }}
                className="text-2xl text-gray-300 hover:text-yellow-400 transition-colors"
                title="Rate this mini-prompt"
                data-testid={`rate-button-${miniPrompt.id}`}
              >
                ☆
              </button>
              <Button
                variant={miniPrompt.isInUserLibrary ? "secondary" : "primary"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImportClick();
                }}
                disabled={miniPrompt.isInUserLibrary || isImporting}
                testId={`import-button-${miniPrompt.id}`}
              >
                {miniPrompt.isInUserLibrary
                  ? "In Library"
                  : isAuthenticated
                    ? "Add to Library"
                    : "Login to Import"}
              </Button>
            </div>
          )}
        </div>
        </div>
      </Card>

      <MiniPromptEditorModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        initialData={{
          name: miniPrompt.name,
          content: miniPrompt.content,
          visibility: miniPrompt.visibility as 'PUBLIC' | 'PRIVATE',
        }}
        viewOnly={true}
      />

      <RatingDialog
        isOpen={isRatingDialogOpen}
        onClose={() => setIsRatingDialogOpen(false)}
        targetType="MINI_PROMPT"
        targetId={miniPrompt.id}
        targetName={miniPrompt.name}
        currentRating={currentRating}
        onSubmit={handleSubmitRating}
      />
    </>
  );
}
