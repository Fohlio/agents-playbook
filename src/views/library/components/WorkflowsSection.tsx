'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/routes';
import Button from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/atoms';
import { WorkflowDiscoveryCardWidget } from '@/widgets/workflow-discovery-card';
import Link from 'next/link';
import { SortableItem } from '@/shared/ui/organisms/SortableItem';
import { WorkflowComplexity } from '@prisma/client';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useLibraryReorder } from '../hooks/use-library-reorder';

interface Workflow {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  visibility: string;
  isOwned?: boolean;
  isSystemWorkflow?: boolean;
  referenceId?: string | null;
  complexity?: WorkflowComplexity | null;
  position: number;
  tags?: Array<{ tag: { id: string; name: string; color: string | null; } }>;
  user: {
    id: string;
    username: string | null;
    email: string;
  };
  _count: {
    stages: number;
  };
  averageRating: number | null;
  totalRatings: number;
  usageCount: number;
  isInUserLibrary?: boolean;
}

export function WorkflowsSection() {
  const t = useTranslations('library');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  const { sensors, handleDragEnd } = useLibraryReorder<Workflow>(
    workflows,
    setWorkflows,
    '/api/workflows/reorder'
  );

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const [workflowsRes, sessionRes] = await Promise.all([
        fetch('/api/workflows'),
        fetch('/api/auth/session')
      ]);

      const data = await workflowsRes.json();
      const session = await sessionRes.json();

      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      }

      // Map data to include fields expected by WorkflowDiscoveryCard
      const mapped = data.map((w: Workflow) => ({
        ...w,
        user: {
          id: w.user?.id || '',
          username: w.user?.username || w.user?.email?.split('@')[0] || 'Unknown User',
        },
        averageRating: w.averageRating || null,
        totalRatings: w.totalRatings || 0,
        usageCount: w.usageCount || 0,
        isInUserLibrary: true, // All workflows in library are already in user's library
      }));

      // Sort by position ascending
      const sorted = [...mapped].sort((a, b) => a.position - b.position);
      setWorkflows(sorted);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (!workflow) return;

    // If owned and not system workflow, delete; otherwise remove from library
    if (workflow.isOwned && !workflow.isSystemWorkflow) {
      await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
    } else {
      await fetch(`/api/v1/workflows/remove/${id}`, { method: 'DELETE' });
    }
    setWorkflows(workflows.filter((w) => w.id !== id));
  };


  if (isLoading) {
    return <div className="text-center py-12">{t('loading')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href={ROUTES.LIBRARY.WORKFLOWS.NEW}>
          <Button variant="primary">{t('workflows.create')}</Button>
        </Link>
      </div>

      {workflows.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text-secondary mb-4">{t('workflows.empty')}</p>
          <Link href={ROUTES.LIBRARY.WORKFLOWS.NEW}>
            <Button variant="primary">{t('workflows.createFirst')}</Button>
          </Link>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={workflows.map((w) => w.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {workflows.map((workflow) => (
                <SortableItem key={workflow.id} id={workflow.id}>
                  <WorkflowDiscoveryCardWidget
                    workflow={workflow as unknown as import('@/views/discover/types').PublicWorkflowWithMeta & { tags?: { tag: { id: string; name: string; color: string | null } }[] }}
                    onImport={() => {}}
                    onRemove={handleRemove}
                    onDuplicate={fetchWorkflows}
                    isAuthenticated={true}
                    currentUserId={currentUserId}
                  />
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
