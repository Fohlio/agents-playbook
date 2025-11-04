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
      className={`cursor-pointer h-full ${className}`}
      data-testid={`mini-prompt-card-${miniPrompt.id}`}
    >
      <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex-1">
              {miniPrompt.name}
            </h3>
            <div className="flex items-center gap-2">
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
            <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
              {miniPrompt.description}
            </p>
          )}

          {/* Tags */}
          {miniPrompt.tags && miniPrompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {miniPrompt.tags.slice(0, 3).map((mt) => (
                <Badge key={mt.tag.id} variant="default">
                  {mt.tag.name}
                </Badge>
              ))}
              {miniPrompt.tags.length > 3 && (
                <Badge variant="default">+{miniPrompt.tags.length - 3}</Badge>
              )}
            </div>
          )}

          {/* Metadata */}
          {metadata && (
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-200">
              {metadata}
            </div>
          )}

          {/* Actions */}
          <div
            className="flex gap-2 mt-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        </div>
      </Card>
    </div>
  );
}
