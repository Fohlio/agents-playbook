"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/atoms";
import { ROUTES } from "@/shared/routes";
import { useRouter } from "next/navigation";
import { MiniPromptEditorModal } from "@/features/workflow-constructor/components/MiniPromptEditorModal";
import { createMiniPrompt } from "@/features/workflow-constructor/actions/mini-prompt-actions";

export function QuickActions() {
  const router = useRouter();
  const [isMiniPromptModalOpen, setIsMiniPromptModalOpen] = useState(false);

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
        <Button
          variant="primary"
          onClick={() => router.push(ROUTES.LIBRARY.WORKFLOWS.NEW)}
          testId="new-workflow-button"
        >
          New Workflow
        </Button>

        <Button
          variant="secondary"
          onClick={() => setIsMiniPromptModalOpen(true)}
          testId="new-mini-prompt-button"
        >
          New Mini-Prompt
        </Button>
      </div>

      <MiniPromptEditorModal
        isOpen={isMiniPromptModalOpen}
        onClose={() => setIsMiniPromptModalOpen(false)}
        onSave={handleCreateMiniPrompt}
      />
    </>
  );
}
