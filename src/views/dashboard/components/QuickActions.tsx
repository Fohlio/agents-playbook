"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/atoms";
import { Tooltip } from "@/shared/ui/molecules";
import { ROUTES } from "@/shared/routes";
import { useRouter } from "next/navigation";
import { MiniPromptEditorModal } from "@/views/workflow-constructor/components/MiniPromptEditorModal";
import { createMiniPrompt } from "@/views/workflow-constructor/actions/mini-prompt-actions";

export function QuickActions() {
  const router = useRouter();
  const [isMiniPromptModalOpen, setIsMiniPromptModalOpen] = useState(false);
  const t = useTranslations('dashboard.quickActions');

  const handleCreateMiniPrompt = async (
    name: string,
    description: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE'
  ) => {
    await createMiniPrompt({ name, description, content, visibility });
    // Redirect to library after creation
    router.push('/dashboard/library?tab=mini-prompts');
  };

  return (
    <>
      <div className="flex gap-4" data-testid="quick-actions">
        <Tooltip content={t('newWorkflowTooltip')}>
          <Button
            variant="primary"
            onClick={() => router.push(ROUTES.LIBRARY.WORKFLOWS.NEW)}
            testId="new-workflow-button"
          >
            {t('newWorkflow')}
          </Button>
        </Tooltip>

        <Tooltip content={t('newMiniPromptTooltip')}>
          <Button
            variant="secondary"
            onClick={() => setIsMiniPromptModalOpen(true)}
            testId="new-mini-prompt-button"
          >
            {t('newMiniPrompt')}
          </Button>
        </Tooltip>
      </div>

      <MiniPromptEditorModal
        isOpen={isMiniPromptModalOpen}
        onClose={() => setIsMiniPromptModalOpen(false)}
        onSave={handleCreateMiniPrompt}
      />
    </>
  );
}
