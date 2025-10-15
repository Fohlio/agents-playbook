import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";

export interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  children: ReactNode;
  className?: string;
}

/**
 * Alert Component
 * 
 * Feedback component for displaying messages:
 * - success: Green background (operations succeeded)
 * - error: Red background (errors occurred)
 * - warning: Yellow background (warnings)
 * - info: Blue background (informational)
 */
export default function Alert({
  variant = "info",
  children,
  className,
}: AlertProps) {
  const variantStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };
  
  const iconPaths = {
    success: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
    error: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z",
    warning: "M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z",
    info: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z",
  };
  
  const iconColors = {
    success: "text-green-400",
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
  };
  
  return (
    <div
      className={cn(
        "rounded-md border p-4",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className={cn("h-5 w-5", iconColors[variant])}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d={iconPaths[variant]}
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

