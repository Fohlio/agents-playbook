'use client';

import { useTranslations } from 'next-intl';
import { USAGE_HINT_TEMPLATE } from '@/shared/lib/constants/usage-hint';

export default function SetupSection() {
  const t = useTranslations('landing.setup');

  const steps = [
    {
      number: "1",
      titleKey: "step1.title",
      descriptionKey: "step1.description",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      gradient: "from-blue-500 to-purple-500",
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
      number: "2",
      titleKey: "step2.title",
      descriptionKey: "step2.description",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: "from-green-500 to-emerald-500",
      examples: [
        USAGE_HINT_TEMPLATE.replace('[workflow-name]', 'feature development workflow'),
      ]
    },
    {
      number: "3",
      titleKey: "step3.title",
      descriptionKey: "step3.description",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      gradient: "from-violet-500 to-fuchsia-500",
      exampleKeys: ['step3.example1', 'step3.example2', 'step3.example3']
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>

        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="group relative"
            >
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden sm:block absolute left-6 sm:left-8 top-20 w-0.5 h-16 bg-gradient-to-b from-slate-300 to-transparent"></div>
              )}

              <div className="flex items-start space-x-3 sm:space-x-6">
                {/* Step number circle */}
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${step.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {step.number}
                  </div>
                  {/* Glow effect */}
                  <div className={`absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${step.gradient} rounded-xl sm:rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 group-hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${step.gradient} rounded-lg sm:rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                      {step.icon}
                    </div>
                    <h3 className="text-lg sm:text-2xl font-bold text-slate-900">{t(step.titleKey)}</h3>
                  </div>

                  <p className="text-slate-600 text-base sm:text-lg mb-6 leading-relaxed">
                    {t(step.descriptionKey)}
                  </p>

                  {/* Code blocks for step 1 */}
                  {step.codeBlocks && (
                    <div className="space-y-4">
                      <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 overflow-x-auto border border-slate-200">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                          <span className="text-slate-300 font-medium text-sm sm:text-base">{t('step1.cursorLabel')}</span>
                        </div>
                        <pre className="text-slate-300 text-xs sm:text-sm font-mono leading-relaxed overflow-x-auto">
                          <code className="block min-w-max">{step.codeBlocks.cursor}</code>
                        </pre>
                      </div>

                      {/* Info note */}
                      <div className="px-3 sm:px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-xs sm:text-sm text-blue-800">
                        <p className="font-medium">💡 {t('step1.note')}</p>
                        <p className="mt-2 text-xs">
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
                          className="flex items-start space-x-3 p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50"
                        >
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0 mt-1.5"></div>
                          <span className="text-slate-700 font-medium text-sm sm:text-base break-words">&quot;{example}&quot;</span>
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
                          className="flex items-start space-x-3 p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50"
                        >
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0 mt-1.5"></div>
                          <span className="text-slate-700 font-medium text-sm sm:text-base break-words">&quot;{t(exampleKey)}&quot;</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
