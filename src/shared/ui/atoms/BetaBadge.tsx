'use client';

import React from 'react';

export interface BetaBadgeProps {
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * BetaBadge Component
 *
 * Displays a beta indicator for experimental features
 * Used to mark features that are in beta testing phase
 */
export const BetaBadge: React.FC<BetaBadgeProps> = ({
  size = 'sm',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1'
  };

  return (
    <span
      className={`inline-flex items-center rounded font-semibold bg-blue-100 text-blue-700 ${sizeClasses[size]} ${className}`}
      data-testid="beta-badge"
      title="This feature is in beta"
    >
      BETA
    </span>
  );
};
