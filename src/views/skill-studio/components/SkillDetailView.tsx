'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Copy, Calendar, Eye, Lock, AlertCircle } from 'lucide-react';
import { MarkdownContent } from '@/shared/ui/atoms/MarkdownContent';
import { FileExplorer } from './FileExplorer';
import { SkillAttachment } from '../hooks/useSkillStudio';
import { useState } from 'react';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';

interface SkillDetailData {
  id: string;
  name: string;
  description: string | null;
  content: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  author: string;
  tags: Array<{ id: string; name: string; color: string | null }>;
  models: Array<{ id: string; name: string }>;
  attachments: SkillAttachment[];
}

interface SkillDetailViewProps {
  data: SkillDetailData;
}

export function SkillDetailView({ data }: SkillDetailViewProps) {
  const t = useTranslations('skillStudio');
  const router = useRouter();
  const [previewAttachment, setPreviewAttachment] = useState<SkillAttachment | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const handleDuplicate = async () => {
    setDuplicating(true);
    setDuplicateError(null);
    try {
      const response = await fetch(`/api/skills/${data.id}/duplicate`, {
        method: 'POST',
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to duplicate skill');
      }
      const { id } = await response.json();
      router.push(`/dashboard/skills/${id}/edit`);
    } catch (err) {
      setDuplicateError(err instanceof Error ? err.message : 'Failed to duplicate');
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050508]">
      {/* Header */}
      <div className="bg-[#0a0a0f]/95 backdrop-blur-md border-b border-cyan-500/30 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => router.push('/dashboard/library')}
              className="p-2 hover:bg-cyan-500/10 transition-colors text-cyan-400 hover:text-cyan-300 cursor-pointer"
              aria-label={t('backToLibrary')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1
                className="text-2xl font-bold font-mono text-cyan-400 uppercase tracking-wider truncate"
                style={{ textShadow: '0 0 10px #00ffff40' }}
              >
                {data.name}
              </h1>
              {data.description && (
                <p className="text-sm font-mono text-cyan-100/60 mt-1 line-clamp-2">
                  {data.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Visibility badge */}
            <span className={`flex items-center gap-1 px-2 py-1 text-xs font-mono border ${
              data.visibility === 'PUBLIC'
                ? 'text-purple-400 border-purple-500/50 bg-purple-500/10'
                : 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10'
            }`}>
              {data.visibility === 'PUBLIC' ? <Eye className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {data.visibility === 'PUBLIC' ? t('visibilityPublic') : t('visibilityPrivate')}
            </span>

            {/* Duplicate button */}
            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Copy className="w-4 h-4" />
                {t('duplicate')}
              </span>
            </button>

            {/* Edit button (if owner) */}
            {data.isOwner && (
              <button
                onClick={() => router.push(`/dashboard/skills/${data.id}/edit`)}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(255,0,102,0.4)] transition-all cursor-pointer"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
              >
                <span className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  {t('editSkill')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {duplicateError && (
        <div className="px-6 py-3 bg-pink-500/10 border-b border-pink-500/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-pink-400 flex-shrink-0" />
          <p className="text-sm font-mono text-pink-400">&gt; {duplicateError}</p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {/* Stats */}
          <div className="flex items-center gap-6 text-xs font-mono text-cyan-100/50">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {t('created')}: {new Date(data.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {t('updated')}: {new Date(data.updatedAt).toLocaleDateString()}
            </span>
            <span>{t('author')}: {data.author}</span>
          </div>

          {/* Tags */}
          {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Models */}
          {data.models.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.models.map((model) => (
                <span
                  key={model.id}
                  className="px-2 py-0.5 text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30"
                >
                  {model.name}
                </span>
              ))}
            </div>
          )}

          {/* File Explorer */}
          <FileExplorer
            content={data.content}
            attachments={data.attachments}
            onSelectAttachment={(a) => setPreviewAttachment(a)}
          />

          {/* SKILL.md Content Preview */}
          <div className="border border-cyan-500/30 bg-[#0a0a0f]/50">
            <div className="px-4 py-2 border-b border-cyan-500/20 flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">SKILL.md</span>
            </div>
            <div className="px-4 py-4">
              {data.content ? (
                <MarkdownContent content={data.content} variant="dark" />
              ) : (
                <p className="text-sm font-mono text-cyan-100/30 italic">{t('noContent')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attachment Preview Modal */}
      <AttachmentPreviewModal
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        attachment={previewAttachment}
      />
    </div>
  );
}
