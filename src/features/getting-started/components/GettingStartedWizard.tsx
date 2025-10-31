'use client';

import { useRouter } from 'next/navigation';
import { useWizardNavigation } from '../hooks/use-wizard-navigation';
import { WelcomeStep } from './WelcomeStep';
import { DiscoverStep } from './DiscoverStep';
import { LibraryStep } from './LibraryStep';
import { CreateWorkflowStep } from './CreateWorkflowStep';
import { MCPIntegrationStep } from './MCPIntegrationStep';
import { DocsStep } from './DocsStep';
import Button from '@/shared/ui/atoms/Button';
import { ROUTES } from '@/shared/routes';

const TOTAL_STEPS = 6;

/**
 * Getting Started Wizard
 *
 * Multi-step onboarding wizard for new users
 * Guides through platform features:
 * 1. Welcome
 * 2. Discover Workflows
 * 3. Library Management
 * 4. Workflow Creation
 * 5. MCP Integration
 * 6. Documentation
 */
export function GettingStartedWizard() {
  const router = useRouter();
  const { currentStep, nextStep, prevStep, goToStep, progress, isFirstStep, isLastStep } =
    useWizardNavigation(TOTAL_STEPS);

  const handleFinish = () => {
    router.push(ROUTES.DASHBOARD);
  };

  const handleSkip = () => {
    router.push(ROUTES.DASHBOARD);
  };

  const stepLabels = [
    { label: '🎉 Welcome', key: 'welcome' },
    { label: '🔍 Discover', key: 'discover' },
    { label: '📚 Library', key: 'library' },
    { label: '🏗️ Create', key: 'create' },
    { label: '🔌 MCP', key: 'mcp' },
    { label: '📖 Docs', key: 'docs' },
  ];

  const steps = [
    <WelcomeStep key="welcome" />,
    <DiscoverStep key="discover" />,
    <LibraryStep key="library" />,
    <CreateWorkflowStep key="create" />,
    <MCPIntegrationStep key="mcp" />,
    <DocsStep key="docs" />,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Getting Started</h1>
          <p className="text-gray-600 mt-2">Learn the platform in 6 quick steps</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {stepLabels.map((step, index) => (
              <button
                key={step.key}
                onClick={() => goToStep(index)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                  currentStep === index
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : index < currentStep
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Step {currentStep + 1} of {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-6 min-h-[500px]">
          {steps[currentStep]}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={handleSkip} size="md">
            Skip Tutorial
          </Button>

          <div className="flex gap-3">
            {!isFirstStep && (
              <Button variant="secondary" onClick={prevStep} size="md">
                ← Previous
              </Button>
            )}

            {!isLastStep ? (
              <Button variant="primary" onClick={nextStep} size="md">
                Next →
              </Button>
            ) : (
              <Button variant="primary" onClick={handleFinish} size="md">
                Get Started! 🚀
              </Button>
            )}
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentStep
                  ? 'bg-blue-600 w-8'
                  : index < currentStep
                  ? 'bg-blue-400'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
