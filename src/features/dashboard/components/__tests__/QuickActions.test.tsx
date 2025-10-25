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

  it('renders both action buttons', () => {
    render(<QuickActions />);

    expect(screen.getByTestId('workflows-button')).toBeInTheDocument();
    expect(screen.getByTestId('mini-prompts-button')).toBeInTheDocument();
  });

  it('displays correct button labels', () => {
    render(<QuickActions />);

    expect(screen.getByText('Workflows')).toBeInTheDocument();
    expect(screen.getByText('Mini Prompts')).toBeInTheDocument();
  });

  describe('Navigation', () => {
    it('navigates to workflows list page when Workflows clicked', () => {
      render(<QuickActions />);

      const workflowsButton = screen.getByTestId('workflows-button');
      fireEvent.click(workflowsButton);

      expect(mockPush).toHaveBeenCalledWith(ROUTES.WORKFLOWS.LIST);
    });

    it('navigates to mini-prompts list page when Mini Prompts clicked', () => {
      render(<QuickActions />);

      const miniPromptsButton = screen.getByTestId('mini-prompts-button');
      fireEvent.click(miniPromptsButton);

      expect(mockPush).toHaveBeenCalledWith(ROUTES.MINI_PROMPTS.LIST);
    });
  });

  describe('Button variants', () => {
    it('uses primary variant for Workflows button', () => {
      render(<QuickActions />);

      const workflowsButton = screen.getByTestId('workflows-button');
      expect(workflowsButton).toHaveClass('bg-primary-600');
    });

    it('uses secondary variant for Mini Prompts button', () => {
      render(<QuickActions />);

      const miniPromptsButton = screen.getByTestId('mini-prompts-button');
      expect(miniPromptsButton).toHaveClass('bg-white');
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
