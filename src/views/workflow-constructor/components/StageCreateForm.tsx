'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import InfoIcon from '@mui/icons-material/Info';

interface StageCreateFormProps {
  onSubmit: (name: string, description: string, color: string, withReview: boolean, includeMultiAgentChat: boolean) => void;
  onCancel: () => void;
  initialValues?: {
    name: string;
    description?: string | null;
    color: string;
    withReview: boolean;
    includeMultiAgentChat?: boolean;
  };
  mode?: 'create' | 'edit';
}

const STAGE_COLORS = [
  { value: '#00FFFF', label: 'Cyan' },
  { value: '#FF0066', label: 'Pink' },
  { value: '#00FF00', label: 'Green' },
  { value: '#A855F7', label: 'Purple' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#EF4444', label: 'Red' },
  { value: '#FFFF00', label: 'Yellow' },
];

export function StageCreateForm({ onSubmit, onCancel, initialValues, mode = 'create' }: StageCreateFormProps) {
  const t = useTranslations('stageForm');
  const tCommon = useTranslations('common');
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [color, setColor] = useState(initialValues?.color || '#00FFFF');
  const [withReview, setWithReview] = useState(initialValues?.withReview ?? true);
  const [includeMultiAgentChat, setIncludeMultiAgentChat] = useState(initialValues?.includeMultiAgentChat ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), description.trim(), color, withReview, includeMultiAgentChat);
      setName('');
      setDescription('');
      setColor('#00FFFF');
      setWithReview(true);
      setIncludeMultiAgentChat(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0a0a0f]/80 backdrop-blur-sm border border-cyan-500/30 p-6"
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
    >
      <h3 className="text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4" style={{ textShadow: '0 0 10px #00ffff40' }}>
        {mode === 'edit' ? t('editStage') : t('newStage')}
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="stage-name" className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            {t('stageName')} <span className="text-pink-400">*</span>
          </label>
          <input
            id="stage-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('stageNamePlaceholder')}
            required
            autoFocus
            className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all"
          />
        </div>

        <div>
          <label htmlFor="stage-description" className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            {t('description')}
          </label>
          <textarea
            id="stage-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('descriptionPlaceholder')}
            rows={3}
            className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            {t('color')}
          </label>
          <div className="flex gap-2 flex-wrap">
            {STAGE_COLORS.map((colorOption) => (
              <button
                key={colorOption.value}
                type="button"
                onClick={() => setColor(colorOption.value)}
                className={`w-10 h-10 transition-all cursor-pointer ${
                  color === colorOption.value
                    ? 'scale-110 shadow-[0_0_15px_currentColor]'
                    : 'hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: colorOption.value,
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                  border: color === colorOption.value ? '2px solid white' : '2px solid transparent'
                }}
                title={colorOption.label}
                aria-label={`Select ${colorOption.label} color`}
              />
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-cyan-500/20">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id="with-review"
              checked={withReview}
              onChange={(e) => setWithReview(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
            <span className="text-sm font-mono text-cyan-100">{t('withReview')}</span>
            <span title={t('withReviewTooltip')}>
              <InfoIcon className="w-4 h-4 text-cyan-500/50" />
            </span>
          </label>
          <p className="text-xs text-cyan-100/40 font-mono mt-1 ml-6">
            {t('withReviewHelp')}
          </p>
        </div>

        <div className="pt-2 border-t border-cyan-500/20">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id="include-multi-agent-chat"
              checked={includeMultiAgentChat}
              onChange={(e) => setIncludeMultiAgentChat(e.target.checked)}
              className="w-4 h-4 accent-pink-500 cursor-pointer"
            />
            <span className="text-sm font-mono text-cyan-100">{t('multiAgentChat')}</span>
            <span title={t('multiAgentChatTooltip')}>
              <InfoIcon className="w-4 h-4 text-pink-500/50" />
            </span>
          </label>
          <p className="text-xs text-cyan-100/40 font-mono mt-1 ml-6">
            {t('multiAgentChatHelp')}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-transparent border border-cyan-500/50 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer"
        >
          {tCommon('cancel')}
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
        >
          {mode === 'edit' ? tCommon('save') : tCommon('create')}
        </button>
      </div>
    </form>
  );
}
