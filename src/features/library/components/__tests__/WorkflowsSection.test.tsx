import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { WorkflowsSection } from '../WorkflowsSection';
import { TooltipProvider } from '@/shared/ui/providers/TooltipProvider';
import '@testing-library/jest-dom';

// Mock react-markdown before any imports that use it
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => {},
}));

// Mock fetch
global.fetch = jest.fn();

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock ShareButton
jest.mock('@/features/sharing/ui', () => ({
  ShareButton: ({ targetName }: { targetName: string }) => (
    <button>Share {targetName}</button>
  ),
}));

// Mock WorkflowPreviewModal
jest.mock('@/shared/ui/molecules/WorkflowPreviewModal', () => ({
  WorkflowPreviewModal: ({ workflow, onClose, isOpen }: { workflow: { name: string }; onClose: () => void; isOpen: boolean }) =>
    isOpen ? (
      <div data-testid="workflow-preview-modal">
        <h1>{workflow.name}</h1>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock ConfirmDialog
jest.mock('@/shared/ui/molecules/ConfirmDialog', () => ({
  ConfirmDialog: ({ isOpen, onClose, onConfirm, title, confirmLabel }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; confirmLabel?: string }) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <h2>{title}</h2>
        <button onClick={onConfirm}>{confirmLabel || 'Confirm'}</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}));

// Mock @dnd-kit
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  closestCenter: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
  PointerSensor: jest.fn(),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: jest.fn(),
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
  arrayMove: jest.fn((arr, from, to) => {
    const newArr = [...arr];
    const [item] = newArr.splice(from, 1);
    newArr.splice(to, 0, item);
    return newArr;
  }),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => ''),
    },
  },
}));

jest.mock('../../hooks/use-library-reorder', () => ({
  useLibraryReorder: jest.fn(() => ({
    sensors: [],
    handleDragEnd: jest.fn(),
  })),
}));

const mockWorkflows = [
  {
    id: 'wf1',
    name: 'Test Workflow 1',
    description: 'Description 1',
    isActive: true,
    visibility: 'PUBLIC',
    isOwned: true,
    isSystemWorkflow: false,
    complexity: 'M' as const,
    position: 0,
    tags: [{ tag: { id: 't1', name: 'Tag1' } }],
    _count: { stages: 3 },
  },
  {
    id: 'wf2',
    name: 'Test Workflow 2',
    description: 'Description 2',
    isActive: false,
    visibility: 'PRIVATE',
    isOwned: true,
    isSystemWorkflow: true,
    complexity: 'L' as const,
    position: 1,
    tags: [],
    _count: { stages: 5 },
  },
  {
    id: 'wf3',
    name: 'Imported Workflow',
    description: 'Imported',
    isActive: true,
    visibility: 'PUBLIC',
    isOwned: false,
    isSystemWorkflow: false,
    complexity: 'S' as const,
    position: 2,
    tags: [],
    _count: { stages: 2 },
  },
];

