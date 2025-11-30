'use client';

import { useState, useEffect, useRef } from 'react';
import type { MiniPrompt } from '@prisma/client';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';

interface MiniPromptMultiSelectProps {
  miniPrompts: MiniPrompt[];
  selectedMiniPromptIds: string[];
  onChange: (ids: string[]) => void;
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  placeholder?: string;
}

/**
 * MiniPromptMultiSelect Component
 *
 * Multi-select dropdown for mini-prompts with search functionality
 * Displays selected mini-prompts in a list below with delete icons
 */
export function MiniPromptMultiSelect({
  miniPrompts,
  selectedMiniPromptIds,
  onChange,
  onRemove,
  onEdit,
  placeholder = 'Select mini-prompts...'
}: MiniPromptMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedMiniPrompts = miniPrompts.filter(mp => selectedMiniPromptIds.includes(mp.id));
  const filteredMiniPrompts = miniPrompts.filter(mp =>
    mp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mp.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMiniPrompt = (id: string) => {
    if (selectedMiniPromptIds.includes(id)) {
      onChange(selectedMiniPromptIds.filter(mpId => mpId !== id));
    } else {
      onChange([...selectedMiniPromptIds, id]);
    }
  };

  const removeMiniPrompt = (id: string) => {
    onChange(selectedMiniPromptIds.filter(mpId => mpId !== id));
    if (onRemove) {
      onRemove(id);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[42px] flex items-center justify-between"
          data-testid="mini-prompt-multiselect-button"
        >
          <span className={selectedMiniPrompts.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
            {selectedMiniPrompts.length === 0
              ? placeholder
              : `${selectedMiniPrompts.length} mini-prompt${selectedMiniPrompts.length === 1 ? '' : 's'} selected`
            }
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-auto">
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search mini-prompts..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoFocus
                data-testid="mini-prompt-search-input"
              />
            </div>

            <div className="p-1">
              {filteredMiniPrompts.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No mini-prompts found
                </div>
              ) : (
                filteredMiniPrompts.map(mp => {
                  const isSelected = selectedMiniPromptIds.includes(mp.id);
                  return (
                    <button
                      key={mp.id}
                      type="button"
                      onClick={() => toggleMiniPrompt(mp.id)}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-start gap-2 ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                      data-testid={`mini-prompt-option-${mp.id}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-0.5 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {mp.name}
                        </div>
                        {mp.description && (
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {mp.description}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected mini-prompts list */}
      {selectedMiniPrompts.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700 px-1">
            Selected Mini-Prompts ({selectedMiniPrompts.length})
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {selectedMiniPrompts.map(mp => (
              <div
                key={mp.id}
                className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {mp.name}
                  </div>
                  {mp.description && (
                    <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                      {mp.description}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 flex gap-1">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(mp.id)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      aria-label={`Edit ${mp.name}`}
                      data-testid={`edit-mini-prompt-${mp.id}`}
                    >
                      <EditIcon fontSize="small" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMiniPrompt(mp.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    aria-label={`Remove ${mp.name}`}
                    data-testid={`remove-mini-prompt-${mp.id}`}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
