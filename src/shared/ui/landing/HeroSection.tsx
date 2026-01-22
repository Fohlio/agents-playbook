'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/routes';

function StatCounter({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center p-4 border border-cyan-500/30 bg-[#050508]/80 backdrop-blur-sm hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all duration-300">
      <div className="text-cyan-400 mb-2">{icon}</div>
      <div className="text-2xl lg:text-3xl font-bold cyber-text-cyan font-mono">{value}</div>
      <div className="text-xs text-cyan-400/60 uppercase tracking-wider font-mono">{label}</div>
    </div>
  );
}

export default function HeroSection() {
  const t = useTranslations('landing.hero');
  const tNav = useTranslations('nav');

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-[#050508]">
      {/* Circuit grid background */}
      <div className="absolute inset-0 cyber-circuit-bg pointer-events-none"></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full filter blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Scan lines overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.03)_2px,rgba(0,255,255,0.03)_4px)]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
        {/* Holographic Badge */}
        <div className="inline-flex items-center px-6 py-3 bg-[#050508]/80 backdrop-blur-sm border border-cyan-500/50 text-cyan-400 text-sm font-mono uppercase tracking-widest mb-10 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300">
          <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse shadow-[0_0_10px_#00ffff]"></span>
          <span className="mr-2">[</span>
          <span>{t('badge')}</span>
          <span className="ml-2">]</span>
        </div>

        {/* Main Heading with Glitch Effect */}
        <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black mb-8 leading-tight tracking-tight">
          <span 
            className="cyber-text-glitch block cyber-text-cyan cyber-glitch" 
            data-text={t('title1')}
          >
            {t('title1')}
          </span>
          <span 
            className="cyber-text-glitch block cyber-text-pink mt-2" 
            data-text={t('title2')}
          >
            {t('title2')}
          </span>
        </h1>

        {/* Terminal-style Subtitle */}
        <div className="max-w-4xl mx-auto mb-10">
          <p className="text-lg lg:text-xl text-cyan-100/80 leading-relaxed font-mono">
            <span className="text-cyan-400">&gt;</span> {t('subtitle')}
            <span className="inline-block w-2 h-5 bg-cyan-400 ml-1 animate-pulse"></span>
          </p>
        </div>

        {/* CTA Buttons - Cyberpunk Style */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href={ROUTES.DISCOVER}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all duration-300 clip-path-[polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]"
          >
            <span className="relative z-10">{t('ctaPrimary')} &gt;</span>
          </Link>
          <Link
            href={ROUTES.GETTING_STARTED}
            className="px-8 py-4 bg-transparent border-2 border-pink-500/70 text-pink-400 font-bold uppercase tracking-wider text-sm hover:bg-pink-500/10 hover:border-pink-400 hover:shadow-[0_0_20px_rgba(255,0,102,0.3)] transition-all duration-300 clip-path-[polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]"
          >
            &lt; {tNav('gettingStarted')}
          </Link>
        </div>

        {/* Stats Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16">
          <StatCounter
            value="99.7%"
            label={t('statAccuracy')}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCounter
            value={t('statWorkflowsValue')}
            label={t('statWorkflows')}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          />
          <StatCounter
            value="24/7"
            label={t('statRuntime')}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Value Propositions - Cyber Cards */}
        <div className="flex flex-wrap justify-center gap-4 lg:gap-6 mb-12 max-w-5xl mx-auto">
          <div className="group inline-flex items-center gap-3 px-5 py-3 bg-[#050508]/80 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all duration-300">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-cyan-100/80 font-medium text-sm uppercase tracking-wider">{t('value1')}</span>
          </div>
          <div className="group inline-flex items-center gap-3 px-5 py-3 bg-[#050508]/80 backdrop-blur-sm border border-pink-500/30 hover:border-pink-400/60 hover:shadow-[0_0_15px_rgba(255,0,102,0.2)] transition-all duration-300">
            <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-cyan-100/80 font-medium text-sm uppercase tracking-wider">{t('value2')}</span>
          </div>
          <div className="group inline-flex items-center gap-3 px-5 py-3 bg-[#050508]/80 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/60 hover:shadow-[0_0_15px_rgba(204,0,255,0.2)] transition-all duration-300">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-cyan-100/80 font-medium text-sm uppercase tracking-wider">{t('value3')}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-base lg:text-lg text-cyan-100/60 max-w-3xl mx-auto leading-relaxed">
          {t('description')}
        </p>
      </div>
    </section>
  );
}
