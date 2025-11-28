"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Toast, ToastAction } from "@/shared/ui/atoms/Toast";
import { ToastContainer } from "@/shared/ui/atoms/ToastContainer";

export interface ShowToastOptions {
  message: string;
  variant?: "success" | "error" | "info" | "warning";
  action?: ToastAction;
  duration?: number;
}

interface ToastItem extends ShowToastOptions {
  id: string;
}

interface ToastContextValue {
  showToast: (options: ShowToastOptions) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 5;

/**
 * ToastProvider
 *
 * Provides toast notification context to the app.
 * Manages toast stack with max limit and auto-dismissal.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showToast = useCallback(
    (options: ShowToastOptions): string => {
      const id = generateId();
      const newToast: ToastItem = {
        id,
        ...options,
      };

      setToasts((prev) => {
        // Limit to MAX_TOASTS, remove oldest if needed
        const updated = [...prev, newToast];
        if (updated.length > MAX_TOASTS) {
          return updated.slice(-MAX_TOASTS);
        }
        return updated;
      });

      return id;
    },
    [generateId]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            variant={toast.variant}
            action={toast.action}
            duration={toast.duration}
            onDismiss={dismissToast}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

/**
 * useToast Hook
 *
 * Access toast notification methods from any component.
 *
 * @example
 * ```tsx
 * const { showToast, dismissToast } = useToast();
 *
 * // Show success toast with undo action
 * showToast({
 *   message: "Item added to library",
 *   variant: "success",
 *   action: { label: "Undo", onClick: handleUndo }
 * });
 * ```
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

