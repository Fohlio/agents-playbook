import React from 'react';
import { render, screen } from '@testing-library/react';
import { SortableItem } from '../SortableItem';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

describe('SortableItem', () => {
  const renderWithDndContext = (children: React.ReactNode) => {
    return render(
      <DndContext>
        <SortableContext items={['test-item-1']}>
          {children}
        </SortableContext>
      </DndContext>
    );
  };

  it('should render children correctly', () => {
    renderWithDndContext(
      <SortableItem id="test-item-1">
        <div>Test Content</div>
      </SortableItem>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should have data-testid attribute', () => {
    renderWithDndContext(
      <SortableItem id="test-item-1">
        <div>Test Content</div>
      </SortableItem>
    );

    expect(screen.getByTestId('sortable-item-test-item-1')).toBeInTheDocument();
  });

  it('should wrap content in a div element', () => {
    renderWithDndContext(
      <SortableItem id="test-item-1">
        <span>Test Content</span>
      </SortableItem>
    );

    const sortableDiv = screen.getByTestId('sortable-item-test-item-1');
    expect(sortableDiv.tagName).toBe('DIV');
  });

  it('should render multiple children correctly', () => {
    renderWithDndContext(
      <SortableItem id="test-item-1">
        <div>First</div>
        <div>Second</div>
      </SortableItem>
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('should apply draggable attributes from useSortable', () => {
    renderWithDndContext(
      <SortableItem id="test-item-1">
        <div>Draggable Content</div>
      </SortableItem>
    );

    const sortableDiv = screen.getByTestId('sortable-item-test-item-1');

    // useSortable should add these attributes
    expect(sortableDiv).toHaveAttribute('role');
    expect(sortableDiv).toHaveAttribute('tabindex');
  });

  it('should have default opacity style (not dragging)', () => {
    renderWithDndContext(
      <SortableItem id="test-item-1">
        <div>Test Content</div>
      </SortableItem>
    );

    const sortableDiv = screen.getByTestId('sortable-item-test-item-1');

    // When not dragging, opacity should be 1
    expect(sortableDiv).toHaveStyle({ opacity: '1' });
  });

  it('should render with complex children (nested components)', () => {
    renderWithDndContext(
      <SortableItem id="test-item-1">
        <div>
          <h3>Title</h3>
          <p>Description</p>
          <button>Action</button>
        </div>
      </SortableItem>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});
