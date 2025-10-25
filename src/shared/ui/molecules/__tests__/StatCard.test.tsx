import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../StatCard';

describe('StatCard', () => {
  it('renders with required props (label and value)', () => {
    render(<StatCard label="Total Items" value={42} />);

    expect(screen.getByText('Total Items')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('displays optional subtext when provided', () => {
    render(
      <StatCard
        label="Active Workflows"
        value="3 / 5"
        subtext="Limit reached"
      />
    );

    expect(screen.getByText('Limit reached')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<StatCard label="Test" value={10} testId="test-card" />);

    const valueElement = screen.getByText('10');
    expect(valueElement).toHaveClass('text-gray-900');
  });

  it('applies warning variant styles', () => {
    render(<StatCard label="Test" value={10} variant="warning" />);

    const valueElement = screen.getByText('10');
    expect(valueElement).toHaveClass('text-yellow-600');
  });

  it('applies success variant styles', () => {
    render(<StatCard label="Test" value={10} variant="success" />);

    const valueElement = screen.getByText('10');
    expect(valueElement).toHaveClass('text-green-600');
  });

  it('applies danger variant styles', () => {
    render(<StatCard label="Test" value={10} variant="danger" />);

    const valueElement = screen.getByText('10');
    expect(valueElement).toHaveClass('text-red-600');
  });

  it('renders with icon when provided', () => {
    const TestIcon = () => <svg data-testid="test-icon" />;

    render(
      <StatCard
        label="Test"
        value={10}
        icon={<TestIcon />}
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('includes testId for testing', () => {
    render(<StatCard label="Test" value={10} testId="stat-card" />);

    expect(screen.getByTestId('stat-card')).toBeInTheDocument();
  });

  it('renders string values correctly', () => {
    render(<StatCard label="Status" value="Active" />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders numeric values correctly', () => {
    render(<StatCard label="Count" value={100} />);

    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('uses proper semantic HTML structure', () => {
    render(<StatCard label="Test" value={10} />);

    // Should have proper text elements
    const label = screen.getByText('Test');
    const value = screen.getByText('10');

    expect(label.tagName).toBe('P');
    expect(value.tagName).toBe('P');
  });
});
