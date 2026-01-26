'use client';

import { useState, useEffect, useCallback, useMemo, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Zap } from 'lucide-react';
import { cn } from '@/shared/lib/utils/cn';
import { useDebounce } from '@/shared/lib/hooks/useDebounce';
import { ROUTES } from '@/shared/routes';
import { PublicWorkflow, PublicSkill } from '../services/discover-service';

interface DiscoverViewProps {
  searchQuery: string;
  onImportWorkflow: (workflowId: string) => Promise<void>;
  onImportSkill: (skillId: string) => Promise<void>;
  className?: string;
  importedWorkflowIds?: Set<string>;
  importedSkillIds?: Set<string>;
}

interface DiscoverData {
  workflows: PublicWorkflow[];
  skills: PublicSkill[];
}

/**
 * DiscoverView Component - Cyberpunk Style
 *
 * Public content browser with neon-styled cards
 */
export function DiscoverView({
  searchQuery,
  onImportWorkflow,
  onImportSkill,
  className,
  importedWorkflowIds,
  importedSkillIds,
}: DiscoverViewProps) {
  const t = useTranslations('discoverView');
  const router = useRouter();
  const [data, setData] = useState<DiscoverData>({ workflows: [], skills: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: { id: string; type: 'workflow' | 'skill'; name: string } | null;
  }>({ x: 0, y: 0, item: null });

  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchData = useCallback(async (search?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/discover?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch public content');
      }

      const result = await response.json();
      setData({
        workflows: result.workflows || [],
        skills: result.skills || [],
      });
    } catch (err) {
      console.error('Discover fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(debouncedSearch || undefined);
  }, [fetchData, debouncedSearch]);

  const filteredWorkflows = useMemo(() => {
    if (!searchQuery) return data.workflows;
    const query = searchQuery.toLowerCase();
    return data.workflows.filter(
      (w) =>
        w.name.toLowerCase().includes(query) ||
        w.description?.toLowerCase().includes(query)
    );
  }, [data.workflows, searchQuery]);

  const filteredSkills = useMemo(() => {
    if (!searchQuery) return data.skills;
    const query = searchQuery.toLowerCase();
    return data.skills.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
    );
  }, [data.skills, searchQuery]);

  const isEmpty = filteredWorkflows.length === 0 && filteredSkills.length === 0;
  const hasContent = data.workflows.length > 0 || data.skills.length > 0;

  const handleContextMenu = useCallback(
    (e: MouseEvent, item: { id: string; type: 'workflow' | 'skill'; name: string }) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, item });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu({ x: 0, y: 0, item: null });
  }, []);

  const handlePreview = useCallback(() => {
    if (!contextMenu.item) return;
    if (contextMenu.item.type === 'workflow') {
      router.push(ROUTES.LIBRARY.WORKFLOWS.EDIT(contextMenu.item.id));
    } else {
      router.push(ROUTES.SKILLS.EDIT(contextMenu.item.id));
    }
    closeContextMenu();
  }, [contextMenu.item, router, closeContextMenu]);

  const handleImport = useCallback(async () => {
    if (!contextMenu.item) return;
    try {
      if (contextMenu.item.type === 'workflow') {
        await onImportWorkflow(contextMenu.item.id);
      } else {
        await onImportSkill(contextMenu.item.id);
      }
      setImportedIds((prev) => new Set(prev).add(contextMenu.item!.id));
    } catch (err) {
      console.error('Import error:', err);
    }
    closeContextMenu();
  }, [contextMenu.item, onImportWorkflow, onImportSkill, closeContextMenu]);

  const handleCardImport = useCallback(async (id: string, type: 'workflow' | 'skill') => {
    try {
      if (type === 'workflow') {
        await onImportWorkflow(id);
      } else {
        await onImportSkill(id);
      }
      setImportedIds((prev) => new Set(prev).add(id));
    } catch (err) {
      console.error('Import error:', err);
    }
  }, [onImportWorkflow, onImportSkill]);

  const handleOpenWorkflow = useCallback(
    (workflowId: string) => {
      router.push(ROUTES.LIBRARY.WORKFLOWS.EDIT(workflowId));
    },
    [router]
  );

  const handleOpenSkill = useCallback(
    (skillId: string) => {
      router.push(ROUTES.SKILLS.EDIT(skillId));
    },
    [router]
  );

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu.item) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.item, closeContextMenu]);

  // Loading state - Cyberpunk
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-20', className)}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" style={{ boxShadow: '0 0 20px rgba(0,255,255,0.2)' }} />
          <span className="text-cyan-400 font-mono text-sm uppercase tracking-wider">{t('scanning')}</span>
        </div>
      </div>
    );
  }

  // Error state - Cyberpunk
  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <div className="text-pink-500/30 mb-4">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-pink-400 font-mono text-lg uppercase mb-2">{t('connectionError')}</h3>
        <p className="text-cyan-100/40 font-mono text-sm mb-4">{error}</p>
        <button
          onClick={() => fetchData(debouncedSearch || undefined)}
          className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-mono text-sm uppercase hover:bg-cyan-500/30 hover:border-cyan-400 transition-all"
        >
          [{t('retryConnection')}]
        </button>
      </div>
    );
  }

  // Empty state - Cyberpunk
  if (isEmpty) {
    if (searchQuery && hasContent) {
      return (
        <div className={cn('flex flex-col items-center justify-center py-16', className)}>
          <div className="text-cyan-500/30 mb-4">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-cyan-400 font-mono text-lg uppercase mb-2">{t('noMatchesFound')}</h3>
          <p className="text-cyan-100/40 font-mono text-sm">{t('queryReturned', { query: searchQuery })}</p>
        </div>
      );
    }

    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <div className="text-cyan-500/30 mb-4">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-cyan-400 font-mono text-lg uppercase mb-2">{t('archiveEmpty')}</h3>
        <p className="text-cyan-100/40 font-mono text-sm">{t('noPublicAssets')}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Workflows section */}
      {filteredWorkflows.length > 0 && (
        <section>
          <h3 className="text-xs font-mono text-cyan-500/70 uppercase tracking-wider mb-3">
            {'//'} {t('publicWorkflows')} [{filteredWorkflows.length}]
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredWorkflows.map((workflow) => (
              <PublicWorkflowCard
                key={workflow.id}
                workflow={workflow}
                isImported={importedIds.has(workflow.id) || !!importedWorkflowIds?.has(workflow.id)}
                onOpen={() => handleOpenWorkflow(workflow.id)}
                onImport={() => handleCardImport(workflow.id, 'workflow')}
                onContextMenu={(e) =>
                  handleContextMenu(e, { id: workflow.id, type: 'workflow', name: workflow.name })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Skills section */}
      {filteredSkills.length > 0 && (
        <section>
          <h3 className="text-xs font-mono text-cyan-500/70 uppercase tracking-wider mb-3">
            {'//'} {t('publicSkills')} [{filteredSkills.length}]
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSkills.map((skill) => (
              <PublicSkillCard
                key={skill.id}
                skill={skill}
                isImported={importedIds.has(skill.id) || !!importedSkillIds?.has(skill.id)}
                onOpen={() => handleOpenSkill(skill.id)}
                onImport={() => handleCardImport(skill.id, 'skill')}
                onContextMenu={(e) =>
                  handleContextMenu(e, { id: skill.id, type: 'skill', name: skill.name })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Context Menu - Cyberpunk */}
      {contextMenu.item && (
        <div
          className="fixed z-50 bg-[#0a0a0f]/95 backdrop-blur-md border border-cyan-500/50 py-1 min-w-[180px] shadow-[0_0_20px_rgba(0,255,255,0.2)]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
          role="menu"
          aria-label={`Actions for ${contextMenu.item.name}`}
        >
          <button
            className="w-full px-4 py-3 text-left text-sm text-cyan-100 hover:bg-cyan-500/10 hover:text-cyan-400 flex items-center gap-2 focus:outline-none font-mono uppercase tracking-wider"
            onClick={handlePreview}
            role="menuitem"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {t('preview')}
          </button>
          <button
            className="w-full px-4 py-3 text-left text-sm text-cyan-100 hover:bg-cyan-500/10 hover:text-cyan-400 flex items-center gap-2 focus:outline-none font-mono uppercase tracking-wider"
            onClick={handleImport}
            role="menuitem"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('import')}
          </button>
        </div>
      )}
    </div>
  );
}

// Cyberpunk Public Workflow Card
interface PublicWorkflowCardProps {
  workflow: PublicWorkflow;
  isImported?: boolean;
  onOpen: () => void;
  onImport: () => void;
  onContextMenu: (e: MouseEvent) => void;
}

function PublicWorkflowCard({ workflow, isImported, onOpen, onImport, onContextMenu }: PublicWorkflowCardProps) {
  const t = useTranslations('discoverView');
  const tCommon = useTranslations('common');

  return (
    <div
      className={cn(
        'relative bg-[#0a0a0f]/80 backdrop-blur-sm border p-4 transition-all duration-200 cursor-pointer',
        'border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-500/5 hover:shadow-[0_0_20px_rgba(0,255,255,0.15)]'
      )}
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
      onClick={onOpen}
      onContextMenu={onContextMenu}
      data-testid={`discover-workflow-card-${workflow.id}`}
    >
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/50"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500/50"></div>

      {/* Public badge */}
      <div className="absolute top-3 right-3">
        <span className="px-2 py-0.5 text-xs font-mono bg-green-500/20 text-green-400 border border-green-500/50 uppercase">
          {tCommon('public')}
        </span>
      </div>

      {/* Workflow icon */}
      <div className="flex justify-center mb-3 mt-4">
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30">
          <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
      </div>

      {/* Workflow name */}
      <h4 className="text-center font-mono text-cyan-100 truncate">{workflow.name}</h4>

      {/* Meta info */}
      <div className="flex items-center justify-center gap-2 mt-2 text-xs text-cyan-100/50 font-mono">
        <span className="text-cyan-400">{t('stagesCount', { count: workflow.stageCount })}</span>
        {workflow.authorName && (
          <>
            <span className="text-cyan-500/30">|</span>
            <span>{workflow.authorName}</span>
          </>
        )}
      </div>

      {/* Description */}
      {workflow.description && (
        <p className="mt-2 text-xs text-cyan-100/30 text-center line-clamp-2 font-mono">
          {workflow.description}
        </p>
      )}

      {/* Add to Library button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isImported) onImport();
        }}
        disabled={isImported}
        className={cn(
          'mt-3 w-full py-2 text-xs font-mono uppercase tracking-wider border transition-all',
          isImported
            ? 'border-green-500/50 text-green-400 bg-green-500/10 cursor-default'
            : 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-400 cursor-pointer'
        )}
      >
        {isImported ? t('inLibrary') : t('addToLibrary')}
      </button>
    </div>
  );
}

// Cyberpunk Public Skill Card
interface PublicSkillCardProps {
  skill: PublicSkill;
  isImported?: boolean;
  onOpen: () => void;
  onImport: () => void;
  onContextMenu: (e: MouseEvent) => void;
}

function PublicSkillCard({ skill, isImported, onOpen, onImport, onContextMenu }: PublicSkillCardProps) {
  const t = useTranslations('discoverView');
  const tCommon = useTranslations('common');

  return (
    <div
      className={cn(
        'relative bg-[#0a0a0f]/80 backdrop-blur-sm border p-4 transition-all duration-200 cursor-pointer',
        'border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-500/5 hover:shadow-[0_0_20px_rgba(0,255,255,0.15)]'
      )}
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
      onClick={onOpen}
      onContextMenu={onContextMenu}
      data-testid={`discover-skill-card-${skill.id}`}
    >
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/50"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500/50"></div>

      {/* Public badge */}
      <div className="absolute top-3 right-3">
        <span className="px-2 py-0.5 text-xs font-mono bg-green-500/20 text-green-400 border border-green-500/50 uppercase">
          {tCommon('public')}
        </span>
      </div>

      {/* Skill icon */}
      <div className="flex justify-center mb-3 mt-4">
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30">
          <Zap className="w-8 h-8 text-cyan-400" />
        </div>
      </div>

      {/* Skill name */}
      <h4 className="text-center font-mono text-cyan-100 truncate">{skill.name}</h4>

      {/* Meta info */}
      <div className="flex items-center justify-center gap-2 mt-2 text-xs text-cyan-100/50 font-mono">
        <span className="text-cyan-400">{skill.attachmentCount} files</span>
        {skill.authorName && (
          <>
            <span className="text-cyan-500/30">|</span>
            <span>{skill.authorName}</span>
          </>
        )}
      </div>

      {/* Description */}
      {skill.description && (
        <p className="mt-2 text-xs text-cyan-100/30 text-center line-clamp-2 font-mono">
          {skill.description}
        </p>
      )}

      {/* Add to Library button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isImported) onImport();
        }}
        disabled={isImported}
        className={cn(
          'mt-3 w-full py-2 text-xs font-mono uppercase tracking-wider border transition-all',
          isImported
            ? 'border-green-500/50 text-green-400 bg-green-500/10 cursor-default'
            : 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-400 cursor-pointer'
        )}
      >
        {isImported ? t('inLibrary') : t('addToLibrary')}
      </button>
    </div>
  );
}

