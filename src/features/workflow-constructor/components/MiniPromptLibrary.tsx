'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import IconButton from '@/shared/ui/atoms/IconButton';
import type { MiniPrompt } from '@prisma/client';
import { MiniPromptEditorModal } from './MiniPromptEditorModal';
import { MiniPromptCard } from './MiniPromptCard';
import { createMiniPrompt, updateMiniPrompt, deleteMiniPrompt } from '../actions/mini-prompt-actions';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface MiniPromptLibraryProps {
  miniPrompts: MiniPrompt[];
  selectedMiniPromptIds?: string[];
  onMiniPromptCreated?: (miniPrompt: MiniPrompt) => void;
  onMiniPromptUpdated?: (miniPrompt: MiniPrompt) => void;
  onMiniPromptDeleted?: (miniPromptId: string) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function MiniPromptLibrary({ 
  miniPrompts, 
  selectedMiniPromptIds: controlledSelection,
  onMiniPromptCreated, 
  onMiniPromptUpdated,
  onMiniPromptDeleted,
  onSelectionChange 
}: MiniPromptLibraryProps) {
  const [internalSelection, setInternalSelection] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMiniPrompt, setEditingMiniPrompt] = useState<MiniPrompt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Use controlled selection if provided, otherwise use internal state
  const selectedMiniPromptIds = controlledSelection ?? internalSelection;
  const setSelectedMiniPromptIds = (ids: string[]) => {
    if (onSelectionChange) {
      onSelectionChange(ids);
    } else {
      setInternalSelection(ids);
    }
  };

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

  // Filter mini-prompts based on search query
  const filteredMiniPrompts = miniPrompts.filter(mp => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return mp.name.toLowerCase().includes(query) || 
           mp.description?.toLowerCase().includes(query);
  });

  const handleDeleteMiniPrompt = async (miniPromptId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const miniPrompt = miniPrompts.find(mp => mp.id === miniPromptId);
    if (!miniPrompt) return;

    if (!confirm(`Are you sure you want to delete "${miniPrompt.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteMiniPrompt(miniPromptId);
      onMiniPromptDeleted?.(miniPromptId);
      
      // Remove from selection if selected
      if (selectedMiniPromptIds.includes(miniPromptId)) {
        setSelectedMiniPromptIds(selectedMiniPromptIds.filter(id => id !== miniPromptId));
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete mini-prompt');
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col" testId="mini-prompt-library">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
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
          
          {/* Search/Filter Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mini-prompts..."
              className="w-full text-sm px-3 py-2 pr-8 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          
          {searchQuery && (
            <p className="text-xs text-gray-500 mt-1">
              Showing {filteredMiniPrompts.length} of {miniPrompts.length}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {miniPrompts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No mini-prompts available. Create one to get started.
            </div>
          ) : filteredMiniPrompts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No mini-prompts match your search.
            </div>
          ) : (
            filteredMiniPrompts.map((miniPrompt) => {
              const canDelete = !miniPrompt.isSystemMiniPrompt && !miniPrompt.isAutomatic;
              
              return (
                <div
                  key={miniPrompt.id}
                  className="relative group"
                >
                  <MiniPromptCard miniPrompt={miniPrompt} />
                  
                  {/* Action buttons overlay */}
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingMiniPrompt(miniPrompt);
                        setIsModalOpen(true);
                      }}
                      className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-600"
                      aria-label={`Edit ${miniPrompt.name}`}
                      title="Edit mini-prompt"
                    >
                      <EditIcon sx={{ fontSize: 14 }} />
                    </button>
                    
                    {canDelete && (
                      <button
                        onClick={(e) => handleDeleteMiniPrompt(miniPrompt.id, e)}
                        className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        aria-label={`Delete ${miniPrompt.name}`}
                        title="Delete mini-prompt"
                      >
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
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
