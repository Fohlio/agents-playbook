"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Workflow, MiniPrompt, Tag, Model } from "@prisma/client";
import { WorkflowDiscoveryCard } from "@/shared/ui/molecules/WorkflowDiscoveryCard";
import { MiniPromptDiscoveryCard } from "@/shared/ui/molecules/MiniPromptDiscoveryCard";
import { WorkflowPreviewModal } from "@/shared/ui/molecules/WorkflowPreviewModal";
import { PublicWorkflowWithMeta } from "@/views/discover/types";

interface WorkflowWithMeta extends Workflow {
  user: { id: string; username: string };
  stages: { id: string }[];
  tags?: { tag: Tag }[];
  models?: { model: Model }[];
  _count: { stages: number; references: number };
}

interface MiniPromptWithMeta extends MiniPrompt {
  user: { id: string; username: string };
  tags?: { tag: Tag }[];
  models?: { model: Model }[];
  _count: { stageMiniPrompts: number; references: number };
}

type TabType = "workflows" | "prompts";

// Transform landing workflow data to PublicWorkflowWithMeta format for the preview modal
function toPublicWorkflowWithMeta(workflow: WorkflowWithMeta): PublicWorkflowWithMeta {
  // Omit stages since they don't match the full type - modal will fetch full details
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { stages, ...workflowWithoutStages } = workflow;
  return {
    ...workflowWithoutStages,
    stages: undefined, // Modal will fetch full stages with mini-prompts
    averageRating: null,
    totalRatings: 0,
    usageCount: workflow._count.references,
    isInUserLibrary: false,
  };
}

