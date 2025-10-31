'use client';

import { useState } from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import IconButton from '@/shared/ui/atoms/IconButton';
import Input from '@/shared/ui/atoms/Input';
import type { MiniPrompt } from '@prisma/client';
import { MiniPromptCard } from './MiniPromptCard';
import { MiniPromptEditorModal } from './MiniPromptEditorModal';
import { createMiniPrompt } from '../actions/mini-prompt-actions';
import AddIcon from '@mui/icons-material/Add';

interface MiniPromptLibraryProps {
  miniPrompts: MiniPrompt[];
  onMiniPromptCreated?: (miniPrompt: MiniPrompt) => void;
}

export function MiniPromptLibrary({ miniPrompts, onMiniPromptCreated }: MiniPromptLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredMiniPrompts = miniPrompts.filter((mp) => {
    const matchesSearch = mp.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCreateMiniPrompt = async (
    name: string,
    description: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE'
  ) => {
    const newMiniPrompt = await createMiniPrompt({ name, description, content, visibility });
    onMiniPromptCreated?.(newMiniPrompt);
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

        <div className="space-y-3 mb-4">
          <Input
            type="text"
            placeholder="Search mini-prompts..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            testId="search-mini-prompts"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredMiniPrompts.map((mp) => (
            <MiniPromptCard key={mp.id} miniPrompt={mp} />
          ))}
          {filteredMiniPrompts.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-8">
              No mini-prompts found
            </p>
          )}
        </div>
      </Card>

      <MiniPromptEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateMiniPrompt}
      />
    </>
  );
}
