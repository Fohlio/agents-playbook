'use client';

import { useTranslations } from 'next-intl';
import { MarkdownContent } from '@/shared/ui/atoms/MarkdownContent';
import { useState } from 'react';

interface SkillEditorProps {
  name: string;
  description: string;
  content: string;
  readOnly?: boolean;
  onNameChange: (name: string) => void;
  onDescriptionChange: (desc: string) => void;
  onContentChange: (content: string) => void;
}

export function SkillEditor({
  name,
  description,
  content,
  readOnly,
  onNameChange,
  onDescriptionChange,
  onContentChange,
}: SkillEditorProps) {
  const t = useTranslations('skillStudio');
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-4">
      {/* Name field */}
      <div>
        <label htmlFor="skill-name" className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
          {t('name')} <span className="text-pink-400">*</span>
        </label>
        <input
          id="skill-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          readOnly={readOnly}
          placeholder={t('namePlaceholder')}
          required
          className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all"
        />
      </div>

      {/* Description field */}
      <div className="relative">
        <label htmlFor="skill-description" className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
          {t('description')}
        </label>
        <textarea
          id="skill-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          readOnly={readOnly}
          placeholder={t('descriptionPlaceholder')}
          maxLength={1000}
          rows={2}
          className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all resize-none"
        />
        <p className={`text-xs font-mono mt-1 ${description.length > 900 ? 'text-pink-400' : 'text-cyan-500/40'}`}>
          {description.length}/1000
        </p>
      </div>

      {/* Content editor with edit/preview toggle */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="skill-content" className="block text-xs font-mono text-cyan-400 uppercase tracking-wider">
            {t('content')} {!readOnly && <span className="text-pink-400">*</span>}
          </label>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1.5 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer"
            >
              {showPreview ? t('edit') : t('preview')}
            </button>
          )}
        </div>

        {readOnly || showPreview ? (
          <div className="w-full min-h-[400px] max-h-[600px] overflow-y-auto px-4 py-3 bg-[#050508]/50 border border-cyan-500/30">
            {content ? (
              <MarkdownContent content={content} variant="dark" />
            ) : (
              <p className="text-cyan-500/30 font-mono text-sm italic">{t('noContent')}</p>
            )}
          </div>
        ) : (
          <textarea
            id="skill-content"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder={t('contentPlaceholder')}
            className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all resize-none min-h-[400px]"
          />
        )}
      </div>
    </div>
  );
}
