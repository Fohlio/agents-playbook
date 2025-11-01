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
import MergeIcon from '@mui/icons-material/MergeType';
import RestoreIcon from '@mui/icons-material/Restore';

interface Tag {
  id: string;
  name: string;
  color: string | null;
  isActive: boolean;
  creator: {
    username: string;
    email: string;
  };
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
  const [mergingTag, setMergingTag] = useState<Tag | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState('');

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

  const handleRestore = async (id: string, name: string) => {
    if (!confirm(`Restore tag "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tags/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to restore');
      }
      fetchTags();
    } catch {
      alert('Failed to restore tag');
    }
  };

  const handleMerge = async () => {
    if (!mergingTag || !mergeTargetId) return;

    if (!confirm(`Merge "${mergingTag.name}" into selected tag? This will reassign all workflows/mini-prompts and delete "${mergingTag.name}".`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tags/${mergingTag.id}/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTagId: mergeTargetId }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to merge tags');
        return;
      }

      setMergingTag(null);
      setMergeTargetId('');
      fetchTags();
    } catch {
      alert('Failed to merge tags');
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
    if (!confirm(`Soft delete tag "${name}"? It will be hidden from users but remain on assigned workflows/mini-prompts.`)) {
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
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            <strong>Note:</strong> Users can now create tags directly from workflow/mini-prompt editors.
          </p>
          <p>
            As admin, you can manage all tags (active and deleted), merge similar tags, and restore soft-deleted tags.
          </p>
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
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: tag.color || '#gray' }}
                    />
                    <span className="font-semibold text-text-primary">{tag.name}</span>
                    {!tag.isActive && (
                      <Badge variant="warning" testId={`tag-deleted-badge-${tag.id}`}>
                        Deleted
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {tag.isActive ? (
                      <>
                        <IconButton
                          variant="primary"
                          size="sm"
                          icon={<EditIcon fontSize="small" />}
                          ariaLabel="Edit tag"
                          onClick={() => setEditingTag(tag)}
                        />
                        <IconButton
                          variant="secondary"
                          size="sm"
                          icon={<MergeIcon fontSize="small" />}
                          ariaLabel="Merge tag"
                          onClick={() => setMergingTag(tag)}
                        />
                        <IconButton
                          variant="danger"
                          size="sm"
                          icon={<DeleteIcon fontSize="small" />}
                          ariaLabel="Delete tag"
                          onClick={() => handleDelete(tag.id, tag.name)}
                        />
                      </>
                    ) : (
                      <IconButton
                        variant="primary"
                        size="sm"
                        icon={<RestoreIcon fontSize="small" />}
                        ariaLabel="Restore tag"
                        onClick={() => handleRestore(tag.id, tag.name)}
                      />
                    )}
                  </div>
                </div>
                <div className="text-xs text-text-tertiary space-y-1">
                  <div>{tag._count.workflowTags} workflows</div>
                  <div>{tag._count.miniPromptTags} mini-prompts</div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    Created by: {tag.creator.username}
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {tags.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-text-secondary mb-4">No tags found</p>
          <p className="text-sm text-text-tertiary">Users can create tags from workflow/mini-prompt editors</p>
        </Card>
      )}

      {/* Merge Modal */}
      {mergingTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">Merge Tag: {mergingTag.name}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select target tag to merge into. All workflows and mini-prompts will be reassigned, and &quot;{mergingTag.name}&quot; will be permanently deleted.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Tag
              </label>
              <select
                value={mergeTargetId}
                onChange={(e) => setMergeTargetId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select Target Tag --</option>
                {tags
                  .filter(t => t.id !== mergingTag.id && t.isActive)
                  .map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t._count.workflowTags} workflows, {t._count.miniPromptTags} mini-prompts)
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleMerge} disabled={!mergeTargetId} variant="danger">
                Merge & Delete
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setMergingTag(null);
                  setMergeTargetId('');
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
