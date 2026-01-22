'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/routes';

/**
 * Discover Step - Cyberpunk Style
 */
export function DiscoverStep() {
  const t = useTranslations('gettingStarted.discover');

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

      <div className="bg-[#050508]/50 border border-cyan-500/30 p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div 
            className="flex-shrink-0 w-10 h-10 bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center font-mono font-bold text-cyan-400"
            style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          >
            01
          </div>
          <div>
            <h3 className="font-mono text-cyan-400 uppercase tracking-wider text-sm mb-1">{t('step1Title')}</h3>
            <p className="text-sm text-cyan-100/50 font-mono">
              {t('step1Desc')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div 
            className="flex-shrink-0 w-10 h-10 bg-pink-500/20 border border-pink-500/50 flex items-center justify-center font-mono font-bold text-pink-400"
            style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          >
            02
          </div>
          <div>
            <h3 className="font-mono text-pink-400 uppercase tracking-wider text-sm mb-1">{t('step2Title')}</h3>
            <p className="text-sm text-cyan-100/50 font-mono">
              {t('step2Desc')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div 
            className="flex-shrink-0 w-10 h-10 bg-green-500/20 border border-green-500/50 flex items-center justify-center font-mono font-bold text-green-400"
            style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          >
            03
          </div>
          <div>
            <h3 className="font-mono text-green-400 uppercase tracking-wider text-sm mb-1">{t('step3Title')}</h3>
            <p className="text-sm text-cyan-100/50 font-mono">
              {t('step3Desc')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#050508]/50 border border-cyan-500/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-mono text-cyan-400 uppercase tracking-wider">
              {t('readyToExplore')}
            </p>
            <p className="text-xs text-cyan-100/40 font-mono mt-1">
              {t('visitDiscover')}
            </p>
          </div>
          <Link
            href={ROUTES.DISCOVER}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all cursor-pointer"
            style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
          >
            {t('goToDiscover')}
          </Link>
        </div>
      </div>
    </div>
  );
}
