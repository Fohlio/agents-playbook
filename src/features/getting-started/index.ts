/**
 * Getting Started Feature - Public API
 *
 * Exports main wizard component and utilities
 * Following FSD (Feature-Sliced Design) principles
 */

// Components
export { GettingStartedWizard } from './components/GettingStartedWizard';

// Hooks
export { useWizardNavigation } from './hooks/use-wizard-navigation';

// Types
export type { WizardNavigation, WizardNavigationState, WizardNavigationControls } from './types';
