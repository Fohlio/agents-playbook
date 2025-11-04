import React from 'react';
import { render, screen } from '@testing-library/react';
import { BetaBadge } from '../BetaBadge';

describe('BetaBadge', () => {
  it('should render with default props', () => {
    render(<BetaBadge />);
    const badge = screen.getByTestId('beta-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('BETA');
  });

  it('should render with sm size (default)', () => {
    render(<BetaBadge />);
    const badge = screen.getByTestId('beta-badge');
    expect(badge).toHaveClass('text-xs', 'px-1.5', 'py-0.5');
  });

  it('should render with md size', () => {
    render(<BetaBadge size="md" />);
    const badge = screen.getByTestId('beta-badge');
    expect(badge).toHaveClass('text-sm', 'px-2', 'py-1');
  });

  it('should have correct color classes', () => {
    render(<BetaBadge />);
    const badge = screen.getByTestId('beta-badge');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('should have title attribute for hover tooltip', () => {
    render(<BetaBadge />);
    const badge = screen.getByTestId('beta-badge');
    expect(badge).toHaveAttribute('title', 'This feature is in beta');
  });

  it('should apply custom className', () => {
    render(<BetaBadge className="ml-2" />);
    const badge = screen.getByTestId('beta-badge');
    expect(badge).toHaveClass('ml-2');
  });

  it('should have data-testid attribute', () => {
    render(<BetaBadge />);
    expect(screen.getByTestId('beta-badge')).toBeInTheDocument();
  });

  it('should have correct base classes', () => {
    render(<BetaBadge />);
    const badge = screen.getByTestId('beta-badge');
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded', 'font-semibold');
  });
});
