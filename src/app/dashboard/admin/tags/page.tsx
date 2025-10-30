'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/routes';
import { Button, Card, Badge } from '@/shared/ui/atoms';
import IconButton from '@/shared/ui/atoms/IconButton';
import Link from 'next/link';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Tag {
  id: string;
  name: string;
  color: string | null;
  _count: {
    workflowTags: number;
    miniPromptTags: number;
  };
}

export default function AdminTagsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6' });

  useEffect(() => {
    if (session && session.user?.role !== 'ADMIN') {
      router.push(ROUTES.DASHBOARD);
    }
  }, [session, router]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/tags');
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTag.name.trim()) {
      alert('Tag name is required');
      return;
    }

    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTag),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to create tag');
        return;
      }

      setNewTag({ name: '', color: '#3B82F6' });
      fetchTags();
    } catch {
      alert('Failed to create tag');
    }
  };

  const handleUpdate = async () => {
    if (!editingTag) return;

    try {
      const response = await fetch(`/api/admin/tags/${editingTag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingTag.name,
          color: editingTag.color,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to update tag');
        return;
      }

      setEditingTag(null);
      fetchTags();
    } catch {
      alert('Failed to update tag');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete tag "${name}"? It will be removed from all workflows and mini-prompts.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete');
      }
      fetchTags();
    } catch {
      alert('Failed to delete tag');
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
            <h1 className="text-2xl font-bold text-text-primary">Manage Tags</h1>
            <Badge variant="primary" testId="admin-badge">
              Admin
            </Badge>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Create and manage tags for workflows and mini-prompts
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={ROUTES.ADMIN.SYSTEM_WORKFLOWS}>
            <Button variant="secondary">System Workflows</Button>
          </Link>
          <Link href={ROUTES.ADMIN.SYSTEM_MINI_PROMPTS}>
            <Button variant="secondary">System Mini-Prompts</Button>
          </Link>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Create New Tag</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Name
            </label>
            <input
              type="text"
              placeholder="e.g., development, testing..."
              value={newTag.name}
              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <input
              type="color"
              value={newTag.color}
              onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
              className="w-20 h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
          <Button onClick={handleCreate} disabled={!newTag.name.trim()}>
            Create Tag
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map((tag) => (
          <Card key={tag.id} className="p-4 hover:shadow-md transition-shadow">
            {editingTag?.id === tag.id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingTag.name}
                    onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={editingTag.color || '#3B82F6'}
                    onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleUpdate}>Save</Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditingTag(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: tag.color || '#gray' }}
                    />
                    <span className="font-semibold text-text-primary">{tag.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <IconButton
                      variant="primary"
                      size="sm"
                      icon={<EditIcon fontSize="small" />}
                      ariaLabel="Edit tag"
                      onClick={() => setEditingTag(tag)}
                    />
                    <IconButton
                      variant="danger"
                      size="sm"
                      icon={<DeleteIcon fontSize="small" />}
                      ariaLabel="Delete tag"
                      onClick={() => handleDelete(tag.id, tag.name)}
                    />
                  </div>
                </div>
                <div className="text-xs text-text-tertiary space-y-1">
                  <div>{tag._count.workflowTags} workflows</div>
                  <div>{tag._count.miniPromptTags} mini-prompts</div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {tags.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-text-secondary mb-4">No tags created yet</p>
          <p className="text-sm text-text-tertiary">Create your first tag above</p>
        </Card>
      )}
    </div>
  );
}
