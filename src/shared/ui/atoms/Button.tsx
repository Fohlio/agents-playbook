import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: ReactNode;
  testId?: string;
}

/**
 * Button Component
 * 
 * Design system button with variants:
 * - primary: Main action button (blue gradient)
 * - secondary: Secondary action (white with border)
 * - danger: Destructive action (red)
 * - ghost: Minimal button (text only)
 */
export default function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  disabled,
  testId,
  ...props
}: ButtonProps) {
  const baseStyles = "font-semibold font-mono uppercase tracking-wider transition-all duration-200 focus:outline-none inline-flex items-center justify-center";

  const variantStyles = {
    primary: "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] active:bg-cyan-500/40 focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-transparent border border-cyan-500/30 text-cyan-100 hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:shadow-[0_0_10px_rgba(0,255,255,0.2)] active:bg-cyan-500/20 focus:ring-2 focus:ring-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed",
    danger: "bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:shadow-[0_0_15px_rgba(255,0,0,0.3)] active:bg-red-500/40 focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "text-cyan-400 hover:bg-cyan-500/10 active:bg-cyan-500/20 focus:ring-2 focus:ring-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      data-testid={testId}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

