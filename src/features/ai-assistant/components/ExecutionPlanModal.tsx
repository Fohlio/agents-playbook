'use client';

import { useTranslations } from 'next-intl';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ExecutionPlan } from '@/types/ai-chat';

interface ExecutionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  executionPlan: ExecutionPlan | null;
}

export function ExecutionPlanModal({
  isOpen,
  onClose,
  onApprove,
  executionPlan,
}: ExecutionPlanModalProps) {
  const t = useTranslations('aiAssistant.executionPlan');
  const tCommon = useTranslations('common');

  if (!isOpen || !executionPlan) return null;

  return (
    <div className="fixed inset-0 bg-[#050508]/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-[#0a0a0f] border border-yellow-500/30 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-[0_0_30px_rgba(234,179,8,0.1)]"
        style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-yellow-500/20">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <h2 className="text-lg font-mono font-bold text-yellow-400 uppercase tracking-wider" style={{ textShadow: '0 0 10px #eab30840' }}>
              {t('title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all cursor-pointer"
            aria-label={tCommon('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-cyan-100/60 font-mono mb-4">
            {t('description')}
          </p>

          {/* Summary */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 mb-4">
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">{t('summary')}</h3>
            <p className="text-sm text-cyan-100/80 font-mono">{executionPlan.summary}</p>
          </div>

          {/* Execution Items */}
          <div className="space-y-3">
            {executionPlan.items.map((item, index) => (
              <div
                key={index}
                className="border border-cyan-500/20 bg-[#050508]/50 p-4 hover:border-cyan-500/40 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-mono font-medium text-cyan-400 mb-1 uppercase">
                      {item.toolName}
                    </h4>
                    <p className="text-sm text-cyan-100/60 font-mono">{item.description}</p>

                    {/* Show tool data details */}
                    {item.data.workflow && (
                      <div className="mt-2 p-2 bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-100/50 font-mono">
                        <span className="text-cyan-400">{t('workflow')}:</span> {item.data.workflow.name}
                        {item.data.workflow.stages && (
                          <span className="ml-2 text-green-400">
                            ({t('stageCount', { count: item.data.workflow.stages.length })})
                          </span>
                        )}
                      </div>
                    )}

                    {item.data.stage && (
                      <div className="mt-2 p-2 bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-100/50 font-mono">
                        <span className="text-cyan-400">{t('stage')}:</span> {item.data.stage.name}
                        {item.data.stage.position !== undefined && (
                          <span className="ml-2 text-purple-400">
                            ({t('position')}: {item.data.stage.position})
                          </span>
                        )}
                      </div>
                    )}

                    {item.data.miniPrompt && (
                      <div className="mt-2 p-2 bg-pink-500/5 border border-pink-500/20 text-xs text-cyan-100/50 font-mono">
                        <span className="text-pink-400">{t('miniPrompt')}:</span> {item.data.miniPrompt.name}
                      </div>
                    )}

                    {item.data.stageIndex !== undefined && (
                      <div className="mt-2 p-2 bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-100/50 font-mono">
                        <span className="text-cyan-400">{t('stageIndex')}:</span> {item.data.stageIndex}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Warning */}
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-sm text-yellow-400 font-mono">
              <span className="font-bold">&gt; WARNING:</span> {t('warning')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-yellow-500/20">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer"
          >
            {tCommon('cancel')}
          </button>
          <button
            onClick={() => {
              onApprove();
              onClose();
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,0,0.4)] transition-all flex items-center gap-2 cursor-pointer"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('approveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}
