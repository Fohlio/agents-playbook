'use client';

import { useState, useEffect, useCallback, useMemo, useRef, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils/cn';
import { ROUTES } from '@/shared/routes';
import { PublicWorkflow, PublicPrompt } from '../services/discover-service';

interface DiscoverViewProps {
  searchQuery: string;
  onImportWorkflow: (workflowId: string) => Promise<void>;
  onImportPrompt: (promptId: string) => Promise<void>;
  className?: string;
  importedWorkflowIds?: Set<string>;
  importedPromptIds?: Set<string>;
}

interface DiscoverData {
  workflows: PublicWorkflow[];
  prompts: PublicPrompt[];
}

/**
 * DiscoverView Component - Cyberpunk Style
 *
 * Public content browser with neon-styled cards
 */
export function DiscoverView({
  searchQuery,
  onImportWorkflow,
  onImportPrompt,
  className,
  importedWorkflowIds,
  importedPromptIds,
}: DiscoverViewProps) {
  const t = useTranslations('discoverView');
  const router = useRouter();
  const [data, setData] = useState<DiscoverData>({ workflows: [], prompts: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: { id: string; type: 'workflow' | 'prompt'; name: string } | null;
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
        prompts: result.prompts || [],
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

  const filteredPrompts = useMemo(() => {
    if (!searchQuery) return data.prompts;
    const query = searchQuery.toLowerCase();
    return data.prompts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }, [data.prompts, searchQuery]);

  const isEmpty = filteredWorkflows.length === 0 && filteredPrompts.length === 0;
  const hasContent = data.workflows.length > 0 || data.prompts.length > 0;

  const handleContextMenu = useCallback(
    (e: MouseEvent, item: { id: string; type: 'workflow' | 'prompt'; name: string }) => {
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
      router.push(ROUTES.LIBRARY.MINI_PROMPTS.EDIT(contextMenu.item.id));
    }
    closeContextMenu();
  }, [contextMenu.item, router, closeContextMenu]);

  const handleImport = useCallback(async () => {
    if (!contextMenu.item) return;
    try {
      if (contextMenu.item.type === 'workflow') {
        await onImportWorkflow(contextMenu.item.id);
      } else {
        await onImportPrompt(contextMenu.item.id);
      }
      setImportedIds((prev) => new Set(prev).add(contextMenu.item!.id));
    } catch (err) {
      console.error('Import error:', err);
    }
    closeContextMenu();
  }, [contextMenu.item, onImportWorkflow, onImportPrompt, closeContextMenu]);

  const handleCardImport = useCallback(async (id: string, type: 'workflow' | 'prompt') => {
    try {
      if (type === 'workflow') {
        await onImportWorkflow(id);
      } else {
        await onImportPrompt(id);
      }
      setImportedIds((prev) => new Set(prev).add(id));
    } catch (err) {
      console.error('Import error:', err);
    }
  }, [onImportWorkflow, onImportPrompt]);

  const handleOpenWorkflow = useCallback(
    (workflowId: string) => {
      router.push(ROUTES.LIBRARY.WORKFLOWS.EDIT(workflowId));
    },
    [router]
  );

  const handleOpenPrompt = useCallback(
    (promptId: string) => {
      router.push(ROUTES.LIBRARY.MINI_PROMPTS.EDIT(promptId));
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

      {/* Prompts section */}
      {filteredPrompts.length > 0 && (
        <section>
          <h3 className="text-xs font-mono text-pink-500/70 uppercase tracking-wider mb-3">
            {'//'} {t('publicPrompts')} [{filteredPrompts.length}]
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPrompts.map((prompt) => (
              <PublicPromptCard
                key={prompt.id}
                prompt={prompt}
                isImported={importedIds.has(prompt.id) || !!importedPromptIds?.has(prompt.id)}
                onOpen={() => handleOpenPrompt(prompt.id)}
                onImport={() => handleCardImport(prompt.id, 'prompt')}
                onContextMenu={(e) =>
                  handleContextMenu(e, { id: prompt.id, type: 'prompt', name: prompt.name })
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

// Cyberpunk Public Prompt Card
interface PublicPromptCardProps {
  prompt: PublicPrompt;
  isImported?: boolean;
  onOpen: () => void;
  onImport: () => void;
  onContextMenu: (e: MouseEvent) => void;
}

function PublicPromptCard({ prompt, isImported, onOpen, onImport, onContextMenu }: PublicPromptCardProps) {
  const t = useTranslations('discoverView');
  const tCommon = useTranslations('common');

  return (
    <div
      className={cn(
        'relative bg-[#0a0a0f]/80 backdrop-blur-sm border p-4 transition-all duration-200 cursor-pointer',
        'border-pink-500/30 hover:border-pink-400/60 hover:bg-pink-500/5 hover:shadow-[0_0_20px_rgba(255,0,102,0.15)]'
      )}
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
      onClick={onOpen}
      onContextMenu={onContextMenu}
      data-testid={`discover-prompt-card-${prompt.id}`}
    >
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-pink-500/50"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-pink-500/50"></div>

      {/* Public badge */}
      <div className="absolute top-3 right-3">
        <span className="px-2 py-0.5 text-xs font-mono bg-green-500/20 text-green-400 border border-green-500/50 uppercase">
          {tCommon('public')}
        </span>
      </div>

      {/* Prompt icon */}
      <div className="flex justify-center mb-3 mt-4">
        <div className="p-3 bg-pink-500/10 border border-pink-500/30">
          <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Prompt name */}
      <h4 className="text-center font-mono text-cyan-100 truncate">{prompt.name}</h4>

      {/* Meta info */}
      {prompt.authorName && (
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-cyan-100/50 font-mono">
          <span>{prompt.authorName}</span>
        </div>
      )}

      {/* Description */}
      {prompt.description && (
        <p className="mt-2 text-xs text-cyan-100/30 text-center line-clamp-2 font-mono">
          {prompt.description}
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
            : 'border-pink-500/50 text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 hover:border-pink-400 cursor-pointer'
        )}
      >
        {isImported ? t('inLibrary') : t('addToLibrary')}
      </button>
    </div>
  );
}

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
