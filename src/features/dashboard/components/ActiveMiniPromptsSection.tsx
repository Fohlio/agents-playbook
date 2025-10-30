"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, Badge, Button } from "@/shared/ui/atoms";
import { ShareButton } from "@/features/sharing/ui";
import { MiniPromptWithUsage } from "../lib/dashboard-service";
import { deactivateMiniPrompt } from "../actions/mini-prompt-actions";

interface ActiveMiniPromptsSectionProps {
  miniPrompts: MiniPromptWithUsage[];
}

export function ActiveMiniPromptsSection({ miniPrompts }: ActiveMiniPromptsSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeactivate = async (miniPromptId: string) => {
    try {
      setLoading(miniPromptId);
      setError(null);
      await deactivateMiniPrompt(miniPromptId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate mini-prompt");
    } finally {
      setLoading(null);
    }
  };

  if (miniPrompts.length === 0) {
    return (
      <Card testId="active-mini-prompts-empty">
        <CardHeader
          title="Active Mini-Prompts"
          description="No active mini-prompts yet"
          titleHref="/dashboard/library?tab=mini-prompts"
        />
        <div className="text-center py-8">
          <p className="text-gray-500">Create and activate your first mini-prompt to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <Card testId="active-mini-prompts-section">
      <CardHeader
        title="Active Mini-Prompts"
        description={`${miniPrompts.length} active mini-prompts`}
        titleHref="/dashboard/library?tab=mini-prompts"
      />

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="space-y-3">
        {miniPrompts.map((miniPrompt) => (
          <div
            key={miniPrompt.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            data-testid={`mini-prompt-card-${miniPrompt.id}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{miniPrompt.name}</h3>
                <Badge variant="primary" testId="mini-prompt-active-badge">Active</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Used in {miniPrompt._count.stageMiniPrompts} workflows
              </p>
            </div>

            <div className="flex gap-2">
              <ShareButton
                targetType="MINI_PROMPT"
                targetId={miniPrompt.id}
                targetName={miniPrompt.name}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/dashboard/library/mini-prompts/${miniPrompt.id}/edit`)}
                testId={`edit-button-${miniPrompt.id}`}
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDeactivate(miniPrompt.id)}
                disabled={loading === miniPrompt.id}
                testId={`deactivate-button-${miniPrompt.id}`}
              >
                {loading === miniPrompt.id ? "Deactivating..." : "Deactivate"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
