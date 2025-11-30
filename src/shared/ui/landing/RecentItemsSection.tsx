"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Workflow, MiniPrompt, Tag, Model } from "@prisma/client";
import { WorkflowDiscoveryCard } from "@/shared/ui/molecules/WorkflowDiscoveryCard";
import { MiniPromptDiscoveryCard } from "@/shared/ui/molecules/MiniPromptDiscoveryCard";

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

export default function RecentItemsSection() {
  const [activeTab, setActiveTab] = useState<TabType>("workflows");
  const [workflows, setWorkflows] = useState<WorkflowWithMeta[]>([]);
  const [miniPrompts, setMiniPrompts] = useState<MiniPromptWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewWorkflow, setPreviewWorkflow] = useState<WorkflowWithMeta | null>(null);
  const [previewMiniPrompt, setPreviewMiniPrompt] = useState<MiniPromptWithMeta | null>(null);

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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recent Community Additions
            </h2>
            <p className="text-lg text-gray-600">
              Explore the latest workflows and prompts shared by the community
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Recent Community Additions
          </h2>
          <p className="text-lg text-gray-600">
            Explore the latest workflows and prompts shared by the community
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab("workflows")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "workflows"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Workflows ({workflows.length})
            </button>
            <button
              onClick={() => setActiveTab("prompts")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "prompts"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Prompts ({miniPrompts.length})
            </button>
          </div>
        </div>

        {/* Content Grid */}
        {activeTab === "workflows" ? (
          workflows.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No public workflows yet. Be the first to share one!
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
          <div className="text-center text-gray-500 py-12">
            No public prompts yet. Be the first to share one!
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
                  workflowsCount: miniPrompt._count.workflows || 0,
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

        {/* Preview Modals would go here - for now just a simple overlay */}
        {previewWorkflow && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setPreviewWorkflow(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {previewWorkflow.name}
                </h3>
                <button
                  onClick={() => setPreviewWorkflow(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              {previewWorkflow.description && (
                <p className="text-gray-600 mb-4">{previewWorkflow.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>By {previewWorkflow.user.username}</span>
                <span>{previewWorkflow._count.stages} stages</span>
                {previewWorkflow.complexity && (
                  <span className="px-2 py-0.5 bg-gray-100 rounded">
                    {previewWorkflow.complexity}
                  </span>
                )}
              </div>
              <div className="text-center text-gray-500 mt-8">
                <Link
                  href="/auth/signup"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign up
                </Link>{" "}
                to add this workflow to your library
              </div>
            </div>
          </div>
        )}

        {previewMiniPrompt && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setPreviewMiniPrompt(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {previewMiniPrompt.name}
                </h3>
                <button
                  onClick={() => setPreviewMiniPrompt(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              {previewMiniPrompt.description && (
                <p className="text-gray-600 mb-4">{previewMiniPrompt.description}</p>
              )}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {previewMiniPrompt.content}
                </pre>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  By {previewMiniPrompt.user.username}
                </span>
                <button
                  onClick={() => {
                    handleCopyMiniPrompt(previewMiniPrompt);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Copy Prompt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

