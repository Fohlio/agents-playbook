'use client';

import { MouseEvent, useMemo, useState, KeyboardEvent } from 'react';
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
 * FolderContentsView Component
 *
 * Displays the contents of a folder or special view (trash, uncategorized, root).
 * Features:
 * - Grid of folders, workflows, and prompts
 * - Selection mechanics (click to select)
 * - Click on title to drill into item
 * - Empty states with contextual actions
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
  // Grid/list layout classes
  const gridLayoutClass = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
  const listLayoutClass = 'flex flex-col gap-2';
  // Filter items based on search query
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

  // Render loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-20', className)} role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-hidden="true" />
        <span className="sr-only">Loading library contents...</span>
      </div>
    );
  }

  // Render empty state
  if (isEmpty) {
    // Search with no results
    if (searchQuery && hasContent) {
      return (
        <EmptyState
          icon={EmptyStateIcons.search}
          title="No results found"
          description={`No items match "${searchQuery}". Try a different search term.`}
          className={className}
        />
      );
    }

    // View-specific empty states
    switch (view) {
      case 'trash':
        return (
          <EmptyState
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
            title="Trash is empty"
            description="Items you delete will appear here for 30 days before being permanently removed."
            className={className}
          />
        );

      case 'uncategorized':
        return (
          <EmptyState
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            }
            title="All items are organized"
            description="Great job! All your workflows and prompts are in folders."
            className={className}
          />
        );

      case 'folder':
        return (
          <EmptyState
            icon={EmptyStateIcons.library}
            title="This folder is empty"
            description="Drag items here or use 'Add to Folder' from any item's menu."
            actions={
              onCreateWorkflow
                ? [{ label: 'Create Workflow', onClick: onCreateWorkflow }]
                : undefined
            }
            className={className}
          />
        );

      case 'root':
      default:
        return (
          <EmptyState
            icon={EmptyStateIcons.library}
            title="Welcome to your Library"
            description="Create folders to organize your workflows and prompts, or start by creating your first workflow."
            actions={[
              ...(onCreateFolder ? [{ label: 'Create Folder', onClick: onCreateFolder }] : []),
              ...(onCreateWorkflow
                ? [{ label: 'Create Workflow', onClick: onCreateWorkflow, variant: 'secondary' as const }]
                : []),
            ]}
            className={className}
          />
        );
    }
  }

  return (
    <div className={cn('space-y-6', className)} role="region" aria-label="Library contents">
      {/* Folders section */}
      {filteredFolders.length > 0 && (
        <section aria-labelledby="folders-heading">
          <h3 id="folders-heading" className="text-sm font-medium text-gray-500 mb-3">
            Folders ({filteredFolders.length})
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
          <h3 id="workflows-heading" className="text-sm font-medium text-gray-500 mb-3">
            Workflows ({filteredWorkflows.length})
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
          <h3 id="prompts-heading" className="text-sm font-medium text-gray-500 mb-3">
            Prompts ({filteredPrompts.length})
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

// Internal workflow card component
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

  // List view
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'relative bg-white rounded-lg border px-4 py-3 transition-all duration-200 cursor-pointer',
          'hover:shadow-sm hover:border-gray-300',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'flex items-center gap-4',
          isSelected && 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
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
        {/* Selection checkbox */}
        <div className={cn('transition-opacity', isSelected || isHovered ? 'opacity-100' : 'opacity-0')}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {/* Workflow icon */}
        <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <button
            data-title
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="font-medium text-gray-900 hover:text-purple-600 transition-colors focus:outline-none focus:underline text-left"
            tabIndex={-1}
          >
            {workflow.name}
          </button>
          {workflow.description && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{workflow.description}</p>
          )}
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-sm text-gray-500 flex-shrink-0">
          <span>{workflow._count.stages} stages</span>
          <span className="text-gray-300">•</span>
          <span>{workflow.user.username}</span>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      className={cn(
        'relative bg-white rounded-lg border p-4 transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:border-gray-300',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isSelected && 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
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
      {/* Selection checkbox */}
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
          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {/* Workflow icon */}
      <div className="flex justify-center mb-3 mt-4">
        <div className="p-3 bg-purple-50 rounded-lg">
          <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
      </div>

      {/* Workflow name */}
      <button
        data-title
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className="w-full text-center font-medium text-gray-900 hover:text-purple-600 transition-colors focus:outline-none focus:underline min-h-[44px] flex items-center justify-center px-1 break-words"
        style={{ wordBreak: 'break-word' }}
        tabIndex={-1}
      >
        {workflow.name}
      </button>

      {/* Meta info */}
      <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
        <span>{workflow._count.stages} stages</span>
        <span className="text-gray-300" aria-hidden="true">|</span>
        <span>{workflow.user.username}</span>
      </div>

      {/* Description */}
      {workflow.description && (
        <p className="mt-2 text-xs text-gray-400 text-center line-clamp-2">
          {workflow.description}
        </p>
      )}
    </div>
  );
}

// Internal prompt card component
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

  // List view
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'relative bg-white rounded-lg border px-4 py-3 transition-all duration-200 cursor-pointer',
          'hover:shadow-sm hover:border-green-300',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
          'flex items-center gap-4',
          isSelected && 'border-green-500 bg-green-50 ring-2 ring-green-200'
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
        {/* Selection checkbox */}
        <div className={cn('transition-opacity', isSelected || isHovered ? 'opacity-100' : 'opacity-0')}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {/* Prompt icon */}
        <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <button
            data-title
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="font-medium text-gray-900 hover:text-green-600 transition-colors focus:outline-none focus:underline text-left"
            tabIndex={-1}
          >
            {prompt.name}
          </button>
          {prompt.description && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{prompt.description}</p>
          )}
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-sm text-gray-500 flex-shrink-0">
          <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded">Prompt</span>
          <span>{prompt.user.username}</span>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      className={cn(
        'relative bg-white rounded-lg border p-4 transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:border-green-300',
        'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
        isSelected && 'border-green-500 bg-green-50 ring-2 ring-green-200'
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
      {/* Selection checkbox */}
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
          className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {/* File icon - distinctive from folder */}
      <div className="flex justify-center mb-3 mt-4">
        <div className="relative">
          {/* File shape */}
          <svg className="w-12 h-14 text-green-100" viewBox="0 0 48 56" fill="currentColor" aria-hidden="true">
            <path d="M4 4C4 1.79086 5.79086 0 8 0H30L44 14V52C44 54.2091 42.2091 56 40 56H8C5.79086 56 4 54.2091 4 52V4Z" />
            <path d="M30 0L44 14H34C31.7909 14 30 12.2091 30 10V0Z" fill="rgba(0,0,0,0.1)" />
          </svg>
          {/* Code icon on file */}
          <div className="absolute inset-0 flex items-center justify-center mt-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Prompt name - fixed text overflow */}
      <button
        data-title
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className="w-full text-center font-medium text-gray-900 hover:text-green-600 transition-colors focus:outline-none focus:underline min-h-[44px] flex items-center justify-center px-1 break-words"
        style={{ wordBreak: 'break-word' }}
        tabIndex={-1}
      >
        {prompt.name}
      </button>

      {/* Meta info */}
      <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
        <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded">Prompt</span>
        <span>•</span>
        <span>{prompt.user.username}</span>
      </div>

      {/* Description */}
      {prompt.description && (
        <p className="mt-2 text-xs text-gray-400 text-center line-clamp-2">
          {prompt.description}
        </p>
      )}
    </div>
  );
}
