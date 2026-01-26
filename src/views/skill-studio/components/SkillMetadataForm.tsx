'use client';

import { useTranslations } from 'next-intl';
import { TagMultiSelect } from '@/shared/ui/molecules/TagMultiSelect';
import { ModelMultiSelect } from '@/shared/ui/molecules/ModelMultiSelect';
import { useModels } from '@/entities/models';

interface SkillMetadataFormProps {
  visibility: 'PUBLIC' | 'PRIVATE';
  selectedTagIds: string[];
  selectedModelIds: string[];
  readOnly?: boolean;
  onVisibilityChange: (vis: 'PUBLIC' | 'PRIVATE') => void;
  onTagIdsChange: (ids: string[]) => void;
  onModelIdsChange: (ids: string[]) => void;
}

export function SkillMetadataForm({
  visibility,
  selectedTagIds,
  selectedModelIds,
  readOnly,
  onVisibilityChange,
  onTagIdsChange,
  onModelIdsChange,
}: SkillMetadataFormProps) {
  const t = useTranslations('skillStudio');
  const { models, loading: modelsLoading } = useModels();

  if (readOnly) {
    return (
      <div className="space-y-4">
        <div>
          <span className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            {t('visibility')}
          </span>
          <span className={`text-sm font-mono ${visibility === 'PUBLIC' ? 'text-purple-400' : 'text-cyan-400'}`}>
            {visibility === 'PUBLIC' ? t('visibilityPublic') : t('visibilityPrivate')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visibility */}
      <div>
        <span className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
          {t('visibility')}
        </span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="skill-visibility"
              value="PRIVATE"
              checked={visibility === 'PRIVATE'}
              onChange={(e) => onVisibilityChange(e.target.value as 'PRIVATE')}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
            <span className={`text-sm font-mono ${visibility === 'PRIVATE' ? 'text-cyan-400' : 'text-cyan-100/50'}`}>
              {t('visibilityPrivate')}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="skill-visibility"
              value="PUBLIC"
              checked={visibility === 'PUBLIC'}
              onChange={(e) => onVisibilityChange(e.target.value as 'PUBLIC')}
              className="w-4 h-4 accent-purple-500 cursor-pointer"
            />
            <span className={`text-sm font-mono ${visibility === 'PUBLIC' ? 'text-purple-400' : 'text-cyan-100/50'}`}>
              {t('visibilityPublic')}
            </span>
          </label>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
          {t('tags')}
        </label>
        <TagMultiSelect
          selectedTagIds={selectedTagIds}
          onChange={onTagIdsChange}
          placeholder={t('tagsPlaceholder')}
        />
      </div>

      {/* Models */}
      <div>
        <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
          {t('models')}
        </label>
        <ModelMultiSelect
          models={models}
          selectedModelIds={selectedModelIds}
          onChange={onModelIdsChange}
          loading={modelsLoading}
          placeholder={t('modelsPlaceholder')}
        />
      </div>
    </div>
  );
}
