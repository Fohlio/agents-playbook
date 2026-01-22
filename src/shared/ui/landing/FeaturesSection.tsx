"use client";

import { useTranslations } from "next-intl";
import { useScrollAnimation } from "@/shared/hooks/use-scroll-animation";

export default function FeaturesSection() {
  const t = useTranslations('landing.features');
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      fileName: 'COMPLEX_TASKS.exe',
      titleKey: 'complexTasks.title',
      descriptionKey: 'complexTasks.description',
      audienceKey: 'complexTasks.audience',
      glowColor: 'cyan',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      fileName: 'CODEBASE_NAV.sys',
      titleKey: 'bigCodebases.title',
      descriptionKey: 'bigCodebases.description',
      audienceKey: 'bigCodebases.audience',
      glowColor: 'pink',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      fileName: 'TEAM_SYNC.dll',
      titleKey: 'teamWorkflows.title',
      descriptionKey: 'teamWorkflows.description',
      audienceKey: 'teamWorkflows.audience',
      glowColor: 'purple',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      fileName: 'LIBRARY.db',
      titleKey: 'personalLibrary.title',
      descriptionKey: 'personalLibrary.description',
      audienceKey: 'personalLibrary.audience',
      glowColor: 'cyan',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      fileName: 'ANTI_HALLUCINATION.ai',
      titleKey: 'reduceHallucinations.title',
      descriptionKey: 'reduceHallucinations.description',
      audienceKey: 'reduceHallucinations.audience',
      glowColor: 'green',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
      fileName: 'MCP_INTEGRATION.api',
      titleKey: 'mcpIntegration.title',
      descriptionKey: 'mcpIntegration.description',
      audienceKey: 'mcpIntegration.audience',
      glowColor: 'pink',
    }
  ];

  const getGlowStyles = (color: string) => {
    const colors: Record<string, { border: string; shadow: string; text: string; icon: string }> = {
      cyan: {
        border: 'border-cyan-500/30 hover:border-cyan-400/70',
        shadow: 'hover:shadow-[0_0_30px_rgba(0,255,255,0.3)]',
        text: 'text-cyan-400',
        icon: 'text-cyan-400 group-hover:text-cyan-300',
      },
      pink: {
        border: 'border-pink-500/30 hover:border-pink-400/70',
        shadow: 'hover:shadow-[0_0_30px_rgba(255,0,102,0.3)]',
        text: 'text-pink-400',
        icon: 'text-pink-400 group-hover:text-pink-300',
      },
      purple: {
        border: 'border-purple-500/30 hover:border-purple-400/70',
        shadow: 'hover:shadow-[0_0_30px_rgba(204,0,255,0.3)]',
        text: 'text-purple-400',
        icon: 'text-purple-400 group-hover:text-purple-300',
      },
      green: {
        border: 'border-green-500/30 hover:border-green-400/70',
        shadow: 'hover:shadow-[0_0_30px_rgba(0,255,102,0.3)]',
        text: 'text-green-400',
        icon: 'text-green-400 group-hover:text-green-300',
      },
    };
    return colors[color] || colors.cyan;
  };

  return (
    <section className="py-24 bg-[#050508] border-t border-b border-cyan-500/20 relative overflow-hidden">
      {/* Circuit background */}
      <div className="absolute inset-0 cyber-circuit-bg opacity-50 pointer-events-none"></div>
      
      {/* Animated glow orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-20 ${
            headerVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">
            <span className="cyber-text-cyan">SYSTEM</span>
            <span className="text-white mx-3">{'//'}</span>
            <span className="cyber-text-pink">CAPABILITIES</span>
          </h2>
          {/* Scanner underline */}
          <div className="relative w-64 h-0.5 mx-auto mb-8 bg-gradient-to-r from-transparent via-cyan-500 to-transparent overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-400 animate-pulse"></div>
          </div>
          <p className="text-lg text-cyan-100/60 max-w-3xl mx-auto font-mono">
            {t('subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const styles = getGlowStyles(feature.glowColor);
            return (
              <div
                key={index}
                className={`group relative bg-[#0a0a0f]/80 backdrop-blur-sm p-6 transition-all duration-500 hover:-translate-y-2 border ${styles.border} ${styles.shadow} ${
                  gridVisible
                    ? `animate-fade-in-up animation-delay-${(index % 3) * 100 + 100}`
                    : "opacity-0"
                }`}
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
                }}
              >
                {/* Inner circuit pattern */}
                <div className="absolute inset-0 cyber-circuit-bg opacity-20 pointer-events-none"></div>
                
                {/* Corner accent */}
                <div className={`absolute top-0 right-0 w-5 h-5 border-t border-r ${styles.border.split(' ')[0]}`}></div>
                <div className={`absolute bottom-0 left-0 w-5 h-5 border-b border-l ${styles.border.split(' ')[0]}`}></div>

                {/* File name header */}
                <div className="relative flex items-center justify-between mb-4">
                  <span className={`font-mono text-xs uppercase tracking-wider ${styles.text}`}>
                    {feature.fileName}
                  </span>
                  <span className="font-mono text-xs text-cyan-500/40">
                    [{String(index + 1).padStart(2, '0')}]
                  </span>
                </div>

                {/* Audience Badge */}
                <div className="relative mb-4">
                  <span className={`inline-block px-3 py-1 text-xs font-mono uppercase tracking-wider bg-[#050508] border ${styles.border.split(' ')[0]} ${styles.text}`}>
                    {t(feature.audienceKey)}
                  </span>
                </div>

                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`w-14 h-14 border ${styles.border.split(' ')[0]} bg-[#050508] flex items-center justify-center ${styles.icon} group-hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all duration-300`}
                    style={{
                      clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                    }}
                  >
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-100 transition-colors duration-300">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-cyan-100/50 text-sm leading-relaxed group-hover:text-cyan-100/70 transition-colors duration-300">
                  {t(feature.descriptionKey)}
                </p>

                {/* Bottom status line */}
                <div className="mt-6 pt-4 border-t border-cyan-500/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-500/40">{t('status')}</span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_#00ff66]"></span>
                    <span className="text-xs font-mono text-green-400">{t('active')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
