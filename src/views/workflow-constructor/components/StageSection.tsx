'use client';

import { useTranslations } from 'next-intl';
import type { WorkflowStageWithMiniPrompts } from '@/shared/lib/types/workflow-constructor-types';
import { StageDropZone } from './StageDropZone';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface StageSectionProps {
  stage: WorkflowStageWithMiniPrompts;
  onRemoveStage: (stageId: string) => void;
  onRemoveMiniPrompt: (stageId: string, miniPromptId: string) => void;
  onDropMiniPrompts: (stageId: string, miniPromptIds: string[]) => void;
  onReorderItems?: (stageId: string, itemIds: string[]) => void;
  onEditStage?: (stageId: string) => void;
  onMiniPromptClick?: (miniPrompt: { id: string; name: string; description?: string | null; content: string }) => void;
}

export function StageSection({
  stage,
  onRemoveStage,
  onRemoveMiniPrompt,
  onDropMiniPrompts,
  onReorderItems,
  onEditStage,
  onMiniPromptClick,
}: StageSectionProps) {
  const t = useTranslations('stageSection');

  // Map stage color to neon accent
  const getAccentColor = (color: string | null) => {
    if (!color) return { border: 'border-cyan-500/30', text: 'text-cyan-400', bg: 'bg-cyan-500' };
    const c = color.toLowerCase();
    if (c.includes('blue') || c === '#3b82f6') return { border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500' };
    if (c.includes('green') || c === '#22c55e') return { border: 'border-green-500/30', text: 'text-green-400', bg: 'bg-green-500' };
    if (c.includes('purple') || c === '#a855f7') return { border: 'border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500' };
    if (c.includes('pink') || c === '#ec4899') return { border: 'border-pink-500/30', text: 'text-pink-400', bg: 'bg-pink-500' };
    if (c.includes('orange') || c === '#f97316') return { border: 'border-orange-500/30', text: 'text-orange-400', bg: 'bg-orange-500' };
    if (c.includes('yellow') || c === '#eab308') return { border: 'border-yellow-500/30', text: 'text-yellow-400', bg: 'bg-yellow-500' };
    return { border: 'border-cyan-500/30', text: 'text-cyan-400', bg: 'bg-cyan-500' };
  };

  const accent = getAccentColor(stage.color);

  return (
    <div 
      className={`mb-4 bg-[#0a0a0f]/80 backdrop-blur-sm border ${accent.border} p-6 relative`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
      data-testid={`stage-section-${stage.id}`}
    >
      {/* Corner accents */}
      <div className={`absolute top-0 right-0 w-4 h-4 border-t border-r ${accent.border}`}></div>
      <div className={`absolute bottom-0 left-0 w-4 h-4 border-b border-l ${accent.border}`}></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 ${accent.bg}`}
            style={{ 
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              boxShadow: `0 0 10px ${stage.color || '#00ffff'}` 
            }}
          />
          <div>
            <h3 className={`text-lg font-mono font-bold uppercase tracking-wider ${accent.text}`}>
              {stage.name}
            </h3>
            {stage.description && (
              <p className="text-sm text-cyan-100/50 font-mono">{stage.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEditStage && (
            <button
              onClick={() => onEditStage(stage.id)}
              className="p-2 bg-transparent border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer"
              data-testid={`edit-stage-${stage.id}`}
              title={t('editStageTooltip')}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </button>
          )}
          <button
            onClick={() => onRemoveStage(stage.id)}
            className="p-2 bg-transparent border border-pink-500/30 text-pink-400 hover:bg-pink-500/10 hover:border-pink-400 transition-all cursor-pointer"
            data-testid={`remove-stage-${stage.id}`}
            title={t('removeStageTooltip')}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>

      <StageDropZone
        stage={stage}
        onRemoveMiniPrompt={(miniPromptId) =>
          onRemoveMiniPrompt(stage.id, miniPromptId)
        }
        onDropMiniPrompts={onDropMiniPrompts}
        onReorderItems={onReorderItems}
        onMiniPromptClick={onMiniPromptClick}
        includeMultiAgentChat={stage.includeMultiAgentChat ?? false}
      />
    </div>
  );
}
