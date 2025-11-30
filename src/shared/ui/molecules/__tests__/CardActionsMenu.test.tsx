/* eslint-disable react/display-name */
import { render, screen, fireEvent } from '@testing-library/react';
import { CardActionsMenu } from '../CardActionsMenu';

// Mock MUI components
jest.mock('@mui/material', () => ({
  IconButton: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: (e: React.MouseEvent) => void; 'data-testid'?: string; 'aria-label'?: string }) => (
    <button onClick={onClick} data-testid={props['data-testid']} aria-label={props['aria-label']}>{children}</button>
  ),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Menu: ({ children, open, onClose }: { children: React.ReactNode; open: boolean; onClose: () => void; onClick?: (e: React.MouseEvent) => void }) => 
    open ? <div data-testid="card-actions-menu" onClick={(e) => e.stopPropagation()}>{children}</div> : null,
  MenuItem: ({ children, onClick, disabled, ...props }: { children: React.ReactNode; onClick?: (e: React.MouseEvent) => void; disabled?: boolean; 'data-testid'?: string }) => (
    <button onClick={onClick} disabled={disabled} data-testid={props['data-testid']}>{children}</button>
  ),
  ListItemIcon: ({ children }: { children: React.ReactNode }) => <span className="list-item-icon">{children}</span>,
  ListItemText: ({ primary }: { primary: string }) => <span className="list-item-text">{primary}</span>,
  Switch: ({ checked, onChange, onClick }: { checked: boolean; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; onClick?: (e: React.MouseEvent) => void }) => (
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange}
      onClick={onClick}
      data-testid="mui-switch"
    />
  ),
  Divider: () => <hr data-testid="divider" />,
  CircularProgress: () => <span data-testid="loading-spinner">Loading...</span>,
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

