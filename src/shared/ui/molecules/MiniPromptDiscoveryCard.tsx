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
      <div
        onClick={() => setIsViewOpen(true)}
        className="cursor-pointer"
      >
        <Card
          testId={`mini-prompt-card-${miniPrompt.id}`}
          className="hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
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

            <div className="prose prose-sm max-w-none text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{preview}</ReactMarkdown>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                @{miniPrompt.user.username}
              </span>
              <span
                className="flex items-center gap-1"
                title={`Used in ${miniPrompt._count.stageMiniPrompts} workflows`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {miniPrompt._count.stageMiniPrompts} {miniPrompt._count.stageMiniPrompts === 1 ? 'workflow' : 'workflows'}
              </span>
              <span
                className="flex items-center gap-1"
                title={`${miniPrompt._count.references} users added this to their library`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {miniPrompt._count.references}
              </span>
            </div>

            {!isOwnMiniPrompt && (
              <div className="flex items-center justify-end gap-2">
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
        </Card>
      </div>

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
