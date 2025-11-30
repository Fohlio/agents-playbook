/**
 * Getting Started Feature Types
 *
 * Type definitions for wizard navigation and steps
 */

export interface WizardNavigationState {
  currentStep: number;
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface WizardNavigationControls {
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
}

export type WizardNavigation = WizardNavigationState & WizardNavigationControls;
