'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Badge } from '@/shared/ui/atoms';

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  isTemporary?: boolean; // Flag for tags created inline, not yet saved to DB
}

export interface TagMultiSelectProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  onTagsChanged?: (tags: Tag[]) => void; // Callback to sync temp tags with parent
  label?: string;
  placeholder?: string;
}

/**
 * TagMultiSelect Component
 *
 * Multi-select dropdown for tags with search functionality
 * Displays selected tags as badges with remove buttons
 *
 * FSD Layer: Molecules
 * Imports: atoms (Badge)
 */
export function TagMultiSelect({
  selectedTagIds,
  onChange,
  onTagsChanged,
  label,
  placeholder = 'Select tags...'
}: TagMultiSelectProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/tags')
      .then(res => res.json())
      .then(setTags)
      .finally(() => setLoading(false));
  }, []);

  // Update dropdown position when opening (fixed positioning uses viewport coords directly)
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync temp tags with parent
  useEffect(() => {
    if (onTagsChanged) {
      onTagsChanged(tags);
    }
  }, [tags, onTagsChanged]);

  const selectedTags = tags.filter(t => selectedTagIds.includes(t.id));
  const filteredTags = tags.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if search term would create a new tag
  const searchTermTrimmed = searchTerm.trim();
  const canCreateTag = searchTermTrimmed.length > 0 &&
    !tags.some(t => t.name.toLowerCase() === searchTermTrimmed.toLowerCase());

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const removeTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTagIds.filter(id => id !== tagId));
  };

  const createNewTag = () => {
    if (!canCreateTag) return;

    const newTag: Tag = {
      id: `temp-tag-${Date.now()}`,
      name: searchTermTrimmed,
      color: null,
      isTemporary: true,
    };

    setTags([...tags, newTag]);
    onChange([...selectedTagIds, newTag.id]);
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canCreateTag) {
      e.preventDefault();
      createNewTag();
    }
  };

  if (loading) {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {label}
          </label>
        )}
        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
          Loading tags...
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[42px]"
        data-testid="tag-multiselect-button"
      >
        {selectedTags.length === 0 ? (
          <span className="text-gray-500">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selectedTags.map(tag => (
              <Badge key={tag.id} variant="default">
                {tag.name}
                <button
                  onClick={(e) => removeTag(tag.id, e)}
                  className="ml-1 hover:text-red-600"
                  type="button"
                  aria-label={`Remove ${tag.name}`}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed z-[9999] bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
        >
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search or create tags..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoFocus
              data-testid="tag-search-input"
            />
          </div>

          <div className="p-1">
            {/* Create new tag option */}
            {canCreateTag && (
              <button
                type="button"
                onClick={createNewTag}
                className="w-full text-left px-3 py-2 rounded hover:bg-green-50 flex items-center gap-2 bg-green-50/50 border border-green-200"
                data-testid="create-tag-button"
              >
                <span className="text-sm font-medium text-green-700">
                  + Create &quot;{searchTermTrimmed}&quot;
                </span>
              </button>
            )}

            {filteredTags.length === 0 && !canCreateTag ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No tags found
              </div>
            ) : (
              filteredTags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    data-testid={`tag-option-${tag.id}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {tag.name}
                      {tag.isTemporary && (
                        <span className="ml-2 text-xs text-gray-500">(new)</span>
                      )}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
