'use client';

import { useState, useEffect } from 'react';
import Button from '@/shared/ui/atoms/Button';
import Input from '@/shared/ui/atoms/Input';
import { Modal } from '@/shared/ui/atoms/Modal';
import { TagMultiSelect } from '@/shared/ui/molecules';

interface MiniPromptEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (name: string, description: string, content: string, visibility: 'PUBLIC' | 'PRIVATE', tagIds: string[]) => Promise<void>;
  initialData?: {
    name: string;
    description?: string;
    content: string;
    visibility: 'PUBLIC' | 'PRIVATE';
    tagIds?: string[];
  };
  viewOnly?: boolean;
}

export function MiniPromptEditorModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  viewOnly = false,
}: MiniPromptEditorModalProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>(
    initialData?.visibility ?? 'PRIVATE'
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialData?.tagIds ?? []);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update state when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description ?? '');
      setContent(initialData.content);
      setVisibility(initialData.visibility);
      setSelectedTagIds(initialData.tagIds ?? []);
    } else {
      setName('');
      setDescription('');
      setContent('');
      setVisibility('PRIVATE');
      setSelectedTagIds([]);
    }
    setShowPreview(false);
  }, [initialData, isOpen]);

  const handleSave = async () => {
    if (!name.trim() || !content.trim() || !onSave) return;

    setIsSaving(true);
    try {
      await onSave(name.trim(), description.trim(), content.trim(), visibility, selectedTagIds);
      setName('');
      setDescription('');
      setContent('');
      setVisibility('PRIVATE');
      setSelectedTagIds([]);
      setShowPreview(false);
      onClose();
    } catch (error) {
      console.error('Failed to save mini-prompt:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setName(initialData?.name ?? '');
      setDescription(initialData?.description ?? '');
      setContent(initialData?.content ?? '');
      setVisibility(initialData?.visibility ?? 'PRIVATE');
      setSelectedTagIds(initialData?.tagIds ?? []);
      setShowPreview(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl max-h-[85vh] overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {viewOnly ? name || 'Mini-Prompt' : initialData ? 'Edit Mini-Prompt' : 'Create New Mini-Prompt'}
        </h2>

        <div className="space-y-4 mb-6">
          {!viewOnly && (
            <>
              <div>
                <label htmlFor="mini-prompt-name" className="block text-sm font-medium text-text-primary mb-1">
                  Name *
                </label>
                <Input
                  id="mini-prompt-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Create Implementation Plan"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="mini-prompt-description" className="block text-sm font-medium text-text-primary mb-1">
                  Description
                </label>
                <textarea
                  id="mini-prompt-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for search and discovery (optional, max 1000 chars)"
                  maxLength={1000}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/1000 characters
                </p>
              </div>
            </>
          )}

          <div>
            {!viewOnly && (
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="mini-prompt-content" className="block text-sm font-medium text-text-primary">
                  Content (Markdown) *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-accent-primary hover:text-accent-hover"
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
              </div>
            )}

            {viewOnly || showPreview ? (
              <div className="w-full min-h-[300px] max-h-[500px] overflow-y-auto px-4 py-3 border border-border-base rounded-lg bg-surface-base">
                <div className="prose prose-sm max-w-none text-text-primary">
                  {content.split('\n').map((line, i) => {
                    // Headers
                    if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-xl font-bold mt-6 mb-3">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('# ')) {
                      return <h1 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h1>;
                    }
                    // Lists
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return <li key={i} className="ml-4">{line.replace(/^[*-] /, '')}</li>;
                    }
                    // Code blocks
                    if (line.startsWith('```')) {
                      return <pre key={i} className="bg-surface-secondary p-2 rounded my-2 overflow-x-auto"><code>{line.replace(/```/g, '')}</code></pre>;
                    }
                    // Empty lines
                    if (line.trim() === '') {
                      return <br key={i} />;
                    }
                    // Regular text with inline formatting
                    const formatted = line
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/`(.*?)`/g, '<code class="bg-surface-secondary px-1 rounded text-sm">$1</code>');
                    return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} className="mb-2" />;
                  })}
                </div>
              </div>
            ) : (
              <textarea
                id="mini-prompt-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter markdown content for this mini-prompt...&#10;&#10;Supported formatting:&#10;# Heading 1&#10;## Heading 2&#10;### Heading 3&#10;**bold text**&#10;*italic text*&#10;`code`&#10;- bullet point"
                rows={10}
                className="w-full px-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-text-primary bg-surface-base font-mono text-sm resize-y min-h-[200px] max-h-[400px]"
              />
            )}
          </div>

          {!viewOnly && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Visibility
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="PRIVATE"
                      checked={visibility === 'PRIVATE'}
                      onChange={(e) => setVisibility(e.target.value as 'PRIVATE')}
                      className="w-4 h-4 text-accent-primary focus:ring-accent-primary"
                    />
                    <span className="text-sm text-text-primary">Private (Only Me)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="PUBLIC"
                      checked={visibility === 'PUBLIC'}
                      onChange={(e) => setVisibility(e.target.value as 'PUBLIC')}
                      className="w-4 h-4 text-accent-primary focus:ring-accent-primary"
                    />
                    <span className="text-sm text-text-primary">Public (Everyone)</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tags
                </label>
                <TagMultiSelect
                  selectedTagIds={selectedTagIds}
                  onChange={setSelectedTagIds}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          {viewOnly ? (
            <Button variant="primary" onClick={handleClose}>
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!name.trim() || !content.trim() || isSaving}
              >
                {isSaving ? 'Saving...' : initialData ? 'Update' : 'Create'}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
