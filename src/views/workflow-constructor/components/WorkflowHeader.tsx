'use client';

import { useTranslations } from 'next-intl';
import { ModelMultiSelect } from '@/shared/ui/molecules/ModelMultiSelect';
import { useModels } from '@/entities/models';

interface WorkflowHeaderProps {
  workflowName: string;
  workflowDescription: string | null;
  workflowKey?: string | null;
  isActive: boolean;
  isPublic: boolean;
  selectedModelIds: string[];
  isDirty: boolean;
  isSaving: boolean;
  readOnly?: boolean;
  onWorkflowNameChange: (name: string) => void;
  onWorkflowDescriptionChange: (description: string | null) => void;
  onIsActiveChange: (isActive: boolean) => void;
  onIsPublicChange: (isPublic: boolean) => void;
  onSelectedModelIdsChange: (modelIds: string[]) => void;
  onSave: () => void;
}

export function WorkflowHeader({
  workflowName,
  workflowDescription,
  workflowKey,
  isActive,
  isPublic,
  selectedModelIds,
  isDirty,
  isSaving,
  readOnly,
  onWorkflowNameChange,
  onWorkflowDescriptionChange,
  onIsActiveChange,
  onIsPublicChange,
  onSelectedModelIdsChange,
  onSave,
}: WorkflowHeaderProps) {
  const t = useTranslations('workflowHeader');
  const { models, loading: modelsLoading } = useModels();

  return (
    <div className="bg-[#0a0a0f]/95 backdrop-blur-md border-b border-cyan-500/30 px-6 py-4">
      <div className="flex items-center justify-between mb-3 gap-4">
        <div className="flex-1 min-w-0 max-w-4xl">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => {
              onWorkflowNameChange(e.target.value);
            }}
            readOnly={readOnly}
            placeholder={t('namePlaceholder')}
            className="text-2xl font-bold font-mono text-cyan-400 bg-transparent border-0 focus:outline-none focus:ring-0 px-0 w-full uppercase tracking-wider placeholder:text-cyan-500/30"
            style={{ textShadow: '0 0 10px #00ffff40' }}
          />
        </div>
        {!readOnly && (
          <div className="flex gap-3">
            <button
              onClick={onSave}
              disabled={!isDirty || isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              {isSaving ? t('saving') : t('save')}
            </button>
          </div>
        )}
      </div>

      {/* System panel - single row with checkboxes and models */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-6">
          <label className={`flex items-center gap-2 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => onIsActiveChange(e.target.checked)}
              disabled={readOnly}
              id="workflow-active-checkbox"
              className="w-4 h-4 accent-cyan-500 cursor-pointer disabled:cursor-default disabled:opacity-50"
            />
            <span className={`text-xs font-mono uppercase tracking-wider ${isActive ? 'text-green-400' : 'text-cyan-100/40'}`}>
              {isActive ? t('active') : t('inactive')}
            </span>
          </label>
          <label className={`flex items-center gap-2 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => onIsPublicChange(e.target.checked)}
              disabled={readOnly}
              id="workflow-public-checkbox"
              className="w-4 h-4 accent-cyan-500 cursor-pointer disabled:cursor-default disabled:opacity-50"
            />
            <span className={`text-xs font-mono uppercase tracking-wider ${isPublic ? 'text-purple-400' : 'text-cyan-100/40'}`}>
              {isPublic ? t('public') : t('private')}
            </span>
          </label>
          {workflowKey && (
            <div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
              {t('key')}: {workflowKey}
            </div>
          )}
        </div>

        {/* Models multiselect */}
        <div className="flex-1 min-w-[200px] max-w-[400px]">
          <ModelMultiSelect
            models={models}
            selectedModelIds={selectedModelIds}
            onChange={onSelectedModelIdsChange}
            loading={modelsLoading}
            placeholder={t('selectModelsPlaceholder')}
          />
        </div>
      </div>

      {/* Description textarea below top panel */}
      <div className="mt-4 relative">
        <textarea
          value={workflowDescription || ''}
          onChange={(e) => {
            const value = e.target.value || null;
            onWorkflowDescriptionChange(value);
          }}
          readOnly={readOnly}
          placeholder={t('descriptionPlaceholder')}
          maxLength={500}
          rows={2}
          className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/30 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.1)] transition-all resize-none"
        />
        <div className={`absolute bottom-2 right-2 text-xs font-mono ${(workflowDescription?.length || 0) > 480 ? 'text-pink-400' : 'text-cyan-500/40'}`}>
          {workflowDescription?.length || 0}/500
        </div>
      </div>
    </div>
  );
}
