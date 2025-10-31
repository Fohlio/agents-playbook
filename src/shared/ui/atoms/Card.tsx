import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils/cn";

export interface CardProps {
  children: ReactNode;
  className?: string;
  testId?: string;
}

export function Card({ children, className, testId }: CardProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-sm p-6",
        "hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: string;
  description?: string;
  className?: string;
  testId?: string;
  titleHref?: string;
}

export function CardHeader({ title, description, className, testId, titleHref }: CardHeaderProps) {
  return (
    <div className={cn("mb-6", className)} data-testid={testId}>
      {titleHref ? (
        <Link href={titleHref}>
          <h2 className="text-xl font-semibold text-text-primary hover:text-primary-600 transition-colors cursor-pointer">
            {title}
          </h2>
        </Link>
      ) : (
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      )}
      {description && (
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      )}
    </div>
  );
}

export interface CardActionsProps {
  children: ReactNode;
  className?: string;
}

export function CardActions({ children, className }: CardActionsProps) {
  return (
    <div className={cn("flex justify-end gap-3 mt-6", className)}>
      {children}
    </div>
  );
}
