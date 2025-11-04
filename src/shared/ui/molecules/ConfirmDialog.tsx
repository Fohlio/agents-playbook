"use client";

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
} from "@/shared/ui/atoms/Modal";
import Button from "@/shared/ui/atoms/Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
  testId?: string;
}

/**
 * ConfirmDialog Component
 *
 * Reusable confirmation modal for user actions
 * - Supports customizable title, message, and button labels
 * - Two variants: "danger" (red, for destructive actions) and "primary" (blue)
 * - Loading state for async operations
 * - Automatically disables buttons during loading
 * - Prevents accidental clicks with clear UX
 *
 * Usage:
 * ```tsx
 * <ConfirmDialog
 *   isOpen={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Item"
 *   message="Are you sure you want to delete this item?"
 *   variant="danger"
 * />
 * ```
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  loading = false,
  testId,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={loading ? undefined : onClose} testId={testId}>
      <ModalHeader title={title} />
      <ModalBody>
        <p className="text-sm text-gray-700">{message}</p>
      </ModalBody>
      <ModalActions>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
          testId={testId ? `${testId}-cancel` : undefined}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          disabled={loading}
          testId={testId ? `${testId}-confirm` : undefined}
        >
          {loading ? "Processing..." : confirmLabel}
        </Button>
      </ModalActions>
    </Modal>
  );
}
