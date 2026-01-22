"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShareButton } from "@/features/sharing/ui";
import { WorkflowWithUsage } from "../lib/dashboard-service";
import { deactivateWorkflow } from "../actions/workflow-actions";

interface ActiveWorkflowsSectionProps {
  workflows: WorkflowWithUsage[];
}

function CyberCard({ children, testId }: { children: React.ReactNode; testId?: string }) {
  return (
    <div
      data-testid={testId}
      className="bg-[#0a0a0f]/80 backdrop-blur-sm border border-cyan-500/30 relative"
      style={{
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-cyan-500/30"></div>
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-cyan-500/30"></div>
      
      {/* Circuit pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px'
      }}></div>
      
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

function ComplexityBadge({ complexity }: { complexity: string }) {
  const colors = {
    LOW: 'bg-green-500/20 text-green-400 border-green-500/50',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    HIGH: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-mono uppercase border ${colors[complexity as keyof typeof colors] || colors.MEDIUM}`}>
      {complexity}
    </span>
  );
}

export function ActiveWorkflowsSection({ workflows }: ActiveWorkflowsSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('dashboard.activeWorkflows');
  const tCommon = useTranslations('common');

  const handleDeactivate = async (workflowId: string) => {
    try {
      setLoading(workflowId);
      setError(null);
      await deactivateWorkflow(workflowId);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToDeactivate"));
    } finally {
      setLoading(null);
    }
  };

  if (workflows.length === 0) {
    return (
      <CyberCard testId="active-workflows-empty">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold font-mono text-cyan-400">ACTIVE_WORKFLOWS.exe</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
          </div>
          <div className="text-center py-8">
            <p className="text-cyan-100/40 font-mono">{t('emptyDescription')}</p>
          </div>
        </div>
      </CyberCard>
    );
  }

  return (
    <CyberCard testId="active-workflows-section">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold font-mono text-cyan-400" style={{ textShadow: '0 0 10px #00ffff40' }}>
              ACTIVE_WORKFLOWS.exe
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
              {workflows.length}
            </span>
          </div>
          <Link
            href="/dashboard/library?tab=workflows"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 uppercase tracking-wider transition-colors"
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
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="flex items-center justify-between p-4 bg-[#050508]/50 border-l-2 border-cyan-500/50 hover:border-cyan-400 hover:bg-[#050508]/80 transition-all duration-200"
              data-testid={`workflow-card-${workflow.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-white">{workflow.name}</h3>
                  {workflow.complexity && <ComplexityBadge complexity={workflow.complexity} />}
                  {workflow.isSystemWorkflow && (
                    <span className="px-2 py-0.5 text-xs font-mono bg-purple-500/20 text-purple-400 border border-purple-500/50">
                      {tCommon('system')}
                    </span>
                  )}
                  <span className="px-2 py-0.5 text-xs font-mono bg-green-500/20 text-green-400 border border-green-500/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    {tCommon('active')}
                  </span>
                </div>
                {workflow.description && (
                  <p className="text-sm text-cyan-100/50 mt-1 truncate">{workflow.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs text-cyan-100/40 font-mono">
                    {tCommon('stages', { count: workflow._count.stages })}
                  </span>
                  {workflow.tags && workflow.tags.length > 0 && (
                    <>
                      <span className="text-cyan-500/30">|</span>
                      <div className="flex flex-wrap gap-1">
                        {workflow.tags.slice(0, 3).map((wt) => (
                          <span 
                            key={wt.tag.id} 
                            className="px-2 py-0.5 text-xs font-mono bg-cyan-500/10 text-cyan-400/70 border border-cyan-500/30"
                          >
                            {wt.tag.name}
                          </span>
                        ))}
                        {workflow.tags.length > 3 && (
                          <span className="text-xs text-cyan-100/40 font-mono">+{workflow.tags.length - 3}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <ShareButton
                  targetType="WORKFLOW"
                  targetId={workflow.id}
                  targetName={workflow.name}
                />
                {!workflow.isSystemWorkflow && (
                  <button
                    onClick={() => router.push(`/dashboard/library/workflows/${workflow.id}/constructor`)}
                    data-testid={`edit-button-${workflow.id}`}
                    className="px-3 py-1.5 text-xs font-mono uppercase bg-[#050508] border border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-all"
                  >
                    {tCommon('edit')}
                  </button>
                )}
                <button
                  onClick={() => handleDeactivate(workflow.id)}
                  disabled={loading === workflow.id}
                  data-testid={`deactivate-button-${workflow.id}`}
                  className="px-3 py-1.5 text-xs font-mono uppercase bg-[#050508] border border-pink-500/50 text-pink-400 hover:border-pink-400 hover:shadow-[0_0_10px_rgba(255,0,102,0.2)] disabled:opacity-50 transition-all"
                >
                  {loading === workflow.id ? '...' : t('deactivate')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CyberCard>
  );
}
