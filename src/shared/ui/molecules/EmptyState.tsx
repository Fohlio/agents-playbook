"use client";

import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";
import Button from "@/shared/ui/atoms/Button";
import Link from "next/link";

export interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: EmptyStateAction[];
  className?: string;
  testId?: string;
}

/**
 * EmptyState Component
 *
 * Displays a contextual empty state with icon, message, and action buttons.
 * Used when content lists are empty or search/filter returns no results.
 */
export function EmptyState({
  icon,
  title,
  description,
  actions,
  className,
  testId,
}: EmptyStateProps) {
  return (
    <div
      data-testid={testId || "empty-state"}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div className="mb-4 text-gray-300" data-testid="empty-state-icon">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3
        className="text-lg font-semibold text-gray-900 mb-2"
        data-testid="empty-state-title"
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className="text-sm text-gray-500 max-w-md mb-6"
          data-testid="empty-state-description"
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div
          className="flex flex-wrap items-center justify-center gap-3"
          data-testid="empty-state-actions"
        >
          {actions.map((action, index) => {
            const buttonContent = (
              <Button
                key={index}
                variant={action.variant || (index === 0 ? "primary" : "secondary")}
                onClick={action.onClick}
                testId={`empty-state-action-${index}`}
              >
                {action.label}
              </Button>
            );

            if (action.href) {
              return (
                <Link key={index} href={action.href}>
                  {buttonContent}
                </Link>
              );
            }

            return buttonContent;
          })}
        </div>
      )}
    </div>
  );
}

// Default icons for common empty states
export const EmptyStateIcons = {
  search: (
    <svg
      className="w-16 h-16"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  library: (
    <svg
      className="w-16 h-16"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  ),
  share: (
    <svg
      className="w-16 h-16"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  ),
  filter: (
    <svg
      className="w-16 h-16"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  ),
  prompt: (
    <svg
      className="w-16 h-16"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
};

