'use client';

import { MouseEvent, useMemo, useState, KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { FolderCard } from './FolderCard';
import { EmptyState, EmptyStateIcons } from '@/shared/ui/molecules/EmptyState';
import { WorkflowWithMeta, PromptWithMeta, FolderWithItems } from '@/server/folders/types';
import { LibraryView } from '../hooks/useLibraryNavigation';
import { cn } from '@/shared/lib/utils/cn';

export interface LibraryItem {
  id: string;
  type: 'folder' | 'workflow' | 'prompt';
  name: string;
  description: string | null;
}

interface FolderContentsViewProps {
  view: LibraryView;
  viewMode?: 'grid' | 'list';
  folders: FolderWithItems[];
  workflows: WorkflowWithMeta[];
  prompts: PromptWithMeta[];
  searchQuery: string;
  selectedIds: Set<string>;
  onSelectItem: (id: string, type: 'folder' | 'workflow' | 'prompt', event: MouseEvent) => void;
  onOpenFolder: (folderId: string) => void;
  onOpenWorkflow: (workflowId: string) => void;
  onOpenPrompt: (promptId: string) => void;
  onRenameFolder?: (folderId: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onCreateFolder?: () => void;
  onCreateWorkflow?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * FolderContentsView Component - Cyberpunk Style
 *
 * Grid of neon-bordered cards with angular corners
 */
export function FolderContentsView({
  view,
  viewMode = 'grid',
  folders,
  workflows,
  prompts,
  searchQuery,
  selectedIds,
  onSelectItem,
  onOpenFolder,
  onOpenWorkflow,
  onOpenPrompt,
  onRenameFolder,
  onDeleteFolder,
  onCreateFolder,
  onCreateWorkflow,
  isLoading,
  className,
}: FolderContentsViewProps) {
  const t = useTranslations('folderContents');
  const gridLayoutClass = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
  const listLayoutClass = 'flex flex-col gap-2';

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folders;
    const query = searchQuery.toLowerCase();
    return folders.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.description?.toLowerCase().includes(query)
    );
  }, [folders, searchQuery]);

  const filteredWorkflows = useMemo(() => {
    if (!searchQuery) return workflows;
    const query = searchQuery.toLowerCase();
    return workflows.filter(
      (w) =>
        w.name.toLowerCase().includes(query) ||
        w.description?.toLowerCase().includes(query)
    );
  }, [workflows, searchQuery]);

  const filteredPrompts = useMemo(() => {
    if (!searchQuery) return prompts;
    const query = searchQuery.toLowerCase();
    return prompts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }, [prompts, searchQuery]);

  const isEmpty =
    filteredFolders.length === 0 &&
    filteredWorkflows.length === 0 &&
    filteredPrompts.length === 0;

  const hasContent =
    folders.length > 0 || workflows.length > 0 || prompts.length > 0;

  // Loading state - Cyberpunk
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-20', className)} role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" style={{ boxShadow: '0 0 20px rgba(0,255,255,0.2)' }} aria-hidden="true" />
          <span className="text-cyan-400 font-mono text-sm uppercase tracking-wider">{t('scanningVault')}</span>
        </div>
      </div>
    );
  }

  // Empty states - Cyberpunk
  if (isEmpty) {
    if (searchQuery && hasContent) {
      return (
        <div className={cn('flex flex-col items-center justify-center py-16', className)}>
          <div className="text-cyan-500/30 mb-4">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-cyan-400 font-mono text-lg uppercase mb-2">{t('noResultsFound')}</h3>
          <p className="text-cyan-100/40 font-mono text-sm">{t('queryReturned', { query: searchQuery })}</p>
        </div>
      );
    }

    switch (view) {
      case 'trash':
        return (
          <div className={cn('flex flex-col items-center justify-center py-16', className)}>
            <div className="text-pink-500/30 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-pink-400 font-mono text-lg uppercase mb-2">{t('recycleBinEmpty')}</h3>
            <p className="text-cyan-100/40 font-mono text-sm">{t('deletedItemsPurged')}</p>
          </div>
        );

      case 'uncategorized':
        return (
          <div className={cn('flex flex-col items-center justify-center py-16', className)}>
            <div className="text-green-500/30 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-green-400 font-mono text-lg uppercase mb-2">{t('allItemsOrganized')}</h3>
            <p className="text-cyan-100/40 font-mono text-sm">{t('allAssetsCategorized')}</p>
          </div>
        );

      case 'folder':
        return (
          <div className={cn('flex flex-col items-center justify-center py-16', className)}>
            <div className="text-cyan-500/30 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-cyan-400 font-mono text-lg uppercase mb-2">{t('directoryEmpty')}</h3>
            <p className="text-cyan-100/40 font-mono text-sm mb-4">{t('dragItemsHere')}</p>
            {onCreateWorkflow && (
              <button
                onClick={onCreateWorkflow}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-mono text-sm uppercase hover:bg-cyan-500/30 hover:border-cyan-400 transition-all"
              >
                [{t('createWorkflow')}]
              </button>
            )}
          </div>
        );

      case 'root':
      default:
        return (
          <EmptyState
            icon={EmptyStateIcons.library}
            title={t('welcomeTitle')}
            description={t('welcomeDescription')}
            actions={[
              ...(onCreateFolder ? [{ label: t('createFolder'), onClick: onCreateFolder }] : []),
              ...(onCreateWorkflow
                ? [{ label: t('createWorkflow'), onClick: onCreateWorkflow, variant: 'secondary' as const }]
                : []),
            ]}
            className={className}
          />
        );
    }
  }

  return (
    <div className={cn('space-y-8', className)} role="region" aria-label="Library contents">
      {/* Folders section */}
      {filteredFolders.length > 0 && (
        <section aria-labelledby="folders-heading">
          <h3 id="folders-heading" className="text-xs font-mono text-cyan-500/70 uppercase tracking-wider mb-3">
            {'//'} {t('directories')} [{filteredFolders.length}]
          </h3>
          <div
            className={viewMode === 'grid' ? gridLayoutClass : listLayoutClass}
            role="list"
            aria-label="Folders"
          >
            {filteredFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={{
                  id: folder.id,
                  name: folder.name,
                  key: folder.key,
                  description: folder.description,
                  visibility: folder.visibility,
                  itemCount: folder.itemCount,
                }}
                isSelected={selectedIds.has(folder.id)}
                onSelect={(id, e) => onSelectItem(id, 'folder', e)}
                onOpen={onOpenFolder}
                onRename={onRenameFolder}
                onDelete={onDeleteFolder}
                viewMode={viewMode}
              />
            ))}
          </div>
        </section>
      )}

      {/* Workflows section */}
      {filteredWorkflows.length > 0 && (
        <section aria-labelledby="workflows-heading">
          <h3 id="workflows-heading" className="text-xs font-mono text-cyan-500/70 uppercase tracking-wider mb-3">
            {'//'} {t('workflows')} [{filteredWorkflows.length}]
          </h3>
          <div
            className={viewMode === 'grid' ? gridLayoutClass : listLayoutClass}
            role="list"
            aria-label="Workflows"
          >
            {filteredWorkflows.map((workflow) => (
              <WorkflowItemCard
                key={workflow.id}
                workflow={workflow}
                isSelected={selectedIds.has(workflow.id)}
                onSelect={(e) => onSelectItem(workflow.id, 'workflow', e)}
                onOpen={() => onOpenWorkflow(workflow.id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        </section>
      )}

      {/* Prompts section */}
      {filteredPrompts.length > 0 && (
        <section aria-labelledby="prompts-heading">
          <h3 id="prompts-heading" className="text-xs font-mono text-pink-500/70 uppercase tracking-wider mb-3">
            {'//'} {t('miniPrompts')} [{filteredPrompts.length}]
          </h3>
          <div
            className={viewMode === 'grid' ? gridLayoutClass : listLayoutClass}
            role="list"
            aria-label="Prompts"
          >
            {filteredPrompts.map((prompt) => (
              <PromptItemCard
                key={prompt.id}
                prompt={prompt}
                isSelected={selectedIds.has(prompt.id)}
                onSelect={(e) => onSelectItem(prompt.id, 'prompt', e)}
                onOpen={() => onOpenPrompt(prompt.id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Cyberpunk Workflow Card
interface WorkflowItemCardProps {
  workflow: WorkflowWithMeta;
  isSelected: boolean;
  onSelect: (e: MouseEvent) => void;
  onOpen: () => void;
  viewMode?: 'grid' | 'list';
}

function WorkflowItemCard({ workflow, isSelected, onSelect, onOpen, viewMode = 'grid' }: WorkflowItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-title]')) {
      return;
    }
    onSelect(e);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      onOpen();
    } else if (e.key === ' ') {
      e.preventDefault();
      onSelect(e as unknown as MouseEvent);
    }
  };

  // List view - Cyberpunk
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'relative bg-[#0a0a0f]/80 backdrop-blur-sm border px-4 py-3 transition-all duration-200 cursor-pointer',
          'flex items-center gap-4',
          isSelected
            ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]'
            : 'border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-500/5'
        )}
        onClick={handleClick}
        onDoubleClick={onOpen}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid={`workflow-card-${workflow.id}`}
        role="listitem"
        tabIndex={0}
        aria-label={`${workflow.name} workflow, ${workflow._count.stages} stages, by ${workflow.user.username}${isSelected ? ', selected' : ''}`}
      >
        <div className={cn('transition-opacity', isSelected || isHovered ? 'opacity-100' : 'opacity-0')}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 bg-transparent border-2 border-cyan-500/50 text-cyan-500 focus:ring-cyan-500/50"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 flex-shrink-0">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <button
            data-title
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="font-mono text-cyan-100 hover:text-cyan-400 transition-colors focus:outline-none text-left"
            tabIndex={-1}
          >
            {workflow.name}
          </button>
          {workflow.description && (
            <p className="text-xs text-cyan-100/40 truncate mt-0.5 font-mono">{workflow.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-cyan-100/50 font-mono flex-shrink-0">
          <span className="text-cyan-400">{workflow._count.stages} stages</span>
          <span className="text-cyan-500/30">|</span>
          <span>{workflow.user.username}</span>
        </div>
      </div>
    );
  }

  // Grid view - Cyberpunk
  return (
    <div
      className={cn(
        'relative bg-[#0a0a0f]/80 backdrop-blur-sm border p-4 transition-all duration-200 cursor-pointer',
        isSelected
          ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,255,255,0.2)]'
          : 'border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-500/5'
      )}
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
      onClick={handleClick}
      onDoubleClick={onOpen}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`workflow-card-${workflow.id}`}
      role="listitem"
      tabIndex={0}
      aria-label={`${workflow.name} workflow, ${workflow._count.stages} stages, by ${workflow.user.username}${isSelected ? ', selected' : ''}`}
    >
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/50"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500/50"></div>

      <div
        className={cn(
          'absolute top-3 left-3 transition-opacity',
          isSelected || isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="w-4 h-4 bg-transparent border-2 border-cyan-500/50 text-cyan-500 focus:ring-cyan-500/50"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      <div className="flex justify-center mb-3 mt-4">
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30">
          <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
      </div>

      <button
        data-title
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className="w-full text-center font-mono text-cyan-100 hover:text-cyan-400 transition-colors focus:outline-none min-h-[44px] flex items-center justify-center px-1 break-words"
        style={{ wordBreak: 'break-word' }}
        tabIndex={-1}
      >
        {workflow.name}
      </button>

      <div className="flex items-center justify-center gap-2 mt-2 text-xs text-cyan-100/50 font-mono">
        <span className="text-cyan-400">{workflow._count.stages}</span>
        <span className="text-cyan-500/30">|</span>
        <span>{workflow.user.username}</span>
      </div>

      {workflow.description && (
        <p className="mt-2 text-xs text-cyan-100/30 text-center line-clamp-2 font-mono">
          {workflow.description}
        </p>
      )}
    </div>
  );
}

// Cyberpunk Prompt Card
interface PromptItemCardProps {
  prompt: PromptWithMeta;
  isSelected: boolean;
  onSelect: (e: MouseEvent) => void;
  onOpen: () => void;
  viewMode?: 'grid' | 'list';
}

function PromptItemCard({ prompt, isSelected, onSelect, onOpen, viewMode = 'grid' }: PromptItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-title]')) {
      return;
    }
    onSelect(e);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      onOpen();
    } else if (e.key === ' ') {
      e.preventDefault();
      onSelect(e as unknown as MouseEvent);
    }
  };

  // List view - Cyberpunk
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'relative bg-[#0a0a0f]/80 backdrop-blur-sm border px-4 py-3 transition-all duration-200 cursor-pointer',
          'flex items-center gap-4',
          isSelected
            ? 'border-pink-400 bg-pink-500/10 shadow-[0_0_15px_rgba(255,0,102,0.2)]'
            : 'border-pink-500/30 hover:border-pink-400/60 hover:bg-pink-500/5'
        )}
        onClick={handleClick}
        onDoubleClick={onOpen}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid={`prompt-card-${prompt.id}`}
        role="listitem"
        tabIndex={0}
        aria-label={`${prompt.name} prompt, by ${prompt.user.username}${isSelected ? ', selected' : ''}`}
      >
        <div className={cn('transition-opacity', isSelected || isHovered ? 'opacity-100' : 'opacity-0')}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 bg-transparent border-2 border-pink-500/50 text-pink-500 focus:ring-pink-500/50"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        <div className="p-2 bg-pink-500/10 border border-pink-500/30 flex-shrink-0">
          <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <button
            data-title
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="font-mono text-cyan-100 hover:text-pink-400 transition-colors focus:outline-none text-left"
            tabIndex={-1}
          >
            {prompt.name}
          </button>
          {prompt.description && (
            <p className="text-xs text-cyan-100/40 truncate mt-0.5 font-mono">{prompt.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs flex-shrink-0">
          <span className="px-2 py-0.5 font-mono bg-pink-500/20 text-pink-400 border border-pink-500/50">PROMPT</span>
          <span className="text-cyan-100/50 font-mono">{prompt.user.username}</span>
        </div>
      </div>
    );
  }

  // Grid view - Cyberpunk
  return (
    <div
      className={cn(
        'relative bg-[#0a0a0f]/80 backdrop-blur-sm border p-4 transition-all duration-200 cursor-pointer',
        isSelected
          ? 'border-pink-400 bg-pink-500/10 shadow-[0_0_20px_rgba(255,0,102,0.2)]'
          : 'border-pink-500/30 hover:border-pink-400/60 hover:bg-pink-500/5'
      )}
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
      onClick={handleClick}
      onDoubleClick={onOpen}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`prompt-card-${prompt.id}`}
      role="listitem"
      tabIndex={0}
      aria-label={`${prompt.name} prompt, by ${prompt.user.username}${isSelected ? ', selected' : ''}`}
    >
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-pink-500/50"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-pink-500/50"></div>

      <div
        className={cn(
          'absolute top-3 left-3 transition-opacity',
          isSelected || isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="w-4 h-4 bg-transparent border-2 border-pink-500/50 text-pink-500 focus:ring-pink-500/50"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      <div className="flex justify-center mb-3 mt-4">
        <div className="p-3 bg-pink-500/10 border border-pink-500/30">
          <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
      </div>

      <button
        data-title
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className="w-full text-center font-mono text-cyan-100 hover:text-pink-400 transition-colors focus:outline-none min-h-[44px] flex items-center justify-center px-1 break-words"
        style={{ wordBreak: 'break-word' }}
        tabIndex={-1}
      >
        {prompt.name}
      </button>

      <div className="flex items-center justify-center gap-2 mt-2 text-xs font-mono">
        <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 border border-pink-500/50">PROMPT</span>
        <span className="text-cyan-100/50">{prompt.user.username}</span>
      </div>

      {prompt.description && (
        <p className="mt-2 text-xs text-cyan-100/30 text-center line-clamp-2 font-mono">
          {prompt.description}
        </p>
      )}
    </div>
  );
}
