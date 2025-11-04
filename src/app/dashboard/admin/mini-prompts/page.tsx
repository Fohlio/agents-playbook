'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/routes';
import { Button, Card, Badge } from '@/shared/ui/atoms';
import IconButton from '@/shared/ui/atoms/IconButton';
import Toggle from '@/shared/ui/atoms/Toggle';
import Link from 'next/link';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { MiniPromptEditorModal } from '@/features/workflow-constructor/components/MiniPromptEditorModal';

interface SystemMiniPrompt {
  id: string;
  name: string;
  content: string;
  description?: string | null;
  visibility: string;
  isActive: boolean;
  isSystemMiniPrompt: boolean;
}

export default function AdminSystemMiniPromptsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [miniPrompts, setMiniPrompts] = useState<SystemMiniPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMiniPrompt, setEditingMiniPrompt] = useState<SystemMiniPrompt | null>(null);
  const [editingTagIds, setEditingTagIds] = useState<string[]>([]);

  // Check if user is admin
  useEffect(() => {
    if (session && session.user?.role !== 'ADMIN') {
      router.push(ROUTES.DASHBOARD);
    }
  }, [session, router]);

  useEffect(() => {
    fetchSystemMiniPrompts();
  }, []);

  const fetchSystemMiniPrompts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/mini-prompts?systemOnly=true');
      const data = await response.json();
      setMiniPrompts(data);
    } catch (error) {
      console.error('Failed to fetch system mini-prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = async (miniPrompt: SystemMiniPrompt) => {
    try {
      // Fetch full mini prompt with tags
      const response = await fetch(`/api/mini-prompts/${miniPrompt.id}`);
      if (!response.ok) throw new Error('Failed to fetch mini prompt');
      const data = await response.json();
      setEditingTagIds(data.tagIds || []);
      setEditingMiniPrompt(data);
    } catch (error) {
      console.error('Failed to fetch mini prompt:', error);
      alert('Failed to load mini prompt for editing');
    }
  };

  const handleUpdateMiniPrompt = async (
    name: string,
    description: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE',
    tagIds: string[]
  ) => {
    if (!editingMiniPrompt) return;

    try {
      const response = await fetch(`/api/mini-prompts/${editingMiniPrompt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          content,
          visibility,
          tagIds,
        }),
      });

      if (!response.ok) throw new Error('Failed to update mini prompt');

      // Refresh the list
      await fetchSystemMiniPrompts();
      setEditingMiniPrompt(null);
      setEditingTagIds([]);
    } catch (error) {
      console.error('Failed to update mini prompt:', error);
      alert('Failed to update mini prompt');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/mini-prompts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setMiniPrompts(
        miniPrompts.map((m) => (m.id === id ? { ...m, isActive: !isActive } : m))
      );
    } catch {
      alert('Failed to update mini-prompt');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this system mini-prompt?')) return;
    try {
      await fetch(`/api/mini-prompts/${id}`, { method: 'DELETE' });
      setMiniPrompts(miniPrompts.filter((m) => m.id !== id));
    } catch {
      alert('Failed to delete mini-prompt');
    }
  };

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">
              System Mini-Prompts
            </h1>
            <Badge variant="primary" testId="admin-badge">
              Admin
            </Badge>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Manage system mini-prompts available to all users
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={ROUTES.ADMIN.SYSTEM_WORKFLOWS}>
            <Button variant="secondary">System Workflows</Button>
          </Link>
          <Link href={ROUTES.ADMIN.TAGS}>
            <Button variant="secondary">Tags</Button>
          </Link>
          <Link href={ROUTES.LIBRARY.MINI_PROMPTS.NEW}>
            <Button variant="primary">+ Create System Mini-Prompt</Button>
          </Link>
        </div>
      </div>

      {miniPrompts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text-secondary mb-4">No system mini-prompts found</p>
          <Link href={ROUTES.LIBRARY.MINI_PROMPTS.NEW}>
            <Button variant="primary">Create First System Mini-Prompt</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {miniPrompts.map((miniPrompt) => (
            <Card
              key={miniPrompt.id}
              className="hover:shadow-lg transition-shadow border-2 border-accent-primary/20"
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-text-primary flex-1">
                      {miniPrompt.name}
                    </h3>
                    <Badge variant="primary" testId={`system-badge-${miniPrompt.id}`}>
                      System
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary mb-4 line-clamp-3">
                    {miniPrompt.content.slice(0, 150)}
                    {miniPrompt.content.length > 150 ? '...' : ''}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-text-tertiary mb-3">
                    <span>{miniPrompt.visibility}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={miniPrompt.isActive}
                      onChange={() =>
                        handleToggleActive(miniPrompt.id, miniPrompt.isActive)
                      }
                      label={miniPrompt.isActive ? 'Active' : 'Inactive'}
                      testId={`mini-prompt-toggle-${miniPrompt.id}`}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <IconButton
                    variant="primary"
                    size="sm"
                    icon={<EditIcon fontSize="small" />}
                    ariaLabel="Edit mini-prompt"
                    onClick={() => handleEditClick(miniPrompt)}
                  />
                  <IconButton
                    variant="danger"
                    size="sm"
                    icon={<DeleteIcon fontSize="small" />}
                    ariaLabel="Delete mini-prompt"
                    onClick={() => handleDelete(miniPrompt.id)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <MiniPromptEditorModal
        isOpen={!!editingMiniPrompt}
        onClose={() => {
          setEditingMiniPrompt(null);
          setEditingTagIds([]);
        }}
        onSave={handleUpdateMiniPrompt}
        initialData={editingMiniPrompt ? {
          name: editingMiniPrompt.name,
          description: editingMiniPrompt.description || '',
          content: editingMiniPrompt.content,
          visibility: editingMiniPrompt.visibility as 'PUBLIC' | 'PRIVATE',
          tagIds: editingTagIds,
        } : undefined}
      />
    </div>
  );
}
