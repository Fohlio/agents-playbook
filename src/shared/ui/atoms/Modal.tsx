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
      className="fixed inset-0 bg-[#050508]/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      data-testid={testId}
    >
      <div
        className={cn(
          "bg-[#0a0a0f] border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.1)] p-6 max-w-md w-full mx-auto",
          className
        )}
        style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-500/50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-500/50 pointer-events-none"></div>
        
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
      className={cn("text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4", className)}
      style={{ textShadow: '0 0 10px #00ffff40' }}
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