export default function RecentItemsSection() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const t = useTranslations('landing.recentItems');
  const tCommon = useTranslations('common');
  
  const [activeTab, setActiveTab] = useState<TabType>("workflows");
  const [workflows, setWorkflows] = useState<WorkflowWithMeta[]>([]);
  const [miniPrompts, setMiniPrompts] = useState<MiniPromptWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewWorkflow, setPreviewWorkflow] = useState<WorkflowWithMeta | null>(null);
  const [previewMiniPrompt, setPreviewMiniPrompt] = useState<MiniPromptWithMeta | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async (workflowId: string) => {
    if (!isAuthenticated) {
      router.push("/auth/login?returnUrl=/dashboard/discover");
      return;
    }
    
    setIsImporting(true);
    try {
      const response = await fetch(`/api/v1/workflows/import/${workflowId}`, {
        method: "POST",
      });
      
      if (response.ok) {
        // Close modal and redirect to library
        setPreviewWorkflow(null);
        router.push("/dashboard/library");
      }
    } catch (error) {
      console.error("Failed to import workflow:", error);
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    fetch("/api/public/recent")
      .then((res) => res.json())
      .then((data) => {
        setWorkflows(data.workflows || []);
        setMiniPrompts(data.miniPrompts || []);
      })
      .catch((error) => {
        console.error("Failed to fetch recent items:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCopyMiniPrompt = async (miniPrompt: MiniPromptWithMeta) => {
    try {
      await navigator.clipboard.writeText(miniPrompt.content);
      // Could add a toast notification here
    } catch (error) {
      console.error("Failed to copy mini-prompt:", error);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#050508]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight mb-4">
              <span className="cyber-text-cyan">RECENT</span>
              <span className="text-white mx-3">{'//'}</span>
              <span className="cyber-text-pink">ITEMS</span>
            </h2>
            <p className="text-lg text-cyan-100/60 font-mono">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="font-mono text-cyan-400 animate-pulse">{tCommon('loading')}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#050508] relative overflow-hidden">
      {/* Circuit background */}
      <div className="absolute inset-0 cyber-circuit-bg opacity-20 pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black tracking-tight mb-4">
            <span className="cyber-text-cyan">RECENT</span>
            <span className="text-white mx-3">{'//'}</span>
            <span className="cyber-text-pink">ITEMS</span>
          </h2>
          {/* Scanner underline */}
          <div className="relative w-48 h-0.5 mx-auto mb-6 bg-gradient-to-r from-transparent via-cyan-500 to-transparent overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-400 animate-pulse"></div>
          </div>
          <p className="text-lg text-cyan-100/60 font-mono">
            {t('subtitle')}
          </p>
        </div>

        {/* Tabs - Cyberpunk Style */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-[#0a0a0f] border border-cyan-500/30 p-1">
            <button
              onClick={() => setActiveTab("workflows")}
              className={`px-6 py-2 text-sm font-mono uppercase tracking-wider transition-all ${
                activeTab === "workflows"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                  : "text-cyan-100/60 hover:text-cyan-400 border border-transparent"
              }`}
            >
              {t('tabWorkflows', { count: workflows.length })}
            </button>
            <button
              onClick={() => setActiveTab("prompts")}
              className={`px-6 py-2 text-sm font-mono uppercase tracking-wider transition-all ${
                activeTab === "prompts"
                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/50 shadow-[0_0_15px_rgba(255,0,102,0.2)]"
                  : "text-cyan-100/60 hover:text-pink-400 border border-transparent"
              }`}
            >
              {t('tabPrompts', { count: miniPrompts.length })}
            </button>
          </div>
        </div>

        {/* Content Grid */}
        {activeTab === "workflows" ? (
          workflows.length === 0 ? (
            <div className="text-center text-cyan-100/40 py-12 font-mono">
              {t('noWorkflows')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <WorkflowDiscoveryCard
                  key={workflow.id}
                  workflow={{
                    id: workflow.id,
                    name: workflow.name,
                    description: workflow.description || null,
                    complexity: workflow.complexity,
                    user: { username: workflow.user.username },
                    stagesCount: workflow._count.stages,
                    usageCount: workflow._count.references,
                    tags: workflow.tags?.map((t) => t.tag) || [],
                    models: workflow.models?.map((m) => ({
                      id: m.model.id,
                      name: m.model.name,
                      slug: m.model.slug,
                      category: m.model.category,
                    })) || [],
                    rating: { average: null, count: 0 },
                  }}
                  state={{
                    isActive: true,
                    isPublic: true,
                  }}
                  visibility={{
                    showUsageHint: true,
                  }}
                  handlers={{
                    onCardClick: () => setPreviewWorkflow(workflow),
                  }}
                />
              ))}
            </div>
          )
        ) : miniPrompts.length === 0 ? (
          <div className="text-center text-cyan-100/40 py-12 font-mono">
            {t('noPrompts')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {miniPrompts.map((miniPrompt) => (
              <MiniPromptDiscoveryCard
                key={miniPrompt.id}
                miniPrompt={{
                  id: miniPrompt.id,
                  name: miniPrompt.name,
                  description: miniPrompt.description || null,
                  user: { username: miniPrompt.user.username },
                  workflowsCount: miniPrompt._count.stageMiniPrompts || 0,
                  referencesCount: miniPrompt._count.references,
                  tags: miniPrompt.tags?.map((t) => t.tag) || [],
                  models: miniPrompt.models?.map((m) => ({
                    id: m.model.id,
                    name: m.model.name,
                    slug: m.model.slug,
                    category: m.model.category,
                  })) || [],
                  rating: { average: null, count: 0 },
                }}
                state={{
                  isActive: true,
                  isPublic: true,
                }}
                visibility={{}}
                handlers={{
                  onCardClick: () => setPreviewMiniPrompt(miniPrompt),
                }}
              />
            ))}
          </div>
        )}

        {/* Workflow Preview Modal */}
        {previewWorkflow && (
          <WorkflowPreviewModal
            workflow={toPublicWorkflowWithMeta(previewWorkflow)}
            isOpen={true}
            onClose={() => setPreviewWorkflow(null)}
            onImport={() => handleImport(previewWorkflow.id)}
            isAuthenticated={isAuthenticated}
            isImporting={isImporting}
            isOwnWorkflow={session?.user?.id === previewWorkflow.user.id}
          />
        )}

        {/* Mini-Prompt Preview Modal - Cyberpunk Style */}
        {previewMiniPrompt && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setPreviewMiniPrompt(null)}
          >
            <div
              className="bg-[#0a0a0f] border border-cyan-500/50 max-w-2xl w-full max-h-[80vh] overflow-auto p-6 shadow-[0_0_50px_rgba(0,255,255,0.2)]"
              onClick={(e) => e.stopPropagation()}
              style={{
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold cyber-text-cyan">
                  {previewMiniPrompt.name}
                </h3>
                <button
                  onClick={() => setPreviewMiniPrompt(null)}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
                >
                  [X]
                </button>
              </div>
              {previewMiniPrompt.description && (
                <p className="text-cyan-100/60 mb-4">{previewMiniPrompt.description}</p>
              )}
              <div className="bg-[#050508] border border-cyan-500/30 p-4 mb-4">
                <pre className="whitespace-pre-wrap text-sm text-green-400 font-mono">
                  {previewMiniPrompt.content}
                </pre>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-cyan-100/40 font-mono">
                  {tCommon('by', { author: previewMiniPrompt.user.username })}
                </span>
                <button
                  onClick={() => {
                    handleCopyMiniPrompt(previewMiniPrompt);
                  }}
                  className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-mono uppercase text-sm tracking-wider hover:bg-cyan-500/30 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all"
                >
                  {t('copyPrompt')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
