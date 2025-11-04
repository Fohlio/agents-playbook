import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  testId?: string;
}

export function Modal({ isOpen, onClose, children, className, testId }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      data-testid={testId}
    >
      <div
        className={cn(
          "bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-auto",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export interface ModalHeaderProps {
  title: string;
  className?: string;
  testId?: string;
}

export function ModalHeader({ title, className, testId }: ModalHeaderProps) {
  return (
    <h3
      className={cn("text-lg font-semibold text-gray-900 mb-4", className)}
      data-testid={testId}
    >
      {title}
    </h3>
  );
}

export interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

export interface ModalActionsProps {
  children: ReactNode;
  className?: string;
}

export function ModalActions({ children, className }: ModalActionsProps) {
  return (
    <div className={cn("flex gap-3 justify-end", className)}>
      {children}
    </div>
  );
}
