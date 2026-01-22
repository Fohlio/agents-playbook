'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useWizardNavigation } from '../hooks/use-wizard-navigation';
import { WelcomeStep } from './WelcomeStep';
import { DiscoverStep } from './DiscoverStep';
import { LibraryStep } from './LibraryStep';
import { CreateWorkflowStep } from './CreateWorkflowStep';
import { MCPIntegrationStep } from './MCPIntegrationStep';
import { WorkflowCombinationsStep } from './WorkflowCombinationsStep';
import { ROUTES } from '@/shared/routes';

const TOTAL_STEPS = 6;

/**
 * Getting Started Wizard - Cyberpunk Style
 */
export function GettingStartedWizard() {
  const router = useRouter();
  const t = useTranslations('gettingStarted');
  const tWizard = useTranslations('gettingStartedWizard');
  const tCommon = useTranslations('common');
  const { currentStep, nextStep, prevStep, goToStep, progress, isFirstStep, isLastStep } =
    useWizardNavigation(TOTAL_STEPS);

  const handleFinish = () => {
    router.push(ROUTES.DASHBOARD);
  };

  const handleSkip = () => {
    router.push(ROUTES.DASHBOARD);
  };

  const stepLabels = [
    { label: tWizard('steps.init'), key: 'welcome', icon: '01' },
    { label: tWizard('steps.scan'), key: 'discover', icon: '02' },
    { label: tWizard('steps.vault'), key: 'library', icon: '03' },
    { label: tWizard('steps.build'), key: 'create', icon: '04' },
    { label: tWizard('steps.mcp'), key: 'mcp', icon: '05' },
    { label: tWizard('steps.sync'), key: 'combinations', icon: '06' },
  ];

  const steps = [
    <WelcomeStep key="welcome" />,
    <DiscoverStep key="discover" />,
    <LibraryStep key="library" />,
    <CreateWorkflowStep key="create" />,
    <MCPIntegrationStep key="mcp" />,
    <WorkflowCombinationsStep key="combinations" />,
  ];

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Scan lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
        animation: 'scanline 8s linear infinite'
      }}></div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">
            <span className="cyber-text-glitch" data-text={tWizard('title')} style={{ color: '#00ffff', textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff40' }}>
              {tWizard('title')}
            </span>
          </h1>
          <p className="text-cyan-100/60 font-mono text-sm uppercase tracking-wider">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {stepLabels.map((step, index) => (
              <button
                key={step.key}
                onClick={() => goToStep(index)}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  currentStep === index
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                    : index < currentStep
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                    : 'bg-[#0a0a0f]/50 text-cyan-100/40 border border-cyan-500/20 hover:border-cyan-500/40 hover:text-cyan-100/60'
                }`}
                style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
              >
                <span className="opacity-50 mr-1">{step.icon}.</span>
                {step.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1 bg-[#0a0a0f] border border-cyan-500/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 transition-all duration-500"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs font-mono text-cyan-100/50">
            <span>{tWizard('phase', { current: currentStep + 1, total: TOTAL_STEPS })}</span>
            <span>{tWizard('complete', { percent: Math.round(progress) })}</span>
          </div>
        </div>

        {/* Current Step */}
        <div 
          className="bg-[#0a0a0f]/80 backdrop-blur-sm border border-cyan-500/30 p-8 mb-6 min-h-[500px] relative"
          style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
        >
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-cyan-500/50"></div>
          <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-cyan-500/50"></div>
          
          {steps[currentStep]}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button 
            onClick={handleSkip}
            className="px-4 py-2 text-cyan-100/40 font-mono text-sm uppercase hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {tCommon('skip')} &gt;&gt;
          </button>

          <div className="flex gap-3">
            {!isFirstStep && (
              <button 
                onClick={prevStep}
                className="px-6 py-2.5 bg-transparent border border-cyan-500/50 text-cyan-400 font-mono uppercase tracking-wider text-sm hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer"
                style={{ clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)' }}
              >
                ← {tCommon('previous')}
              </button>
            )}

            {!isLastStep ? (
              <button 
                onClick={nextStep}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all cursor-pointer"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
              >
                {tCommon('next')} →
              </button>
            ) : (
              <button 
                onClick={handleFinish}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,0,0.4)] transition-all cursor-pointer"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
              >
                {tCommon('finish')} ✓
              </button>
            )}
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div
              key={index}
              className={`h-1 transition-all duration-300 ${
                index === currentStep
                  ? 'bg-cyan-400 w-8 shadow-[0_0_10px_rgba(0,255,255,0.5)]'
                  : index < currentStep
                  ? 'bg-green-400 w-2'
                  : 'bg-cyan-500/20 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
