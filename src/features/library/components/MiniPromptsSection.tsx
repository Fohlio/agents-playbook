'use client';

import { useState, useEffect } from 'react';
import Button from '@/shared/ui/atoms/Button';
import IconButton from '@/shared/ui/atoms/IconButton';
import Toggle from '@/shared/ui/atoms/Toggle';
import { Card, Badge } from '@/shared/ui/atoms';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ShareButton } from '@/features/sharing/ui';
import { MiniPromptEditorModal } from '@/features/workflow-constructor/components/MiniPromptEditorModal';
import { createMiniPrompt } from '@/features/workflow-constructor/actions/mini-prompt-actions';

interface MiniPrompt {
  id: string;
  name: string;
  content: string;
  visibility: string;
  isActive: boolean;
  isOwned?: boolean;
  referenceId?: string | null;
  tags?: { tag: { id: string; name: string; color: string | null } }[];
}

export function MiniPromptsSection() {
  const [miniPrompts, setMiniPrompts] = useState<MiniPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMiniPrompt, setSelectedMiniPrompt] = useState<MiniPrompt | null>(null);

  useEffect(() => {
    fetchMiniPrompts();
  }, []);

  const fetchMiniPrompts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/mini-prompts');
      const data = await response.json();
      setMiniPrompts(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (
    name: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE',
    tagIds: string[]
  ) => {
    try {
      const response = await fetch('/api/mini-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content, visibility, tagIds }),
      });
      const newMiniPrompt = await response.json();
      setMiniPrompts([newMiniPrompt, ...miniPrompts]);
    } catch {
      alert('Failed to create mini-prompt');
    }
  };

  const handleSave = async (
    name: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE',
    tagIds: string[]
  ) => {
    if (!selectedMiniPrompt) return;
    try {
      const response = await fetch(`/api/mini-prompts/${selectedMiniPrompt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content, visibility, tagIds }),
      });
      const updated = await response.json();
      setMiniPrompts(
        miniPrompts.map((m) => (m.id === updated.id ? updated : m))
      );
      setSelectedMiniPrompt(null);
    } catch {
      alert('Failed to update mini-prompt');
    }
  };

  const handleDuplicate = async (miniPrompt: MiniPrompt) => {
    const duplicated = await createMiniPrompt({
      name: `${miniPrompt.name} (Copy)`,
      content: miniPrompt.content,
      visibility: miniPrompt.visibility as 'PUBLIC' | 'PRIVATE',
    });
    setMiniPrompts([duplicated, ...miniPrompts]);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/mini-prompts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setMiniPrompts(
        miniPrompts.map((m) => (m.id === id ? { ...m, isActive: !isActive } : m))
      );
    } catch {
      alert('Failed to update mini-prompt');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mini-prompt?')) return;
    try {
      await fetch(`/api/mini-prompts/${id}`, { method: 'DELETE' });
      setMiniPrompts(miniPrompts.filter((m) => m.id !== id));
    } catch {
      alert('Failed to delete mini-prompt');
    }
  };

  const handleRemoveFromLibrary = async (id: string) => {
    if (!confirm('Remove this mini-prompt from your library?')) return;
    try {
      await fetch(`/api/v1/mini-prompts/remove/${id}`, { method: 'DELETE' });
      setMiniPrompts(miniPrompts.filter((m) => m.id !== id));
    } catch {
      alert('Failed to remove mini-prompt from library');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            + Create Mini-Prompt
          </Button>
        </div>

        {miniPrompts.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-text-secondary mb-4">No mini-prompts yet</p>
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              Create Your First Mini-Prompt
            </Button>
          </Card>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {miniPrompts.map((miniPrompt) => (
            <div
              key={miniPrompt.id}
              onClick={() => {
                setSelectedMiniPrompt(miniPrompt);
                setIsModalOpen(true);
              }}
              className="cursor-pointer"
            >
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-text-primary flex-1">
                      {miniPrompt.name}
                    </h3>
                    {!miniPrompt.isOwned && (
                      <Badge variant="default" testId={`imported-badge-${miniPrompt.id}`}>
                        Imported
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mb-4 line-clamp-3">
                    {miniPrompt.content.slice(0, 150)}
                    {miniPrompt.content.length > 150 ? '...' : ''}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-text-tertiary mb-3">
                    <span>{miniPrompt.visibility}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                    <Toggle
                      checked={miniPrompt.isActive}
                      onChange={() =>
                        handleToggleActive(miniPrompt.id, miniPrompt.isActive)
                      }
                      label={miniPrompt.isActive ? 'Active' : 'Inactive'}
                      testId={`mini-prompt-toggle-${miniPrompt.id}`}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                  {miniPrompt.isOwned ? (
                    <>
                      <ShareButton
                        targetType="MINI_PROMPT"
                        targetId={miniPrompt.id}
                        targetName={miniPrompt.name}
                      />
                      <IconButton
                        variant="secondary"
                        size="sm"
                        icon={<ContentCopyIcon fontSize="small" />}
                        ariaLabel="Duplicate mini-prompt"
                        onClick={() => handleDuplicate(miniPrompt)}
                      />
                      <IconButton
                        variant="danger"
                        size="sm"
                        icon={<DeleteIcon fontSize="small" />}
                        ariaLabel="Delete mini-prompt"
                        onClick={() => handleDelete(miniPrompt.id)}
                      />
                    </>
                  ) : (
                    <>
                      <IconButton
                        variant="secondary"
                        size="sm"
                        icon={<ContentCopyIcon fontSize="small" />}
                        ariaLabel="Duplicate mini-prompt"
                        onClick={() => handleDuplicate(miniPrompt)}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveFromLibrary(miniPrompt.id)}
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
      </div>

      <MiniPromptEditorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
      />

      {selectedMiniPrompt && (
        <MiniPromptEditorModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMiniPrompt(null);
          }}
          onSave={selectedMiniPrompt.isOwned ? handleSave : async () => {}}
          initialData={{
            name: selectedMiniPrompt.name,
            content: selectedMiniPrompt.content,
            visibility: selectedMiniPrompt.visibility as 'PUBLIC' | 'PRIVATE',
            tagIds: selectedMiniPrompt.tags?.map(t => t.tag.id) ?? [],
          }}
          viewOnly={!selectedMiniPrompt.isOwned}
        />
      )}
    </>
  );
}
