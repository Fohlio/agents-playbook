'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Textarea, FormField, Radio } from '@/shared/ui/atoms';
import { Modal } from '@/shared/ui/atoms/Modal';
import { TagMultiSelect } from '@/shared/ui/molecules';
import { MarkdownContent } from '@/shared/ui/atoms/MarkdownContent';

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
              <FormField label="Name" htmlFor="mini-prompt-name" required>
                <Input
                  id="mini-prompt-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Create Implementation Plan"
                  required
                  autoFocus
                  fullWidth
                />
              </FormField>
              <FormField 
                label="Description" 
                htmlFor="mini-prompt-description"
                helperText={`${description.length}/1000 characters`}
              >
                <Textarea
                  id="mini-prompt-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for search and discovery (optional, max 1000 chars)"
                  maxLength={1000}
                  rows={3}
                  fullWidth
                />
              </FormField>
            </>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="mini-prompt-content" className="block text-sm font-medium text-gray-700">
                Content (Markdown) {!viewOnly && <span className="text-red-500 ml-1">*</span>}
              </label>
              {!viewOnly && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm"
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </Button>
              )}
            </div>
            {viewOnly || showPreview ? (
              <div className="w-full min-h-[300px] max-h-[500px] overflow-y-auto px-4 py-3 border border-border-base rounded-lg bg-surface-base">
                <MarkdownContent content={content} />
              </div>
            ) : (
              <Textarea
                id="mini-prompt-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter markdown content for this mini-prompt...&#10;&#10;Supported formatting:&#10;# Heading 1&#10;## Heading 2&#10;### Heading 3&#10;**bold text**&#10;*italic text*&#10;`code`&#10;- bullet point"
                rows={10}
                fullWidth
                className="font-mono min-h-[200px] max-h-[400px]"
              />
            )}
          </div>

          {!viewOnly && (
            <>
              <FormField label="Visibility" htmlFor="visibility-private">
                <div className="flex gap-4">
                  <Radio
                    name="visibility"
                    id="visibility-private"
                    value="PRIVATE"
                    checked={visibility === 'PRIVATE'}
                    onChange={(e) => setVisibility(e.target.value as 'PRIVATE')}
                    label="Private (Only Me)"
                  />
                  <Radio
                    name="visibility"
                    id="visibility-public"
                    value="PUBLIC"
                    checked={visibility === 'PUBLIC'}
                    onChange={(e) => setVisibility(e.target.value as 'PUBLIC')}
                    label="Public (Everyone)"
                  />
                </div>
              </FormField>
              <FormField label="Tags" htmlFor="mini-prompt-tags">
                <TagMultiSelect
                  selectedTagIds={selectedTagIds}
                  onChange={setSelectedTagIds}
                />
              </FormField>
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
