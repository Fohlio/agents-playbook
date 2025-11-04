'use client';

import { useState } from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import Button from '@/shared/ui/atoms/Button';

interface SystemPromptEditorProps {
  prompt: {
    id: string;
    name: string;
    description: string | null;
    content: string;
  };
  onSave: (id: string, content: string, description?: string) => Promise<void>;
  onCancel: () => void;
}

export function SystemPromptEditor({ prompt, onSave, onCancel }: SystemPromptEditorProps) {
  const [content, setContent] = useState(prompt.content);
  const [description, setDescription] = useState(prompt.description || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(prompt.id, content, description);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = content !== prompt.content || description !== (prompt.description || '');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          Edit: {prompt.name}
        </h2>

        <div className="space-y-4">
          {/* Warning */}
          <Card className="bg-yellow-50 border-yellow-200 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Changes to this prompt will affect all workflows that use it.
              Make sure to test thoroughly after updating.
            </p>
          </Card>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of this prompt"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-text-primary mb-2">
              Prompt Content (Markdown)
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 px-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Enter prompt content in markdown format"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
