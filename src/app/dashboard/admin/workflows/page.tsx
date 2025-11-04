'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/routes';
import { Button, Card, Badge } from '@/shared/ui/atoms';
import IconButton from '@/shared/ui/atoms/IconButton';
import Toggle from '@/shared/ui/atoms/Toggle';
import Link from 'next/link';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface SystemWorkflow {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  visibility: string;
  isSystemWorkflow: boolean;
  _count: {
    stages: number;
  };
}

export default function AdminSystemWorkflowsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [workflows, setWorkflows] = useState<SystemWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (session && session.user?.role !== 'ADMIN') {
      router.push(ROUTES.DASHBOARD);
    }
  }, [session, router]);

  useEffect(() => {
    fetchSystemWorkflows();
  }, []);

  const fetchSystemWorkflows = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/workflows?systemOnly=true');
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to fetch system workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setWorkflows(
        workflows.map((w) => (w.id === id ? { ...w, isActive: !isActive } : w))
      );
    } catch {
      alert('Failed to update workflow');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this system workflow?')) return;
    try {
      await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
      setWorkflows(workflows.filter((w) => w.id !== id));
    } catch {
      alert('Failed to delete workflow');
    }
  };

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">System Workflows</h1>
            <Badge variant="primary" testId="admin-badge">
              Admin
            </Badge>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Manage system workflows available to all users
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={ROUTES.ADMIN.SYSTEM_MINI_PROMPTS}>
            <Button variant="secondary">System Mini-Prompts</Button>
          </Link>
          <Link href={ROUTES.ADMIN.TAGS}>
            <Button variant="secondary">Tags</Button>
          </Link>
          <Link href={ROUTES.LIBRARY.WORKFLOWS.NEW}>
            <Button variant="primary">+ Create System Workflow</Button>
          </Link>
        </div>
      </div>

      {workflows.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text-secondary mb-4">No system workflows found</p>
          <Link href={ROUTES.LIBRARY.WORKFLOWS.NEW}>
            <Button variant="primary">Create First System Workflow</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <Card
              key={workflow.id}
              className="hover:shadow-lg transition-shadow border-2 border-accent-primary/20"
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-text-primary flex-1">
                      {workflow.name}
                    </h3>
                    <Badge variant="primary" testId={`system-badge-${workflow.id}`}>
                      System
                    </Badge>
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
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={workflow.isActive}
                      onChange={() =>
                        handleToggleActive(workflow.id, workflow.isActive)
                      }
                      label={workflow.isActive ? 'Active' : 'Inactive'}
                      testId={`workflow-toggle-${workflow.id}`}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={ROUTES.LIBRARY.WORKFLOWS.EDIT(workflow.id)}>
                    <IconButton
                      variant="primary"
                      size="sm"
                      icon={<EditIcon fontSize="small" />}
                      ariaLabel="Edit workflow"
                    />
                  </Link>
                  <IconButton
                    variant="danger"
                    size="sm"
                    icon={<DeleteIcon fontSize="small" />}
                    ariaLabel="Delete workflow"
                    onClick={() => handleDelete(workflow.id)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
