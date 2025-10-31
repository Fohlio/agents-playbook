import { Card } from "@/shared/ui/atoms";
import { Tooltip } from "./Tooltip";
import { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: ReactNode;
  variant?: "default" | "warning" | "success" | "danger";
  testId?: string;
  tooltip?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  icon,
  variant = "default",
  testId,
  tooltip
}: StatCardProps) {
  const variantStyles = {
    default: "text-gray-900",
    warning: "text-yellow-600",
    success: "text-green-600",
    danger: "text-red-600",
  };

  const cardContent = (
    <Card testId={testId}>
      <div className="text-center">
        {icon && <div className="flex justify-center mb-2">{icon}</div>}
        <p className="text-sm text-gray-600">{label}</p>
        <p className={`text-3xl font-bold mt-2 ${variantStyles[variant]}`}>
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-gray-500 mt-1">{subtext}</p>
        )}
      </div>
    </Card>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{cardContent}</Tooltip>;
  }

  return cardContent;
}
