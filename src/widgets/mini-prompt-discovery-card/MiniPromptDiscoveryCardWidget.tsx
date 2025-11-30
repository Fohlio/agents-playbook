"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MiniPromptDiscoveryCard } from "@/shared/ui/molecules/MiniPromptDiscoveryCard";
import { ConfirmDialog } from "@/shared/ui/molecules";
import { ROUTES } from "@/shared/routes";
import { PublicMiniPromptWithMeta } from "@/views/discover/types";
import { MiniPromptEditorModal } from "@/views/workflow-constructor/components/MiniPromptEditorModal";
import { RatingDialog } from "@/features/ratings/ui/RatingDialog";
import { ShareModal } from "@/features/sharing/components/ShareModal";

interface MiniPromptDiscoveryCardWidgetProps {
  miniPrompt: PublicMiniPromptWithMeta & {
    tags?: { tag: { id: string; name: string; color: string | null } }[];
    models?: { model: { id: string; name: string; slug: string; category: 'LLM' | 'IMAGE' } }[];
  };
  onImport: (id: string) => void;
  onRemove?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onUpdate?: () => void;
  isAuthenticated: boolean;
  isImporting?: boolean;
  currentUserId?: string;
}

/**
 * MiniPromptDiscoveryCardWidget - Business Logic Container
 *
 * Handles all business logic for the mini-prompt discovery card:
 * - State management (active, public, loading states)
 * - API calls (toggle active, toggle visibility, duplicate, etc.)
 * - Modal management (editor, rating, share, confirm)
 * - Authentication redirects
 *
 * FSD Layer: widgets
 * - Can import from features/
 * - Can import from shared/
 * - Composes the pure UI card with business logic
 */
export function MiniPromptDiscoveryCardWidget({
  miniPrompt,
  onImport,
  onRemove,
  onDuplicate,
  onUpdate,
  isAuthenticated,
  isImporting,
  currentUserId,
}: MiniPromptDiscoveryCardWidgetProps) {
  const router = useRouter();

  // Modal states
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Action states
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Data states
  const [isActive, setIsActive] = useState(miniPrompt.isActive);
  const [isPublic, setIsPublic] = useState(miniPrompt.visibility === "PUBLIC");
  const [currentRating, setCurrentRating] = useState<number | undefined>();
  const [localRating, setLocalRating] = useState<{
    average: number | null;
    count: number;
  }>({
    average: miniPrompt.averageRating,
    count: miniPrompt.totalRatings,
  });

  const isOwnMiniPrompt = currentUserId && miniPrompt.userId === currentUserId;

  // Handlers
  const handleRemoveClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!onRemove) return;

    setIsRemoving(true);
    try {
      await onRemove(miniPrompt.id);
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Failed to remove mini-prompt:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleToggleActive = async (checked: boolean) => {
    setIsActive(checked);

    try {
      await fetch(`/api/mini-prompts/${miniPrompt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: checked }),
      });
    } catch (error) {
      console.error("Failed to update mini-prompt active state:", error);
      setIsActive(!checked); // Revert on error
    }
  };

  const handleToggleVisibility = async (checked: boolean) => {
    setIsPublic(checked);

    try {
      await fetch(`/api/mini-prompts/${miniPrompt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: checked ? "PUBLIC" : "PRIVATE" }),
      });
    } catch (error) {
      console.error("Failed to update mini-prompt visibility:", error);
      setIsPublic(!checked); // Revert on error
    }
  };

  const handleDuplicate = async () => {
    if (!onDuplicate) return;

    setIsDuplicating(true);

    try {
      const response = await fetch(
        `/api/mini-prompts/${miniPrompt.id}/duplicate`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        onDuplicate(miniPrompt.id);
      }
    } catch (error) {
      console.error("Failed to duplicate mini-prompt:", error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleImportClick = () => {
    if (!isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?returnUrl=${ROUTES.DISCOVER}`);
    } else {
      onImport(miniPrompt.id);
    }
  };

  const handleRateClick = async () => {
    if (!isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?returnUrl=${ROUTES.DISCOVER}`);
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

  const handleEditClick = () => {
    setIsViewOpen(true);
  };

  // Transform mini-prompt data for the UI component
  const miniPromptCardData = {
    id: miniPrompt.id,
    name: miniPrompt.name,
    description: miniPrompt.description,
    user: {
      username: miniPrompt.user.username,
    },
    workflowsCount: miniPrompt._count.stageMiniPrompts,
    referencesCount: miniPrompt._count.references,
    tags: miniPrompt.tags?.map((mt) => mt.tag),
    models: miniPrompt.models?.map((mm) => mm.model),
    rating: {
      average: localRating.average,
      count: localRating.count,
    },
  };

  return (
    <>
      <MiniPromptDiscoveryCard
        miniPrompt={miniPromptCardData}
        state={{
          isActive,
          isPublic,
          isDuplicating,
          isRemoving,
          isImporting,
        }}
        visibility={{
          showActive: miniPrompt.isInUserLibrary,
          showPublic: miniPrompt.isInUserLibrary && !!isOwnMiniPrompt,
          showShare: miniPrompt.isInUserLibrary,
          showRate: !isOwnMiniPrompt && isAuthenticated,
          showEdit: !!isOwnMiniPrompt,
          showDuplicate: miniPrompt.isInUserLibrary,
          showRemove: miniPrompt.isInUserLibrary,
          showImport: !miniPrompt.isInUserLibrary && isAuthenticated,
          isOwned: !!isOwnMiniPrompt,
        }}
        handlers={{
          onCardClick: () => setIsViewOpen(true),
          onToggleActive: handleToggleActive,
          onTogglePublic: handleToggleVisibility,
          onShare: () => setIsShareModalOpen(true),
          onRate: handleRateClick,
          onEdit: handleEditClick,
          onDuplicate: handleDuplicate,
          onRemove: handleRemoveClick,
          onImport: handleImportClick,
        }}
        testId={`mini-prompt-${miniPrompt.id}`}
      />

      <MiniPromptEditorModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        initialData={{
          name: miniPrompt.name,
          description: miniPrompt.description || "",
          content: miniPrompt.content,
          visibility: miniPrompt.visibility as "PUBLIC" | "PRIVATE",
          tagIds: miniPrompt.tags?.map((t) => t.tag.id) ?? [],
          modelIds: miniPrompt.models?.map((m) => m.model.id) ?? [],
        }}
        viewOnly={!isOwnMiniPrompt}
        onSave={
          isOwnMiniPrompt
            ? async (
                name,
                description,
                content,
                visibility,
                tagIds,
                newTagNames,
                modelIds
              ) => {
                await fetch(`/api/mini-prompts/${miniPrompt.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name,
                    description,
                    content,
                    visibility,
                    tagIds,
                    newTagNames,
                    modelIds,
                  }),
                });
                setIsViewOpen(false);
                onUpdate?.();
              }
            : undefined
        }
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

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        targetType="MINI_PROMPT"
        targetId={miniPrompt.id}
        targetName={miniPrompt.name}
      />

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmRemove}
        title="Remove from Library"
        message={`Are you sure you want to remove "${miniPrompt.name}" from your library?`}
        confirmLabel="Remove"
        variant="danger"
        loading={isRemoving}
        testId={`confirm-remove-${miniPrompt.id}`}
      />
    </>
  );
}

