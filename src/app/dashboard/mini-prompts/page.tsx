'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/shared/ui/atoms/Button';
import { Card } from '@/shared/ui/atoms/Card';
import { MiniPromptEditorModal } from '@/features/workflow-constructor/components/MiniPromptEditorModal';
import { createMiniPrompt, updateMiniPrompt, deleteMiniPrompt } from '@/features/workflow-constructor/actions/mini-prompt-actions';
import type { MiniPrompt } from '@prisma/client';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function MiniPromptsListPage() {
  const router = useRouter();
  const [miniPrompts, setMiniPrompts] = useState<MiniPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<MiniPrompt | null>(null);

  useEffect(() => {
    fetchMiniPrompts();
  }, []);

  const fetchMiniPrompts = async () => {
    try {
      const response = await fetch('/api/mini-prompts');
      const data = await response.json();
      setMiniPrompts(data);
    } catch (error) {
      console.error('Failed to fetch mini-prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (name: string, content: string, visibility: 'PUBLIC' | 'PRIVATE') => {
    const newPrompt = await createMiniPrompt({ name, content, visibility });
    setMiniPrompts([newPrompt, ...miniPrompts]);
  };

  const handleUpdate = async (name: string, content: string, visibility: 'PUBLIC' | 'PRIVATE') => {
    if (!editingPrompt) return;
    const updated = await updateMiniPrompt({
      id: editingPrompt.id,
      name,
      content,
      visibility,
    });
    setMiniPrompts(miniPrompts.map((mp) => (mp.id === updated.id ? updated : mp)));
    setEditingPrompt(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mini-prompt?')) return;
    try {
      await deleteMiniPrompt(id);
      setMiniPrompts(miniPrompts.filter((mp) => mp.id !== id));
    } catch (error: any) {
      alert(error.message || 'Failed to delete mini-prompt');
    }
  };

  const openEditModal = (prompt: MiniPrompt) => {
    setEditingPrompt(prompt);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingPrompt(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPrompt(null);
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Mini-Prompts</h1>
            <p className="text-sm text-text-secondary mt-1">
              Create and manage reusable prompt templates
            </p>
          </div>
          <Button variant="primary" onClick={openCreateModal}>
            + Create New Mini-Prompt
          </Button>
        </div>

        {miniPrompts.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-text-secondary mb-4">No mini-prompts yet</p>
            <Button variant="primary" onClick={openCreateModal}>
              Create Your First Mini-Prompt
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {miniPrompts.map((prompt) => (
              <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {prompt.name}
                    </h3>
                    <p className="text-sm text-text-secondary mb-4 line-clamp-3 font-mono text-xs">
                      {prompt.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-text-tertiary">
                      <span
                        className={`px-2 py-1 rounded ${
                          prompt.visibility === 'PUBLIC'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {prompt.visibility}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openEditModal(prompt)}
                    >
                      <EditIcon fontSize="small" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(prompt.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <MiniPromptEditorModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={editingPrompt ? handleUpdate : handleCreate}
        initialData={
          editingPrompt
            ? {
                name: editingPrompt.name,
                content: editingPrompt.content,
                visibility: editingPrompt.visibility,
              }
            : undefined
        }
      />
    </>
  );
}
