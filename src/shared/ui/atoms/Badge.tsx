import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "primary";
  testId?: string;
}

/**
 * Badge Component
 *
 * Displays small status indicators or labels
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  testId,
}) => {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    primary: "bg-primary-100 text-primary-800",
  };

  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
};
