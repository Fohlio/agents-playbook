import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickActions } from '../QuickActions';
import { ROUTES } from '@/shared/routes';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('QuickActions', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders all three action buttons', () => {
    render(<QuickActions />);

    expect(screen.getByTestId('create-workflow-button')).toBeInTheDocument();
    expect(screen.getByTestId('create-mini-prompt-button')).toBeInTheDocument();
    expect(screen.getByTestId('discover-button')).toBeInTheDocument();
  });

  it('displays correct button labels', () => {
    render(<QuickActions />);

    expect(screen.getByText('Create Workflow')).toBeInTheDocument();
    expect(screen.getByText('Create Mini-Prompt')).toBeInTheDocument();
    expect(screen.getByText('Discover Public')).toBeInTheDocument();
  });

  describe('Navigation', () => {
    it('navigates to workflow creation page when Create Workflow clicked', () => {
      render(<QuickActions />);

      const createWorkflowButton = screen.getByTestId('create-workflow-button');
      fireEvent.click(createWorkflowButton);

      expect(mockPush).toHaveBeenCalledWith(ROUTES.WORKFLOWS.NEW);
    });

    it('navigates to mini-prompt creation page when Create Mini-Prompt clicked', () => {
      render(<QuickActions />);

      const createMiniPromptButton = screen.getByTestId('create-mini-prompt-button');
      fireEvent.click(createMiniPromptButton);

      expect(mockPush).toHaveBeenCalledWith(ROUTES.MINI_PROMPTS.NEW);
    });

    it('navigates to discover page when Discover Public clicked', () => {
      render(<QuickActions />);

      const discoverButton = screen.getByTestId('discover-button');
      fireEvent.click(discoverButton);

      expect(mockPush).toHaveBeenCalledWith(ROUTES.DISCOVER);
    });
  });

  describe('Button variants', () => {
    it('uses primary variant for Create Workflow button', () => {
      render(<QuickActions />);

      const createWorkflowButton = screen.getByTestId('create-workflow-button');
      expect(createWorkflowButton).toHaveClass('bg-primary-600');
    });

    it('uses secondary variant for Create Mini-Prompt button', () => {
      render(<QuickActions />);

      const createMiniPromptButton = screen.getByTestId('create-mini-prompt-button');
      expect(createMiniPromptButton).toHaveClass('bg-white');
    });

    it('uses secondary variant for Discover Public button', () => {
      render(<QuickActions />);

      const discoverButton = screen.getByTestId('discover-button');
      expect(discoverButton).toHaveClass('bg-white');
    });
  });

  describe('Container', () => {
    it('renders quick actions container with testId', () => {
      render(<QuickActions />);

      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });

    it('uses flex layout with gap', () => {
      const { container } = render(<QuickActions />);

      const quickActionsContainer = container.querySelector('[data-testid="quick-actions"]');
      expect(quickActionsContainer).toHaveClass('flex', 'gap-4');
    });
  });
});
