"use client";

import { ReactNode } from "react";

interface ToastContainerProps {
  children: ReactNode;
  testId?: string;
}

/**
 * ToastContainer Component
 *
 * Fixed position container for toast notifications.
 * Positioned at bottom-right, stacks toasts vertically.
 */
export function ToastContainer({ children, testId }: ToastContainerProps) {
  return (
    <div
      data-testid={testId || "toast-container"}
      className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 pointer-events-none"
      aria-label="Notifications"
    >
      <div className="flex flex-col gap-2 pointer-events-auto">{children}</div>
    </div>
  );
}

