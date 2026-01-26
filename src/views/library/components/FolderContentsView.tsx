'use client';

import React, { MouseEvent, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Zap } from 'lucide-react';
import { FolderCard } from './FolderCard';
import { LibraryItemCard } from './LibraryItemCard';
import { EmptyState, EmptyStateIcons } from '@/shared/ui/molecules/EmptyState';
import { CardActionsMenu } from '@/shared/ui/molecules/CardActionsMenu';
import { ShareModal } from '@/features/sharing/components/ShareModal';
import { WorkflowWithMeta, SkillWithFolderMeta, FolderWithItems } from '@/server/folders/types';
import { LibraryView } from '../hooks/useLibraryNavigation';
import { useCardActions, CardItem } from '../hooks/useCardActions';
import { cn } from '@/shared/lib/utils/cn';

export interface LibraryItem {
  id: string;
  type: 'folder' | 'workflow' | 'skill';
  name: string;
  description: string | null;
}

/** Filter items by name or description matching search query */
function filterBySearch<T extends { name: string; description?: string | null }>(
  items: T[],
  query: string
): T[] {
  if (!query) return items;
  const lowerQuery = query.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery)
  );
}

interface FolderContentsViewProps {
  view: LibraryView;
  viewMode?: 'grid' | 'list';
  folders: FolderWithItems[];
  workflows: WorkflowWithMeta[];
  skills: SkillWithFolderMeta[];
  searchQuery: string;
  selectedIds: Set<string>;
  onSelectItem: (id: string, type: 'folder' | 'workflow' | 'skill', event: MouseEvent) => void;
  onOpenFolder: (folderId: string) => void;
  onOpenWorkflow: (workflowId: string) => void;
  onOpenSkill: (skillId: string) => void;
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
  skills,
  searchQuery,
  selectedIds,
  onSelectItem,
  onOpenFolder,
  onOpenWorkflow,
  onOpenSkill,
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

  // Card actions hook
  const {
    isDuplicating,
    isDeleting,
    duplicate,
    deleteItem,
    toggleActive,
    toggleVisibility,
    shareModalItem,
    openShareModal,
    closeShareModal,
  } = useCardActions();

  const filteredFolders = useMemo(() => filterBySearch(folders, searchQuery), [folders, searchQuery]);
  const filteredWorkflows = useMemo(() => filterBySearch(workflows, searchQuery), [workflows, searchQuery]);
  const filteredSkills = useMemo(() => filterBySearch(skills, searchQuery), [skills, searchQuery]);

  // Helper to create CardItem from workflow or skill
  const toCardItem = useCallback((
    item: WorkflowWithMeta | SkillWithFolderMeta,
    type: 'workflow' | 'skill'
  ): CardItem => ({
    id: item.id,
    type,
    name: item.name,
    isActive: item.isActive,
    visibility: item.visibility,
  }), []);

  // Render card actions menu for an item
  const renderActionsMenu = useCallback((
    cardItem: CardItem,
    onEdit: () => void
  ) => (
    <CardActionsMenu
      isActive={cardItem.isActive}
      isPublic={cardItem.visibility === 'PUBLIC'}
      onToggleActive={(checked) => toggleActive(cardItem, checked)}
      onTogglePublic={(checked) => toggleVisibility(cardItem, checked ? 'PUBLIC' : 'PRIVATE')}
      onShare={() => openShareModal(cardItem)}
      onEdit={onEdit}
      onDuplicate={() => duplicate(cardItem)}
      onRemove={() => deleteItem(cardItem)}
      showActive
      showPublic
      showShare
      showEdit
      showDuplicate
      showRemove
      isDuplicating={isDuplicating}
      isRemoving={isDeleting}
      isOwned
      testId={`${cardItem.type}-${cardItem.id}`}
    />
  ), [toggleActive, toggleVisibility, openShareModal, duplicate, deleteItem, isDuplicating, isDeleting]);

  const isEmpty =
    filteredFolders.length === 0 &&
    filteredWorkflows.length === 0 &&
    filteredSkills.length === 0;

