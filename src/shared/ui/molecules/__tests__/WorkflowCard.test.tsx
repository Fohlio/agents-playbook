import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowCard, WorkflowCardData } from '../WorkflowCard';
import { WorkflowComplexity } from '@prisma/client';

describe('WorkflowCard', () => {
  const mockWorkflow: WorkflowCardData = {
    id: 'test-workflow-1',
    name: 'Test Workflow',
    description: 'This is a test workflow description',
    complexity: WorkflowComplexity.M,
    visibility: 'PUBLIC',
    isSystemWorkflow: false,
    isOwned: true,
  };

  const mockActions = <button>Edit</button>;

  it('should render with minimal props', () => {
    render(<WorkflowCard workflow={mockWorkflow} actions={mockActions} />);

    expect(screen.getByTestId('workflow-card-test-workflow-1')).toBeInTheDocument();
    expect(screen.getByText('Test Workflow')).toBeInTheDocument();
  });

  it('should display description with line-clamp-3', () => {
    render(<WorkflowCard workflow={mockWorkflow} actions={mockActions} />);

    const description = screen.getByText('This is a test workflow description');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('line-clamp-3');
  });

  it('should render complexity badge when complexity is provided', () => {
    render(<WorkflowCard workflow={mockWorkflow} actions={mockActions} />);

    expect(screen.getByText('M - Moderate')).toBeInTheDocument();
  });

  it('should not render complexity badge when complexity is null', () => {
    const workflowWithoutComplexity = { ...mockWorkflow, complexity: null };
    render(<WorkflowCard workflow={workflowWithoutComplexity} actions={mockActions} />);

    expect(screen.queryByText(/Moderate/)).not.toBeInTheDocument();
  });

  it('should render System badge for system workflows', () => {
    const systemWorkflow = { ...mockWorkflow, isSystemWorkflow: true };
    render(<WorkflowCard workflow={systemWorkflow} actions={mockActions} />);

    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('should render Imported badge for non-owned workflows', () => {
    const importedWorkflow = { ...mockWorkflow, isOwned: false };
    render(<WorkflowCard workflow={importedWorkflow} actions={mockActions} />);

    expect(screen.getByText('Imported')).toBeInTheDocument();
  });

  it('should display tags (max 3 + overflow indicator)', () => {
    const workflowWithTags = {
      ...mockWorkflow,
      tags: [
        { tag: { id: '1', name: 'Tag 1', color: null } },
        { tag: { id: '2', name: 'Tag 2', color: null } },
        { tag: { id: '3', name: 'Tag 3', color: null } },
        { tag: { id: '4', name: 'Tag 4', color: null } },
      ],
    };

    render(<WorkflowCard workflow={workflowWithTags} actions={mockActions} />);

    expect(screen.getByText('Tag 1')).toBeInTheDocument();
    expect(screen.getByText('Tag 2')).toBeInTheDocument();
    expect(screen.getByText('Tag 3')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.queryByText('Tag 4')).not.toBeInTheDocument();
  });

  it('should call onCardClick when card is clicked', () => {
    const handleClick = jest.fn();
    render(<WorkflowCard workflow={mockWorkflow} actions={mockActions} onCardClick={handleClick} />);

    fireEvent.click(screen.getByTestId('workflow-card-test-workflow-1'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not propagate click from actions area', () => {
    const handleClick = jest.fn();
    render(<WorkflowCard workflow={mockWorkflow} actions={mockActions} onCardClick={handleClick} />);

    const actionButton = screen.getByText('Edit');
    fireEvent.click(actionButton);

    // onClick should not have been called because stopPropagation prevents it
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render metadata slot when provided', () => {
    const metadata = <span>5 stages</span>;
    render(<WorkflowCard workflow={mockWorkflow} actions={mockActions} metadata={metadata} />);

    expect(screen.getByText('5 stages')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <WorkflowCard workflow={mockWorkflow} actions={mockActions} className="custom-class" />
    );

    const cardWrapper = container.querySelector('.custom-class');
    expect(cardWrapper).toBeInTheDocument();
  });

  it('should have proper flexbox classes for equal card heights', () => {
    render(<WorkflowCard workflow={mockWorkflow} actions={mockActions} />);

    const cardWrapper = screen.getByTestId('workflow-card-test-workflow-1');
    expect(cardWrapper).toHaveClass('h-full');
  });

  it('should render actions in the actions slot', () => {
    const actions = (
      <>
        <button>Edit</button>
        <button>Delete</button>
      </>
    );

    render(<WorkflowCard workflow={mockWorkflow} actions={actions} />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
