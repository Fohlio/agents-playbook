"use client";

import { Button, Badge } from "@/shared/ui/atoms";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useState } from "react";

interface WorkflowStage {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  order: number;
  miniPrompts: Array<{
    miniPromptId: string;
    order: number;
    miniPrompt: {
      id: string;
      name: string;
      content: string;
    };
  }>;
}

interface SharedWorkflow {
  id: string;
  name: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  user: {
    id: string;
    username: string;
  };
  stages: WorkflowStage[];
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string | null;
    };
  }>;
}

interface SharedWorkflowViewProps {
  workflow: SharedWorkflow;
  isAuthenticated: boolean;
  onImport?: () => void;
  isImporting?: boolean;
}

/**
 * SharedWorkflowView Component
 *
 * Public view for shared workflows accessed via share link
 * - Read-only display of workflow content
 * - Shows stages and mini-prompts
 * - "Add to Library" button for PUBLIC workflows (authenticated users only)
 * - Blocks library import for PRIVATE workflows
 */
export function SharedWorkflowView({
  workflow,
  isAuthenticated,
  onImport,
  isImporting = false,
}: SharedWorkflowViewProps) {
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!onImport || workflow.visibility === "PRIVATE") return;

    setImporting(true);
    try {
      await onImport();
    } finally {
      setImporting(false);
    }
  };

  const canImport =
    isAuthenticated && workflow.visibility === "PUBLIC" && onImport;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {workflow.name}
        </h1>
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
            @{workflow.user.username}
          </span>
          <Badge variant={workflow.visibility === "PUBLIC" ? "success" : "warning"}>
            {workflow.visibility}
          </Badge>
        </div>

        {workflow.tags && workflow.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {workflow.tags.map(({ tag }) => (
              <Badge
                key={tag.id}
                variant="default"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {workflow.description && (
          <p className="text-gray-700 leading-relaxed">{workflow.description}</p>
        )}
      </div>

      {/* Stages */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Stages ({workflow.stages.length})
        </h2>
        {workflow.stages.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No stages defined yet</p>
        ) : (
          <div className="space-y-4">
            {workflow.stages.map((stage, index) => (
              <div
                key={stage.id}
                className="p-5 rounded-lg border border-gray-200 bg-white shadow-sm"
                style={{
                  borderLeftColor: stage.color || "#64748b",
                  borderLeftWidth: "4px",
                }}
              >
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Stage {index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {stage.name}
                  </h3>
                  {stage.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {stage.description}
                    </p>
                  )}
                </div>

                {stage.miniPrompts && stage.miniPrompts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Mini-Prompts ({stage.miniPrompts.length})
                    </p>
                    <div className="space-y-3">
                      {stage.miniPrompts.map((smp) => (
                        <div
                          key={smp.miniPromptId}
                          className="p-3 rounded-md bg-gray-50 border border-gray-100"
                        >
                          <h4 className="font-semibold text-sm text-gray-900 mb-1">
                            {smp.miniPrompt.name}
                          </h4>
                          <div className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                              {smp.miniPrompt.content ||
                                "No prompt text available"}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {!isAuthenticated && (
          <p className="text-sm text-gray-600 mr-auto">
            Login to add this workflow to your library
          </p>
        )}
        {workflow.visibility === "PRIVATE" && isAuthenticated && (
          <p className="text-sm text-gray-600 mr-auto">
            Private workflows cannot be added to library
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
