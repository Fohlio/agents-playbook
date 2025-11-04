'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import IconButton from '@/shared/ui/atoms/IconButton';
import type { MiniPrompt } from '@prisma/client';
import { MiniPromptEditorModal } from './MiniPromptEditorModal';
import { MiniPromptMultiSelect } from './MiniPromptMultiSelect';
import { createMiniPrompt, updateMiniPrompt } from '../actions/mini-prompt-actions';
import AddIcon from '@mui/icons-material/Add';

interface MiniPromptLibraryProps {
  miniPrompts: MiniPrompt[];
  onMiniPromptCreated?: (miniPrompt: MiniPrompt) => void;
  onMiniPromptUpdated?: (miniPrompt: MiniPrompt) => void;
}

export function MiniPromptLibrary({ miniPrompts, onMiniPromptCreated, onMiniPromptUpdated }: MiniPromptLibraryProps) {
  const [selectedMiniPromptIds, setSelectedMiniPromptIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMiniPrompt, setEditingMiniPrompt] = useState<MiniPrompt | null>(null);

  // Sync editingMiniPrompt when miniPrompts array changes (e.g., AI updates it)
  useEffect(() => {
    if (editingMiniPrompt) {
      const updated = miniPrompts.find(mp => mp.id === editingMiniPrompt.id);
      if (updated && (
        updated.name !== editingMiniPrompt.name ||
        updated.description !== editingMiniPrompt.description ||
        updated.content !== editingMiniPrompt.content
      )) {
        console.log('[MiniPromptLibrary] Detected external update to editing mini-prompt, refreshing modal');
        setEditingMiniPrompt(updated);
      }
    }
  }, [miniPrompts, editingMiniPrompt]);


  const handleCreateMiniPrompt = async (
    name: string,
    description: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE'
  ) => {
    const newMiniPrompt = await createMiniPrompt({ name, description, content, visibility });
    onMiniPromptCreated?.(newMiniPrompt);
  };

  const handleUpdateMiniPrompt = async (
    name: string,
    description: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE'
  ) => {
    if (!editingMiniPrompt) return;

    // Check if this is a temp mini-prompt (not saved to database yet)
    const isTempMiniPrompt = editingMiniPrompt.id.startsWith('temp-');

    if (isTempMiniPrompt) {
      // For temp mini-prompts, just update locally
      const updated: MiniPrompt = {
        ...editingMiniPrompt,
        name,
        description,
        content,
        visibility,
        updatedAt: new Date(),
      };
      onMiniPromptUpdated?.(updated);
      setEditingMiniPrompt(null);
    } else {
      // For saved mini-prompts, update in database
      const updated = await updateMiniPrompt({
        id: editingMiniPrompt.id,
        name,
        description,
        content,
        visibility,
      });
      onMiniPromptUpdated?.(updated);
      setEditingMiniPrompt(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMiniPrompt(null);
  };

  return (
    <>
      <Card className="h-full flex flex-col" testId="mini-prompt-library">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Mini-Prompts
          </h2>
          <IconButton
            variant="primary"
            size="sm"
            icon={<AddIcon fontSize="small" />}
            ariaLabel="Create new mini-prompt"
            onClick={() => setIsModalOpen(true)}
            testId="create-mini-prompt-button"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <MiniPromptMultiSelect
            miniPrompts={miniPrompts}
            selectedMiniPromptIds={selectedMiniPromptIds}
            onChange={setSelectedMiniPromptIds}
          />
        </div>
      </Card>

      <MiniPromptEditorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingMiniPrompt ? handleUpdateMiniPrompt : handleCreateMiniPrompt}
        initialData={editingMiniPrompt ? {
          name: editingMiniPrompt.name,
          description: editingMiniPrompt.description || '',
          content: editingMiniPrompt.content,
          visibility: editingMiniPrompt.visibility,
        } : undefined}
      />
    </>
  );
}
