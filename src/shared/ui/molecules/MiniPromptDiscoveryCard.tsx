"use client";

import { useState } from "react";
import { Card, Button, Badge } from "@/shared/ui/atoms";
import { ROUTES } from "@/shared/routes";
import { PublicMiniPromptWithMeta } from "@/features/public-discovery/types";
import { MiniPromptEditorModal } from "@/features/workflow-constructor/components/MiniPromptEditorModal";

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
  const isOwnMiniPrompt = currentUserId && miniPrompt.userId === currentUserId;

  const handleImportClick = () => {
    if (!isAuthenticated) {
      window.location.href = `${ROUTES.LOGIN}?returnUrl=${ROUTES.DISCOVER}`;
    } else {
      onImport(miniPrompt.id);
    }
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
          {miniPrompt.averageRating && (
            <Badge variant="default" testId="rating-badge">
              ★ {miniPrompt.averageRating}
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{preview}</p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>By @{miniPrompt.user.username}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {/* TODO: Phase 3 - Replace with real usage stats from UsageStats table */}
            <span>Used in {miniPrompt._count.stageMiniPrompts} workflows</span>
          </div>

          {!isOwnMiniPrompt && (
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
    </>
  );
}
