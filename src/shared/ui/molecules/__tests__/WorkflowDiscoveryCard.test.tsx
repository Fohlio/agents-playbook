/* eslint-disable react/display-name */
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowDiscoveryCard, WorkflowCardData, WorkflowCardState, WorkflowCardVisibility, WorkflowCardHandlers } from '../WorkflowDiscoveryCard';
import { TooltipProvider } from '@/shared/ui/providers/TooltipProvider';
import { WorkflowComplexity } from '@prisma/client';

// Mock MarkdownContent to avoid react-markdown parsing issues
jest.mock('@/shared/ui/atoms/MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => <div>{content}</div>,
}));

// Mock ComplexityBadge
jest.mock('@/shared/ui/atoms/ComplexityBadge', () => ({
  ComplexityBadge: ({ complexity }: { complexity: import('@prisma/client').WorkflowComplexity | null | undefined }) => {
    if (!complexity) return null;
    const labels: Record<import('@prisma/client').WorkflowComplexity, string> = {
      XS: 'XS - Quick',
      S: 'S - Simple',
      M: 'M - Moderate',
      L: 'L - Complex',
      XL: 'XL - Advanced',
    };
    return <span data-testid="complexity-badge">{labels[complexity]}</span>;
  },
}));

// Mock MUI components
jest.mock('@mui/material', () => ({
  IconButton: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: (e: React.MouseEvent) => void; 'data-testid'?: string }) => (
    <button onClick={onClick} data-testid={props['data-testid']}>{children}</button>
  ),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Menu: ({ children, open, onClose }: { children: React.ReactNode; open: boolean; onClose: () => void }) => 
    open ? <div data-testid="actions-menu" onClick={(e) => e.stopPropagation()}>{children}</div> : null,
  MenuItem: ({ children, onClick, disabled, ...props }: { children: React.ReactNode; onClick?: (e: React.MouseEvent) => void; disabled?: boolean; 'data-testid'?: string }) => (
    <button onClick={onClick} disabled={disabled} data-testid={props['data-testid']}>{children}</button>
  ),
  ListItemIcon: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  ListItemText: ({ primary }: { primary: string }) => <span>{primary}</span>,
  Switch: ({ checked, onChange, onClick }: { checked: boolean; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; onClick?: (e: React.MouseEvent) => void; edge?: string; size?: string }) => (
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

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const mockWorkflow: WorkflowCardData = {
  id: 'workflow-1',
  name: 'Test Workflow',
  description: 'Test Description',
  complexity: WorkflowComplexity.M,
  user: {
    username: 'testuser',
  },
  stagesCount: 3,
  usageCount: 10,
  tags: [
    { id: 'tag-1', name: 'Test Tag', color: '#blue' },
  ],
  rating: {
    average: 4.5,
    count: 5,
  },
};

const defaultState: WorkflowCardState = {
  isActive: true,
  isPublic: true,
  isDuplicating: false,
  isRemoving: false,
  isImporting: false,
};

const defaultVisibility: WorkflowCardVisibility = {
  showActive: false,
  showPublic: false,
  showShare: false,
  showRate: false,
  showEdit: false,
  showDuplicate: false,
  showRemove: false,
  showImport: false,
  isOwned: false,
};

const defaultHandlers: WorkflowCardHandlers = {
  onCardClick: jest.fn(),
  onToggleActive: jest.fn(),
  onTogglePublic: jest.fn(),
  onShare: jest.fn(),
  onRate: jest.fn(),
  onEdit: jest.fn(),
  onDuplicate: jest.fn(),
  onRemove: jest.fn(),
  onImport: jest.fn(),
};

describe('WorkflowDiscoveryCard (Pure UI)', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<TooltipProvider>{ui}</TooltipProvider>);
  };

  // Helper to open the actions menu
  const openActionsMenu = () => {
    const menuButton = screen.getByTestId('workflow-workflow-1-menu-button');
    fireEvent.click(menuButton);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Display and Layout', () => {
    it('should render workflow information correctly', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={defaultVisibility}
          handlers={defaultHandlers}
        />
      );

      expect(screen.getByText('Test Workflow')).toBeInTheDocument();
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
          state={defaultState}
          visibility={defaultVisibility}
          handlers={defaultHandlers}
        />
      );

      expect(screen.getByText('No description')).toBeInTheDocument();
    });

    it('should render tags when provided', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={defaultVisibility}
          handlers={defaultHandlers}
        />
      );

      expect(screen.getByText('Test Tag')).toBeInTheDocument();
    });

    it('should render complexity badge', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={defaultVisibility}
          handlers={defaultHandlers}
        />
      );

      expect(screen.getByText('M - Moderate')).toBeInTheDocument();
    });

    it('should render rating when provided', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={defaultVisibility}
          handlers={defaultHandlers}
        />
      );

      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('(5)')).toBeInTheDocument();
    });

    it('should call onCardClick when card is clicked', () => {
      const mockOnCardClick = jest.fn();
      
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={defaultVisibility}
          handlers={{ ...defaultHandlers, onCardClick: mockOnCardClick }}
        />
      );

      const card = screen.getByTestId('workflow-card-workflow-1');
      fireEvent.click(card);

      expect(mockOnCardClick).toHaveBeenCalled();
    });
  });

  describe('Actions Menu Visibility', () => {
    it('should not show menu button when no actions are visible', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={defaultVisibility}
          handlers={defaultHandlers}
        />
      );

      const menuButton = screen.queryByTestId('workflow-workflow-1-menu-button');
      expect(menuButton).not.toBeInTheDocument();
    });

    it('should show menu button when at least one action is visible', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showShare: true }}
          handlers={defaultHandlers}
        />
      );

      const menuButton = screen.getByTestId('workflow-workflow-1-menu-button');
      expect(menuButton).toBeInTheDocument();
    });

    it('should show active toggle when showActive is true', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showActive: true }}
          handlers={defaultHandlers}
        />
      );

      openActionsMenu();

      const activeToggle = screen.getByTestId('workflow-workflow-1-active-toggle');
      expect(activeToggle).toBeInTheDocument();
    });

    it('should show public toggle when showPublic is true', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showPublic: true }}
          handlers={defaultHandlers}
        />
      );

      openActionsMenu();

      const publicToggle = screen.getByTestId('workflow-workflow-1-public-toggle');
      expect(publicToggle).toBeInTheDocument();
    });

    it('should show share menu item when showShare is true', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showShare: true }}
          handlers={defaultHandlers}
        />
      );

      openActionsMenu();

      const shareItem = screen.getByTestId('workflow-workflow-1-share');
      expect(shareItem).toBeInTheDocument();
    });

    it('should show rate menu item when showRate is true', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showRate: true }}
          handlers={defaultHandlers}
        />
      );

      openActionsMenu();

      const rateItem = screen.getByTestId('workflow-workflow-1-rate');
      expect(rateItem).toBeInTheDocument();
    });

    it('should show edit menu item when showEdit is true', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showEdit: true }}
          handlers={defaultHandlers}
        />
      );

      openActionsMenu();

      const editItem = screen.getByTestId('workflow-workflow-1-edit');
      expect(editItem).toBeInTheDocument();
    });

    it('should show duplicate menu item when showDuplicate is true', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showDuplicate: true }}
          handlers={defaultHandlers}
        />
      );

      openActionsMenu();

      const duplicateItem = screen.getByTestId('workflow-workflow-1-duplicate');
      expect(duplicateItem).toBeInTheDocument();
    });

    it('should show remove menu item when showRemove is true', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showRemove: true }}
          handlers={defaultHandlers}
        />
      );

      openActionsMenu();

      const removeItem = screen.getByTestId('workflow-workflow-1-remove');
      expect(removeItem).toBeInTheDocument();
    });

    it('should show import menu item when showImport is true', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showImport: true }}
          handlers={defaultHandlers}
        />
      );

      openActionsMenu();

      const importItem = screen.getByTestId('workflow-workflow-1-import');
      expect(importItem).toBeInTheDocument();
    });
  });

  describe('Handler Callbacks', () => {
    it('should call onToggleActive when active toggle is changed', () => {
      const mockOnToggleActive = jest.fn();

      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showActive: true }}
          handlers={{ ...defaultHandlers, onToggleActive: mockOnToggleActive }}
        />
      );

      openActionsMenu();

      const activeToggle = screen.getByTestId('workflow-workflow-1-active-toggle');
      fireEvent.click(activeToggle);

      expect(mockOnToggleActive).toHaveBeenCalled();
    });

    it('should call onShare when share menu item is clicked', () => {
      const mockOnShare = jest.fn();

      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showShare: true }}
          handlers={{ ...defaultHandlers, onShare: mockOnShare }}
        />
      );

      openActionsMenu();

      const shareItem = screen.getByTestId('workflow-workflow-1-share');
      fireEvent.click(shareItem);

      expect(mockOnShare).toHaveBeenCalled();
    });

    it('should call onRate when rate menu item is clicked', () => {
      const mockOnRate = jest.fn();

      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showRate: true }}
          handlers={{ ...defaultHandlers, onRate: mockOnRate }}
        />
      );

      openActionsMenu();

      const rateItem = screen.getByTestId('workflow-workflow-1-rate');
      fireEvent.click(rateItem);

      expect(mockOnRate).toHaveBeenCalled();
    });

    it('should call onEdit when edit menu item is clicked', () => {
      const mockOnEdit = jest.fn();

      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showEdit: true }}
          handlers={{ ...defaultHandlers, onEdit: mockOnEdit }}
        />
      );

      openActionsMenu();

      const editItem = screen.getByTestId('workflow-workflow-1-edit');
      fireEvent.click(editItem);

      expect(mockOnEdit).toHaveBeenCalled();
    });

    it('should call onDuplicate when duplicate menu item is clicked', () => {
      const mockOnDuplicate = jest.fn();

      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showDuplicate: true }}
          handlers={{ ...defaultHandlers, onDuplicate: mockOnDuplicate }}
        />
      );

      openActionsMenu();

      const duplicateItem = screen.getByTestId('workflow-workflow-1-duplicate');
      fireEvent.click(duplicateItem);

      expect(mockOnDuplicate).toHaveBeenCalled();
    });

    it('should call onRemove when remove menu item is clicked', () => {
      const mockOnRemove = jest.fn();

      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showRemove: true }}
          handlers={{ ...defaultHandlers, onRemove: mockOnRemove }}
        />
      );

      openActionsMenu();

      const removeItem = screen.getByTestId('workflow-workflow-1-remove');
      fireEvent.click(removeItem);

      expect(mockOnRemove).toHaveBeenCalled();
    });

    it('should call onImport when import menu item is clicked', () => {
      const mockOnImport = jest.fn();

      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showImport: true }}
          handlers={{ ...defaultHandlers, onImport: mockOnImport }}
        />
      );

      openActionsMenu();

      const importItem = screen.getByTestId('workflow-workflow-1-import');
      fireEvent.click(importItem);

      expect(mockOnImport).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show duplicating state when isDuplicating is true', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={{ ...defaultState, isDuplicating: true }}
          visibility={{ ...defaultVisibility, showDuplicate: true }}
          handlers={defaultHandlers}
        />
      );

      openActionsMenu();

      const duplicateItem = screen.getByTestId('workflow-workflow-1-duplicate');
      expect(duplicateItem).toBeDisabled();
    });

    it('should show removing state when isRemoving is true', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={{ ...defaultState, isRemoving: true }}
          visibility={{ ...defaultVisibility, showRemove: true }}
          handlers={defaultHandlers}
        />
      );

      openActionsMenu();

      const removeItem = screen.getByTestId('workflow-workflow-1-remove');
      expect(removeItem).toBeDisabled();
    });

    it('should show importing state when isImporting is true', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={{ ...defaultState, isImporting: true }}
          visibility={{ ...defaultVisibility, showImport: true }}
          handlers={defaultHandlers}
        />
      );

      openActionsMenu();

      const importItem = screen.getByTestId('workflow-workflow-1-import');
      expect(importItem).toBeDisabled();
    });
  });

  describe('Custom Test ID', () => {
    it('should use custom testId when provided', () => {
      renderWithProviders(
        <WorkflowDiscoveryCard
          workflow={mockWorkflow}
          state={defaultState}
          visibility={{ ...defaultVisibility, showShare: true }}
          handlers={defaultHandlers}
          testId="custom-test-id"
        />
      );

      const menuButton = screen.getByTestId('custom-test-id-menu-button');
      expect(menuButton).toBeInTheDocument();
    });
  });
});
