"use client";

import { useState } from 'react';

/**
 * Wizard Navigation Hook
 *
 * Manages multi-step wizard navigation state and controls
 *
 * @param totalSteps - Total number of steps in wizard
 * @returns Navigation state and control functions
 */
export function useWizardNavigation(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    progress,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
  };
}
