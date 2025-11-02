import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MiniPromptCard, MiniPromptCardData } from '../MiniPromptCard';

describe('MiniPromptCard', () => {
  const mockMiniPrompt: MiniPromptCardData = {
    id: 'test-mini-prompt-1',
    name: 'Test Mini-Prompt',
    description: 'This is a test mini-prompt description',
    visibility: 'PUBLIC',
    isSystemMiniPrompt: false,
    isOwned: true,
  };

  const mockActions = <button>Edit</button>;

  it('should render with minimal props', () => {
    render(<MiniPromptCard miniPrompt={mockMiniPrompt} actions={mockActions} />);

    expect(screen.getByTestId('mini-prompt-card-test-mini-prompt-1')).toBeInTheDocument();
    expect(screen.getByText('Test Mini-Prompt')).toBeInTheDocument();
  });

  it('should display description with line-clamp-3', () => {
    render(<MiniPromptCard miniPrompt={mockMiniPrompt} actions={mockActions} />);

    const description = screen.getByText('This is a test mini-prompt description');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('line-clamp-3');
  });

  it('should not render description when not provided', () => {
    const miniPromptWithoutDescription = { ...mockMiniPrompt, description: null };
    render(<MiniPromptCard miniPrompt={miniPromptWithoutDescription} actions={mockActions} />);

    expect(screen.queryByText('This is a test mini-prompt description')).not.toBeInTheDocument();
  });

  it('should render System badge for system mini-prompts', () => {
    const systemMiniPrompt = { ...mockMiniPrompt, isSystemMiniPrompt: true };
    render(<MiniPromptCard miniPrompt={systemMiniPrompt} actions={mockActions} />);

    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('should render Imported badge for non-owned mini-prompts', () => {
    const importedMiniPrompt = { ...mockMiniPrompt, isOwned: false };
    render(<MiniPromptCard miniPrompt={importedMiniPrompt} actions={mockActions} />);

    expect(screen.getByText('Imported')).toBeInTheDocument();
  });

  it('should display tags (max 3 + overflow indicator)', () => {
    const miniPromptWithTags = {
      ...mockMiniPrompt,
      tags: [
        { tag: { id: '1', name: 'Tag 1', color: null } },
        { tag: { id: '2', name: 'Tag 2', color: null } },
        { tag: { id: '3', name: 'Tag 3', color: null } },
        { tag: { id: '4', name: 'Tag 4', color: null } },
        { tag: { id: '5', name: 'Tag 5', color: null } },
      ],
    };

    render(<MiniPromptCard miniPrompt={miniPromptWithTags} actions={mockActions} />);

    expect(screen.getByText('Tag 1')).toBeInTheDocument();
    expect(screen.getByText('Tag 2')).toBeInTheDocument();
    expect(screen.getByText('Tag 3')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.queryByText('Tag 4')).not.toBeInTheDocument();
    expect(screen.queryByText('Tag 5')).not.toBeInTheDocument();
  });

  it('should call onCardClick when card is clicked', () => {
    const handleClick = jest.fn();
    render(<MiniPromptCard miniPrompt={mockMiniPrompt} actions={mockActions} onCardClick={handleClick} />);

    fireEvent.click(screen.getByTestId('mini-prompt-card-test-mini-prompt-1'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not propagate click from actions area', () => {
    const handleClick = jest.fn();
    render(<MiniPromptCard miniPrompt={mockMiniPrompt} actions={mockActions} onCardClick={handleClick} />);

    const actionButton = screen.getByText('Edit');
    fireEvent.click(actionButton);

    // onClick should not have been called because stopPropagation prevents it
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render metadata slot when provided', () => {
    const metadata = <span>Used 42 times</span>;
    render(<MiniPromptCard miniPrompt={mockMiniPrompt} actions={mockActions} metadata={metadata} />);

    expect(screen.getByText('Used 42 times')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <MiniPromptCard miniPrompt={mockMiniPrompt} actions={mockActions} className="custom-class" />
    );

    const cardWrapper = container.querySelector('.custom-class');
    expect(cardWrapper).toBeInTheDocument();
  });

  it('should have proper flexbox classes for equal card heights', () => {
    render(<MiniPromptCard miniPrompt={mockMiniPrompt} actions={mockActions} />);

    const cardWrapper = screen.getByTestId('mini-prompt-card-test-mini-prompt-1');
    expect(cardWrapper).toHaveClass('h-full');
  });

  it('should render actions in the actions slot', () => {
    const actions = (
      <>
        <button>Edit</button>
        <button>Delete</button>
      </>
    );

    render(<MiniPromptCard miniPrompt={mockMiniPrompt} actions={actions} />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
