import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActiveWorkflowsSection } from '../ActiveWorkflowsSection';
import { deactivateWorkflow } from '../../actions/workflow-actions';

jest.mock('../../actions/workflow-actions', () => ({
  deactivateWorkflow: jest.fn(),
}));

describe('ActiveWorkflowsSection', () => {
  const mockWorkflows = [
    {
      id: 'workflow-1',
      name: 'Test Workflow 1',
      description: 'Description 1',
      _count: { stages: 3 },
    },
    {
      id: 'workflow-2',
      name: 'Test Workflow 2',
      description: null,
      _count: { stages: 5 },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty state', () => {
    it('renders empty state when no workflows provided', () => {
      render(<ActiveWorkflowsSection workflows={[]} />);

      expect(screen.getByTestId('active-workflows-empty')).toBeInTheDocument();
      expect(screen.getByText('No active workflows yet')).toBeInTheDocument();
      expect(
        screen.getByText('Create and activate your first workflow to get started')
      ).toBeInTheDocument();
    });
  });

  describe('Workflow rendering', () => {
    it('renders all workflows with their information', () => {
      render(<ActiveWorkflowsSection workflows={mockWorkflows} />);

      expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('3 mini-prompts')).toBeInTheDocument();

      expect(screen.getByText('Test Workflow 2')).toBeInTheDocument();
      expect(screen.getByText('5 mini-prompts')).toBeInTheDocument();
    });

    it('displays Active badge for each workflow', () => {
      render(<ActiveWorkflowsSection workflows={mockWorkflows} />);

      const badges = screen.getAllByTestId('workflow-active-badge');
      expect(badges).toHaveLength(2);
      badges.forEach((badge) => {
        expect(badge).toHaveTextContent('Active');
      });
    });

    it('displays workflow count in header', () => {
      render(<ActiveWorkflowsSection workflows={mockWorkflows} />);

      expect(screen.getByText('2 of 5 active workflows')).toBeInTheDocument();
    });

    it('does not render description when null', () => {
      render(<ActiveWorkflowsSection workflows={mockWorkflows} />);

      const workflow2Card = screen.getByTestId('workflow-card-workflow-2');
      expect(workflow2Card).not.toHaveTextContent('Description');
    });
  });

  describe('Deactivation functionality', () => {
    it('calls deactivateWorkflow when deactivate button clicked', async () => {
      (deactivateWorkflow as jest.Mock).mockResolvedValue({ success: true });

      render(<ActiveWorkflowsSection workflows={mockWorkflows} />);

      const deactivateButton = screen.getByTestId('deactivate-button-workflow-1');
      fireEvent.click(deactivateButton);

      await waitFor(() => {
        expect(deactivateWorkflow).toHaveBeenCalledWith('workflow-1');
      });
    });

    it('shows loading state during deactivation', async () => {
      (deactivateWorkflow as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<ActiveWorkflowsSection workflows={mockWorkflows} />);

      const deactivateButton = screen.getByTestId('deactivate-button-workflow-1');
      fireEvent.click(deactivateButton);

      expect(deactivateButton).toBeDisabled();
      expect(deactivateButton).toHaveTextContent('Deactivating...');

      await waitFor(() => {
        expect(deactivateButton).not.toBeDisabled();
      });
    });

    it('resets loading state after successful deactivation', async () => {
      (deactivateWorkflow as jest.Mock).mockResolvedValue({ success: true });

      render(<ActiveWorkflowsSection workflows={mockWorkflows} />);

      const deactivateButton = screen.getByTestId('deactivate-button-workflow-1');
      fireEvent.click(deactivateButton);

      await waitFor(() => {
        expect(deactivateButton).not.toBeDisabled();
        expect(deactivateButton).toHaveTextContent('Deactivate');
      });
    });

    it('only disables the specific workflow being deactivated', async () => {
      (deactivateWorkflow as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<ActiveWorkflowsSection workflows={mockWorkflows} />);

      const button1 = screen.getByTestId('deactivate-button-workflow-1');
      const button2 = screen.getByTestId('deactivate-button-workflow-2');

      fireEvent.click(button1);

      expect(button1).toBeDisabled();
      expect(button2).not.toBeDisabled();

      await waitFor(() => {
        expect(button1).not.toBeDisabled();
      });
    });
  });

  describe('Error handling', () => {
    it('displays error message when deactivation fails', async () => {
      (deactivateWorkflow as jest.Mock).mockRejectedValue(
        new Error('Failed to deactivate')
      );

      render(<ActiveWorkflowsSection workflows={mockWorkflows} />);

      const deactivateButton = screen.getByTestId('deactivate-button-workflow-1');
      fireEvent.click(deactivateButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to deactivate')).toBeInTheDocument();
      });
    });

    it('displays generic error message for non-Error objects', async () => {
      (deactivateWorkflow as jest.Mock).mockRejectedValue('Unknown error');

      render(<ActiveWorkflowsSection workflows={mockWorkflows} />);

      const deactivateButton = screen.getByTestId('deactivate-button-workflow-1');
      fireEvent.click(deactivateButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to deactivate workflow')).toBeInTheDocument();
      });
    });

    it('clears previous error when starting new deactivation', async () => {
      (deactivateWorkflow as jest.Mock)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({ success: true });

      render(<ActiveWorkflowsSection workflows={mockWorkflows} />);

      const button1 = screen.getByTestId('deactivate-button-workflow-1');

      fireEvent.click(button1);
      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      fireEvent.click(button1);
      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });

    it('resets loading state after error', async () => {
      (deactivateWorkflow as jest.Mock).mockRejectedValue(
        new Error('Failed to deactivate')
      );

      render(<ActiveWorkflowsSection workflows={mockWorkflows} />);

      const deactivateButton = screen.getByTestId('deactivate-button-workflow-1');
      fireEvent.click(deactivateButton);

      await waitFor(() => {
        expect(deactivateButton).not.toBeDisabled();
        expect(deactivateButton).toHaveTextContent('Deactivate');
      });
    });
  });

  describe('TestIds', () => {
    it('includes testIds for main section and workflow cards', () => {
      render(<ActiveWorkflowsSection workflows={mockWorkflows} />);

      expect(screen.getByTestId('active-workflows-section')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-card-workflow-1')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-card-workflow-2')).toBeInTheDocument();
    });
  });
});
