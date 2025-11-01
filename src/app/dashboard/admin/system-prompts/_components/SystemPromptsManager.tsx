'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import Button from '@/shared/ui/atoms/Button';
import { SystemPromptEditor } from './SystemPromptEditor';

interface SystemPrompt {
  id: string;
  name: string;
  description: string | null;
  content: string;
  updatedAt: Date;
}

export function SystemPromptsManager() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/system-prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data);
      }
    } catch (error) {
      console.error('Failed to fetch system prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: string, content: string, description?: string) => {
    try {
      const response = await fetch(`/api/admin/system-prompts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, description })
      });

      if (response.ok) {
        await fetchPrompts();
        setEditingPrompt(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update prompt');
      }
    } catch (error) {
      console.error('Failed to save prompt:', error);
      alert('Failed to save prompt');
    }
  };

  if (loading) {
    return <div className="text-text-secondary">Loading system prompts...</div>;
  }

  // Separate automatic prompts from others
  const automaticPrompts = prompts.filter(p =>
    p.name === 'Handoff Memory Board' || p.name === 'Internal Agents Chat'
  );
  const otherPrompts = prompts.filter(p =>
    p.name !== 'Handoff Memory Board' && p.name !== 'Internal Agents Chat'
  );

  return (
    <div className="space-y-8">
      {/* Automatic Prompts Section */}
      <section>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">
          Automatic Prompts
        </h2>
        <p className="text-text-secondary mb-4">
          These prompts are automatically attached to workflows based on settings.
        </p>
        <div className="grid gap-4">
          {automaticPrompts.map(prompt => (
            <Card key={prompt.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {prompt.name === 'Handoff Memory Board' ? '📋' : '🤖'}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {prompt.name}
                    </h3>
                    {prompt.description && (
                      <p className="text-sm text-text-secondary mt-1">
                        {prompt.description}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                    Auto
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingPrompt(prompt)}
                >
                  Edit Content
                </Button>
              </div>
              <div className="text-sm text-text-tertiary">
                Last updated: {new Date(prompt.updatedAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Other System Prompts */}
      {otherPrompts.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Other System Prompts
          </h2>
          <div className="grid gap-4">
            {otherPrompts.map(prompt => (
              <Card key={prompt.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {prompt.name}
                    </h3>
                    {prompt.description && (
                      <p className="text-sm text-text-secondary mt-1">
                        {prompt.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingPrompt(prompt)}
                  >
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Editor Modal */}
      {editingPrompt && (
        <SystemPromptEditor
          prompt={editingPrompt}
          onSave={handleSave}
          onCancel={() => setEditingPrompt(null)}
        />
      )}
    </div>
  );
}
