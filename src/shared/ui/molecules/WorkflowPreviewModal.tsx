"use client";

import { Modal } from "@/shared/ui/atoms";
import { PublicWorkflowWithMeta } from "@/views/discover/types";
import { MarkdownContent } from "@/shared/ui/atoms/MarkdownContent";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface WorkflowPreviewModalProps {
  workflow: PublicWorkflowWithMeta;
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
  isAuthenticated: boolean;
  isImporting?: boolean;
  isOwnWorkflow?: boolean;
}

export function WorkflowPreviewModal({
  workflow,
  isOpen,
  onClose,
  onImport,
  isAuthenticated,
  isImporting,
  isOwnWorkflow,
}: WorkflowPreviewModalProps) {
  const t = useTranslations('workflowPreview');
  const tCommon = useTranslations('common');
  const [fullWorkflow, setFullWorkflow] = useState(workflow);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (isOpen && (!workflow.stages || workflow.stages.length === 0) && workflow._count.stages > 0) {
      setIsLoadingDetails(true);
      const endpoint = isAuthenticated 
        ? `/api/workflows/${workflow.id}/details`
        : `/api/public/workflows/${workflow.id}/details`;
      fetch(endpoint)
        .then(res => res.json())
        .then(data => {
          setFullWorkflow({ ...workflow, ...data });
          setIsLoadingDetails(false);
        })
        .catch(err => {
          console.error('Failed to fetch workflow details:', err);
          setIsLoadingDetails(false);
        });
    } else {
      setFullWorkflow(workflow);
    }
  }, [isOpen, workflow, isAuthenticated]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl"
      testId="fullWorkflow-preview-modal"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2" style={{ textShadow: '0 0 10px #00ffff40' }}>
              {fullWorkflow.name}
            </h2>
            <div className="flex items-center gap-4 text-sm font-mono text-cyan-100/50 flex-wrap">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-purple-400">@{fullWorkflow.user.username}</span>
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-green-400">{fullWorkflow._count.references}</span> {t('users')}
              </span>
              {fullWorkflow.averageRating && (
                <span className="px-2 py-0.5 text-xs font-mono bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                  ★ {fullWorkflow.averageRating.toFixed(1)}
                </span>
              )}
              {fullWorkflow.key && (
                <span className="px-2 py-0.5 text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {t('key')}: {fullWorkflow.key}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">{t('description')}</h3>
          <p className="text-cyan-100/60 font-mono text-sm leading-relaxed">
            {fullWorkflow.description || t('noDescription')}
          </p>
          {fullWorkflow.includeMultiAgentChat && (
            <div className="mt-3">
              <span className="px-2 py-1 text-xs font-mono bg-purple-500/20 text-purple-400 border border-purple-500/50">
                {t('multiAgentChat')}
              </span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-3">
            {t('stages')} ({fullWorkflow._count.stages})
          </h3>
          {isLoadingDetails ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
              <span className="text-sm font-mono text-cyan-100/40">{t('loadingStages')}</span>
            </div>
          ) : !fullWorkflow.stages || fullWorkflow.stages.length === 0 ? (
            <p className="text-sm font-mono text-cyan-100/40 italic">{t('noStages')}</p>
          ) : (
            <div className="space-y-4">
              {fullWorkflow.stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="p-5 bg-[#050508]/50 border border-l-4"
                  style={{ 
                    borderColor: `${stage.color || '#00ffff'}30`,
                    borderLeftColor: stage.color || '#00ffff',
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                  }}
                >
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-cyan-100/40 uppercase tracking-wide">
                        {t('stageNumber', { number: String(index + 1).padStart(2, '0') })}
                      </span>
                      {stage.withReview && (
                        <span className="px-2 py-0.5 text-xs font-mono bg-green-500/20 text-green-400 border border-green-500/50">
                          {t('withReview')}
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-mono font-bold text-cyan-100 mb-2">{stage.name}</h4>
                    {stage.description && (
                      <p className="text-sm font-mono text-cyan-100/50 leading-relaxed">{stage.description}</p>
                    )}
                  </div>

                  {stage.miniPrompts && stage.miniPrompts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-cyan-500/20">
                      <p className="text-xs font-mono text-pink-400 uppercase tracking-wide mb-3">
                        {t('miniPrompts')} ({stage.miniPrompts.length})
                      </p>
                      <div className="space-y-3">
                        {stage.miniPrompts.map((smp) => (
                          <div key={smp.miniPromptId} className="p-3 bg-[#0a0a0f]/50 border border-pink-500/30">
                            <h5 className="font-mono font-semibold text-sm text-pink-400 mb-1">
                              {smp.miniPrompt.name}
                            </h5>
                            <div className="text-xs text-cyan-100/50 font-mono leading-relaxed">
                              <MarkdownContent
                                content={smp.miniPrompt.content || t('noPromptText')}
                                className="prose prose-sm prose-invert max-w-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-cyan-500/20">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer"
          >
            {tCommon('close')}
          </button>
          {!isOwnWorkflow && (
            <button
              onClick={() => {
                onImport();
                onClose();
              }}
              disabled={fullWorkflow.isInUserLibrary || isImporting}
              className={`px-6 py-2.5 font-bold uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer ${
                fullWorkflow.isInUserLibrary
                  ? 'bg-transparent border border-green-500/50 text-green-400'
                  : 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]'
              }`}
              style={{ clipPath: fullWorkflow.isInUserLibrary ? undefined : 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              {fullWorkflow.isInUserLibrary
                ? t('inLibrary')
                : isAuthenticated
                  ? t('addToLibrary')
                  : t('loginToImport')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
