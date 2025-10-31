"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
          title="Active Workflows"
          description="No active workflows yet"
          titleHref="/dashboard/library?tab=workflows"
        />
        <div className="text-center py-8">
          <p className="text-gray-500">Create and activate your first workflow to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <Card testId="active-workflows-section">
      <CardHeader
        title="Active Workflows"
        description={`${workflows.length} of 5 active workflows`}
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
                <Badge variant="primary" testId="workflow-active-badge">Active</Badge>
              </div>
              {workflow.description && (
                <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">
                  {workflow._count.stages} stages
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/dashboard/library/workflows/${workflow.id}/constructor`)}
                testId={`edit-button-${workflow.id}`}
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDeactivate(workflow.id)}
                disabled={loading === workflow.id}
                testId={`deactivate-button-${workflow.id}`}
              >
                {loading === workflow.id ? "Deactivating..." : "Deactivate"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
