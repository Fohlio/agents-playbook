"use client";

import { Button, Badge } from "@/shared/ui/atoms";
import { MarkdownContent } from "@/shared/ui/atoms/MarkdownContent";
import { CopyButton } from "@/shared/ui/molecules";
import { useState } from "react";

interface SharedMiniPrompt {
  id: string;
  name: string;
  content: string;
  visibility: "PUBLIC" | "PRIVATE";
  user: {
    id: string;
    username: string;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string | null;
    };
  }>;
}

interface SharedMiniPromptViewProps {
  miniPrompt: SharedMiniPrompt;
  isAuthenticated: boolean;
  onImport?: () => void;
  isImporting?: boolean;
}

/**
 * SharedMiniPromptView Component
 *
 * Public view for shared mini-prompts accessed via share link
 * - Read-only display of mini-prompt content with markdown rendering
 * - "Add to Library" button for PUBLIC mini-prompts (authenticated users only)
 * - Blocks library import for PRIVATE mini-prompts
 */
export function SharedMiniPromptView({
  miniPrompt,
  isAuthenticated,
  onImport,
  isImporting = false,
}: SharedMiniPromptViewProps) {
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!onImport || miniPrompt.visibility === "PRIVATE") return;

    setImporting(true);
    try {
      await onImport();
    } finally {
      setImporting(false);
    }
  };

  const canImport =
    isAuthenticated && miniPrompt.visibility === "PUBLIC" && onImport;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex-1">
            {miniPrompt.name}
          </h1>
          <CopyButton
            textToCopy={miniPrompt.content || ""}
            label="Copy"
            variant="secondary"
            size="sm"
            testId="copy-content"
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
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
            @{miniPrompt.user.username}
          </span>
          <Badge
            variant={miniPrompt.visibility === "PUBLIC" ? "success" : "warning"}
          >
            {miniPrompt.visibility}
          </Badge>
        </div>

        {miniPrompt.tags && miniPrompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {miniPrompt.tags.map(({ tag }) => (
              <Badge
                key={tag.id}
                variant="default"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Content</h2>
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="prose prose-sm max-w-none text-gray-700">
            <MarkdownContent content={miniPrompt.content || "No content available"} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {!isAuthenticated && (
          <p className="text-sm text-gray-600 mr-auto">
            Login to add this mini-prompt to your library
          </p>
        )}
        {miniPrompt.visibility === "PRIVATE" && isAuthenticated && (
          <p className="text-sm text-gray-600 mr-auto">
            Private mini-prompts cannot be added to library
          </p>
        )}
        {canImport && (
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={importing || isImporting}
          >
            {importing || isImporting ? "Adding..." : "Add to Library"}
          </Button>
        )}
      </div>
    </div>
  );
}
