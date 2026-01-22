'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/routes';

/**
 * Create Workflow Step - Cyberpunk Style
 */
export function CreateWorkflowStep() {
  const t = useTranslations('gettingStarted.createWorkflow');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-2" style={{ textShadow: '0 0 10px #00ffff40' }}>
          {t('title')}
        </h2>
        <p className="text-cyan-100/60 font-mono text-sm">
          {t('subtitle')}
        </p>
      </div>

      {/* Build steps */}
      <div className="bg-[#050508]/50 border border-cyan-500/30 p-6">
        <div className="space-y-4">
          <div className="bg-[#0a0a0f] border border-cyan-500/20 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
                01
              </div>
              <h4 className="font-mono text-cyan-400 uppercase tracking-wider text-sm">{t('step1Title')}</h4>
            </div>
            <p className="text-sm text-cyan-100/50 font-mono ml-11">
              {t('step1Desc')}
            </p>
          </div>

          <div className="flex justify-center">
            <span className="text-cyan-500/50 font-mono">│</span>
          </div>

          <div className="bg-[#0a0a0f] border border-pink-500/20 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-pink-500/20 border border-pink-500/50 flex items-center justify-center text-pink-400 font-mono font-bold text-sm">
                02
              </div>
              <h4 className="font-mono text-pink-400 uppercase tracking-wider text-sm">{t('step2Title')}</h4>
            </div>
            <p className="text-sm text-cyan-100/50 font-mono ml-11">
              {t('step2Desc')}
            </p>
          </div>

          <div className="flex justify-center">
            <span className="text-cyan-500/50 font-mono">│</span>
          </div>

          <div className="bg-[#0a0a0f] border border-green-500/20 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400 font-mono font-bold text-sm">
                03
              </div>
              <h4 className="font-mono text-green-400 uppercase tracking-wider text-sm">{t('step3Title')}</h4>
            </div>
            <p className="text-sm text-cyan-100/50 font-mono ml-11">
              {t('step3Desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Best practice */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h4 className="font-mono text-cyan-400 uppercase tracking-wider text-sm mb-1">{t('bestPractice')}</h4>
            <p className="text-xs text-cyan-100/50 font-mono">
              {t('bestPracticeDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Context Management */}
      <div className="bg-pink-500/10 border border-pink-500/30 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">📋</span>
          <div className="flex-1">
            <h4 className="font-mono text-pink-400 uppercase tracking-wider text-sm mb-2">{t('contextManagement')}</h4>
            <p className="text-xs text-cyan-100/50 font-mono mb-3">
              {t('contextManagementDesc')}
            </p>
            <div className="space-y-2">
              <div className="bg-[#050508]/50 p-2 text-xs font-mono">
                <span className="text-pink-400">{t('memoryBoard')}</span>
                <span className="text-cyan-100/40 ml-2">{t('memoryBoardDesc')}</span>
              </div>
              <div className="bg-[#050508]/50 p-2 text-xs font-mono">
                <span className="text-pink-400">{t('multiAgentChat')}</span>
                <span className="text-cyan-100/40 ml-2">{t('multiAgentChatDesc')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-cyan-500/10 border border-cyan-500/30 p-3">
          <p className="font-mono text-cyan-400 uppercase tracking-wider text-xs mb-1">✨ {t('realTimePreview')}</p>
          <p className="text-cyan-100/40 font-mono text-xs">{t('realTimePreviewDesc')}</p>
        </div>
        <div className="bg-pink-500/10 border border-pink-500/30 p-3">
          <p className="font-mono text-pink-400 uppercase tracking-wider text-xs mb-1">🎯 {t('smartValidation')}</p>
          <p className="text-cyan-100/40 font-mono text-xs">{t('smartValidationDesc')}</p>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="bg-purple-500/10 border border-purple-500/30 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">🤖</span>
          <div className="flex-1">
            <h4 className="font-mono text-purple-400 uppercase tracking-wider text-sm mb-2">{t('aiAssistant')}</h4>
            <p className="text-xs text-cyan-100/50 font-mono mb-3">
              {t('aiAssistantDesc')}
            </p>
            <div className="space-y-2">
              <div className="bg-[#050508]/50 p-2 text-xs font-mono">
                <span className="text-purple-400">{t('generateWorkflows')}</span>
                <span className="text-cyan-100/40 ml-2">{t('generateWorkflowsDesc')}</span>
              </div>
              <div className="bg-[#050508]/50 p-2 text-xs font-mono">
                <span className="text-purple-400">{t('createMiniPrompts')}</span>
                <span className="text-cyan-100/40 ml-2">{t('createMiniPromptsDesc')}</span>
              </div>
              <div className="bg-[#050508]/50 p-2 text-xs font-mono">
                <span className="text-purple-400">{t('getRecommendations')}</span>
                <span className="text-cyan-100/40 ml-2">{t('getRecommendationsDesc')}</span>
              </div>
            </div>
            <p className="text-xs text-purple-400/60 font-mono mt-3 italic">
              💡 {t('aiAssistantNote')}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#050508]/50 border border-cyan-500/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-mono text-cyan-400 uppercase tracking-wider">
              {t('tryConstructor')}
            </p>
            <p className="text-xs text-cyan-100/40 font-mono mt-1">
              {t('tryConstructorDesc')}
            </p>
          </div>
          <Link
            href={ROUTES.LIBRARY.WORKFLOWS.NEW}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all cursor-pointer"
            style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
          >
            {t('createWorkflowBtn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
