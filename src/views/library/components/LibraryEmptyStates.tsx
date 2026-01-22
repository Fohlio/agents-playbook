"use client";

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { FolderPlus, FilePlus, Search, Trash2, Inbox, Globe } from 'lucide-react';
import Button from '@/shared/ui/atoms/Button';
import { cn } from '@/shared/lib/utils/cn';

interface EmptyStateProps {
  onCreateFolder?: () => void;
  onCreateWorkflow?: () => void;
  onCreatePrompt?: () => void;
  className?: string;
}

/**
 * Base empty state component
 */
function BaseEmptyState({
  icon,
  title,
  description,
  actions,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center',
        className
      )}
    >
      <div className="mb-4 text-cyan-500/60">{icon}</div>
      <h3 className="text-lg font-semibold text-cyan-100 mb-2">{title}</h3>
      <p className="text-sm text-cyan-100/60 mb-6 max-w-md">{description}</p>
      {actions && <div className="flex flex-wrap gap-3 justify-center">{actions}</div>}
    </div>
  );
}

/**
 * New user - empty library
 *
 * Shown when a user has no content at all in their library.
 */
export function EmptyLibraryState({
  onCreateFolder,
  onCreateWorkflow,
  className,
}: EmptyStateProps) {
  const t = useTranslations('libraryEmptyStates');

  return (
    <BaseEmptyState
      icon={<Inbox className="h-16 w-16" />}
      title={t('welcomeTitle')}
      description={t('welcomeDescription')}
      actions={
        <>
          {onCreateFolder && (
            <Button variant="secondary" onClick={onCreateFolder}>
              <FolderPlus className="h-4 w-4 mr-2" />
              {t('createFolder')}
            </Button>
          )}
          {onCreateWorkflow && (
            <Button variant="primary" onClick={onCreateWorkflow}>
              <FilePlus className="h-4 w-4 mr-2" />
              {t('createWorkflow')}
            </Button>
          )}
        </>
      }
      className={className}
    />
  );
}

/**
 * Empty folder
 *
 * Shown when a folder has no items.
 */
export function EmptyFolderState({ className }: { className?: string }) {
  const t = useTranslations('libraryEmptyStates');

  return (
    <BaseEmptyState
      icon={<FolderPlus className="h-12 w-12" />}
      title={t('folderEmptyTitle')}
      description={t('folderEmptyDescription')}
      className={className}
    />
  );
}

/**
 * Uncategorized with items - prompt to organize
 *
 * Shown as a subtle prompt when user has uncategorized items.
 * Only appears when there are 3+ items to organize.
 */
export function UncategorizedPromptState({
  itemCount,
  onCreateFolder,
}: {
  itemCount: number;
  onCreateFolder?: () => void;
}) {
  const t = useTranslations('libraryEmptyStates');
  if (itemCount < 3) return null;

  return (
    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-cyan-100">{t('organizeTitle')}</p>
        <p className="text-sm text-cyan-100/70">
          {t('organizeDescription', { count: itemCount })}
        </p>
      </div>
      {onCreateFolder && (
        <Button variant="secondary" size="sm" onClick={onCreateFolder}>
          <FolderPlus className="h-4 w-4 mr-2" />
          {t('createFolder')}
        </Button>
      )}
    </div>
  );
}

/**
 * Empty trash
 *
 * Shown when the trash is empty.
 */
export function EmptyTrashState({ className }: { className?: string }) {
  const t = useTranslations('libraryEmptyStates');

  return (
    <BaseEmptyState
      icon={<Trash2 className="h-12 w-12" />}
      title={t('trashEmptyTitle')}
      description={t('trashEmptyDescription')}
      className={className}
    />
  );
}

/**
 * No search results
 *
 * Shown when a search returns no matching items.
 */
export function NoSearchResultsState({
  query,
  onClear,
  className,
}: {
  query: string;
  onClear: () => void;
  className?: string;
}) {
  const t = useTranslations('libraryEmptyStates');

  return (
    <BaseEmptyState
      icon={<Search className="h-12 w-12" />}
      title={t('noResultsTitle')}
      description={t('noResultsDescription', { query })}
      actions={
        <Button variant="secondary" size="sm" onClick={onClear}>
          {t('clearSearch')}
        </Button>
      }
      className={className}
    />
  );
}

/**
 * Empty discover (no public content)
 *
 * Shown when there's no public content to discover.
 */
export function EmptyDiscoverState({ className }: { className?: string }) {
  const t = useTranslations('libraryEmptyStates');

  return (
    <BaseEmptyState
      icon={<Globe className="h-12 w-12" />}
      title={t('discoverEmptyTitle')}
      description={t('discoverEmptyDescription')}
      className={className}
    />
  );
}

/**
 * Root view empty state
 *
 * Shown when the root library view has no content.
 */
export function EmptyRootState({
  onCreateFolder,
  onCreateWorkflow,
  className,
}: EmptyStateProps) {
  const t = useTranslations('libraryEmptyStates');

  return (
    <BaseEmptyState
      icon={
        <svg
          className="h-16 w-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      }
      title={t('rootEmptyTitle')}
      description={t('rootEmptyDescription')}
      actions={
        <>
          {onCreateFolder && (
            <Button variant="secondary" onClick={onCreateFolder}>
              <FolderPlus className="h-4 w-4 mr-2" />
              {t('createFolder')}
            </Button>
          )}
          {onCreateWorkflow && (
            <Button variant="primary" onClick={onCreateWorkflow}>
              <FilePlus className="h-4 w-4 mr-2" />
              {t('createWorkflow')}
            </Button>
          )}
        </>
      }
      className={className}
    />
  );
}

/**
 * Loading state
 *
 * Shown while content is loading.
 */
export function LoadingState({ className }: { className?: string }) {
  const t = useTranslations('common');

  return (
    <div className={cn('flex items-center justify-center py-20', className)}>
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
        <p className="text-sm text-cyan-100/60">{t('loading')}</p>
      </div>
    </div>
  );
}
