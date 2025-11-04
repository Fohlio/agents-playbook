'use client';

import { Card } from '@/shared/ui/atoms/Card';
import { Tooltip } from '@/shared/ui/molecules';
import { cn } from '@/shared/lib/utils/cn';
import type { AutoPromptMetadata } from '@/lib/types/workflow-constructor-types';

interface AutoPromptCardProps {
  autoPrompt: AutoPromptMetadata;
  className?: string;
}

/**
 * AutoPromptCard displays an automatic mini-prompt that is auto-attached based on workflow/stage settings.
 * These prompts cannot be dragged or removed manually.
 */
export function AutoPromptCard({ autoPrompt, className }: AutoPromptCardProps) {
  const icon = autoPrompt.type === 'memory-board' ? '📋' : '🤖';
  const badgeText = autoPrompt.type === 'memory-board' ? 'Review' : 'Auto';
  const tooltipText =
    autoPrompt.type === 'memory-board'
      ? 'Memory Board: Auto-attached when "With Review" is enabled. Provides handoff context between stages.'
      : 'Multi-Agent Chat: Auto-attached when "Include Multi-Agent Chat" is enabled. Facilitates coordination between agents.';

  return (
    <Tooltip content={tooltipText}>
      <Card
        className={cn(
          'p-3 border-2 border-dashed relative',
          'bg-gray-50 border-gray-300',
          'opacity-80',
          className
        )}
        testId={`auto-prompt-${autoPrompt.id}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-label={autoPrompt.type}>
            {icon}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-gray-700">
                {autoPrompt.name}
              </h4>
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                {badgeText}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {autoPrompt.type === 'memory-board'
                ? 'Handoff memory board for stage review'
                : 'Internal agents coordination chat'}
            </p>
          </div>
          <div className="text-gray-400" title="Auto-attached (not draggable)">
            🔒
          </div>
        </div>
      </Card>
    </Tooltip>
  );
}
