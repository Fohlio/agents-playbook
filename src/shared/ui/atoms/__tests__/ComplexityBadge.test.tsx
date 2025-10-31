import React from 'react';
import { render, screen } from '@testing-library/react';
import { ComplexityBadge } from '../ComplexityBadge';
import { WorkflowComplexity } from '@prisma/client';

describe('ComplexityBadge', () => {
  it('should render XS complexity badge with correct label and variant', () => {
    render(<ComplexityBadge complexity={WorkflowComplexity.XS} testId="test-badge" />);
    const badge = screen.getByTestId('test-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('XS - Quick');
  });

  it('should render S complexity badge with correct label and variant', () => {
    render(<ComplexityBadge complexity={WorkflowComplexity.S} />);
    expect(screen.getByText('S - Simple')).toBeInTheDocument();
  });

  it('should render M complexity badge with correct label and variant', () => {
    render(<ComplexityBadge complexity={WorkflowComplexity.M} />);
    expect(screen.getByText('M - Moderate')).toBeInTheDocument();
  });

  it('should render L complexity badge with correct label and variant', () => {
    render(<ComplexityBadge complexity={WorkflowComplexity.L} />);
    expect(screen.getByText('L - Complex')).toBeInTheDocument();
  });

  it('should render XL complexity badge with correct label and variant', () => {
    render(<ComplexityBadge complexity={WorkflowComplexity.XL} />);
    expect(screen.getByText('XL - Advanced')).toBeInTheDocument();
  });

  it('should pass testId prop correctly', () => {
    render(<ComplexityBadge complexity={WorkflowComplexity.M} testId="custom-id" />);
    expect(screen.getByTestId('custom-id')).toBeInTheDocument();
  });
});
