"use client";

import { useState } from "react";
import ShareIcon from "@mui/icons-material/Share";
import { IconButton } from "@mui/material";
import { Tooltip } from "@/shared/ui/molecules";
import { ShareModal } from "@/features/sharing/components/ShareModal";

// TargetType from Prisma schema
type TargetType = "WORKFLOW" | "MINI_PROMPT";

export interface ShareButtonProps {
  targetType: TargetType;
  targetId: string;
  targetName: string;
  className?: string;
  testId?: string;
}

/**
 * ShareButton Component
 *
 * Icon button that opens ShareModal for managing share links
 * - Compact IconButton design for use in card actions
 * - Opens ShareModal on click
 * - Passes targetType, targetId, targetName to modal
 * - Manages modal state internally
 *
 * Usage:
 * ```tsx
 * <ShareButton
 *   targetType="WORKFLOW"
 *   targetId={workflow.id}
 *   targetName={workflow.name}
 * />
 * ```
 */
export function ShareButton({
  targetType,
  targetId,
  targetName,
  className,
  testId,
}: ShareButtonProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <>
      <Tooltip content="Create a shareable link with expiration date">
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setIsShareModalOpen(true);
          }}
          size="small"
          className={className}
          data-testid={testId}
          title="Share"
        >
          <ShareIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        targetType={targetType}
        targetId={targetId}
        targetName={targetName}
      />
    </>
  );
}
