'use client';

import { useTranslations } from 'next-intl';

/**
 * Welcome Step - Cyberpunk Style
 */
export function WelcomeStep() {
  const t = useTranslations('gettingStarted.welcome');

  return (
    <div className="text-center space-y-6">
      {/* Logo */}
      <div className="flex justify-center">
        <div className="relative">
          <div 
            className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-pink-500 shadow-[0_0_30px_rgba(0,255,255,0.4)]"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#050508] font-bold text-2xl">AP</span>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold font-mono">
        <span className="text-cyan-400" style={{ textShadow: '0 0 10px #00ffff40' }}>
          {t('title')}
        </span>
      </h1>

      <p className="text-cyan-100/60 font-mono text-sm max-w-2xl mx-auto">
        {t('subtitle')}
      </p>

      {/* Feature cards */}
      <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
        <div 
          className="text-center p-4 bg-[#050508]/50 border border-cyan-500/30 hover:border-cyan-400/50 transition-all"
          style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
        >
          <div className="text-3xl mb-2 opacity-80">🎯</div>
          <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">{t('discoverWorkflows')}</p>
          <p className="text-xs text-cyan-100/40 font-mono">{t('discoverWorkflowsDesc')}</p>
        </div>
        <div 
          className="text-center p-4 bg-[#050508]/50 border border-pink-500/30 hover:border-pink-400/50 transition-all"
          style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
        >
          <div className="text-3xl mb-2 opacity-80">📚</div>
          <p className="text-xs font-mono text-pink-400 uppercase tracking-wider mb-1">{t('buildLibrary')}</p>
          <p className="text-xs text-cyan-100/40 font-mono">{t('buildLibraryDesc')}</p>
        </div>
        <div 
          className="text-center p-4 bg-[#050508]/50 border border-green-500/30 hover:border-green-400/50 transition-all"
          style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
        >
          <div className="text-3xl mb-2 opacity-80">🚀</div>
          <p className="text-xs font-mono text-green-400 uppercase tracking-wider mb-1">{t('integrateMcp')}</p>
          <p className="text-xs text-cyan-100/40 font-mono">{t('integrateMcpDesc')}</p>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 max-w-xl mx-auto">
        <p className="text-sm text-cyan-100/70 font-mono">
          <span className="text-cyan-400 font-bold">&gt; INFO:</span> <strong>{t('whyWorkflows')}</strong> {t('whyWorkflowsDesc')}
        </p>
      </div>
    </div>
  );
}
