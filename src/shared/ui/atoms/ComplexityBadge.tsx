import React from "react";
import { WorkflowComplexity } from "@prisma/client";
import { Badge } from "./Badge";

export interface ComplexityBadgeProps {
  complexity: WorkflowComplexity | null | undefined;
  size?: "sm" | "md"; // Not used in Badge but kept for API compatibility
  testId?: string;
}

const COMPLEXITY_CONFIG: Record<
  WorkflowComplexity,
  { label: string; variant: "default" | "success" | "warning" | "error" | "primary" }
> = {
  XS: { label: "XS - Quick", variant: "success" },
  S: { label: "S - Simple", variant: "primary" },
  M: { label: "M - Moderate", variant: "default" },
  L: { label: "L - Complex", variant: "warning" },
  XL: { label: "XL - Advanced", variant: "error" },
};

/**
 * ComplexityBadge Component
 *
 * Displays workflow complexity using color-coded badges
 * Returns null if no complexity is provided
 */
export const ComplexityBadge: React.FC<ComplexityBadgeProps> = ({
  complexity,
  testId,
}) => {
  if (!complexity) {
    return null;
  }

  const config = COMPLEXITY_CONFIG[complexity];

  return (
    <Badge variant={config.variant} testId={testId}>
      {config.label}
    </Badge>
  );
};
