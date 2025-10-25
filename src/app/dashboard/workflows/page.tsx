'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/routes';
import Button from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/atoms/Card';
import Link from 'next/link';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  visibility: string;
  _count: {
    stages: number;
  };
}

export default function WorkflowsListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
      setWorkflows(workflows.filter((w) => w.id !== id));
    } catch (error) {
      alert('Failed to delete workflow');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const updated = await response.json();
      setWorkflows(workflows.map((w) => (w.id === id ? { ...w, isActive: !isActive } : w)));
    } catch (error) {
      alert('Failed to update workflow');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Workflows</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage and organize your workflow templates
          </p>
        </div>
        <Link href={ROUTES.WORKFLOWS.NEW}>
          <Button variant="primary">+ Create New Workflow</Button>
        </Link>
      </div>

      {workflows.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text-secondary mb-4">No workflows yet</p>
          <Link href={ROUTES.WORKFLOWS.NEW}>
            <Button variant="primary">Create Your First Workflow</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {workflow.name}
                  </h3>
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
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={workflow.isActive}
                        onChange={() => handleToggleActive(workflow.id, workflow.isActive)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      <span className="ms-3 text-sm font-medium text-text-primary">
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={ROUTES.WORKFLOWS.EDIT(workflow.id)}>
                    <Button variant="primary" size="sm">
                      <EditIcon fontSize="small" />
                    </Button>
                  </Link>
                  <Button variant="secondary" size="sm">
                    <ContentCopyIcon fontSize="small" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(workflow.id)}>
                    <DeleteIcon fontSize="small" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
