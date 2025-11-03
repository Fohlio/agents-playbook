import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MiniPromptsSection } from '../MiniPromptsSection';
import { TooltipProvider } from "@/shared/ui/providers/TooltipProvider";
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = jest.fn();

// Mock createMiniPrompt action
jest.mock('@/features/workflow-constructor/actions/mini-prompt-actions', () => ({
  createMiniPrompt: jest.fn(async (data) => ({
    id: 'new-mp',
    ...data,
    isActive: false,
    isOwned: true,
    position: 0,
  })),
}));

// Mock MiniPromptEditorModal
jest.mock('@/features/workflow-constructor/components/MiniPromptEditorModal', () => ({
  MiniPromptEditorModal: ({ isOpen, onSave, onClose }: { isOpen: boolean; onSave: (name: string, desc: string, content: string, visibility: string, tags: unknown[]) => void; onClose: () => void }) => (
    isOpen ? (
      <div data-testid="mini-prompt-editor-modal">
        <button onClick={() => onSave('Test', 'Desc', 'Content', 'PUBLIC', [])}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
}));

// Mock ShareButton
jest.mock('@/features/sharing/ui', () => ({
  ShareButton: ({ targetName }: { targetName: string }) => (
    <button>Share {targetName}</button>
  ),
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

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockMiniPrompts,
    });
  });

  it('should render loading state initially', () => {
    renderWithProviders(<MiniPromptsSection />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
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
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      expect(screen.getByText('No mini-prompts yet')).toBeInTheDocument();
      expect(screen.getByText('Create Your First Mini-Prompt')).toBeInTheDocument();
    });
  });

  it('should render Create Mini-Prompt button', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      expect(screen.getByText('+ Create Mini-Prompt')).toBeInTheDocument();
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
      expect(screen.getAllByText('PUBLIC').length).toBeGreaterThan(0);
      expect(screen.getByText('PRIVATE')).toBeInTheDocument();
    });
  });

  it('should render toggle for active/inactive state', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      const activeToggle = screen.getByTestId('mini-prompt-toggle-mp1');
      const inactiveToggle = screen.getByTestId('mini-prompt-toggle-mp2');
      expect(activeToggle).toBeInTheDocument();
      expect(inactiveToggle).toBeInTheDocument();
    });
  });

  it('should render action buttons for owned mini-prompts', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      const duplicateButtons = screen.queryAllByLabelText('Duplicate mini-prompt');
      expect(duplicateButtons.length).toBeGreaterThan(0);

      const deleteButtons = screen.queryAllByLabelText('Delete mini-prompt');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  it('should render Remove from Library button for imported mini-prompts', async () => {
    renderWithProviders(<MiniPromptsSection />);

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
    global.confirm = jest.fn(() => true);
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMiniPrompts,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      const deleteButton = screen.getAllByLabelText('Delete mini-prompt')[0];
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/mini-prompts/mp1', {
        method: 'DELETE',
      });
    });
  });

  it('should handle duplicate mini-prompt', async () => {
    const miniPromptActions = await import('@/features/workflow-constructor/actions/mini-prompt-actions');
    const { createMiniPrompt } = miniPromptActions;

    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      const duplicateButtons = screen.getAllByLabelText('Duplicate mini-prompt');
      fireEvent.click(duplicateButtons[0]);
    });

    await waitFor(() => {
      expect(createMiniPrompt).toHaveBeenCalledWith({
        name: 'Test Mini-Prompt 1 (Copy)',
        description: '',
        content: 'Content 1',
        visibility: 'PUBLIC',
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
      const createButton = screen.getByText('+ Create Mini-Prompt');
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mini-prompt-editor-modal')).toBeInTheDocument();
    });
  });

  it('should handle toggle active state', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMiniPrompts,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      const toggle = screen.getByTestId('mini-prompt-toggle-mp1');
      fireEvent.click(toggle);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/mini-prompts/mp1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });
    });
  });
});
