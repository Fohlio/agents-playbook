'use client';

import { Card, Badge } from '@/shared/ui/atoms';
import { ReactNode } from 'react';

export interface MiniPromptCardData {
  id: string;
  name: string;
  description?: string | null;
  visibility?: string;
  isSystemMiniPrompt?: boolean;
  isOwned?: boolean;
  tags?: Array<{ tag: { id: string; name: string; color: string | null } }>;
}

interface MiniPromptCardProps {
  miniPrompt: MiniPromptCardData;
  metadata?: ReactNode;
  actions: ReactNode;
  onCardClick?: () => void;
  className?: string;
}

/**
 * MiniPromptCard Component
 *
 * Unified mini-prompt card component for Library and Discover sections
 * Displays mini-prompt information with consistent layout and styling
 *
 * FSD Layer: Molecules
 * Imports: atoms (Card, Badge)
 */
export function MiniPromptCard({
  miniPrompt,
  metadata,
  actions,
  onCardClick,
  className = ''
}: MiniPromptCardProps) {
  return (
    <div
      onClick={onCardClick}
      className={`cursor-pointer h-full touch-manipulation ${className}`}
      data-testid={`mini-prompt-card-${miniPrompt.id}`}
    >
      <Card className="hover:shadow-lg transition-shadow h-full flex flex-col active:scale-[0.98] sm:active:scale-100">
        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 line-clamp-2">
              {miniPrompt.name}
            </h3>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {miniPrompt.isSystemMiniPrompt && (
                <Badge variant="default">System</Badge>
              )}
              {!miniPrompt.isOwned && (
                <Badge variant="default">Imported</Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {miniPrompt.description && (
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-1">
              {miniPrompt.description}
            </p>
          )}

          {/* Tags */}
          {miniPrompt.tags && miniPrompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
              {miniPrompt.tags.slice(0, 2).map((mt) => (
                <Badge key={mt.tag.id} variant="default">
                  {mt.tag.name}
                </Badge>
              ))}
              {miniPrompt.tags.length > 2 && (
                <Badge variant="default">+{miniPrompt.tags.length - 2}</Badge>
              )}
            </div>
          )}

          {/* Metadata */}
          {metadata && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-200">
              {metadata}
            </div>
          )}

          {/* Actions */}
          <div
            className="flex flex-wrap gap-2 mt-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        </div>
      </Card>
    </div>
  );
}
