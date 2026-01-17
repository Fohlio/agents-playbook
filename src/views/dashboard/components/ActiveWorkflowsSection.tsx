"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardHeader, Badge, Button } from "@/shared/ui/atoms";
import { ComplexityBadge } from "@/shared/ui/atoms/ComplexityBadge";
import { ShareButton } from "@/features/sharing/ui";
import { WorkflowWithUsage } from "../lib/dashboard-service";
import { deactivateWorkflow } from "../actions/workflow-actions";

interface ActiveWorkflowsSectionProps {
  workflows: WorkflowWithUsage[];
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
      setError(err instanceof Error ? err.message : "Failed to deactivate workflow");
    } finally {
      setLoading(null);
    }
  };

  if (workflows.length === 0) {
    return (
      <Card testId="active-workflows-empty">
        <CardHeader
          title={t('title')}
          description={t('empty')}
          titleHref="/dashboard/library?tab=workflows"
        />
        <div className="text-center py-8">
          <p className="text-gray-500">{t('emptyDescription')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card testId="active-workflows-section">
      <CardHeader
        title={t('title')}
        description={t('count', { count: workflows.length })}
        titleHref="/dashboard/library?tab=workflows"
      />

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="space-y-3">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            data-testid={`workflow-card-${workflow.id}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                <ComplexityBadge complexity={workflow.complexity} size="sm" />
                {workflow.isSystemWorkflow && (
                  <Badge variant="default" testId={`system-badge-${workflow.id}`}>
                    {tCommon('system')}
                  </Badge>
                )}
                <Badge variant="primary" testId="workflow-active-badge">{tCommon('active')}</Badge>
              </div>
              {workflow.description && (
                <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">
                  {tCommon('stages', { count: workflow._count.stages })}
                </p>
                {workflow.tags && workflow.tags.length > 0 && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <div className="flex flex-wrap gap-1">
                      {workflow.tags.map((wt) => (
                        <Badge key={wt.tag.id} variant="default">
                          {wt.tag.name}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <ShareButton
                targetType="WORKFLOW"
                targetId={workflow.id}
                targetName={workflow.name}
              />
              {!workflow.isSystemWorkflow && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push(`/dashboard/library/workflows/${workflow.id}/constructor`)}
                  testId={`edit-button-${workflow.id}`}
                >
                  {tCommon('edit')}
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDeactivate(workflow.id)}
                disabled={loading === workflow.id}
                testId={`deactivate-button-${workflow.id}`}
              >
                {loading === workflow.id ? t('deactivating') : t('deactivate')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
