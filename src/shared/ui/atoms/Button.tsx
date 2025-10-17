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
  const baseStyles = "rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantStyles = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
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
        fullWidth ? "w-full flex justify-center items-center" : "",
        disabled ? "cursor-not-allowed" : "",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

