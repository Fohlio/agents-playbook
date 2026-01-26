"use client";

import { Button, Badge } from "@/shared/ui/atoms";
import { MarkdownContent } from "@/shared/ui/atoms/MarkdownContent";
import { CopyButton, KeyDisplay } from "@/shared/ui/molecules";
import { useState } from "react";
import { Paperclip, FileText, Image as ImageIcon, File } from "lucide-react";
import { formatFileSize, getMimeCategory } from "@/shared/lib/utils";
import type { SkillAttachment } from "@/views/skill-studio/hooks/useSkillStudio";

interface SharedSkill {
  id: string;
  name: string;
  description: string | null;
  content: string;
  visibility: "PUBLIC" | "PRIVATE";
  key?: string | null;
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
  attachments: SkillAttachment[];
}

interface SharedSkillViewProps {
  skill: SharedSkill;
  isAuthenticated: boolean;
  onImport?: () => void;
  isImporting?: boolean;
}

const MIME_ICON_MAP = {
  image: <ImageIcon className="w-4 h-4" />,
  text: <FileText className="w-4 h-4" />,
  binary: <File className="w-4 h-4" />,
} as const;

function getFileIcon(mimeType: string) {
  return MIME_ICON_MAP[getMimeCategory(mimeType)];
}

/**
 * SharedSkillView Component
 *
 * Public view for shared skills accessed via share link
 * - Read-only display of skill content
 * - Shows attachments list
 * - "Add to Library" button for PUBLIC skills (authenticated users only)
 * - Blocks library import for PRIVATE skills
 */
export function SharedSkillView({
  skill,
  isAuthenticated,
  onImport,
  isImporting = false,
}: SharedSkillViewProps) {
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!onImport || skill.visibility === "PRIVATE") return;

    setImporting(true);
    try {
      await onImport();
    } finally {
      setImporting(false);
    }
  };

  const canImport =
    isAuthenticated && skill.visibility === "PUBLIC" && onImport;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex-1">
            {skill.name}
          </h1>
          {skill.content && (
            <CopyButton
              textToCopy={skill.content}
              label="Copy"
              variant="secondary"
              size="sm"
              testId="copy-content"
            />
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 flex-wrap">
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
            @{skill.user.username}
          </span>
          <Badge variant={skill.visibility === "PUBLIC" ? "success" : "warning"}>
            {skill.visibility}
          </Badge>
          {skill.key && <KeyDisplay keyValue={skill.key} />}
        </div>

        {skill.tags && skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {skill.tags.map(({ tag }) => (
              <Badge key={tag.id} variant="default">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {skill.description && (
          <p className="text-gray-700 leading-relaxed">{skill.description}</p>
        )}
      </div>

      {/* Content */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Content</h2>
        <div className="p-5 rounded-lg border border-gray-200 bg-white shadow-sm">
          <MarkdownContent
            content={skill.content || "No content available"}
            className="prose prose-sm max-w-none"
          />
        </div>
      </div>

      {/* Attachments */}
      {skill.attachments && skill.attachments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Paperclip className="w-5 h-5" />
            Attachments ({skill.attachments.length})
          </h2>
          <div className="space-y-2">
            {skill.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 rounded-md bg-gray-50 border border-gray-100"
              >
                <div className="text-gray-500">
                  {getFileIcon(attachment.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-500 italic">
            Attachments are not available for download in shared view
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {!isAuthenticated && (
          <p className="text-sm text-gray-600 mr-auto">
            Login to add this skill to your library
          </p>
        )}
        {skill.visibility === "PRIVATE" && isAuthenticated && (
          <p className="text-sm text-gray-600 mr-auto">
            Private skills cannot be added to library
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