  const hasContent =
    folders.length > 0 || workflows.length > 0 || skills.length > 0;

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
    <>
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
                actionsMenu={renderActionsMenu(
                  toCardItem(workflow, 'workflow'),
                  () => onOpenWorkflow(workflow.id)
                )}
              />
            ))}
            </div>
          </section>
        )}

        {/* Skills section */}
        {filteredSkills.length > 0 && (
          <section aria-labelledby="skills-heading">
            <h3 id="skills-heading" className="text-xs font-mono text-cyan-500/70 uppercase tracking-wider mb-3">
              {'//'} SKILLS [{filteredSkills.length}]
            </h3>
            <div
              className={viewMode === 'grid' ? gridLayoutClass : listLayoutClass}
              role="list"
              aria-label="Skills"
            >
              {filteredSkills.map((skill) => (
              <SkillItemCard
                key={skill.id}
                skill={skill}
                isSelected={selectedIds.has(skill.id)}
                onSelect={(e) => onSelectItem(skill.id, 'skill', e)}
                onOpen={() => onOpenSkill(skill.id)}
                viewMode={viewMode}
                actionsMenu={renderActionsMenu(
                  toCardItem(skill, 'skill'),
                  () => onOpenSkill(skill.id)
                )}
              />
            ))}
            </div>
          </section>
        )}
      </div>

      {/* Share Modal */}
      {shareModalItem && (
        <ShareModal
          isOpen={true}
          onClose={closeShareModal}
          targetType={shareModalItem.type === 'workflow' ? 'WORKFLOW' : 'SKILL'}
          targetId={shareModalItem.id}
          targetName={shareModalItem.name}
        />
      )}
    </>
  );
}

// Workflow icon component
const WorkflowIcon = ({ size = 'md' }: { size?: 'sm' | 'md' }) => (
  <svg
    className={size === 'sm' ? 'w-5 h-5 text-cyan-400' : 'w-8 h-8 text-cyan-400'}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);

// Cyberpunk Workflow Card
interface WorkflowItemCardProps {
  workflow: WorkflowWithMeta;
  isSelected: boolean;
  onSelect: (e: MouseEvent) => void;
  onOpen: () => void;
  viewMode?: 'grid' | 'list';
  actionsMenu?: React.ReactNode;
}

function WorkflowItemCard({ workflow, isSelected, onSelect, onOpen, viewMode = 'grid', actionsMenu }: WorkflowItemCardProps) {
  return (
    <LibraryItemCard
      id={workflow.id}
      name={workflow.name}
      description={workflow.description}
      isSelected={isSelected}
      onSelect={onSelect}
      onOpen={onOpen}
      viewMode={viewMode}
      testIdPrefix="workflow"
      ariaLabel={`${workflow.name} workflow, ${workflow._count.stages} stages, by ${workflow.user.username}`}
      icon={<WorkflowIcon size={viewMode === 'list' ? 'sm' : 'md'} />}
      actionsMenu={actionsMenu}
      metaInfo={
        <>
          <span className="text-cyan-400">{workflow._count.stages} stages</span>
          <span className="text-cyan-500/30">|</span>
          <span className="text-cyan-100/50 font-mono">{workflow.user.username}</span>
        </>
      }
    />
  );
}

// Cyberpunk Skill Card
interface SkillItemCardProps {
  skill: SkillWithFolderMeta;
  isSelected: boolean;
  onSelect: (e: MouseEvent) => void;
  onOpen: () => void;
  viewMode?: 'grid' | 'list';
  actionsMenu?: React.ReactNode;
}

function SkillItemCard({ skill, isSelected, onSelect, onOpen, viewMode = 'grid', actionsMenu }: SkillItemCardProps) {
  return (
    <LibraryItemCard
      id={skill.id}
      name={skill.name}
      description={skill.description}
      isSelected={isSelected}
      onSelect={onSelect}
      onOpen={onOpen}
      viewMode={viewMode}
      testIdPrefix="skill"
      ariaLabel={`${skill.name} skill, by ${skill.user.username}`}
      icon={<Zap className={viewMode === 'list' ? 'w-5 h-5 text-cyan-400' : 'w-8 h-8 text-cyan-400'} aria-hidden="true" />}
      badge={<span className="px-2 py-0.5 font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">SKILL</span>}
      actionsMenu={actionsMenu}
      metaInfo={
        <>
          <span className="text-cyan-400">{skill.attachmentCount} files</span>
          <span className="text-cyan-500/30">|</span>
          <span className="text-cyan-100/50 font-mono">{skill.user.username}</span>
        </>
      }
    />
  );
}
