"use client";

import { useState } from "react";
import Button, { type ButtonProps } from "@/shared/ui/atoms/Button";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

export interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  onCopy?: () => void;
  testId?: string;
  className?: string;
}

/**
 * CopyButton Component
 *
 * Reusable button that copies text to clipboard with visual feedback
 * - Shows "Copied!" state for 2 seconds after successful copy
 * - Uses ContentCopyIcon and CheckIcon from MUI
 * - Supports all Button variants (primary, secondary, danger, ghost)
 * - Handles clipboard API failures gracefully
 */
export function CopyButton({
  textToCopy,
  label = "Copy",
  variant = "secondary",
  size = "md",
  onCopy,
  testId,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy to clipboard");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      testId={testId}
      className={className}
    >
      {copied ? (
        <>
          <CheckIcon fontSize="small" className="mr-1" />
          Copied!
        </>
      ) : (
        <>
          <ContentCopyIcon fontSize="small" className="mr-1" />
          {label}
        </>
      )}
    </Button>
  );
}
