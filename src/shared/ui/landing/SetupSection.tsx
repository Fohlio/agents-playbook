'use client';

import { useTranslations } from 'next-intl';
import { USAGE_HINT_TEMPLATE } from '@/shared/lib/constants/usage-hint';

export default function SetupSection() {
  const t = useTranslations('landing.setup');

  const steps = [
    {
      number: "01",
      titleKey: "step1.title",
      descriptionKey: "step1.description",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      glowColor: 'cyan',
      codeBlocks: {
        cursor: `{
  "mcpServers": {
    "agents-playbook": {
      "url": "https://agents-playbook.com/api/v1/mcp",
      "description": "AI Agent Workflow Engine",
      "headers": {
        "Authorization": "Bearer your-api-token"
      }
    }
  }
}`
      }
    },
    {
      number: "02",
      titleKey: "step2.title",
      descriptionKey: "step2.description",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      glowColor: 'green',
      examples: [
        USAGE_HINT_TEMPLATE.replace('[workflow-name]', 'feature development workflow'),
      ]
    },
    {
      number: "03",
      titleKey: "step3.title",
      descriptionKey: "step3.description",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      glowColor: 'pink',
      exampleKeys: ['step3.example1', 'step3.example2', 'step3.example3']
    }
  ];

  const getGlowStyles = (color: string) => {
    const colors: Record<string, { border: string; text: string; bg: string }> = {
      cyan: { border: 'border-cyan-500/50', text: 'text-cyan-400', bg: 'bg-cyan-500' },
      pink: { border: 'border-pink-500/50', text: 'text-pink-400', bg: 'bg-pink-500' },
      green: { border: 'border-green-500/50', text: 'text-green-400', bg: 'bg-green-500' },
    };
    return colors[color] || colors.cyan;
  };

  return (
    <section className="py-24 bg-[#050508] relative overflow-hidden">
      {/* Circuit background */}
      <div className="absolute inset-0 cyber-circuit-bg opacity-30 pointer-events-none"></div>
      
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">
            <span className="cyber-text-cyan">QUICK</span>
            <span className="text-white mx-3">{'//'}</span>
            <span className="cyber-text-pink">SETUP</span>
          </h2>
          {/* Scanner underline */}
          <div className="relative w-48 h-0.5 mx-auto mb-8 bg-gradient-to-r from-transparent via-cyan-500 to-transparent overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-400 animate-pulse"></div>
          </div>
          <p className="text-lg text-cyan-100/60 max-w-2xl mx-auto font-mono">
            {t('subtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const styles = getGlowStyles(step.glowColor);
            return (
              <div 
                key={index}
                className="group relative"
              >
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute left-6 sm:left-8 top-24 w-px h-16 bg-gradient-to-b from-cyan-500/50 to-transparent"></div>
                )}

                <div className="flex items-start space-x-3 sm:space-x-6">
                  {/* Step number */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 ${styles.border} border bg-[#050508] flex items-center justify-center font-mono font-bold text-lg sm:text-xl ${styles.text} group-hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300`}
                      style={{
                        clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                      }}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 min-w-0 bg-[#0a0a0f]/80 backdrop-blur-sm p-4 sm:p-8 border ${styles.border} group-hover:border-opacity-100 group-hover:shadow-[0_0_30px_rgba(0,255,255,0.1)] transition-all duration-300`}
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
                    }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 ${styles.border} border bg-[#050508] flex items-center justify-center ${styles.text} flex-shrink-0`}>
                        {step.icon}
                      </div>
                      <h3 className="text-lg sm:text-2xl font-bold text-white">{t(step.titleKey)}</h3>
                    </div>

                    <p className="text-cyan-100/60 text-base sm:text-lg mb-6 leading-relaxed">
                      {t(step.descriptionKey)}
                    </p>

                    {/* Code blocks for step 1 */}
                    {step.codeBlocks && (
                      <div className="space-y-4">
                        <div className="bg-[#050508] border border-cyan-500/30 p-4 sm:p-6 overflow-x-auto">
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="w-3 h-3 bg-cyan-500 rounded-full flex-shrink-0 shadow-[0_0_10px_#00ffff]"></div>
                            <span className="text-cyan-400 font-mono text-sm sm:text-base uppercase tracking-wider">{t('step1.cursorLabel')}</span>
                          </div>
                          <pre className="text-green-400 text-xs sm:text-sm font-mono leading-relaxed overflow-x-auto">
                            <code className="block min-w-max">{step.codeBlocks.cursor}</code>
                          </pre>
                        </div>

                        {/* Info note */}
                        <div className="px-3 sm:px-4 py-3 bg-cyan-500/10 border border-cyan-500/30 text-xs sm:text-sm text-cyan-400">
                          <p className="font-mono uppercase tracking-wider">&gt; {t('step1.note')}</p>
                          <p className="mt-2 text-cyan-100/60 text-xs">
                            {t('step1.tokenNote')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Examples for step 2 */}
                    {step.examples && (
                      <div className="space-y-3">
                        {step.examples.map((example, exampleIndex) => (
                          <div
                            key={exampleIndex}
                            className="flex items-start space-x-3 p-3 sm:p-4 bg-[#050508] border border-green-500/30 hover:border-green-400/60 transition-colors"
                          >
                            <span className="text-green-400 font-mono">&gt;</span>
                            <span className="text-green-400 font-mono text-sm sm:text-base break-words">&quot;{example}&quot;</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Examples for step 3 with translation keys */}
                    {step.exampleKeys && (
                      <div className="space-y-3">
                        {step.exampleKeys.map((exampleKey, exampleIndex) => (
                          <div
                            key={exampleIndex}
                            className="flex items-start space-x-3 p-3 sm:p-4 bg-[#050508] border border-pink-500/30 hover:border-pink-400/60 transition-colors"
                          >
                            <span className="text-pink-400 font-mono">&gt;</span>
                            <span className="text-pink-400 font-mono text-sm sm:text-base break-words">&quot;{t(exampleKey)}&quot;</span>
                          </div>
                        ))}
                      </div>
                    )}
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
