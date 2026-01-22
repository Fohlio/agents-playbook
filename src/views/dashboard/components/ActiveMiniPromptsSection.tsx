"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShareButton } from "@/features/sharing/ui";
import { MiniPromptWithUsage } from "../lib/dashboard-service";
import { deactivateMiniPrompt } from "../actions/mini-prompt-actions";
import { MiniPromptEditorModal } from "@/views/workflow-constructor/components/MiniPromptEditorModal";

interface ActiveMiniPromptsSectionProps {
  miniPrompts: MiniPromptWithUsage[];
}

function CyberCard({ children, testId, accent = 'pink' }: { children: React.ReactNode; testId?: string; accent?: 'cyan' | 'pink' }) {
  const borderColor = accent === 'pink' ? 'border-pink-500/30' : 'border-cyan-500/30';
  
  return (
    <div
      data-testid={testId}
      className={`bg-[#0a0a0f]/80 backdrop-blur-sm border ${borderColor} relative`}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
      }}
    >
      {/* Corner accents */}
      <div className={`absolute top-0 right-0 w-5 h-5 border-t border-r ${borderColor}`}></div>
      <div className={`absolute bottom-0 left-0 w-5 h-5 border-b border-l ${borderColor}`}></div>
      
      {/* Circuit pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(255, 0, 102, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 0, 102, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px'
      }}></div>
      
      <div className="relative">
        {children}
      </div>
    </div>
  );
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
      setError(err instanceof Error ? err.message : t("failedToDeactivate"));
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
      setError(err instanceof Error ? err.message : t("failedToLoad"));
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
      setError(err instanceof Error ? err.message : t("failedToUpdate"));
    }
  };

  if (miniPrompts.length === 0) {
    return (
      <CyberCard testId="active-mini-prompts-empty" accent="pink">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold font-mono text-pink-400">ACTIVE_PROMPTS.dll</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-pink-500/50 to-transparent"></div>
          </div>
          <div className="text-center py-8">
            <p className="text-cyan-100/40 font-mono">{t('emptyDescription')}</p>
          </div>
        </div>
      </CyberCard>
    );
  }

  return (
    <CyberCard testId="active-mini-prompts-section" accent="pink">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold font-mono text-pink-400" style={{ textShadow: '0 0 10px #ff006640' }}>
              ACTIVE_PROMPTS.dll
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono bg-pink-500/20 text-pink-400 border border-pink-500/50">
              {miniPrompts.length}
            </span>
          </div>
          <Link
            href="/dashboard/library?tab=mini-prompts"
            className="text-xs font-mono text-pink-400 hover:text-pink-300 uppercase tracking-wider transition-colors"
          >
            [{t("viewAll")}]
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-pink-500/10 border border-pink-500/50 text-pink-400 font-mono text-sm">
            &gt; ERROR: {error}
          </div>
        )}

        <div className="space-y-3">
          {miniPrompts.map((miniPrompt) => (
            <div
              key={miniPrompt.id}
              className="flex items-center justify-between p-4 bg-[#050508]/50 border-l-2 border-pink-500/50 hover:border-pink-400 hover:bg-[#050508]/80 transition-all duration-200"
              data-testid={`mini-prompt-card-${miniPrompt.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-white">{miniPrompt.name}</h3>
                  {miniPrompt.isSystemMiniPrompt && (
                    <span className="px-2 py-0.5 text-xs font-mono bg-purple-500/20 text-purple-400 border border-purple-500/50">
                      {tCommon('system')}
                    </span>
                  )}
                  <span className="px-2 py-0.5 text-xs font-mono bg-green-500/20 text-green-400 border border-green-500/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    {tCommon('active')}
                  </span>
                </div>
                <p className="text-xs text-cyan-100/40 font-mono mt-1">
                  {tMiniPromptCard('usedIn', { count: miniPrompt._count.stageMiniPrompts })}
                </p>
              </div>

              <div className="flex gap-2 ml-4">
                <ShareButton
                  targetType="MINI_PROMPT"
                  targetId={miniPrompt.id}
                  targetName={miniPrompt.name}
                />
                {!miniPrompt.isSystemMiniPrompt && (
                  <button
                    onClick={() => handleEdit(miniPrompt.id)}
                    data-testid={`edit-button-${miniPrompt.id}`}
                    className="px-3 py-1.5 text-xs font-mono uppercase bg-[#050508] border border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-all"
                  >
                    {tCommon('edit')}
                  </button>
                )}
                <button
                  onClick={() => handleDeactivate(miniPrompt.id)}
                  disabled={loading === miniPrompt.id}
                  data-testid={`deactivate-button-${miniPrompt.id}`}
                  className="px-3 py-1.5 text-xs font-mono uppercase bg-[#050508] border border-pink-500/50 text-pink-400 hover:border-pink-400 hover:shadow-[0_0_10px_rgba(255,0,102,0.2)] disabled:opacity-50 transition-all"
                >
                  {loading === miniPrompt.id ? '...' : t('deactivate')}
                </button>
              </div>
            </div>
          ))}
        </div>
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
    </CyberCard>
  );
}