describe('CardActionsMenu', () => {
  const openMenu = () => {
    const menuButton = screen.getByTestId('card-actions-menu-button');
    fireEvent.click(menuButton);
  };

  it('should render the menu button', () => {
    render(
      <CardActionsMenu
        showShare={true}
        onShare={jest.fn()}
      />
    );

    expect(screen.getByTestId('card-actions-menu-button')).toBeInTheDocument();
  });

  it('should not render anything when no actions are provided', () => {
    const { container } = render(<CardActionsMenu />);
    expect(container.firstChild).toBeNull();
  });

  it('should open menu when button is clicked', () => {
    render(
      <CardActionsMenu
        showShare={true}
        onShare={jest.fn()}
      />
    );

    openMenu();
    expect(screen.getByTestId('card-actions-menu')).toBeInTheDocument();
  });

  describe('Toggle Items', () => {
    it('should render Active toggle when showActive is true', () => {
      render(
        <CardActionsMenu
          showActive={true}
          isActive={true}
          onToggleActive={jest.fn()}
        />
      );

      openMenu();
      expect(screen.getByTestId('card-active-toggle')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render Public toggle when showPublic is true', () => {
      render(
        <CardActionsMenu
          showPublic={true}
          isPublic={false}
          onTogglePublic={jest.fn()}
        />
      );

      openMenu();
      expect(screen.getByTestId('card-public-toggle')).toBeInTheDocument();
      expect(screen.getByText('Public')).toBeInTheDocument();
    });

    it('should call onToggleActive when active toggle item is clicked', () => {
      const mockToggleActive = jest.fn();
      render(
        <CardActionsMenu
          showActive={true}
          isActive={true}
          onToggleActive={mockToggleActive}
        />
      );

      openMenu();
      const activeToggle = screen.getByTestId('card-active-toggle');
      fireEvent.click(activeToggle);

      expect(mockToggleActive).toHaveBeenCalledWith(false);
    });

    it('should call onTogglePublic when public toggle item is clicked', () => {
      const mockTogglePublic = jest.fn();
      render(
        <CardActionsMenu
          showPublic={true}
          isPublic={false}
          onTogglePublic={mockTogglePublic}
        />
      );

      openMenu();
      const publicToggle = screen.getByTestId('card-public-toggle');
      fireEvent.click(publicToggle);

      expect(mockTogglePublic).toHaveBeenCalledWith(true);
    });
  });

  describe('Action Items', () => {
    it('should render Share action when showShare is true', () => {
      render(
        <CardActionsMenu
          showShare={true}
          onShare={jest.fn()}
        />
      );

      openMenu();
      expect(screen.getByTestId('card-share-action')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('should render Rate action when showRate is true', () => {
      render(
        <CardActionsMenu
          showRate={true}
          onRate={jest.fn()}
        />
      );

      openMenu();
      expect(screen.getByTestId('card-rate-action')).toBeInTheDocument();
      expect(screen.getByText('Rate')).toBeInTheDocument();
    });

    it('should render Edit action when showEdit is true', () => {
      render(
        <CardActionsMenu
          showEdit={true}
          onEdit={jest.fn()}
        />
      );

      openMenu();
      expect(screen.getByTestId('card-edit-action')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('should render Duplicate action when showDuplicate is true', () => {
      render(
        <CardActionsMenu
          showDuplicate={true}
          onDuplicate={jest.fn()}
        />
      );

      openMenu();
      expect(screen.getByTestId('card-duplicate-action')).toBeInTheDocument();
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
    });

    it('should render Import action when showImport is true', () => {
      render(
        <CardActionsMenu
          showImport={true}
          onImport={jest.fn()}
        />
      );

      openMenu();
      expect(screen.getByTestId('card-import-action')).toBeInTheDocument();
      expect(screen.getByText('Add to Library')).toBeInTheDocument();
    });

    it('should render Remove action when showRemove is true', () => {
      render(
        <CardActionsMenu
          showRemove={true}
          onRemove={jest.fn()}
        />
      );

      openMenu();
      expect(screen.getByTestId('card-remove-action')).toBeInTheDocument();
    });
  });

  describe('Action Callbacks', () => {
    it('should call onShare when share action is clicked', () => {
      const mockOnShare = jest.fn();
      render(
        <CardActionsMenu
          showShare={true}
          onShare={mockOnShare}
        />
      );

      openMenu();
      fireEvent.click(screen.getByTestId('card-share-action'));
      expect(mockOnShare).toHaveBeenCalled();
    });

    it('should call onRate when rate action is clicked', () => {
      const mockOnRate = jest.fn();
      render(
        <CardActionsMenu
          showRate={true}
          onRate={mockOnRate}
        />
      );

      openMenu();
      fireEvent.click(screen.getByTestId('card-rate-action'));
      expect(mockOnRate).toHaveBeenCalled();
    });

    it('should call onEdit when edit action is clicked', () => {
      const mockOnEdit = jest.fn();
      render(
        <CardActionsMenu
          showEdit={true}
          onEdit={mockOnEdit}
        />
      );

      openMenu();
      fireEvent.click(screen.getByTestId('card-edit-action'));
      expect(mockOnEdit).toHaveBeenCalled();
    });

    it('should call onDuplicate when duplicate action is clicked', () => {
      const mockOnDuplicate = jest.fn();
      render(
        <CardActionsMenu
          showDuplicate={true}
          onDuplicate={mockOnDuplicate}
        />
      );

      openMenu();
      fireEvent.click(screen.getByTestId('card-duplicate-action'));
      expect(mockOnDuplicate).toHaveBeenCalled();
    });

    it('should call onImport when import action is clicked', () => {
      const mockOnImport = jest.fn();
      render(
        <CardActionsMenu
          showImport={true}
          onImport={mockOnImport}
        />
      );

      openMenu();
      fireEvent.click(screen.getByTestId('card-import-action'));
      expect(mockOnImport).toHaveBeenCalled();
    });

    it('should call onRemove when remove action is clicked', () => {
      const mockOnRemove = jest.fn();
      render(
        <CardActionsMenu
          showRemove={true}
          onRemove={mockOnRemove}
        />
      );

      openMenu();
      fireEvent.click(screen.getByTestId('card-remove-action'));
      expect(mockOnRemove).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading text when isDuplicating is true', () => {
      render(
        <CardActionsMenu
          showDuplicate={true}
          onDuplicate={jest.fn()}
          isDuplicating={true}
        />
      );

      openMenu();
      expect(screen.getByText('Duplicating...')).toBeInTheDocument();
    });

    it('should show loading text when isImporting is true', () => {
      render(
        <CardActionsMenu
          showImport={true}
          onImport={jest.fn()}
          isImporting={true}
        />
      );

      openMenu();
      expect(screen.getByText('Importing...')).toBeInTheDocument();
    });

    it('should disable duplicate action when isDuplicating is true', () => {
      render(
        <CardActionsMenu
          showDuplicate={true}
          onDuplicate={jest.fn()}
          isDuplicating={true}
        />
      );

      openMenu();
      expect(screen.getByTestId('card-duplicate-action')).toBeDisabled();
    });
  });

  describe('Delete vs Remove Label', () => {
    it('should show "Delete" for owned items', () => {
      render(
        <CardActionsMenu
          showRemove={true}
          onRemove={jest.fn()}
          isOwned={true}
        />
      );

      openMenu();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should show "Remove from Library" for non-owned items', () => {
      render(
        <CardActionsMenu
          showRemove={true}
          onRemove={jest.fn()}
          isOwned={false}
        />
      );

      openMenu();
      expect(screen.getByText('Remove from Library')).toBeInTheDocument();
    });
  });

  describe('Custom Test IDs', () => {
    it('should use custom testId prefix for all elements', () => {
      render(
        <CardActionsMenu
          showActive={true}
          showShare={true}
          showRemove={true}
          onToggleActive={jest.fn()}
          onShare={jest.fn()}
          onRemove={jest.fn()}
          testId="custom"
        />
      );

      const menuButton = screen.getByTestId('custom-menu-button');
      expect(menuButton).toBeInTheDocument();
      
      fireEvent.click(menuButton);
      expect(screen.getByTestId('custom-active-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('custom-share')).toBeInTheDocument();
      expect(screen.getByTestId('custom-remove')).toBeInTheDocument();
    });
  });

  describe('Dividers', () => {
    it('should render divider between toggles and actions', () => {
      render(
        <CardActionsMenu
          showActive={true}
          showShare={true}
          onToggleActive={jest.fn()}
          onShare={jest.fn()}
        />
      );

      openMenu();
      expect(screen.getAllByTestId('divider').length).toBeGreaterThan(0);
    });

    it('should render divider before remove action', () => {
      render(
        <CardActionsMenu
          showShare={true}
          showRemove={true}
          onShare={jest.fn()}
          onRemove={jest.fn()}
        />
      );

      openMenu();
      expect(screen.getAllByTestId('divider').length).toBeGreaterThan(0);
    });
  });
});

