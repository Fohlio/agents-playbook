'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/shared/ui/atoms/Modal';
import { CopyButton } from '@/shared/ui/molecules';
import { ModelMultiSelect } from '@/shared/ui/molecules/ModelMultiSelect';
import { MarkdownContent } from '@/shared/ui/atoms/MarkdownContent';
import { useModels } from '@/entities/models';
import { isValidKey } from '@/shared/lib/validators/key';

interface MiniPromptEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (name: string, description: string, content: string, visibility: 'PUBLIC' | 'PRIVATE', tagIds: string[], newTagNames: string[], modelIds: string[], key?: string) => Promise<void>;
  initialData?: {
    name: string;
    description?: string;
    content: string;
    visibility: 'PUBLIC' | 'PRIVATE';
    modelIds?: string[];
    key?: string | null;
  };
  viewOnly?: boolean;
  isSystemPrompt?: boolean;
}

export function MiniPromptEditorModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  viewOnly = false,
  isSystemPrompt = false,
}: MiniPromptEditorModalProps) {
  const t = useTranslations('miniPromptEditorModal');
  const tCommon = useTranslations('common');

  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>(
    initialData?.visibility ?? 'PRIVATE'
  );
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(initialData?.modelIds ?? []);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [key, setKey] = useState(initialData?.key ?? '');
  const [keyError, setKeyError] = useState<string | null>(null);

  const { models, loading: modelsLoading } = useModels();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description ?? '');
      setContent(initialData.content);
      setVisibility(initialData.visibility);
      setSelectedModelIds(initialData.modelIds ?? []);
      setKey(initialData.key ?? '');
    } else {
      setName('');
      setDescription('');
      setContent('');
      setVisibility('PRIVATE');
      setSelectedModelIds([]);
      setKey('');
    }
    setShowPreview(false);
    setKeyError(null);
  }, [initialData, isOpen]);

  const handleSave = async () => {
    if (!name.trim() || !content.trim() || !onSave) return;

    const trimmedKey = key.trim();
    if (isSystemPrompt && trimmedKey && !isValidKey(trimmedKey)) {
      setKeyError(t('keyError'));
      return;
    }

    setIsSaving(true);
    setKeyError(null);
    try {
      await onSave(name.trim(), description.trim(), content.trim(), visibility, [], [], selectedModelIds, isSystemPrompt ? trimmedKey || undefined : undefined);
      setName('');
      setDescription('');
      setContent('');
      setVisibility('PRIVATE');
      setSelectedModelIds([]);
      setShowPreview(false);
      setKey('');
      setKeyError(null);
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
      setSelectedModelIds(initialData?.modelIds ?? []);
      setKey(initialData?.key ?? '');
      setKeyError(null);
      setShowPreview(false);
      onClose();
    }
  };

  const getTitle = () => {
    if (viewOnly) return name || t('viewTitle');
    return initialData ? t('editTitle') : t('createTitle');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl max-h-[85vh] overflow-y-auto">
      <div className="p-2">
        <div className="mb-6">
          <h2 className="text-xl font-mono font-bold text-pink-400 uppercase tracking-wider mb-2" style={{ textShadow: '0 0 10px #ff006640' }}>
            {getTitle()}
          </h2>
          {key && (
            <div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs inline-block">
              {t('key')}: {key}
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          {!viewOnly && (
            <>
              <div>
                <label htmlFor="mini-prompt-name" className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                  {t('name')} <span className="text-pink-400">*</span>
                </label>
                <input
                  id="mini-prompt-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  required
                  autoFocus
                  className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all"
                />
              </div>
              <div>
                <label htmlFor="mini-prompt-description" className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                  {t('description')}
                </label>
                <textarea
                  id="mini-prompt-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('descriptionPlaceholder')}
                  maxLength={1000}
                  rows={2}
                  className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all resize-none"
                />
                <p className={`text-xs font-mono mt-1 ${description.length > 900 ? 'text-pink-400' : 'text-cyan-500/40'}`}>
                  {description.length}/1000
                </p>
              </div>
              {isSystemPrompt && (
                <div>
                  <label htmlFor="mini-prompt-key" className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                    {t('key')}
                  </label>
                  <input
                    id="mini-prompt-key"
                    type="text"
                    value={key}
                    onChange={(e) => {
                      setKey(e.target.value.toLowerCase());
                      setKeyError(null);
                    }}
                    placeholder={t('keyPlaceholder')}
                    maxLength={100}
                    className={`w-full px-3 py-2 bg-[#050508]/50 border font-mono text-sm text-cyan-100 placeholder:text-cyan-500/30 focus:outline-none transition-all ${
                      keyError
                        ? 'border-pink-500/50 focus:border-pink-400 focus:shadow-[0_0_15px_rgba(255,0,102,0.2)]'
                        : 'border-cyan-500/50 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                    }`}
                  />
                  <p className="text-xs font-mono text-cyan-100/40 mt-1">
                    {t('keyHelp')}
                  </p>
                  {keyError && (
                    <p className="text-xs font-mono text-pink-400 mt-1">&gt; {t('error')}: {keyError}</p>
                  )}
                </div>
              )}
            </>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="mini-prompt-content" className="block text-xs font-mono text-cyan-400 uppercase tracking-wider">
                {t('contentMarkdown')} {!viewOnly && <span className="text-pink-400">*</span>}
              </label>
              <div className="flex items-center gap-2">
                {viewOnly && (
                  <CopyButton
                    textToCopy={content || ""}
                    label={tCommon('copy')}
                    variant="secondary"
                    size="sm"
                    testId="copy-mini-prompt-content"
                  />
                )}
                {!viewOnly && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-3 py-1.5 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer"
                  >
                    {showPreview ? t('edit') : t('preview')}
                  </button>
                )}
              </div>
            </div>
            {viewOnly ? (
              <div className="w-full min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 bg-[#050508]/50 border border-cyan-500/30">
                <MarkdownContent content={content} variant="dark" />
              </div>
            ) : showPreview ? (
              <div className="w-full min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 bg-[#050508]/50 border border-cyan-500/30">
                <MarkdownContent content={content} variant="dark" />
              </div>
            ) : (
              <textarea
                id="mini-prompt-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('contentPlaceholder')}
                rows={8}
                className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all resize-none min-h-[200px] max-h-[400px]"
              />
            )}
          </div>

          {!viewOnly && (
            <>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="PRIVATE"
                    checked={visibility === 'PRIVATE'}
                    onChange={(e) => setVisibility(e.target.value as 'PRIVATE')}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                  <span className={`text-sm font-mono ${visibility === 'PRIVATE' ? 'text-cyan-400' : 'text-cyan-100/50'}`}>
                    {t('private')}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="PUBLIC"
                    checked={visibility === 'PUBLIC'}
                    onChange={(e) => setVisibility(e.target.value as 'PUBLIC')}
                    className="w-4 h-4 accent-purple-500 cursor-pointer"
                  />
                  <span className={`text-sm font-mono ${visibility === 'PUBLIC' ? 'text-purple-400' : 'text-cyan-100/50'}`}>
                    {t('public')}
                  </span>
                </label>
              </div>
              <div>
                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                  {t('aiModels')}
                </label>
                <ModelMultiSelect
                  models={models}
                  selectedModelIds={selectedModelIds}
                  onChange={setSelectedModelIds}
                  loading={modelsLoading}
                  placeholder={t('aiModelsPlaceholder')}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          {viewOnly ? (
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all cursor-pointer"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              {t('close')}
            </button>
          ) : (
            <>
              <button
                onClick={handleClose}
                disabled={isSaving}
                className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 disabled:opacity-50 transition-all cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || !content.trim() || isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(255,0,102,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
              >
                {isSaving ? t('saving') : initialData ? t('update') : t('create')}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
