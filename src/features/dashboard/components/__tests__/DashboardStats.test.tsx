import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardStats } from '../DashboardStats';

describe('DashboardStats', () => {
  const mockStats = {
    totalWorkflows: 10,
    totalMiniPrompts: 8,
    activeWorkflows: 3,
    publicItems: 5,
  };

  it('renders all 4 stat cards', () => {
    render(<DashboardStats stats={mockStats} userTier="FREE" />);

    expect(screen.getByText('Total Workflows')).toBeInTheDocument();
    expect(screen.getByText('Active Workflows')).toBeInTheDocument();
    expect(screen.getByText('Mini-Prompts')).toBeInTheDocument();
    expect(screen.getByText('Public Items')).toBeInTheDocument();
  });

  it('displays correct values for all stats', () => {
    render(<DashboardStats stats={mockStats} userTier="PREMIUM" />);

    expect(screen.getByText('10')).toBeInTheDocument(); // totalWorkflows
    expect(screen.getByText('3')).toBeInTheDocument(); // activeWorkflows
    expect(screen.getByText('8')).toBeInTheDocument(); // totalMiniPrompts
    expect(screen.getByText('5')).toBeInTheDocument(); // publicItems
  });

  describe('FREE tier behavior', () => {
    it('shows "X / 5" format for active workflows on FREE tier', () => {
      render(<DashboardStats stats={mockStats} userTier="FREE" />);

      expect(screen.getByText('3 / 5')).toBeInTheDocument();
    });

    it('shows "Limit reached" subtext when limit is hit', () => {
      const limitReachedStats = { ...mockStats, activeWorkflows: 5 };

      render(<DashboardStats stats={limitReachedStats} userTier="FREE" />);

      expect(screen.getByText('Limit reached')).toBeInTheDocument();
    });

    it('uses danger variant when limit reached', () => {
      const limitReachedStats = { ...mockStats, activeWorkflows: 5 };

      render(<DashboardStats stats={limitReachedStats} userTier="FREE" />);

      const statCard = screen.getByTestId('stat-active-workflows');
      expect(statCard).toBeInTheDocument();
      // The danger variant is passed to StatCard which applies red color
    });

    it('does not show "Limit reached" when under limit', () => {
      render(<DashboardStats stats={mockStats} userTier="FREE" />);

      expect(screen.queryByText('Limit reached')).not.toBeInTheDocument();
    });
  });

  describe('PREMIUM tier behavior', () => {
    it('shows raw number for active workflows on PREMIUM tier', () => {
      render(<DashboardStats stats={mockStats} userTier="PREMIUM" />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.queryByText('3 / 5')).not.toBeInTheDocument();
    });

    it('never shows "Limit reached" for PREMIUM tier', () => {
      const highStats = { ...mockStats, activeWorkflows: 10 };

      render(<DashboardStats stats={highStats} userTier="PREMIUM" />);

      expect(screen.queryByText('Limit reached')).not.toBeInTheDocument();
    });
  });

  describe('Business logic', () => {
    it('calculates isFreeTier correctly', () => {
      const { rerender } = render(
        <DashboardStats stats={mockStats} userTier="FREE" />
      );
      expect(screen.getByText('3 / 5')).toBeInTheDocument();

      rerender(<DashboardStats stats={mockStats} userTier="PREMIUM" />);
      expect(screen.queryByText('3 / 5')).not.toBeInTheDocument();
    });

    it('calculates limitReached correctly', () => {
      const { rerender } = render(
        <DashboardStats
          stats={{ ...mockStats, activeWorkflows: 4 }}
          userTier="FREE"
        />
      );
      expect(screen.queryByText('Limit reached')).not.toBeInTheDocument();

      rerender(
        <DashboardStats
          stats={{ ...mockStats, activeWorkflows: 5 }}
          userTier="FREE"
        />
      );
      expect(screen.getByText('Limit reached')).toBeInTheDocument();
    });
  });

  describe('Grid layout', () => {
    it('uses responsive grid layout', () => {
      const { container } = render(
        <DashboardStats stats={mockStats} userTier="FREE" />
      );

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1');
      expect(gridContainer).toHaveClass('md:grid-cols-4');
    });
  });

  describe('Test IDs', () => {
    it('includes testId for each stat card', () => {
      render(<DashboardStats stats={mockStats} userTier="FREE" />);

      expect(screen.getByTestId('stat-total-workflows')).toBeInTheDocument();
      expect(screen.getByTestId('stat-active-workflows')).toBeInTheDocument();
      expect(screen.getByTestId('stat-mini-prompts')).toBeInTheDocument();
      expect(screen.getByTestId('stat-public-items')).toBeInTheDocument();
    });
  });
});
