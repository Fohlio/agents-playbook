"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Workflow, Skill, Tag, Model } from "@prisma/client";
import { Zap } from "lucide-react";
import { WorkflowDiscoveryCard } from "@/shared/ui/molecules/WorkflowDiscoveryCard";
import { WorkflowPreviewModal } from "@/shared/ui/molecules/WorkflowPreviewModal";
import { PublicWorkflowWithMeta } from "@/views/discover/types";
import { ROUTES } from "@/shared/routes";

interface WorkflowWithMeta extends Workflow {
  user: { id: string; username: string };
  stages: { id: string }[];
  tags?: { tag: Tag }[];
  models?: { model: Model }[];
  _count: { stages: number; references: number };
}

interface SkillWithMeta extends Skill {
  user: { id: string; username: string };
  tags?: { tag: Tag }[];
  models?: { model: Model }[];
  _count: { attachments: number; references: number };
}

type TabType = "workflows" | "skills";

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
  const [skills, setSkills] = useState<SkillWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewWorkflow, setPreviewWorkflow] = useState<WorkflowWithMeta | null>(null);
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

  const handleViewSkill = (skillId: string) => {
    router.push(ROUTES.SKILLS.EDIT(skillId));
  };

  useEffect(() => {
    fetch("/api/public/recent")
      .then((res) => res.json())
      .then((data) => {
        setWorkflows(data.workflows || []);
        setSkills(data.skills || []);
      })
      .catch((error) => {
        console.error("Failed to fetch recent items:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
              onClick={() => setActiveTab("skills")}
              className={`px-6 py-2 text-sm font-mono uppercase tracking-wider transition-all ${
                activeTab === "skills"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                  : "text-cyan-100/60 hover:text-cyan-400 border border-transparent"
              }`}
            >
              {t('tabSkills', { count: skills.length })}
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
        ) : skills.length === 0 ? (
          <div className="text-center text-cyan-100/40 py-12 font-mono">
            {t('noSkills')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onClick={() => handleViewSkill(skill.id)}
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
      </div>
    </section>
  );
}

// Skill Card Component for Landing Page
interface SkillCardProps {
  skill: SkillWithMeta;
  onClick: () => void;
}

function SkillCard({ skill, onClick }: SkillCardProps) {
  const tCommon = useTranslations('common');

  return (
    <div
      onClick={onClick}
      className="relative bg-[#0a0a0f]/80 backdrop-blur-sm border border-cyan-500/30 p-4 cursor-pointer transition-all duration-200 hover:border-cyan-400/60 hover:bg-cyan-500/5 hover:shadow-[0_0_20px_rgba(0,255,255,0.15)]"
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/50"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500/50"></div>

      {/* Public badge */}
      <div className="absolute top-3 right-3">
        <span className="px-2 py-0.5 text-xs font-mono bg-green-500/20 text-green-400 border border-green-500/50 uppercase">
          {tCommon('public')}
        </span>
      </div>

      {/* Skill icon */}
      <div className="flex justify-center mb-3 mt-4">
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30">
          <Zap className="w-8 h-8 text-cyan-400" />
        </div>
      </div>

      {/* Skill name */}
      <h4 className="text-center font-mono text-cyan-100 truncate">{skill.name}</h4>

      {/* Meta info */}
      <div className="flex items-center justify-center gap-2 mt-2 text-xs text-cyan-100/50 font-mono">
        <span className="text-cyan-400">{skill._count.attachments} files</span>
        <span className="text-cyan-500/30">|</span>
        <span>{skill.user.username}</span>
      </div>

      {/* Description */}
      {skill.description && (
        <p className="mt-2 text-xs text-cyan-100/30 text-center line-clamp-2 font-mono">
          {skill.description}
        </p>
      )}
    </div>
  );
}
