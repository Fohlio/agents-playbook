'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/routes';
import { Card } from '@/shared/ui/atoms';
import Link from 'next/link';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { MiniPromptEditorModal } from '@/views/workflow-constructor/components/MiniPromptEditorModal';

interface SystemMiniPrompt {
  id: string;
  name: string;
  content: string;
  description?: string | null;
  visibility: string;
  isActive: boolean;
  isSystemMiniPrompt: boolean;
  key?: string | null;
}

export default function AdminSystemMiniPromptsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('admin');
  const tm = useTranslations('admin.miniPrompts');
  const [miniPrompts, setMiniPrompts] = useState<SystemMiniPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMiniPrompt, setEditingMiniPrompt] = useState<SystemMiniPrompt | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
      const response = await fetch(`/api/mini-prompts/${miniPrompt.id}`);
      if (!response.ok) throw new Error('Failed to fetch mini prompt');
      const data = await response.json();
      setEditingMiniPrompt(data);
    } catch (error) {
      console.error('Failed to fetch mini prompt:', error);
      alert(tm('failedFetch'));
    }
  };

  const handleCreateMiniPrompt = async (
    name: string,
    description: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE',
    tagIds: string[],
    newTagNames: string[],
    modelIds: string[],
    key?: string
  ) => {
    try {
      const response = await fetch('/api/mini-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          content,
          visibility,
          tagIds,
          newTagNames,
          modelIds,
          isSystemMiniPrompt: true,
          key: key || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create system mini prompt');

      await fetchSystemMiniPrompts();
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create system mini prompt:', error);
      alert(tm('failedCreate'));
    }
  };

  const handleUpdateMiniPrompt = async (
    name: string,
    description: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE',
    tagIds: string[],
    newTagNames: string[],
    modelIds: string[],
    key?: string
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
          newTagNames,
          modelIds,
          key: key || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update mini prompt');

      await fetchSystemMiniPrompts();
      setEditingMiniPrompt(null);
    } catch (error) {
      console.error('Failed to update mini prompt:', error);
      alert(tm('failedUpdate'));
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
      alert(tm('failedToggle'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(tm('confirmDelete'))) return;
    try {
      await fetch(`/api/mini-prompts/${id}`, { method: 'DELETE' });
      setMiniPrompts(miniPrompts.filter((m) => m.id !== id));
    } catch {
      alert(tm('failedDelete'));
    }
  };

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <div className="bg-pink-500/10 border border-pink-500/30 p-6 inline-block">
          <p className="text-pink-400 font-mono uppercase">{t('accessDenied')}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-400 rounded-full animate-spin" />
          <span className="text-pink-400 font-mono text-sm uppercase tracking-wider">{tm('loading')}</span>
        </div>
      </div>
    );
  }

  const header = tm('header');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight">
              <span className="cyber-text-glitch" data-text={header} style={{ color: '#ff0066', textShadow: '0 0 10px #ff0066, 0 0 20px #ff006640' }}>
                {header}
              </span>
            </h1>
            <span className="px-2 py-1 text-xs font-mono bg-pink-500/20 text-pink-400 border border-pink-500/50 uppercase">
              {t('badge')}
            </span>
          </div>
          <p className="text-cyan-100/60 font-mono text-sm uppercase tracking-wider mt-1">
            {tm('subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={ROUTES.ADMIN.SYSTEM_WORKFLOWS}>
            <button className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer">
              {tm('navWorkflows')}
            </button>
          </Link>
          <Link href={ROUTES.ADMIN.TAGS}>
            <button className="px-4 py-2 bg-transparent border border-purple-500/30 text-purple-400 font-mono text-sm uppercase tracking-wider hover:bg-purple-500/10 hover:border-purple-400 transition-all cursor-pointer">
              {tm('navTags')}
            </button>
          </Link>
          <button
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(255,0,102,0.4)] transition-all cursor-pointer"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            onClick={() => setIsCreating(true)}
          >
            {tm('create')}
          </button>
        </div>
      </div>

      {miniPrompts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-cyan-100/40 font-mono uppercase mb-4">{tm('empty')}</p>
          <button
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(255,0,102,0.4)] transition-all cursor-pointer"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            onClick={() => setIsCreating(true)}
          >
            {tm('createFirst')}
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {miniPrompts.map((miniPrompt) => (
            <div
              key={miniPrompt.id}
              className="bg-[#0a0a0f]/80 backdrop-blur-sm border border-pink-500/30 p-4 hover:border-pink-400/50 hover:shadow-[0_0_20px_rgba(255,0,102,0.1)] transition-all"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-mono text-pink-400 flex-1 truncate">
                      {miniPrompt.name}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-mono bg-purple-500/20 text-purple-400 border border-purple-500/50 uppercase">
                      {tm('system')}
                    </span>
                  </div>
                  <p className="text-sm text-cyan-100/50 font-mono mb-4 line-clamp-3">
                    {miniPrompt.content.slice(0, 150)}
                    {miniPrompt.content.length > 150 ? '...' : ''}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-mono text-cyan-100/40 mb-3">
                    <span>{miniPrompt.visibility}</span>
                    {miniPrompt.key && (
                      <span className="bg-cyan-500/10 px-1.5 py-0.5 text-cyan-400 border border-cyan-500/30">
                        {tm('key')}: {miniPrompt.key}
                      </span>
                    )}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={miniPrompt.isActive}
                      onChange={() => handleToggleActive(miniPrompt.id, miniPrompt.isActive)}
                      className="w-4 h-4 accent-pink-500 cursor-pointer"
                      data-testid={`mini-prompt-toggle-${miniPrompt.id}`}
                    />
                    <span className={`text-xs font-mono uppercase ${miniPrompt.isActive ? 'text-green-400' : 'text-cyan-100/40'}`}>
                      {miniPrompt.isActive ? tm('active') : tm('inactive')}
                    </span>
                  </label>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    className="p-2 bg-pink-500/20 border border-pink-500/30 text-pink-400 hover:bg-pink-500/30 transition-all cursor-pointer"
                    onClick={() => handleEditClick(miniPrompt)}
                  >
                    <EditIcon fontSize="small" />
                  </button>
                  <button
                    className="p-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-all cursor-pointer"
                    onClick={() => handleDelete(miniPrompt.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MiniPromptEditorModal
        isOpen={isCreating || !!editingMiniPrompt}
        onClose={() => {
          setIsCreating(false);
          setEditingMiniPrompt(null);
        }}
        onSave={isCreating ? handleCreateMiniPrompt : handleUpdateMiniPrompt}
        initialData={editingMiniPrompt ? {
          name: editingMiniPrompt.name,
          description: editingMiniPrompt.description || '',
          content: editingMiniPrompt.content,
          visibility: editingMiniPrompt.visibility as 'PUBLIC' | 'PRIVATE',
          key: editingMiniPrompt.key,
        } : undefined}
        isSystemPrompt={true}
      />
    </div>
  );
}
