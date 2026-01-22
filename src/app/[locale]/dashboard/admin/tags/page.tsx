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
  const t = useTranslations('admin');
  const tt = useTranslations('admin.tags');
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
    if (!confirm(tt('confirmRestore', { name }))) {
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
      alert(tt('failedRestore'));
    }
  };

  const handleMerge = async () => {
    if (!mergingTag || !mergeTargetId) return;

    if (!confirm(tt('confirmMerge', { name: mergingTag.name }))) {
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
        alert(error.error || tt('failedMerge'));
        return;
      }

      setMergingTag(null);
      setMergeTargetId('');
      fetchTags();
    } catch {
      alert(tt('failedMerge'));
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
        alert(error.error || tt('failedUpdate'));
        return;
      }

      setEditingTag(null);
      fetchTags();
    } catch {
      alert(tt('failedUpdate'));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(tt('confirmDelete', { name }))) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete');
      }
      fetchTags();
    } catch {
      alert(tt('failedDelete'));
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
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-cyan-400 font-mono text-sm uppercase tracking-wider">{tt('loading')}</span>
        </div>
      </div>
    );
  }

  const header = tt('header');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight">
              <span className="cyber-text-glitch" data-text={header} style={{ color: '#00ffff', textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff40' }}>
                {header}
              </span>
            </h1>
            <span className="px-2 py-1 text-xs font-mono bg-pink-500/20 text-pink-400 border border-pink-500/50 uppercase">
              {t('badge')}
            </span>
          </div>
          <p className="text-cyan-100/60 font-mono text-sm uppercase tracking-wider mt-1">
            {tt('subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={ROUTES.ADMIN.SYSTEM_WORKFLOWS}>
            <button className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer">
              {tt('navWorkflows')}
            </button>
          </Link>
          <Link href={ROUTES.ADMIN.SYSTEM_MINI_PROMPTS}>
            <button className="px-4 py-2 bg-transparent border border-pink-500/30 text-pink-400 font-mono text-sm uppercase tracking-wider hover:bg-pink-500/10 hover:border-pink-400 transition-all cursor-pointer">
              {tt('navMiniPrompts')}
            </button>
          </Link>
        </div>
      </div>

      <Card className="p-4">
        <p className="text-cyan-100/50 font-mono text-xs">
          <span className="text-cyan-400">&gt; {tt('note')}</span> {tt('noteText')}
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="bg-[#0a0a0f]/80 backdrop-blur-sm border border-cyan-500/30 p-4 hover:border-cyan-400/50 transition-all"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            {editingTag?.id === tag.id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
                    {tt('name')}
                  </label>
                  <input
                    type="text"
                    value={editingTag.name}
                    onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
                    {tt('color')}
                  </label>
                  <input
                    type="color"
                    value={editingTag.color || '#00FFFF'}
                    onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                    className="w-full h-10 bg-transparent border border-cyan-500/50 cursor-pointer"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleUpdate} className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold text-xs uppercase cursor-pointer">
                    {tt('save')}
                  </button>
                  <button onClick={() => setEditingTag(null)} className="px-3 py-1.5 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase cursor-pointer">
                    {tt('cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-4 h-4"
                      style={{
                        backgroundColor: tag.color || '#00ffff',
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        boxShadow: `0 0 10px ${tag.color || '#00ffff'}`
                      }}
                    />
                    <span className="font-mono text-cyan-100">{tag.name}</span>
                    {!tag.isActive && (
                      <span className="px-2 py-0.5 text-xs font-mono bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 uppercase">
                        {tt('deleted')}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {tag.isActive ? (
                      <>
                        <button className="p-1.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-all cursor-pointer" onClick={() => setEditingTag(tag)}>
                          <EditIcon sx={{ fontSize: 14 }} />
                        </button>
                        <button className="p-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-all cursor-pointer" onClick={() => setMergingTag(tag)}>
                          <MergeIcon sx={{ fontSize: 14 }} />
                        </button>
                        <button className="p-1.5 bg-pink-500/20 border border-pink-500/30 text-pink-400 hover:bg-pink-500/30 transition-all cursor-pointer" onClick={() => handleDelete(tag.id, tag.name)}>
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </button>
                      </>
                    ) : (
                      <button className="p-1.5 bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all cursor-pointer" onClick={() => handleRestore(tag.id, tag.name)}>
                        <RestoreIcon sx={{ fontSize: 14 }} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-xs font-mono text-cyan-100/40 space-y-1">
                  <div>{tag._count.workflowTags} {tt('workflows')}</div>
                  <div>{tag._count.miniPromptTags} {tt('miniPrompts')}</div>
                  <div className="mt-2 pt-2 border-t border-cyan-500/20">
                    {tt('createdBy')} <span className="text-purple-400">@{tag.creator.username}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {tags.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-cyan-100/40 font-mono uppercase mb-4">{tt('empty')}</p>
          <p className="text-xs text-cyan-100/30 font-mono">{tt('emptyNote')}</p>
        </Card>
      )}

      {/* Merge Modal */}
      {mergingTag && (
        <div className="fixed inset-0 bg-[#050508]/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="w-full max-w-md bg-[#0a0a0f] border border-cyan-500/30 p-6"
            style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
          >
            <h3 className="font-mono text-lg text-cyan-400 uppercase mb-4">{tt('merge.title')} {mergingTag.name}</h3>
            <p className="text-sm text-cyan-100/50 font-mono mb-4">
              {tt('merge.description', { name: mergingTag.name })}
            </p>

            <div className="mb-4">
              <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                {tt('merge.targetLabel')}
              </label>
              <select
                value={mergeTargetId}
                onChange={(e) => setMergeTargetId(e.target.value)}
                className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm focus:outline-none focus:border-cyan-400"
              >
                <option value="">{tt('merge.selectTarget')}</option>
                {tags
                  .filter(tagItem => tagItem.id !== mergingTag.id && tagItem.isActive)
                  .map(tagItem => (
                    <option key={tagItem.id} value={tagItem.id}>
                      {tagItem.name} ({tagItem._count.workflowTags} {tt('workflows')}, {tagItem._count.miniPromptTags} {tt('miniPrompts')})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleMerge}
                disabled={!mergeTargetId}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {tt('merge.button')}
              </button>
              <button
                onClick={() => {
                  setMergingTag(null);
                  setMergeTargetId('');
                }}
                className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase cursor-pointer"
              >
                {tt('merge.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
