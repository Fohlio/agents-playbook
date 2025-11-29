'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/shared/ui/atoms';
import Button from '@/shared/ui/atoms/Button';
import { MiniPromptDiscoveryCard } from '@/shared/ui/molecules/MiniPromptDiscoveryCard';
import { MiniPromptEditorModal } from '@/features/workflow-constructor/components/MiniPromptEditorModal';
import { SortableItem } from '@/shared/ui/organisms/SortableItem';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useLibraryReorder } from '../hooks/use-library-reorder';

interface MiniPrompt {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  content: string;
  visibility: string;
  isActive: boolean;
  isOwned?: boolean;
  isSystemMiniPrompt?: boolean;
  referenceId?: string | null;
  position: number;
  tags?: { tag: { id: string; name: string; color: string | null } }[];
  user: {
    id: string;
    username: string | null;
    email: string;
  };
  _count: {
    references: number;
    stageMiniPrompts: number;
  };
  averageRating: number | null;
  totalRatings: number;
  isInUserLibrary?: boolean;
}

export function MiniPromptsSection() {
  const [miniPrompts, setMiniPrompts] = useState<MiniPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  const { sensors, handleDragEnd } = useLibraryReorder<MiniPrompt>(
    miniPrompts,
    setMiniPrompts,
    '/api/mini-prompts/reorder'
  );

  useEffect(() => {
    fetchMiniPrompts();
  }, []);

  const fetchMiniPrompts = async () => {
    setIsLoading(true);
    try {
      const [miniPromptsRes, sessionRes] = await Promise.all([
        fetch('/api/mini-prompts'),
        fetch('/api/auth/session')
      ]);

      const data = await miniPromptsRes.json();
      const session = await sessionRes.json();

      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      }

      // Map data to include fields expected by MiniPromptDiscoveryCard
      const mapped = data.map((mp: MiniPrompt) => ({
        ...mp,
        user: {
          id: mp.user?.id || '',
          username: mp.user?.username || mp.user?.email?.split('@')[0] || 'Unknown User',
        },
        _count: mp._count || { references: 0, stageMiniPrompts: 0 },
        averageRating: mp.averageRating || null,
        totalRatings: mp.totalRatings || 0,
        isInUserLibrary: true, // All mini-prompts in library are already in user's library
      }));

      // Sort by position ascending
      const sorted = [...mapped].sort((a, b) => a.position - b.position);
      setMiniPrompts(sorted);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    const miniPrompt = miniPrompts.find(m => m.id === id);
    if (!miniPrompt) return;

    // If owned and not system mini-prompt, delete; otherwise remove from library
    if (miniPrompt.isOwned && !miniPrompt.isSystemMiniPrompt) {
      await fetch(`/api/mini-prompts/${id}`, { method: 'DELETE' });
    } else {
      await fetch(`/api/v1/mini-prompts/remove/${id}`, { method: 'DELETE' });
    }
    setMiniPrompts(miniPrompts.filter((m) => m.id !== id));
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setIsCreating(true)}>
          + Create Mini-Prompt
        </Button>
      </div>

      {miniPrompts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text-secondary mb-4">No mini-prompts yet</p>
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            Create Your First Mini-Prompt
          </Button>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={miniPrompts.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {miniPrompts.map((miniPrompt) => (
                <SortableItem key={miniPrompt.id} id={miniPrompt.id}>
                  <MiniPromptDiscoveryCard
                    miniPrompt={miniPrompt as unknown as import('@/features/public-discovery/types').PublicMiniPromptWithMeta & { tags?: { tag: { id: string; name: string; color: string | null } }[] }}
                    onImport={() => {}}
                    onRemove={handleRemove}
                    onDuplicate={fetchMiniPrompts}
                    onUpdate={fetchMiniPrompts}
                    isAuthenticated={true}
                    currentUserId={currentUserId}
                  />
                </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

      <MiniPromptEditorModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSave={async (name, description, content, visibility, tagIds, newTagNames) => {
          // Create the mini-prompt
          await fetch('/api/mini-prompts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              description,
              content,
              visibility,
              tagIds,
              newTagNames,
            }),
          });
          setIsCreating(false);
          fetchMiniPrompts();
        }}
      />
    </div>
  );
}
