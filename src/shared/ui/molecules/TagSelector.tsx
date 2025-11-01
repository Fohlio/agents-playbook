'use client';

import { useState, useEffect } from 'react';

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  label?: string;
  onCreateTag?: (name: string, color?: string) => Promise<Tag | null>;
  allowCreate?: boolean;
}

export function TagSelector({
  selectedTagIds,
  onChange,
  label,
  onCreateTag,
  allowCreate = false
}: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    fetch('/api/tags')
      .then(res => res.json())
      .then(setTags)
      .finally(() => setLoading(false));
  }, []);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !onCreateTag) return;

    const newTag = await onCreateTag(newTagName.trim());
    if (newTag) {
      setTags([...tags, newTag]);
      onChange([...selectedTagIds, newTag.id]);
      setNewTagName('');
      setIsCreating(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading tags...</div>;
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-1'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={isSelected && tag.color ? { backgroundColor: tag.color } : undefined}
              data-testid={`tag-${tag.name}`}
            >
              {tag.name}
            </button>
          );
        })}

        {allowCreate && onCreateTag && (
          <>
            {isCreating ? (
              <div className="flex gap-1 items-center">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                  placeholder="Tag name..."
                  className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  data-testid="tag-create-input"
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className="px-2 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  data-testid="tag-create-confirm"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewTagName('');
                  }}
                  className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  data-testid="tag-create-cancel"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="px-3 py-1.5 rounded-full text-sm border-2 border-dashed border-gray-300 hover:border-blue-500 text-gray-600 hover:text-blue-600 transition-colors"
                data-testid="tag-create-button"
              >
                + Create Tag
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
