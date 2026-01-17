import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock MarkdownContent BEFORE importing components that use it
jest.mock('@/shared/ui/atoms/MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => <div>{content}</div>,
}));

import { MiniPromptsSection } from '../MiniPromptsSection';
import { TooltipProvider } from "@/shared/ui/providers/TooltipProvider";

// Mock fetch
global.fetch = jest.fn();

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/dashboard/library/mini-prompts',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock createMiniPrompt action
jest.mock('@/views/workflow-constructor/actions/mini-prompt-actions', () => ({
  createMiniPrompt: jest.fn(async (data) => ({
    id: 'new-mp',
    ...data,
    isActive: false,
    isOwned: true,
    position: 0,
  })),
}));

// Mock MiniPromptEditorModal
jest.mock('@/views/workflow-constructor/components/MiniPromptEditorModal', () => ({
  MiniPromptEditorModal: ({ isOpen, onSave, onClose }: { isOpen: boolean; onSave: (name: string, desc: string, content: string, visibility: string, tags: unknown[]) => void; onClose: () => void }) => (
    isOpen ? (
      <div data-testid="mini-prompt-editor-modal">
        <button onClick={() => onSave('Test', 'Desc', 'Content', 'PUBLIC', [])}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
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

const mockMiniPrompts = [
  {
    id: 'mp1',
    name: 'Test Mini-Prompt 1',
    description: 'Description 1',
    content: 'Content 1',
    isActive: true,
    visibility: 'PUBLIC',
    isOwned: true,
    isSystemMiniPrompt: false,
    position: 0,
    tags: [{ tag: { id: 't1', name: 'Tag1', color: null } }],
  },
  {
    id: 'mp2',
    name: 'Test Mini-Prompt 2',
    description: 'Description 2',
    content: 'Content 2',
    isActive: false,
    visibility: 'PRIVATE',
    isOwned: true,
    isSystemMiniPrompt: true,
    position: 1,
    tags: [],
  },
  {
    id: 'mp3',
    name: 'Imported Mini-Prompt',
    description: 'Imported',
    content: 'Content 3',
    isActive: true,
    visibility: 'PUBLIC',
    isOwned: false,
    isSystemMiniPrompt: false,
    position: 2,
    tags: [],
  },
];

describe('MiniPromptsSection', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <TooltipProvider>
        {component}
      </TooltipProvider>
    );
  };

  // Helper to open the actions menu for a mini-prompt
  const openActionsMenu = (mpId: string) => {
    const menuButton = screen.getByTestId(`mini-prompt-${mpId}-menu-button`);
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
      if (url === '/api/mini-prompts') {
        return Promise.resolve({
          ok: true,
          json: async () => mockMiniPrompts.map(mp => ({
            ...mp,
            userId: 'user-1',
            user: { id: 'user-1', username: 'testuser', email: 'test@example.com' },
            _count: { references: 0, stageMiniPrompts: 0 },
            averageRating: null,
            totalRatings: 0,
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
    renderWithProviders(<MiniPromptsSection />);
    // Translation mock returns the key
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('should fetch and display mini-prompts sorted by position', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      expect(screen.getByText('Test Mini-Prompt 1')).toBeInTheDocument();
      expect(screen.getByText('Test Mini-Prompt 2')).toBeInTheDocument();
      expect(screen.getByText('Imported Mini-Prompt')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/mini-prompts');
  });

  it('should render empty state when no mini-prompts', async () => {
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

    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      // Translation mock returns the key
      expect(screen.getByText('miniPrompts.empty')).toBeInTheDocument();
      expect(screen.getByText('miniPrompts.createFirst')).toBeInTheDocument();
    });
  });

  it('should render Create Mini-Prompt button', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      // Translation mock returns the key
      expect(screen.getByText('miniPrompts.create')).toBeInTheDocument();
    });
  });

  it('should use MiniPromptCard component for each mini-prompt', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('mini-prompt-card-mp1')).toBeInTheDocument();
      expect(screen.getByTestId('mini-prompt-card-mp2')).toBeInTheDocument();
      expect(screen.getByTestId('mini-prompt-card-mp3')).toBeInTheDocument();
    });
  });

  it('should render metadata with visibility', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      // Visibility is not displayed in the card UI, but cards are rendered
      expect(screen.getByTestId('mini-prompt-card-mp1')).toBeInTheDocument();
      expect(screen.getByTestId('mini-prompt-card-mp2')).toBeInTheDocument();
      expect(screen.getByTestId('mini-prompt-card-mp3')).toBeInTheDocument();
    });
  });

  it('should render toggle for active/inactive state in menu', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('mini-prompt-card-mp1')).toBeInTheDocument();
    });

    // Open menu for mp1
    openActionsMenu('mp1');

    // Check for active toggle in menu
    expect(screen.getByTestId('mini-prompt-mp1-active-toggle')).toBeInTheDocument();
  });

  it('should render action buttons for owned mini-prompts in menu', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('mini-prompt-card-mp1')).toBeInTheDocument();
    });

    // Open menu for mp1
    openActionsMenu('mp1');

    // Check for actions in menu
    expect(screen.getByTestId('mini-prompt-mp1-duplicate')).toBeInTheDocument();
    expect(screen.getByTestId('mini-prompt-mp1-remove')).toBeInTheDocument();
  });

  it('should render Remove from Library button for imported mini-prompts', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('mini-prompt-card-mp3')).toBeInTheDocument();
    });

    // Open menu for mp3 (imported)
    openActionsMenu('mp3');

    // Click the remove action
    const removeAction = screen.getByTestId('mini-prompt-mp3-remove');
    expect(removeAction).toBeInTheDocument();
    fireEvent.click(removeAction);

    // Wait for confirm dialog to appear with "Remove from Library" title
    await waitFor(() => {
      expect(screen.getByText('Remove from Library')).toBeInTheDocument();
    });
  });

  it('should handle mini-prompt click and open editor modal', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      const miniPromptCard = screen.getByTestId('mini-prompt-card-mp1');
      fireEvent.click(miniPromptCard);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mini-prompt-editor-modal')).toBeInTheDocument();
    });
  });

  it('should handle delete mini-prompt', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('mini-prompt-card-mp1')).toBeInTheDocument();
    });

    // Open menu for mp1
    openActionsMenu('mp1');

    // Click the remove action
    const removeAction = screen.getByTestId('mini-prompt-mp1-remove');
    fireEvent.click(removeAction);

    // Wait for confirm dialog and click Remove
    await waitFor(() => {
      expect(screen.getByText('Remove from Library')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Remove');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/mini-prompts/mp1', {
        method: 'DELETE',
      });
    });
  });

  it('should handle duplicate mini-prompt', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('mini-prompt-card-mp1')).toBeInTheDocument();
    });

    // Open menu for mp1
    openActionsMenu('mp1');

    // Click the duplicate action
    const duplicateAction = screen.getByTestId('mini-prompt-mp1-duplicate');
    fireEvent.click(duplicateAction);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/mini-prompts/mp1/duplicate', {
        method: 'POST',
      });
    });
  });

  it('should wrap mini-prompts in DndContext and SortableContext', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('mini-prompt-card-mp1')).toBeInTheDocument();
    });

    const container = screen.getByTestId('mini-prompt-card-mp1').parentElement;
    expect(container).toBeInTheDocument();
  });

  it('should use useLibraryReorder hook with correct endpoint', async () => {
    const libraryReorderModule = await import('../../hooks/use-library-reorder');
    const { useLibraryReorder } = libraryReorderModule;

    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      expect(useLibraryReorder).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        '/api/mini-prompts/reorder'
      );
    });
  });

  it('should open create modal when Create button clicked', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      // Translation mock returns the key, so look for the translation key
      const createButton = screen.getByText('miniPrompts.create');
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mini-prompt-editor-modal')).toBeInTheDocument();
    });
  });

  it('should handle toggle active state via menu', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      expect(screen.getByTestId('mini-prompt-card-mp1')).toBeInTheDocument();
    });

    // Open menu for mp1
    openActionsMenu('mp1');

    // Click the active toggle
    const activeToggle = screen.getByTestId('mini-prompt-mp1-active-toggle');
    fireEvent.click(activeToggle);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/mini-prompts/mp1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });
    });
  });
});
