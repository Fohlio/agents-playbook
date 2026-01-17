"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardHeader, Badge, Button } from "@/shared/ui/atoms";
import { ShareButton } from "@/features/sharing/ui";
import { MiniPromptWithUsage } from "../lib/dashboard-service";
import { deactivateMiniPrompt } from "../actions/mini-prompt-actions";
import { MiniPromptEditorModal } from "@/views/workflow-constructor/components/MiniPromptEditorModal";

interface ActiveMiniPromptsSectionProps {
  miniPrompts: MiniPromptWithUsage[];
}

export function ActiveMiniPromptsSection({ miniPrompts }: ActiveMiniPromptsSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingMiniPromptId, setEditingMiniPromptId] = useState<string | null>(null);
  const [editingMiniPromptData, setEditingMiniPromptData] = useState<{
    name: string;
    description?: string;
    content: string;
    visibility: 'PUBLIC' | 'PRIVATE';
    tagIds?: string[];
    key?: string | null;
  } | null>(null);
  const t = useTranslations('dashboard.activeMiniPrompts');
  const tCommon = useTranslations('common');
  const tMiniPromptCard = useTranslations('miniPromptCard');

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

  const handleEdit = async (miniPromptId: string) => {
    try {
      const response = await fetch(`/api/mini-prompts/${miniPromptId}`);
      if (!response.ok) throw new Error('Failed to fetch mini-prompt');
      const data = await response.json();
      setEditingMiniPromptData({
        name: data.name,
        description: data.description || '',
        content: data.content,
        visibility: data.visibility,
        tagIds: data.tagIds || [],
        key: data.key,
      });
      setEditingMiniPromptId(miniPromptId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mini-prompt for editing");
    }
  };

  const handleSaveEdit = async (
    name: string,
    description: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE',
    tagIds: string[],
    newTagNames: string[]
  ) => {
    if (!editingMiniPromptId) return;
    
    try {
      const response = await fetch(`/api/mini-prompts/${editingMiniPromptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          content,
          visibility,
          tagIds,
          newTagNames,
        }),
      });
      if (!response.ok) throw new Error('Failed to update mini-prompt');
      setEditingMiniPromptId(null);
      setEditingMiniPromptData(null);
      // Reload the page to refresh the list
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update mini-prompt");
    }
  };

  if (miniPrompts.length === 0) {
    return (
      <Card testId="active-mini-prompts-empty">
        <CardHeader
          title={t('title')}
          description={t('empty')}
          titleHref="/dashboard/library?tab=mini-prompts"
        />
        <div className="text-center py-8">
          <p className="text-gray-500">{t('emptyDescription')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card testId="active-mini-prompts-section">
      <CardHeader
        title={t('title')}
        description={t('count', { count: miniPrompts.length })}
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
                {miniPrompt.isSystemMiniPrompt && (
                  <Badge variant="default" testId={`system-badge-${miniPrompt.id}`}>
                    {tCommon('system')}
                  </Badge>
                )}
                <Badge variant="primary" testId="mini-prompt-active-badge">{tCommon('active')}</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {tMiniPromptCard('usedIn', { count: miniPrompt._count.stageMiniPrompts })}
              </p>
            </div>

            <div className="flex gap-2">
              <ShareButton
                targetType="MINI_PROMPT"
                targetId={miniPrompt.id}
                targetName={miniPrompt.name}
              />
              {!miniPrompt.isSystemMiniPrompt && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(miniPrompt.id)}
                  testId={`edit-button-${miniPrompt.id}`}
                >
                  {tCommon('edit')}
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDeactivate(miniPrompt.id)}
                disabled={loading === miniPrompt.id}
                testId={`deactivate-button-${miniPrompt.id}`}
              >
                {loading === miniPrompt.id ? t('deactivating') : t('deactivate')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <MiniPromptEditorModal
        isOpen={editingMiniPromptId !== null}
        onClose={() => {
          setEditingMiniPromptId(null);
          setEditingMiniPromptData(null);
        }}
        onSave={handleSaveEdit}
        initialData={editingMiniPromptData || undefined}
      />
    </Card>
  );
}
