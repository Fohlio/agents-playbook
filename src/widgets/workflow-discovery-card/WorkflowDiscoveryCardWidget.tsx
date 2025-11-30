"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WorkflowDiscoveryCard } from "@/shared/ui/molecules/WorkflowDiscoveryCard";
import { ConfirmDialog } from "@/shared/ui/molecules";
import { ROUTES } from "@/shared/routes";
import { PublicWorkflowWithMeta } from "@/views/discover/types";
import { WorkflowPreviewModal } from "@/shared/ui/molecules/WorkflowPreviewModal";
import { RatingDialog } from "@/features/ratings/ui/RatingDialog";
import { ShareModal } from "@/features/sharing/components/ShareModal";

interface WorkflowDiscoveryCardWidgetProps {
  workflow: PublicWorkflowWithMeta & {
    tags?: { tag: { id: string; name: string; color: string | null } }[];
    models?: { model: { id: string; name: string; slug: string; category: 'LLM' | 'IMAGE' } }[];
  };
  onImport: (id: string) => void;
  onRemove?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  isAuthenticated: boolean;
  isImporting?: boolean;
  currentUserId?: string;
}

/**
 * WorkflowDiscoveryCardWidget - Business Logic Container
 *
 * Handles all business logic for the workflow discovery card:
 * - State management (active, public, loading states)
 * - API calls (toggle active, toggle visibility, duplicate, etc.)
 * - Modal management (preview, rating, share, confirm)
 * - Authentication redirects
 *
 * FSD Layer: widgets
 * - Can import from features/
 * - Can import from shared/
 * - Composes the pure UI card with business logic
 */
export function WorkflowDiscoveryCardWidget({
  workflow,
  onImport,
  onRemove,
  onDuplicate,
  isAuthenticated,
  isImporting,
  currentUserId,
}: WorkflowDiscoveryCardWidgetProps) {
  const router = useRouter();
  
  // Modal states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Action states
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Data states
  const [isActive, setIsActive] = useState(workflow.isActive);
  const [isPublic, setIsPublic] = useState(workflow.visibility === "PUBLIC");
  const [currentRating, setCurrentRating] = useState<number | undefined>();
  const [localRating, setLocalRating] = useState<{
    average: number | null;
    count: number;
  }>({
    average: workflow.averageRating,
    count: workflow.totalRatings,
  });

  const isOwnWorkflow = Boolean(
    currentUserId && workflow.userId === currentUserId
  );

  // Handlers
  const handleImportClick = () => {
    if (!isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?returnUrl=${ROUTES.DISCOVER}`);
    } else {
      onImport(workflow.id);
    }
  };

  const handleRateClick = async () => {
    if (!isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?returnUrl=${ROUTES.DISCOVER}`);
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

  const handleToggleActive = async (checked: boolean) => {
    setIsActive(checked);

    try {
      await fetch(`/api/workflows/${workflow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: checked }),
      });
    } catch (error) {
      console.error("Failed to update workflow active state:", error);
      setIsActive(!checked); // Revert on error
    }
  };

  const handleToggleVisibility = async (checked: boolean) => {
    setIsPublic(checked);

    try {
      await fetch(`/api/workflows/${workflow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: checked ? "PUBLIC" : "PRIVATE" }),
      });
    } catch (error) {
      console.error("Failed to update workflow visibility:", error);
      setIsPublic(!checked); // Revert on error
    }
  };

  const handleDuplicate = async () => {
    if (!onDuplicate) return;

    setIsDuplicating(true);

    try {
      const response = await fetch(`/api/workflows/${workflow.id}/duplicate`, {
        method: "POST",
      });

      if (response.ok) {
        onDuplicate(workflow.id);
      }
    } catch (error) {
      console.error("Failed to duplicate workflow:", error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleEditClick = () => {
    router.push(`/dashboard/library/workflows/${workflow.id}/constructor`);
  };

  // Transform workflow data for the UI component
  const workflowCardData = {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    complexity: workflow.complexity,
    user: {
      username: workflow.user.username,
    },
    stagesCount: workflow._count.stages,
    usageCount: workflow.usageCount,
    tags: workflow.tags?.map((wt) => wt.tag),
    models: workflow.models?.map((wm) => wm.model),
    rating: {
      average: localRating.average,
      count: localRating.count,
    },
  };

  return (
    <>
      <WorkflowDiscoveryCard
        workflow={workflowCardData}
        state={{
          isActive,
          isPublic,
          isDuplicating,
          isRemoving,
          isImporting,
        }}
        visibility={{
          showActive: workflow.isInUserLibrary,
          showPublic: workflow.isInUserLibrary && isOwnWorkflow,
          showShare: workflow.isInUserLibrary,
          showRate: !isOwnWorkflow && isAuthenticated,
          showEdit: isOwnWorkflow,
          showDuplicate: workflow.isInUserLibrary,
          showRemove: workflow.isInUserLibrary,
          showImport: !workflow.isInUserLibrary && isAuthenticated,
          isOwned: isOwnWorkflow,
        }}
        handlers={{
          onCardClick: () => setIsPreviewOpen(true),
          onToggleActive: handleToggleActive,
          onTogglePublic: handleToggleVisibility,
          onShare: () => setIsShareModalOpen(true),
          onRate: handleRateClick,
          onEdit: handleEditClick,
          onDuplicate: handleDuplicate,
          onRemove: handleRemoveClick,
          onImport: handleImportClick,
        }}
        testId={`workflow-${workflow.id}`}
      />

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

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        targetType="WORKFLOW"
        targetId={workflow.id}
        targetName={workflow.name}
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

