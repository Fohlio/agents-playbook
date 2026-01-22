'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  isTemporary?: boolean;
}

export interface TagMultiSelectProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  onTagsChanged?: (tags: Tag[]) => void;
  label?: string;
  placeholder?: string;
}

export function TagMultiSelect({
  selectedTagIds,
  onChange,
  onTagsChanged,
  label,
  placeholder
}: TagMultiSelectProps) {
  const t = useTranslations('tagMultiSelect');
  const effectivePlaceholder = placeholder ?? t('placeholder');
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

  useEffect(() => {
    if (onTagsChanged) {
      onTagsChanged(tags);
    }
  }, [tags, onTagsChanged]);

  const selectedTags = tags.filter(t => selectedTagIds.includes(t.id));
  const filteredTags = tags.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <div className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/30 text-cyan-100/50 font-mono text-sm">
          {t('loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-left focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] min-h-[42px] transition-all cursor-pointer"
        data-testid="tag-multiselect-button"
      >
        {selectedTags.length === 0 ? (
          <span className="text-cyan-500/30 font-mono text-sm">{effectivePlaceholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selectedTags.map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-0.5 text-xs font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
              >
                {tag.name}
                <button
                  onClick={(e) => removeTag(tag.id, e)}
                  className="ml-1 hover:text-pink-400 cursor-pointer"
                  type="button"
                  aria-label={`Remove ${tag.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed z-[9999] bg-[#0a0a0f] border border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.1)] max-h-60 overflow-auto"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
        >
          <div className="p-2 border-b border-cyan-500/30">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('searchOrCreate')}
              className="w-full px-2 py-1 bg-[#050508]/50 border border-cyan-500/30 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400"
              autoFocus
              data-testid="tag-search-input"
            />
          </div>

          <div className="p-1">
            {canCreateTag && (
              <button
                type="button"
                onClick={createNewTag}
                className="w-full text-left px-3 py-2 hover:bg-green-500/10 flex items-center gap-2 bg-green-500/5 border border-green-500/30 cursor-pointer"
                data-testid="create-tag-button"
              >
                <span className="text-sm font-mono text-green-400">
                  + {t('create', { name: searchTermTrimmed })}
                </span>
              </button>
            )}

            {filteredTags.length === 0 && !canCreateTag ? (
              <div className="px-3 py-2 text-sm font-mono text-cyan-100/40">
                {t('noTagsFound')}
              </div>
            ) : (
              filteredTags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`w-full text-left px-3 py-2 hover:bg-cyan-500/10 flex items-center gap-2 cursor-pointer ${
                      isSelected ? 'bg-cyan-500/20' : ''
                    }`}
                    data-testid={`tag-option-${tag.id}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="accent-cyan-500 cursor-pointer"
                    />
                    <span className="text-sm font-mono text-cyan-100">
                      {tag.name}
                      {tag.isTemporary && (
                        <span className="ml-2 text-xs text-cyan-500/50">({t('new')})</span>
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
