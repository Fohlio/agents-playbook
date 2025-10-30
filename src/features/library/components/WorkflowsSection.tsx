'use client';

import { useState, useEffect } from 'react';
import { ROUTES } from '@/shared/routes';
import Button from '@/shared/ui/atoms/Button';
import IconButton from '@/shared/ui/atoms/IconButton';
import Toggle from '@/shared/ui/atoms/Toggle';
import { Card, Badge } from '@/shared/ui/atoms';
import Link from 'next/link';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import { ShareButton } from '@/features/sharing/ui';
import { WorkflowPreviewModal } from '@/shared/ui/molecules/WorkflowPreviewModal';
import { PublicWorkflowWithMeta } from '@/features/public-discovery/types';

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  visibility: string;
  isOwned?: boolean;
  referenceId?: string | null;
  _count: {
    stages: number;
  };
}

export function WorkflowsSection() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewWorkflow, setPreviewWorkflow] = useState<PublicWorkflowWithMeta | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();
      setWorkflows(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
      setWorkflows(workflows.filter((w) => w.id !== id));
    } catch {
      alert('Failed to delete workflow');
    }
  };

  const handleRemoveFromLibrary = async (id: string) => {
    if (!confirm('Remove this workflow from your library?')) return;
    try {
      await fetch(`/api/v1/workflows/remove/${id}`, { method: 'DELETE' });
      setWorkflows(workflows.filter((w) => w.id !== id));
    } catch {
      alert('Failed to remove workflow from library');
    }
  };

  const handleDuplicate = async (workflow: Workflow) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${workflow.name} (Copy)`,
          description: workflow.description,
          isActive: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate workflow');
      }

      const duplicated = await response.json();
      setWorkflows([duplicated, ...workflows]);
    } catch {
      alert('Failed to duplicate workflow');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setWorkflows(workflows.map((w) => (w.id === id ? { ...w, isActive: !isActive } : w)));
    } catch {
      alert('Failed to update workflow');
    }
  };

  const handleWorkflowClick = async (workflowId: string) => {
    try {
      // Fetch full workflow details
      const response = await fetch(`/api/workflows/${workflowId}/details`);
      if (!response.ok) throw new Error('Failed to fetch workflow details');

      const workflow = await response.json();
      setPreviewWorkflow(workflow);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Error fetching workflow:', error);
      alert('Failed to load workflow details');
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewWorkflow(null);
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href={ROUTES.LIBRARY.WORKFLOWS.NEW}>
          <Button variant="primary">+ Create Workflow</Button>
        </Link>
      </div>

      {workflows.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text-secondary mb-4">No workflows yet</p>
          <Link href={ROUTES.LIBRARY.WORKFLOWS.NEW}>
            <Button variant="primary">Create Your First Workflow</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              onClick={() => handleWorkflowClick(workflow.id)}
              className="cursor-pointer"
            >
              <Card className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-text-primary flex-1">
                      {workflow.name}
                    </h3>
                    {!workflow.isOwned && (
                      <Badge variant="default" testId={`imported-badge-${workflow.id}`}>
                        Imported
                      </Badge>
                    )}
                  </div>
                  {workflow.description && (
                    <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                      {workflow.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-text-tertiary mb-3">
                    <span>{workflow._count.stages} stages</span>
                    <span>•</span>
                    <span>{workflow.visibility}</span>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Toggle
                      checked={workflow.isActive}
                      onChange={() => handleToggleActive(workflow.id, workflow.isActive)}
                      label={workflow.isActive ? 'Active' : 'Inactive'}
                      testId={`workflow-toggle-${workflow.id}`}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                  {workflow.isOwned ? (
                    <>
                      <Link href={ROUTES.LIBRARY.WORKFLOWS.EDIT(workflow.id)}>
                        <IconButton
                          variant="secondary"
                          size="sm"
                          icon={<EditIcon fontSize="small" />}
                          ariaLabel="Edit workflow"
                        />
                      </Link>
                      <ShareButton
                        targetType="WORKFLOW"
                        targetId={workflow.id}
                        targetName={workflow.name}
                      />
                      <IconButton
                        variant="secondary"
                        size="sm"
                        icon={<ContentCopyIcon fontSize="small" />}
                        ariaLabel="Duplicate workflow"
                        onClick={() => handleDuplicate(workflow)}
                      />
                      <IconButton
                        variant="danger"
                        size="sm"
                        icon={<DeleteIcon fontSize="small" />}
                        ariaLabel="Delete workflow"
                        onClick={() => handleDelete(workflow.id)}
                      />
                    </>
                  ) : (
                    <>
                      <IconButton
                        variant="secondary"
                        size="sm"
                        icon={<ContentCopyIcon fontSize="small" />}
                        ariaLabel="Duplicate workflow"
                        onClick={() => handleDuplicate(workflow)}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveFromLibrary(workflow.id)}
                      >
                        Remove from Library
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
            </div>
          ))}
        </div>
      )}

      {/* Workflow Preview Modal */}
      {previewWorkflow && (
        <WorkflowPreviewModal
          workflow={previewWorkflow}
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          onImport={() => {}}
          isAuthenticated={true}
          isOwnWorkflow={workflows.find((w) => w.id === previewWorkflow.id)?.isOwned ?? false}
        />
      )}
    </div>
  );
}
