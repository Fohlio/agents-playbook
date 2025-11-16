import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StageSection } from '../StageSection';
import { TooltipProvider } from '@/shared/ui/providers/TooltipProvider';
import '@testing-library/jest-dom';

const renderWithTooltip = (ui: React.ReactElement) => {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
};

// Mock StageDropZone
jest.mock('../StageDropZone', () => ({
  StageDropZone: ({ stage }: { stage: { id: string } }) => (
    <div data-testid={`stage-dropzone-${stage.id}`}>StageDropZone</div>
  ),
}));

const mockStage = {
  id: 'stage-1',
  workflowId: 'workflow-1',
  name: 'Test Stage',
  description: 'Test stage description',
  color: '#3b82f6',
  order: 0,
  withReview: true,
  includeMultiAgentChat: false,
  createdAt: new Date(),
  miniPrompts: [],
};

describe('StageSection', () => {
  const mockOnRemoveStage = jest.fn();
  const mockOnRemoveMiniPrompt = jest.fn();
  const mockOnDropMiniPrompts = jest.fn();
  const mockOnEditStage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render stage name and description', () => {
    renderWithTooltip(
      <StageSection
        stage={mockStage}
        onRemoveStage={mockOnRemoveStage}
        onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
        onDropMiniPrompts={mockOnDropMiniPrompts}
      />
    );

    expect(screen.getByText('Test Stage')).toBeInTheDocument();
    expect(screen.getByText('Test stage description')).toBeInTheDocument();
  });

  it('should render stage color indicator', () => {
    renderWithTooltip(
      <StageSection
        stage={mockStage}
        onRemoveStage={mockOnRemoveStage}
        onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
        onDropMiniPrompts={mockOnDropMiniPrompts}
      />
    );

    const colorIndicator = screen.getByTestId('stage-section-stage-1').querySelector('.w-3.h-3.rounded-full');
    expect(colorIndicator).toHaveStyle({ backgroundColor: '#3b82f6' });
  });

  it('should render remove stage button', () => {
    renderWithTooltip(
      <StageSection
        stage={mockStage}
        onRemoveStage={mockOnRemoveStage}
        onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
        onDropMiniPrompts={mockOnDropMiniPrompts}
      />
    );

    const removeButton = screen.getByTestId('remove-stage-stage-1');
    expect(removeButton).toBeInTheDocument();
    // Button only contains an icon, no text content
  });

  it('should call onRemoveStage when remove button clicked', () => {
    renderWithTooltip(
      <StageSection
        stage={mockStage}
        onRemoveStage={mockOnRemoveStage}
        onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
        onDropMiniPrompts={mockOnDropMiniPrompts}
      />
    );

    const removeButton = screen.getByTestId('remove-stage-stage-1');
    fireEvent.click(removeButton);

    expect(mockOnRemoveStage).toHaveBeenCalledWith('stage-1');
  });


  describe('Edit Stage Button', () => {
    it('should render edit button when onEditStage provided', () => {
      renderWithTooltip(
        <StageSection
          stage={mockStage}
          onRemoveStage={mockOnRemoveStage}
          onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
          onDropMiniPrompts={mockOnDropMiniPrompts}
          onEditStage={mockOnEditStage}
        />
      );

      const editButton = screen.getByTestId('edit-stage-stage-1');
      expect(editButton).toBeInTheDocument();
    });

    it('should call onEditStage when edit button clicked', () => {
      renderWithTooltip(
        <StageSection
          stage={mockStage}
          onRemoveStage={mockOnRemoveStage}
          onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
          onDropMiniPrompts={mockOnDropMiniPrompts}
          onEditStage={mockOnEditStage}
        />
      );

      const editButton = screen.getByTestId('edit-stage-stage-1');
      fireEvent.click(editButton);

      expect(mockOnEditStage).toHaveBeenCalledWith('stage-1');
    });

    it('should not render edit button when onEditStage not provided', () => {
      renderWithTooltip(
        <StageSection
          stage={mockStage}
          onRemoveStage={mockOnRemoveStage}
          onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
          onDropMiniPrompts={mockOnDropMiniPrompts}
        />
      );

      expect(screen.queryByTestId('edit-stage-stage-1')).not.toBeInTheDocument();
    });
  });

  it('should render StageDropZone with correct props', () => {
    renderWithTooltip(
      <StageSection
        stage={mockStage}
        onRemoveStage={mockOnRemoveStage}
        onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
        onDropMiniPrompts={mockOnDropMiniPrompts}
      />
    );

    expect(screen.getByTestId('stage-dropzone-stage-1')).toBeInTheDocument();
  });

});
