'use client';

import { useTranslations } from 'next-intl';

/**
 * Workflow Combinations Step - Cyberpunk Style
 */
export function WorkflowCombinationsStep() {
  const t = useTranslations('gettingStarted.combinations');
  const tProcess = useTranslations('combinationsStep.processItems');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-2" style={{ textShadow: '0 0 10px #00ffff40' }}>
          🔗 {t('title')}
        </h2>
        <p className="text-cyan-100/60 font-mono text-sm">
          {t('subtitle')}
        </p>
      </div>

      {/* Main Example */}
      <div className="bg-[#050508]/50 border border-purple-500/30 p-6">
        <h3 className="text-lg font-mono text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>💡</span>
          <span>{t('exampleTitle')}</span>
        </h3>

        <div className="space-y-4">
          {/* Step 1: PRD Creation */}
          <div className="bg-[#0a0a0f] border-l-4 border-purple-500 p-5">
            <div className="flex items-start gap-4">
              <div 
                className="flex-shrink-0 w-10 h-10 bg-purple-500/20 border border-purple-500/50 flex items-center justify-center font-mono font-bold text-purple-400"
              >
                01
              </div>
              <div className="flex-1">
                <h4 className="font-mono text-purple-400 uppercase tracking-wider mb-2">
                  {t('step1Title')}
                </h4>
                <p className="text-cyan-100/50 font-mono text-sm mb-3">
                  {t('step1Desc')}
                </p>
                <div className="bg-purple-500/10 border border-purple-500/20 p-3 mb-3">
                  <p className="text-xs font-mono text-purple-400 uppercase mb-2">📋 {t('step1Creates')}</p>
                  <ul className="text-xs text-cyan-100/50 font-mono space-y-1">
                    <li>• <code className="bg-purple-500/20 px-1">.agents-playbook/[project]/prd.md</code></li>
                    <li>• <code className="bg-purple-500/20 px-1">.agents-playbook/[project]/requirements.md</code></li>
                    <li>• <code className="bg-purple-500/20 px-1">.agents-playbook/[project]/design.md</code></li>
                    <li>• <code className="bg-purple-500/20 px-1">.agents-playbook/[project]/design-system.md</code></li>
                    <li>• <code className="bg-purple-500/20 px-1">.agents-playbook/[project]/features/[feature].md</code></li>
                  </ul>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-2">
                  <p className="text-xs text-yellow-400 font-mono">
                    💡 {t('step1Tip')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="text-2xl text-cyan-500/50 font-mono">↓</div>
          </div>

          {/* Step 2: Feature Development */}
          <div className="bg-[#0a0a0f] border-l-4 border-cyan-500 p-5">
            <div className="flex items-start gap-4">
              <div 
                className="flex-shrink-0 w-10 h-10 bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center font-mono font-bold text-cyan-400"
              >
                02
              </div>
              <div className="flex-1">
                <h4 className="font-mono text-cyan-400 uppercase tracking-wider mb-2">
                  {t('step2Title')}
                </h4>
                <p className="text-cyan-100/50 font-mono text-sm mb-3">
                  {t('step2Desc')}
                </p>
                <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 mb-3">
                  <p className="text-xs font-mono text-cyan-400 uppercase mb-2">🎯 {t('step2Process')}</p>
                  <ul className="text-xs text-cyan-100/50 font-mono space-y-1">
                    <li>• {tProcess('item1')}</li>
                    <li>• {tProcess('item2')}</li>
                    <li>• {tProcess('item3')}</li>
                    <li>• {tProcess('item4')}</li>
                    <li>• {tProcess('item5')}</li>
                  </ul>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 p-2">
                  <p className="text-xs text-green-400 font-mono">
                    ✅ {t('step2Result')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why This Works */}
      <div className="bg-[#0a0a0f] border border-cyan-500/30 p-6">
        <h4 className="font-mono text-cyan-400 uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
          <span>🚀</span>
          <span>{t('whyWorksTitle')}</span>
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[#050508]/50 border border-cyan-500/20 p-4">
            <div className="text-2xl mb-2">📐</div>
            <h5 className="font-mono text-cyan-400 uppercase tracking-wider text-xs mb-2">{t('structuredPlanning')}</h5>
            <p className="text-xs text-cyan-100/40 font-mono">
              {t('structuredPlanningDesc')}
            </p>
          </div>
          <div className="bg-[#050508]/50 border border-pink-500/20 p-4">
            <div className="text-2xl mb-2">🎯</div>
            <h5 className="font-mono text-pink-400 uppercase tracking-wider text-xs mb-2">{t('focusedExecution')}</h5>
            <p className="text-xs text-cyan-100/40 font-mono">
              {t('focusedExecutionDesc')}
            </p>
          </div>
          <div className="bg-[#050508]/50 border border-green-500/20 p-4">
            <div className="text-2xl mb-2">✨</div>
            <h5 className="font-mono text-green-400 uppercase tracking-wider text-xs mb-2">{t('betterResults')}</h5>
            <p className="text-xs text-cyan-100/40 font-mono">
              {t('betterResultsDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💪</span>
          <div>
            <p className="font-mono text-cyan-400 uppercase tracking-wider text-sm mb-1">
              {t('readyToTry')}
            </p>
            <p className="text-xs text-cyan-100/50 font-mono mb-3">
              {t('readyToTryDesc')}
            </p>
            <div className="flex gap-2 items-center">
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 font-mono uppercase border border-purple-500/30">
                {t('prdCreation')}
              </span>
              <span className="text-cyan-500/50 font-mono">→</span>
              <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 font-mono uppercase border border-cyan-500/30">
                {t('featureDevelopment')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
