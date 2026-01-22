'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PROTECTED_ROUTES } from '@/shared/routes';

/**
 * Library Step - Cyberpunk Style
 */
export function LibraryStep() {
  const t = useTranslations('gettingStarted.library');

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

      <div className="grid md:grid-cols-2 gap-4">
        {/* Workflows Card */}
        <div 
          className="bg-[#050508]/50 border border-cyan-500/30 p-6 hover:border-cyan-400/50 transition-all"
          style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
              <span className="text-xl">🔄</span>
            </div>
            <h3 className="text-lg font-mono text-cyan-400 uppercase tracking-wider">{t('workflowsTitle')}</h3>
          </div>
          <p className="text-sm text-cyan-100/50 font-mono mb-4">
            {t('workflowsDesc')}
          </p>
          <ul className="space-y-2 text-sm text-cyan-100/60 font-mono">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>{t('workflowsFeature1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>{t('workflowsFeature2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>{t('workflowsFeature3')}</span>
            </li>
          </ul>
        </div>

        {/* Mini-Prompts Card */}
        <div 
          className="bg-[#050508]/50 border border-pink-500/30 p-6 hover:border-pink-400/50 transition-all"
          style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-pink-500/20 border border-pink-500/50 flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <h3 className="text-lg font-mono text-pink-400 uppercase tracking-wider">{t('miniPromptsTitle')}</h3>
          </div>
          <p className="text-sm text-cyan-100/50 font-mono mb-4">
            {t('miniPromptsDesc')}
          </p>
          <ul className="space-y-2 text-sm text-cyan-100/60 font-mono">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>{t('miniPromptsFeature1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>{t('miniPromptsFeature2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>{t('miniPromptsFeature3')}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Pro tip */}
      <div className="bg-purple-500/10 border border-purple-500/30 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-sm font-mono text-purple-400 uppercase tracking-wider mb-1">
              {t('proTip')}
            </p>
            <p className="text-xs text-cyan-100/50 font-mono">
              {t('proTipDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#050508]/50 border border-cyan-500/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-mono text-cyan-400 uppercase tracking-wider">
              {t('manageLibrary')}
            </p>
            <p className="text-xs text-cyan-100/40 font-mono mt-1">
              {t('manageLibraryDesc')}
            </p>
          </div>
          <Link
            href={PROTECTED_ROUTES.LIBRARY}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all cursor-pointer"
            style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
          >
            {t('goToLibrary')}
          </Link>
        </div>
      </div>
    </div>
  );
}
