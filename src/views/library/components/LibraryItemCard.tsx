'use client';

import { useState, MouseEvent, KeyboardEvent, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils/cn';

interface LibraryItemCardProps {
  id: string;
  name: string;
  description?: string | null;
  isSelected: boolean;
  onSelect: (e: MouseEvent) => void;
  onOpen: () => void;
  viewMode?: 'grid' | 'list';
  testIdPrefix: string;
  ariaLabel: string;
  icon: ReactNode;
  badge?: ReactNode;
  metaInfo: ReactNode;
  actionsMenu?: ReactNode;
}

/**
 * LibraryItemCard - Generic Cyberpunk Card Component
 *
 * Reusable card component for workflows and skills in the library view.
 * Supports both grid and list view modes with consistent styling.
 */
export function LibraryItemCard({
  id,
  name,
  description,
  isSelected,
  onSelect,
  onOpen,
  viewMode = 'grid',
  testIdPrefix,
  ariaLabel,
  icon,
  badge,
  metaInfo,
  actionsMenu,
}: LibraryItemCardProps) {
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

  const checkboxElement = (
    <input
      type="checkbox"
      checked={isSelected}
      onChange={() => {}}
      className="w-4 h-4 bg-transparent border-2 border-cyan-500/50 text-cyan-500 focus:ring-cyan-500/50"
      onClick={(e) => e.stopPropagation()}
      tabIndex={-1}
      aria-hidden="true"
    />
  );

  const titleButton = (
    <button
      data-title
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      className="font-mono text-cyan-100 hover:text-cyan-400 transition-colors focus:outline-none text-left"
      tabIndex={-1}
    >
      {name}
    </button>
  );

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
        data-testid={`${testIdPrefix}-card-${id}`}
        role="listitem"
        tabIndex={0}
        aria-label={`${ariaLabel}${isSelected ? ', selected' : ''}`}
      >
        <div className={cn('transition-opacity', isSelected || isHovered ? 'opacity-100' : 'opacity-0')}>
          {checkboxElement}
        </div>

        <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 flex-shrink-0">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          {titleButton}
          {description && (
            <p className="text-xs text-cyan-100/40 truncate mt-0.5 font-mono">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs flex-shrink-0">
          {badge}
          {metaInfo}
        </div>

        {/* Actions menu */}
        {actionsMenu && (
          <div
            className={cn(
              'ml-2 transition-opacity',
              isSelected || isHovered ? 'opacity-100' : 'opacity-0'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {actionsMenu}
          </div>
        )}
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
      data-testid={`${testIdPrefix}-card-${id}`}
      role="listitem"
      tabIndex={0}
      aria-label={`${ariaLabel}${isSelected ? ', selected' : ''}`}
    >
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/50" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500/50" />

      <div
        className={cn(
          'absolute top-3 left-3 transition-opacity',
          isSelected || isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        {checkboxElement}
      </div>

      {/* Actions menu - top right */}
      {actionsMenu && (
        <div
          className={cn(
            'absolute top-3 right-3 transition-opacity',
            isSelected || isHovered ? 'opacity-100' : 'opacity-0'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {actionsMenu}
        </div>
      )}

      <div className="flex justify-center mb-3 mt-4">
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30">
          {icon}
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
        {name}
      </button>

      <div className="flex items-center justify-center gap-2 mt-2 text-xs font-mono">
        {badge}
        {metaInfo}
      </div>

      {description && (
        <p className="mt-2 text-xs text-cyan-100/30 text-center line-clamp-2 font-mono">
          {description}
        </p>
      )}
    </div>
  );
}
