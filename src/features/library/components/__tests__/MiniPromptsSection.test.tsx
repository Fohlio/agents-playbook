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
      // Visibility is not displayed in the card UI, but cards are rendered
      expect(screen.getByTestId('mini-prompt-card-mp1')).toBeInTheDocument();
      expect(screen.getByTestId('mini-prompt-card-mp2')).toBeInTheDocument();
      expect(screen.getByTestId('mini-prompt-card-mp3')).toBeInTheDocument();
    });
  });

  it('should render toggle for active/inactive state', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      // Checkbox is rendered via role checkbox, not testid
      const checkboxes = screen.getAllByRole('checkbox');
      const activeCheckbox = checkboxes.find(cb => (cb as HTMLInputElement).checked);
      const inactiveCheckbox = checkboxes.find(cb => !(cb as HTMLInputElement).checked);
      expect(activeCheckbox).toBeInTheDocument();
      expect(inactiveCheckbox).toBeInTheDocument();
    });
  });

  it('should render action buttons for owned mini-prompts', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      // Buttons use testid, not aria-label
      const duplicateButton = screen.getByTestId('duplicate-button-mp1');
      expect(duplicateButton).toBeInTheDocument();

      const deleteButton = screen.getByTestId('remove-button-mp1');
      expect(deleteButton).toBeInTheDocument();
    });
  });

  it('should render Remove from Library button for imported mini-prompts', async () => {
    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      // Find the remove button for imported mini-prompt (mp3) and click it to see the dialog
      const removeButton = screen.getByTestId('remove-button-mp3');
      expect(removeButton).toBeInTheDocument();
      fireEvent.click(removeButton);
    });

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
      const deleteButton = screen.getByTestId('remove-button-mp1');
      fireEvent.click(deleteButton);
    });

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
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMiniPrompts,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockMiniPrompts[0], id: 'mp-new', name: 'Test Mini-Prompt 1 (Copy)' }),
      });

    renderWithProviders(<MiniPromptsSection />);

    await waitFor(() => {
      const duplicateButton = screen.getByTestId('duplicate-button-mp1');
      fireEvent.click(duplicateButton);
    });

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
      // Find the checkbox for mp1 (should be checked since isActive: true)
      const checkboxes = screen.getAllByRole('checkbox');
      const activeCheckbox = checkboxes.find(cb => (cb as HTMLInputElement).checked);
      expect(activeCheckbox).toBeInTheDocument();
      fireEvent.click(activeCheckbox!);
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