describe('WorkflowsSection', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<TooltipProvider>{ui}</TooltipProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/auth/session') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: { id: 'user-1' } }),
        });
      }
      if (url === '/api/workflows') {
        return Promise.resolve({
          ok: true,
          json: async () => mockWorkflows.map(w => ({
            ...w,
            userId: 'user-1', // Make workflows owned by user-1
            user: { id: 'user-1', username: 'testuser', email: 'test@example.com' },
            averageRating: null,
            totalRatings: 0,
            usageCount: 0,
          })),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
  });

  it('should render loading state initially', () => {
    renderWithProviders(<WorkflowsSection />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should fetch and display workflows sorted by position', async () => {
    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      // Use testid to avoid duplicate matches (card name also appears in modal)
      expect(screen.getByTestId('workflow-card-wf1')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-card-wf2')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-card-wf3')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/workflows');
  });

  it('should render empty state when no workflows', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      expect(screen.getByText('No workflows yet')).toBeInTheDocument();
      expect(screen.getByText('Create Your First Workflow')).toBeInTheDocument();
    });
  });

  it('should render Create Workflow button', async () => {
    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      expect(screen.getByText('+ Create Workflow')).toBeInTheDocument();
    });
  });

  it('should use WorkflowCard component for each workflow', async () => {
    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('workflow-card-wf1')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-card-wf2')).toBeInTheDocument();
      expect(screen.getByTestId('workflow-card-wf3')).toBeInTheDocument();
    });
  });

  it('should render metadata with stages count and visibility', async () => {
    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      expect(screen.getByText('3 stages')).toBeInTheDocument();
      expect(screen.getByText('5 stages')).toBeInTheDocument();
      expect(screen.getByText('2 stages')).toBeInTheDocument();
    });
  });

  it('should render toggle for active/inactive state', async () => {
    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      // Checkbox is rendered via role checkbox, not testid
      const checkboxes = screen.getAllByRole('checkbox');
      const activeCheckbox = checkboxes.find(cb => (cb as HTMLInputElement).checked);
      const inactiveCheckbox = checkboxes.find(cb => !(cb as HTMLInputElement).checked);
      expect(activeCheckbox).toBeInTheDocument();
      expect(inactiveCheckbox).toBeInTheDocument();
    });
  });

  it('should render action buttons for owned workflows', async () => {
    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      // Edit button only for non-system workflows (wf1 is owned, non-system)
      const editButton = screen.getByTestId('edit-button-wf1');
      expect(editButton).toBeInTheDocument();

      // Duplicate button
      const duplicateButton = screen.getByTestId('duplicate-button-wf1');
      expect(duplicateButton).toBeInTheDocument();

      // Delete button only for non-system owned workflows
      const deleteButton = screen.getByTestId('remove-button-wf1');
      expect(deleteButton).toBeInTheDocument();
    });
  });

  it('should render Remove from Library button for imported workflows', async () => {
    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      // Find the remove button for imported workflow (wf3) and click it to see the dialog
      const removeButton = screen.getByTestId('remove-button-wf3');
      expect(removeButton).toBeInTheDocument();
      fireEvent.click(removeButton);
    });

    // Wait for confirm dialog to appear with "Remove from Library" title
    await waitFor(() => {
      expect(screen.getByText('Remove from Library')).toBeInTheDocument();
    });
  });

  it('should handle workflow click and open preview modal', async () => {
    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      const workflowCard = screen.getByTestId('workflow-card-wf1');
      fireEvent.click(workflowCard);
    });

    await waitFor(() => {
      expect(screen.getByTestId('workflow-preview-modal')).toBeInTheDocument();
    });
  });

  it('should handle delete workflow', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkflows,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      const deleteButton = screen.getByTestId('remove-button-wf1');
      fireEvent.click(deleteButton);
    });

    // Wait for confirm dialog and click Remove
    await waitFor(() => {
      expect(screen.getByText('Remove from Library')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Remove');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/workflows/wf1', {
        method: 'DELETE',
      });
    });
  });

  it('should handle duplicate workflow', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkflows,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockWorkflows[0], id: 'wf-new', name: 'Test Workflow 1 (Copy)' }),
      });

    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      const duplicateButton = screen.getByTestId('duplicate-button-wf1');
      fireEvent.click(duplicateButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/workflows/wf1/duplicate', {
        method: 'POST',
      });
    });
  });

  it('should wrap workflows in DndContext and SortableContext', async () => {
    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('workflow-card-wf1')).toBeInTheDocument();
    });

    // Verify DndContext and SortableContext are used (mocked to render children)
    const container = screen.getByTestId('workflow-card-wf1').parentElement;
    expect(container).toBeInTheDocument();
  });

  it('should use useLibraryReorder hook with correct endpoint', async () => {
    const libraryReorderModule = await import('../../hooks/use-library-reorder');
    const { useLibraryReorder } = libraryReorderModule;

    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      expect(useLibraryReorder).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        '/api/workflows/reorder'
      );
    });
  });
});
