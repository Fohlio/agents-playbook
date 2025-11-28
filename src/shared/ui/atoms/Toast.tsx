"use client";

import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils/cn";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  id: string;
  message: string;
  variant?: "success" | "error" | "info" | "warning";
  action?: ToastAction;
  duration?: number;
  onDismiss: (id: string) => void;
  testId?: string;
}

/**
 * Toast Component
 *
 * Individual toast notification with optional action button.
 * Follows Alert component color patterns for consistency.
 */
export function Toast({
  id,
  message,
  variant = "info",
  action,
  duration = 5000,
  onDismiss,
  testId,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 200);
  };

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const variantStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  const iconColors = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
    warning: "text-yellow-500",
  };

  const iconPaths = {
    success:
      "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
    error:
      "M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z",
    warning:
      "M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z",
    info: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z",
  };

  const actionButtonStyles = {
    success: "text-green-700 hover:bg-green-100",
    error: "text-red-700 hover:bg-red-100",
    info: "text-blue-700 hover:bg-blue-100",
    warning: "text-yellow-700 hover:bg-yellow-100",
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      data-testid={testId || `toast-${id}`}
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-[320px] max-w-[420px]",
        "transition-all duration-200 ease-out",
        variantStyles[variant],
        isVisible && !isExiting
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2"
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <svg
          className={cn("h-5 w-5", iconColors[variant])}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d={iconPaths[variant]} clipRule="evenodd" />
        </svg>
      </div>

      {/* Message */}
      <p className="flex-1 text-sm font-medium">{message}</p>

      {/* Action Button */}
      {action && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
            handleDismiss();
          }}
          className={cn(
            "px-2 py-1 text-sm font-semibold rounded transition-colors",
            actionButtonStyles[variant]
          )}
          data-testid={`toast-action-${id}`}
        >
          {action.label}
        </button>
      )}

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        className={cn(
          "flex-shrink-0 p-1 rounded transition-colors",
          actionButtonStyles[variant]
        )}
        aria-label="Dismiss notification"
        data-testid={`toast-close-${id}`}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

