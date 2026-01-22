"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/routes";
import { useRouter } from "next/navigation";
import { MiniPromptEditorModal } from "@/views/workflow-constructor/components/MiniPromptEditorModal";
import { createMiniPrompt } from "@/views/workflow-constructor/actions/mini-prompt-actions";
import AddIcon from '@mui/icons-material/Add';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

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
      <div className="flex gap-3" data-testid="quick-actions">
        {/* New Workflow Button - Cyan */}
        <button
          onClick={() => router.push(ROUTES.LIBRARY.WORKFLOWS.NEW)}
          data-testid="new-workflow-button"
          className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all duration-300"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
          }}
          title={t('newWorkflowTooltip')}
        >
          <AddIcon className="w-4 h-4" />
          <span className="hidden sm:inline">{t('newWorkflow')}</span>
        </button>

        {/* New Mini-Prompt Button - Pink Outline */}
        <button
          onClick={() => setIsMiniPromptModalOpen(true)}
          data-testid="new-mini-prompt-button"
          className="group flex items-center gap-2 px-4 py-2.5 bg-transparent border-2 border-pink-500/70 text-pink-400 font-bold uppercase tracking-wider text-sm hover:bg-pink-500/10 hover:border-pink-400 hover:shadow-[0_0_20px_rgba(255,0,102,0.3)] transition-all duration-300"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
          }}
          title={t('newMiniPromptTooltip')}
        >
          <TextSnippetIcon className="w-4 h-4" />
          <span className="hidden sm:inline">{t('newMiniPrompt')}</span>
        </button>
      </div>

      <MiniPromptEditorModal
        isOpen={isMiniPromptModalOpen}
        onClose={() => setIsMiniPromptModalOpen(false)}
        onSave={handleCreateMiniPrompt}
      />
    </>
  );
}
