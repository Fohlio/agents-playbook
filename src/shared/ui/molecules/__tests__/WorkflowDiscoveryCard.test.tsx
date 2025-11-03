import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkflowDiscoveryCard } from '../WorkflowDiscoveryCard';
import { PublicWorkflowWithMeta } from '@/features/public-discovery/types';
import { TooltipProvider } from '@/shared/ui/providers/TooltipProvider';

// Mock fetch globally
global.fetch = jest.fn();

// Mock MarkdownContent to avoid react-markdown parsing issues
jest.mock('@/shared/ui/atoms/MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => <div>{content}</div>,
}));

// Mock WorkflowPreviewModal to avoid react-markdown in nested components
jest.mock('../WorkflowPreviewModal', () => ({
  WorkflowPreviewModal: ({ workflow, onClose }: { workflow: { name: string }; onClose: () => void }) => (
    <div data-testid="workflow-preview-modal">
      <h1>{workflow.name}</h1>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock ComplexityBadge
jest.mock('@/shared/ui/atoms/ComplexityBadge', () => ({
  ComplexityBadge: ({ complexity }: { complexity: string }) => (
    <span data-testid="complexity-badge">{complexity}</span>
  ),
}));

// Mock RatingDisplay
jest.mock('@/features/ratings/ui/RatingDisplay', () => ({
  RatingDisplay: ({ averageRating, totalRatings }: { averageRating: number | null; totalRatings: number }) => (
    <div data-testid="rating-display">
      {averageRating ? `${averageRating} (${totalRatings})` : 'No ratings'}
    </div>
  ),
}));

// Mock RatingDialog
jest.mock('@/features/ratings/ui/RatingDialog', () => ({
  RatingDialog: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="rating-dialog">
        <button onClick={onClose}>Close Rating</button>
      </div>
    ) : null,
}));

// Mock ConfirmDialog
jest.mock('../ConfirmDialog', () => ({
  ConfirmDialog: ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}));

const mockWorkflow: PublicWorkflowWithMeta & {
  tags?: { tag: { id: string; name: string; color: string | null } }[];
} = {
  id: 'workflow-1',
  name: 'Test Workflow',
  description: 'Test Description',
  complexity: 'INTERMEDIATE',
  visibility: 'PUBLIC',
  userId: 'user-1',
  user: {
    id: 'user-1',
    username: 'testuser',
  },
  _count: {
    stages: 3,
  },
  usageCount: 10,
  averageRating: 4.5,
  totalRatings: 5,
  isInUserLibrary: false,
  isActive: true,
  tags: [
    { tag: { id: 'tag-1', name: 'Test Tag', color: '#blue' } },
  ],
};

describe('WorkflowDiscoveryCard', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<TooltipProvider>{ui}</TooltipProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  describe('Display and Layout', () => {
    it('should render workflow information correctly', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          onImport={jest.fn()}
          isAuthenticated={true}
          currentUserId="user-2"
        />
      );

      expect(screen.getAllByText('Test Workflow').length).toBeGreaterThan(0);
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
      expect(screen.getByText('3 stages')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // usage count
    });

    it('should show "No description" when description is null', () => {
      const workflowWithoutDescription = { ...mockWorkflow, description: null };

      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={workflowWithoutDescription}
          onImport={jest.fn()}
          isAuthenticated={true}
        />
      );

      expect(screen.getByText('No description')).toBeInTheDocument();
    });

    it('should render tags when provided', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          onImport={jest.fn()}
          isAuthenticated={true}
        />
      );

      expect(screen.getByText('Test Tag')).toBeInTheDocument();
    });

    it('should render complexity badge', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          onImport={jest.fn()}
          isAuthenticated={true}
        />
      );

      // ComplexityBadge should render the complexity level
      expect(screen.getByText(/intermediate/i)).toBeInTheDocument();
    });
  });

  describe('Library Items (isInUserLibrary = true)', () => {
    const libraryWorkflow = { ...mockWorkflow, isInUserLibrary: true };

    it('should show active checkbox for library items', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={libraryWorkflow}
          onImport={jest.fn()}
          isAuthenticated={true}
        />
      );

      const activeCheckbox = screen.getByRole('checkbox');
      expect(activeCheckbox).toBeInTheDocument();
      expect(activeCheckbox).toBeChecked();
    });

    it('should update active state when checkbox is toggled', async () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={libraryWorkflow}
          onImport={jest.fn()}
          isAuthenticated={true}
        />
      );

      const activeCheckbox = screen.getByRole('checkbox') as HTMLInputElement;
      fireEvent.click(activeCheckbox);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/workflows/${mockWorkflow.id}`,
          expect.objectContaining({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: false }),
          })
        );
      });
    });

    describe('Owned Workflows', () => {
      it('should show edit button for owned workflows', () => {
        renderWithProviders(
          <WorkflowDiscoveryCard
            workflow={libraryWorkflow}
            onImport={jest.fn()}
            isAuthenticated={true}
            currentUserId="user-1" // Same as workflow.userId
          />
        );

        const editButton = screen.getByTestId(`edit-button-${mockWorkflow.id}`);
        expect(editButton).toBeInTheDocument();
      });

      it('should not show rate button for owned workflows', () => {
        renderWithProviders(
          <WorkflowDiscoveryCard
            workflow={libraryWorkflow}
            onImport={jest.fn()}
            isAuthenticated={true}
            currentUserId="user-1"
          />
        );

        const rateButton = screen.queryByTestId(`rate-button-${mockWorkflow.id}`);
        expect(rateButton).not.toBeInTheDocument();
      });

      it('should show delete button (trash icon) for owned workflows', () => {
        renderWithProviders(
          <WorkflowDiscoveryCard
            workflow={libraryWorkflow}
            onImport={jest.fn()}
            onRemove={jest.fn()}
            isAuthenticated={true}
            currentUserId="user-1"
          />
        );

        const deleteButton = screen.getByTestId(`remove-button-${mockWorkflow.id}`);
        expect(deleteButton).toBeInTheDocument();
      });
    });

    describe('Non-Owned Library Items', () => {
      it('should show rate button for non-owned library workflows', () => {
        renderWithProviders(
          <WorkflowDiscoveryCard
            workflow={libraryWorkflow}
            onImport={jest.fn()}
            isAuthenticated={true}
            currentUserId="user-2" // Different from workflow.userId
          />
        );

        const rateButton = screen.getByTestId(`rate-button-${mockWorkflow.id}`);
        expect(rateButton).toBeInTheDocument();
      });

      it('should not show edit button for non-owned library workflows', () => {
        renderWithProviders(
          <WorkflowDiscoveryCard
            workflow={libraryWorkflow}
            onImport={jest.fn()}
            isAuthenticated={true}
            currentUserId="user-2"
          />
        );

        const editButton = screen.queryByTestId(`edit-button-${mockWorkflow.id}`);
        expect(editButton).not.toBeInTheDocument();
      });

      it('should show remove button (X icon) for non-owned library workflows', () => {
        renderWithProviders(
          <WorkflowDiscoveryCard
            workflow={libraryWorkflow}
            onImport={jest.fn()}
            onRemove={jest.fn()}
            isAuthenticated={true}
            currentUserId="user-2"
          />
        );

        const removeButton = screen.getByTestId(`remove-button-${mockWorkflow.id}`);
        expect(removeButton).toBeInTheDocument();
      });
    });

    it('should show duplicate button for all library items', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={libraryWorkflow}
          onImport={jest.fn()}
          onDuplicate={jest.fn()}
          isAuthenticated={true}
        />
      );

      const duplicateButton = screen.getByTestId(`duplicate-button-${mockWorkflow.id}`);
      expect(duplicateButton).toBeInTheDocument();
    });

    it('should call onDuplicate when duplicate button is clicked', async () => {
      const mockOnDuplicate = jest.fn();

      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={libraryWorkflow}
          onImport={jest.fn()}
          onDuplicate={mockOnDuplicate}
          isAuthenticated={true}
        />
      );

      const duplicateButton = screen.getByTestId(`duplicate-button-${mockWorkflow.id}`);
      fireEvent.click(duplicateButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/workflows/${mockWorkflow.id}/duplicate`,
          expect.objectContaining({ method: 'POST' })
        );
        expect(mockOnDuplicate).toHaveBeenCalledWith(mockWorkflow.id);
      });
    });
  });

  describe('Discover Page (isInUserLibrary = false)', () => {
    it('should show rate and import buttons for non-library items when authenticated', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          onImport={jest.fn()}
          isAuthenticated={true}
        />
      );

      const rateButton = screen.getByTestId(`rate-button-${mockWorkflow.id}`);
      const importButton = screen.getByTestId(`import-button-${mockWorkflow.id}`);

      expect(rateButton).toBeInTheDocument();
      expect(importButton).toBeInTheDocument();
    });

    it('should NOT show duplicate button on discover page', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          onImport={jest.fn()}
          onDuplicate={jest.fn()}
          isAuthenticated={true}
        />
      );

      const duplicateButton = screen.queryByTestId(`duplicate-button-${mockWorkflow.id}`);
      expect(duplicateButton).not.toBeInTheDocument();
    });

    it('should not show import button when not authenticated', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          onImport={jest.fn()}
          isAuthenticated={false}
        />
      );

      const importButton = screen.queryByTestId(`import-button-${mockWorkflow.id}`);
      expect(importButton).not.toBeInTheDocument();
    });

    it('should call onImport when import button is clicked', () => {
      const mockOnImport = jest.fn();

      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          onImport={mockOnImport}
          isAuthenticated={true}
        />
      );

      const importButton = screen.getByTestId(`import-button-${mockWorkflow.id}`);
      fireEvent.click(importButton);

      expect(mockOnImport).toHaveBeenCalledWith(mockWorkflow.id);
    });

    it('should disable import button while importing', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          onImport={jest.fn()}
          isAuthenticated={true}
          isImporting={true}
        />
      );

      const importButton = screen.getByTestId(`import-button-${mockWorkflow.id}`);
      expect(importButton).toBeDisabled();
    });
  });

  describe('Remove/Delete Actions', () => {
    const libraryWorkflow = { ...mockWorkflow, isInUserLibrary: true };

    it('should call onRemove when remove button is clicked', async () => {
      const mockOnRemove = jest.fn().mockResolvedValue(undefined);

      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={libraryWorkflow}
          onImport={jest.fn()}
          onRemove={mockOnRemove}
          isAuthenticated={true}
          currentUserId="user-2"
        />
      );

      const removeButton = screen.getByTestId(`remove-button-${mockWorkflow.id}`);
      fireEvent.click(removeButton);

      // Should open confirm dialog
      const confirmButton = await screen.findByText('Remove');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnRemove).toHaveBeenCalledWith(mockWorkflow.id);
      });
    });
  });

  describe('Rating Functionality', () => {
    it('should display rating information when available', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          onImport={jest.fn()}
          isAuthenticated={true}
        />
      );

      // RatingDisplay component should show the rating
      expect(screen.getByText(/4\.5/)).toBeInTheDocument();
    });

    it('should open rating dialog when rate button is clicked', async () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          onImport={jest.fn()}
          isAuthenticated={true}
          currentUserId="user-2"
        />
      );

      const rateButton = screen.getByTestId(`rate-button-${mockWorkflow.id}`);
      fireEvent.click(rateButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/v1/ratings/user?targetType=WORKFLOW&targetId=${mockWorkflow.id}`
        );
      });
    });
  });

  describe('Click Handlers and Event Propagation', () => {
    it('should stop event propagation when clicking action buttons', () => {
      const mockOnImport = jest.fn();
      const mockCardClick = jest.fn();

      const { container } = render(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          onImport={mockOnImport}
          isAuthenticated={true}
        />
      );

      const card = container.querySelector('[data-testid="workflow-card-workflow-1"]')?.parentElement;
      if (card) {
        card.onclick = mockCardClick;
      }

      const importButton = screen.getByTestId(`import-button-${mockWorkflow.id}`);
      fireEvent.click(importButton);

      expect(mockOnImport).toHaveBeenCalled();
      expect(mockCardClick).not.toHaveBeenCalled();
    });
  });
});
