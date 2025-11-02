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
  name: 'Test Stage',
  description: 'Test stage description',
  color: '#3b82f6',
  order: 0,
  withReview: true,
  miniPrompts: [],
};

describe('StageSection', () => {
  const mockOnRemoveStage = jest.fn();
  const mockOnRemoveMiniPrompt = jest.fn();
  const mockOnEditStage = jest.fn();
  const mockOnToggleWithReview = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render stage name and description', () => {
    renderWithTooltip(
      <StageSection
        stage={mockStage}
        onRemoveStage={mockOnRemoveStage}
        onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
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
      />
    );

    const removeButton = screen.getByTestId('remove-stage-stage-1');
    expect(removeButton).toBeInTheDocument();
    expect(removeButton).toHaveTextContent('Remove Stage');
  });

  it('should call onRemoveStage when remove button clicked', () => {
    renderWithTooltip(
      <StageSection
        stage={mockStage}
        onRemoveStage={mockOnRemoveStage}
        onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
      />
    );

    const removeButton = screen.getByTestId('remove-stage-stage-1');
    fireEvent.click(removeButton);

    expect(mockOnRemoveStage).toHaveBeenCalledWith('stage-1');
  });

  describe('With Review Checkbox', () => {
    it('should render with review checkbox when onToggleWithReview provided', () => {
      renderWithTooltip(
        <StageSection
          stage={mockStage}
          onRemoveStage={mockOnRemoveStage}
          onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
          onToggleWithReview={mockOnToggleWithReview}
        />
      );

      expect(screen.getByText('With Review')).toBeInTheDocument();
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should render BetaBadge next to with review checkbox', () => {
      renderWithTooltip(
        <StageSection
          stage={mockStage}
          onRemoveStage={mockOnRemoveStage}
          onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
          onToggleWithReview={mockOnToggleWithReview}
        />
      );

      const betaBadge = screen.getByTestId('beta-badge');
      expect(betaBadge).toBeInTheDocument();
      expect(betaBadge).toHaveTextContent('BETA');
    });

    it('should render checkbox in checked state when withReview is true', () => {
      renderWithTooltip(
        <StageSection
          stage={{ ...mockStage, withReview: true }}
          onRemoveStage={mockOnRemoveStage}
          onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
          onToggleWithReview={mockOnToggleWithReview}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should render checkbox in unchecked state when withReview is false', () => {
      renderWithTooltip(
        <StageSection
          stage={{ ...mockStage, withReview: false }}
          onRemoveStage={mockOnRemoveStage}
          onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
          onToggleWithReview={mockOnToggleWithReview}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should call onToggleWithReview when checkbox toggled', () => {
      renderWithTooltip(
        <StageSection
          stage={{ ...mockStage, withReview: false }}
          onRemoveStage={mockOnRemoveStage}
          onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
          onToggleWithReview={mockOnToggleWithReview}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockOnToggleWithReview).toHaveBeenCalledWith('stage-1', true);
    });

    it('should not render checkbox when onToggleWithReview not provided', () => {
      renderWithTooltip(
        <StageSection
          stage={mockStage}
          onRemoveStage={mockOnRemoveStage}
          onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
        />
      );

      expect(screen.queryByText('With Review')).not.toBeInTheDocument();
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });

  describe('Edit Stage Button', () => {
    it('should render edit button when onEditStage provided', () => {
      renderWithTooltip(
        <StageSection
          stage={mockStage}
          onRemoveStage={mockOnRemoveStage}
          onRemoveMiniPrompt={mockOnRemoveMiniPrompt}
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
        includeMultiAgentChat={true}
      />
    );

    expect(screen.getByTestId('stage-dropzone-stage-1')).toBeInTheDocument();
  });
});
