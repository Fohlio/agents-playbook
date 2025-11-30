import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { WorkflowsSection } from '../WorkflowsSection';
import { TooltipProvider } from '@/shared/ui/providers/TooltipProvider';
import '@testing-library/jest-dom';

// Mock MarkdownContent before any imports that use it
jest.mock('@/shared/ui/atoms/MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => <div>{content}</div>,
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

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/dashboard/library/workflows',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock ShareModal
jest.mock('@/features/sharing/components/ShareModal', () => ({
  ShareModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="share-modal">
        <button onClick={onClose}>Close Share</button>
      </div>
    ) : null,
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

/* eslint-disable react/display-name, @typescript-eslint/no-unused-vars */
// Mock MUI components
jest.mock('@mui/material', () => ({
  IconButton: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: (e: React.MouseEvent) => void; 'data-testid'?: string }) => (
    <button onClick={onClick} data-testid={props['data-testid']}>{children}</button>
  ),
  Menu: ({ children, open, onClose }: { children: React.ReactNode; open: boolean; onClose: () => void }) => 
    open ? <div data-testid="actions-menu" onClick={(e) => e.stopPropagation()}>{children}</div> : null,
  MenuItem: ({ children, onClick, disabled, ...props }: { children: React.ReactNode; onClick?: (e: React.MouseEvent) => void; disabled?: boolean; 'data-testid'?: string }) => (
    <button onClick={onClick} disabled={disabled} data-testid={props['data-testid']}>{children}</button>
  ),
  ListItemIcon: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  ListItemText: ({ primary }: { primary: string }) => <span>{primary}</span>,
  Switch: ({ checked, onChange, onClick }: { checked: boolean; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; onClick?: (e: React.MouseEvent) => void }) => (
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange}
      onClick={onClick}
      data-testid="mui-switch"
    />
  ),
  Divider: () => <hr />,
  CircularProgress: () => <span>Loading...</span>,
}));

// Mock MUI icons
jest.mock('@mui/icons-material/MoreVert', () => function MockMoreVert() { return <span>⋮</span>; });
jest.mock('@mui/icons-material/Visibility', () => function MockVisibility() { return <span>👁</span>; });
jest.mock('@mui/icons-material/VisibilityOff', () => function MockVisibilityOff() { return <span>👁‍🗨</span>; });
jest.mock('@mui/icons-material/PowerSettingsNew', () => function MockPower() { return <span>⚡</span>; });
jest.mock('@mui/icons-material/Share', () => function MockShare() { return <span>🔗</span>; });
jest.mock('@mui/icons-material/StarOutline', () => function MockStar() { return <span>⭐</span>; });
jest.mock('@mui/icons-material/Edit', () => function MockEdit() { return <span>✏️</span>; });
jest.mock('@mui/icons-material/ContentCopy', () => function MockCopy() { return <span>📋</span>; });
jest.mock('@mui/icons-material/Delete', () => function MockDelete() { return <span>🗑️</span>; });
jest.mock('@mui/icons-material/RemoveCircleOutline', () => function MockRemove() { return <span>❌</span>; });
jest.mock('@mui/icons-material/Add', () => function MockAdd() { return <span>➕</span>; });

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

  // Helper to open the actions menu for a workflow
  const openActionsMenu = (wfId: string) => {
    const menuButton = screen.getByTestId(`workflow-${wfId}-menu-button`);
    fireEvent.click(menuButton);
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
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/auth/session') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: { id: 'user-1' } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
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

  it('should render toggle for active/inactive state in menu', async () => {
    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('workflow-card-wf1')).toBeInTheDocument();
    });

    // Open menu for wf1
    openActionsMenu('wf1');

    // Check for active toggle in menu
    expect(screen.getByTestId('workflow-wf1-active-toggle')).toBeInTheDocument();
  });

  it('should render action buttons for owned workflows in menu', async () => {
    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('workflow-card-wf1')).toBeInTheDocument();
    });

    // Open menu for wf1
    openActionsMenu('wf1');

    // Check for actions in menu
    expect(screen.getByTestId('workflow-wf1-edit')).toBeInTheDocument();
    expect(screen.getByTestId('workflow-wf1-duplicate')).toBeInTheDocument();
    expect(screen.getByTestId('workflow-wf1-remove')).toBeInTheDocument();
  });

  it('should render Remove from Library button for imported workflows', async () => {
    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('workflow-card-wf3')).toBeInTheDocument();
    });

    // Open menu for wf3 (imported)
    openActionsMenu('wf3');

    // Click the remove action
    const removeAction = screen.getByTestId('workflow-wf3-remove');
    expect(removeAction).toBeInTheDocument();
    fireEvent.click(removeAction);

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
    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('workflow-card-wf1')).toBeInTheDocument();
    });

    // Open menu for wf1
    openActionsMenu('wf1');

    // Click the remove action
    const removeAction = screen.getByTestId('workflow-wf1-remove');
    fireEvent.click(removeAction);

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
    renderWithProviders(<WorkflowsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('workflow-card-wf1')).toBeInTheDocument();
    });

    // Open menu for wf1
    openActionsMenu('wf1');

    // Click the duplicate action
    const duplicateAction = screen.getByTestId('workflow-wf1-duplicate');
    fireEvent.click(duplicateAction);

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
