'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SkillHeaderProps {
  name: string;
  isDirty: boolean;
  isSaving: boolean;
  saveStatus: SaveStatus;
  readOnly?: boolean;
  showAIChat: boolean;
  onSave: () => void;
  onToggleAIChat: () => void;
}

const STATUS_COLORS: Record<SaveStatus, string> = {
  saving: 'text-yellow-400',
  saved: 'text-green-400',
  error: 'text-pink-400',
  idle: 'text-cyan-100/30',
};

export function SkillHeader({
  name,
  isDirty,
  isSaving,
  saveStatus,
  readOnly,
  showAIChat,
  onSave,
  onToggleAIChat,
}: SkillHeaderProps) {
  const t = useTranslations('skillStudio');
  const router = useRouter();

  const statusTextKey = saveStatus !== 'idle' ? saveStatus : (isDirty ? 'unsavedChanges' : null);
  const statusText = statusTextKey ? t(statusTextKey) : '';
  const statusColor = saveStatus === 'idle' && isDirty ? 'text-orange-400' : STATUS_COLORS[saveStatus];

  return (
    <div className="bg-[#0a0a0f]/95 backdrop-blur-md border-b border-cyan-500/30 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left section: Back + Title */}
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
              className="text-xl font-bold font-mono text-cyan-400 uppercase tracking-wider truncate"
              style={{ textShadow: '0 0 10px #00ffff40' }}
            >
              {name || t('createTitle')}
            </h1>
            {/* Status indicator */}
            <p className={`text-xs font-mono mt-1 ${statusColor}`}>
              {statusText}
            </p>
          </div>
        </div>

        {/* Right section: Actions */}
        <div className="flex items-center gap-3">
          {/* AI Assistant toggle */}
          <button
            onClick={onToggleAIChat}
            aria-pressed={showAIChat}
            aria-label={t('aiAssistant')}
            className={`px-4 py-2 font-mono text-sm uppercase tracking-wider transition-all cursor-pointer ${
              showAIChat
                ? 'bg-purple-500/20 border border-purple-400 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'bg-transparent border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400'
            }`}
            style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {t('aiAssistant')}
            </span>
          </button>

          {/* Save button */}
          {!readOnly && (
            <button
              onClick={onSave}
              disabled={!isDirty || isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(255,0,102,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              {isSaving ? t('saving') : t('save')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
