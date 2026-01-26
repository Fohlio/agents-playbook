'use client';

import { useTranslations } from 'next-intl';
import { Zap, ExternalLink, Paperclip } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/shared/routes';

export interface ActiveSkillData {
  id: string;
  name: string;
  description: string | null;
  attachmentCount: number;
  isSystem: boolean;
  visibility: 'PUBLIC' | 'PRIVATE';
}

interface ActiveSkillsSectionProps {
  skills: ActiveSkillData[];
  onDeactivate?: (skillId: string) => void;
  className?: string;
}

/**
 * ActiveSkillsSection Component - Cyberpunk Style
 *
 * Displays a list of active skills on the dashboard.
 * Skills are displayed with cyan accent color (not pink like prompts).
 */
export function ActiveSkillsSection({
  skills,
  onDeactivate,
  className = '',
}: ActiveSkillsSectionProps) {
  const t = useTranslations('dashboard');

  return (
    <div
      className={`relative bg-[#0a0a0f]/80 backdrop-blur-sm border border-cyan-500/30 ${className}`}
      style={{
        clipPath:
          'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-500/50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-500/50" />

      {/* Header */}
      <div className="px-4 py-3 border-b border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 animate-pulse" />
            <h3 className="font-mono text-sm uppercase tracking-wider text-cyan-400">
              ACTIVE_SKILLS.dll
            </h3>
          </div>
          <Link
            href={ROUTES.LIBRARY.ROOT}
            className="text-xs font-mono text-cyan-500/60 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            VIEW_ALL
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Skills list */}
      <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
        {skills.length === 0 ? (
          <div className="text-center py-8 text-cyan-500/40 font-mono text-sm">
            {t('noActiveSkills')}
          </div>
        ) : (
          skills.map((skill) => (
            <div
              key={skill.id}
              className="group relative flex items-center gap-3 p-3 border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all"
              style={{
                clipPath:
                  'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              }}
            >
              {/* Icon */}
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 flex-shrink-0">
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-cyan-100 truncate">
                    {skill.name}
                  </span>
                  {skill.isSystem && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
                      SYSTEM
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-cyan-500/50 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    {skill.attachmentCount} {skill.attachmentCount === 1 ? 'file' : 'files'}
                  </span>
                  <span className="text-cyan-500/30">|</span>
                  <span
                    className={
                      skill.visibility === 'PUBLIC'
                        ? 'text-green-400'
                        : 'text-cyan-500/50'
                    }
                  >
                    {skill.visibility}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={ROUTES.SKILLS.EDIT(skill.id)}
                  className="p-1.5 text-cyan-500/60 hover:text-cyan-400 transition-colors"
                  title="Edit skill"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </Link>
                {onDeactivate && (
                  <button
                    onClick={() => onDeactivate(skill.id)}
                    className="p-1.5 text-red-500/60 hover:text-red-400 transition-colors"
                    title="Deactivate skill"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create new skill link */}
      <div className="px-4 pb-4">
        <Link
          href={ROUTES.SKILLS.NEW}
          className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-cyan-500/30 text-cyan-500/60 font-mono text-sm uppercase tracking-wider hover:border-cyan-400 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all"
        >
          <Zap className="w-4 h-4" />
          CREATE_NEW_SKILL
        </Link>
      </div>
    </div>
  );
}
