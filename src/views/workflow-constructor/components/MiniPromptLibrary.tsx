'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { MiniPrompt } from '@prisma/client';
import { MiniPromptEditorModal } from './MiniPromptEditorModal';
import { MiniPromptCard } from './MiniPromptCard';
import { createMiniPrompt, updateMiniPrompt, deleteMiniPrompt } from '../actions/mini-prompt-actions';
import { useWorkflowConstructorStore } from '../lib/workflow-constructor-store';
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
  const t = useTranslations('miniPromptLibrary');
  const [internalSelection, setInternalSelection] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMiniPrompt, setEditingMiniPrompt] = useState<MiniPrompt | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingTagIds, setEditingTagIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const setViewingMiniPromptId = useWorkflowConstructorStore((state) => state.setViewingMiniPromptId);
  useEffect(() => {
    if (editingMiniPrompt && setViewingMiniPromptId) {
      setViewingMiniPromptId(editingMiniPrompt.id);
    }
  }, [editingMiniPrompt, setViewingMiniPromptId]);

  const selectedMiniPromptIds = controlledSelection ?? internalSelection;
  const setSelectedMiniPromptIds = (ids: string[]) => {
    if (onSelectionChange) {
      onSelectionChange(ids);
    } else {
      setInternalSelection(ids);
    }
  };

  useEffect(() => {
    if (editingMiniPrompt) {
      const updated = miniPrompts.find(mp => mp.id === editingMiniPrompt.id);
      if (updated && (
        updated.name !== editingMiniPrompt.name ||
        updated.description !== editingMiniPrompt.description ||
        updated.content !== editingMiniPrompt.content
      )) {
        setEditingMiniPrompt(updated);
      }
    }
  }, [miniPrompts, editingMiniPrompt]);


  const handleCreateMiniPrompt = async (
    name: string,
    description: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE',
    tagIds: string[],
    newTagNames: string[]
  ) => {
    const newMiniPrompt = await createMiniPrompt({ name, description, content, visibility, tagIds, newTagNames });
    onMiniPromptCreated?.(newMiniPrompt);
  };

  const handleUpdateMiniPrompt = async (
    name: string,
    description: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE',
    tagIds: string[],
    newTagNames: string[]
  ) => {
    if (!editingMiniPrompt) return;

    const isTempMiniPrompt = editingMiniPrompt.id.startsWith('temp-');

    if (isTempMiniPrompt) {
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
      const updated = await updateMiniPrompt({
        id: editingMiniPrompt.id,
        name,
        description,
        content,
        visibility,
        tagIds,
        newTagNames,
      });
      onMiniPromptUpdated?.(updated);
      setEditingMiniPrompt(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMiniPrompt(null);
    setEditingTagIds([]);
  };

  const handleEditMiniPrompt = async (miniPrompt: MiniPrompt) => {
    const isTempMiniPrompt = miniPrompt.id.startsWith('temp-');
    
    if (!isTempMiniPrompt) {
      try {
        const response = await fetch(`/api/mini-prompts/${miniPrompt.id}`);
        if (response.ok) {
          const data = await response.json();
          setEditingTagIds(data.tagIds || []);
        }
      } catch (error) {
        console.error('Failed to fetch mini-prompt tags:', error);
        setEditingTagIds([]);
      }
    } else {
      setEditingTagIds([]);
    }
    
    setEditingMiniPrompt(miniPrompt);
    setIsModalOpen(true);
  };

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

    if (!confirm(t('deleteConfirm', { name: miniPrompt.name }))) {
      return;
    }

    try {
      await deleteMiniPrompt(miniPromptId);
      onMiniPromptDeleted?.(miniPromptId);
      
      if (selectedMiniPromptIds.includes(miniPromptId)) {
        setSelectedMiniPromptIds(selectedMiniPromptIds.filter(id => id !== miniPromptId));
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete mini-prompt');
    }
  };

  return (
    <>
      <div 
        className="h-full flex flex-col bg-[#0a0a0f]/80 backdrop-blur-sm border border-pink-500/30 p-4"
        style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
        data-testid="mini-prompt-library"
      >
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-mono font-bold text-pink-400 uppercase tracking-wider" style={{ textShadow: '0 0 10px #ff006640' }}>
              {t('title')}
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 bg-gradient-to-r from-pink-500 to-pink-400 text-white hover:shadow-[0_0_15px_rgba(255,0,102,0.4)] transition-all cursor-pointer"
              style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
              aria-label={t('createTooltip')}
              data-testid="create-mini-prompt-button"
            >
              <AddIcon fontSize="small" />
            </button>
          </div>

          {/* Search/Filter Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full text-xs px-3 py-2 pr-8 bg-[#050508]/50 border border-pink-500/30 text-cyan-100 font-mono placeholder:text-pink-500/30 focus:outline-none focus:border-pink-400 focus:shadow-[0_0_10px_rgba(255,0,102,0.1)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-300 cursor-pointer"
                aria-label="Clear search"
              >
                x
              </button>
            )}
          </div>

          {searchQuery && (
            <p className="text-xs text-cyan-100/40 font-mono mt-1">
              {t('found', { found: filteredMiniPrompts.length, total: miniPrompts.length })}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {miniPrompts.length === 0 ? (
            <div className="text-center py-8 text-cyan-100/40 font-mono text-xs">
              {t('noPrompts')}
              <br />
              <span className="text-pink-400">{t('createNew')}</span>
            </div>
          ) : filteredMiniPrompts.length === 0 ? (
            <div className="text-center py-8 text-cyan-100/40 font-mono text-xs">
              {t('noMatches')}
            </div>
          ) : (
            filteredMiniPrompts.map((miniPrompt) => {
              const canDelete = !miniPrompt.isSystemMiniPrompt && !miniPrompt.isAutomatic;
              
              return (
                <div
                  key={miniPrompt.id}
                  className="relative group"
                >
                  <MiniPromptCard 
                    miniPrompt={miniPrompt}
                    onClick={(mp) => {
                      if (setViewingMiniPromptId) {
                        setViewingMiniPromptId(mp.id);
                      }
                      handleEditMiniPrompt(mp);
                    }}
                  />
                  
                  {/* Action buttons overlay */}
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (setViewingMiniPromptId) {
                          setViewingMiniPromptId(miniPrompt.id);
                        }
                        handleEditMiniPrompt(miniPrompt);
                      }}
                      className="bg-cyan-500 text-[#050508] w-6 h-6 flex items-center justify-center hover:bg-cyan-400 transition-all cursor-pointer"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))' }}
                      aria-label={`Edit ${miniPrompt.name}`}
                      title={t('editTooltip')}
                    >
                      <EditIcon sx={{ fontSize: 14 }} />
                    </button>

                    {canDelete && (
                      <button
                        onClick={(e) => handleDeleteMiniPrompt(miniPrompt.id, e)}
                        className="bg-pink-500 text-white w-6 h-6 flex items-center justify-center hover:bg-pink-400 transition-all cursor-pointer"
                        style={{ clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))' }}
                        aria-label={`Delete ${miniPrompt.name}`}
                        title={t('deleteTooltip')}
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
      </div>

      <MiniPromptEditorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingMiniPrompt ? handleUpdateMiniPrompt : handleCreateMiniPrompt}
        initialData={editingMiniPrompt ? {
          name: editingMiniPrompt.name,
          description: editingMiniPrompt.description || '',
          content: editingMiniPrompt.content,
          visibility: editingMiniPrompt.visibility,
          key: editingMiniPrompt.key,
        } : undefined}
      />
    </>
  );
}
