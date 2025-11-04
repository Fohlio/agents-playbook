'use client';

import { Card, Badge } from '@/shared/ui/atoms';
import { ComplexityBadge } from '@/shared/ui/atoms/ComplexityBadge';
import { WorkflowComplexity } from '@prisma/client';
import { ReactNode } from 'react';

export interface WorkflowCardData {
  id: string;
  name: string;
  description: string | null;
  complexity?: WorkflowComplexity | null;
  visibility?: string;
  isSystemWorkflow?: boolean;
  isOwned?: boolean;
  tags?: Array<{ tag: { id: string; name: string; color: string | null } }>;
  _count?: { stages: number };
}

interface WorkflowCardProps {
  workflow: WorkflowCardData;
  metadata?: ReactNode;
  actions: ReactNode;
  onCardClick?: () => void;
  className?: string;
}

/**
 * WorkflowCard Component
 *
 * Unified workflow card component for Library and Discover sections
 * Displays workflow information with consistent layout and styling
 *
 * FSD Layer: Molecules
 * Imports: atoms (Card, Badge, ComplexityBadge)
 */
export function WorkflowCard({
  workflow,
  metadata,
  actions,
  onCardClick,
  className = ''
}: WorkflowCardProps) {
  return (
    <div
      onClick={onCardClick}
      className={`cursor-pointer h-full ${className}`}
      data-testid={`workflow-card-${workflow.id}`}
    >
      <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex-1">
              {workflow.name}
            </h3>
            <div className="flex items-center gap-2">
              {workflow.complexity && (
                <ComplexityBadge complexity={workflow.complexity} />
              )}
              {workflow.isSystemWorkflow && (
                <Badge variant="default">System</Badge>
              )}
              {!workflow.isOwned && (
                <Badge variant="default">Imported</Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {workflow.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
              {workflow.description}
            </p>
          )}

          {/* Tags */}
          {workflow.tags && workflow.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {workflow.tags.slice(0, 3).map((wt) => (
                <Badge key={wt.tag.id} variant="default">
                  {wt.tag.name}
                </Badge>
              ))}
              {workflow.tags.length > 3 && (
                <Badge variant="default">+{workflow.tags.length - 3}</Badge>
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
