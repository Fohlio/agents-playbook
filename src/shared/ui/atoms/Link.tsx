import NextLink from "next/link";
import { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils/cn";

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  variant?: "primary" | "secondary" | "muted";
  underline?: boolean;
  external?: boolean;
  children: ReactNode;
  testId?: string;
}

/**
 * Link Component
 * 
 * Design system link with variants:
 * - primary: Main navigation/action link (blue)
 * - secondary: Secondary link (gray)
 * - muted: Subtle link (lighter gray)
 * 
 * Uses Next.js Link for internal navigation
 */
export default function Link({
  href,
  variant = "primary",
  underline = false,
  external = false,
  className,
  children,
  testId,
  ...props
}: LinkProps) {
  const baseStyles = "font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-sm";

  const variantStyles = {
    primary: "text-primary-600 hover:text-primary-700 active:text-primary-800",
    secondary: "text-gray-700 hover:text-gray-900 active:text-gray-950",
    muted: "text-gray-500 hover:text-gray-700 active:text-gray-800",
  };

  const underlineStyles = underline ? "underline underline-offset-2" : "";

  const combinedClassName = cn(
    baseStyles,
    variantStyles[variant],
    underlineStyles,
    className
  );

  // External links use regular anchor tag
  if (external || href.startsWith("http")) {
    return (
      <a
        href={href}
        data-testid={testId}
        className={combinedClassName}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }

  // Internal links use Next.js Link
  return (
    <NextLink
      href={href}
      data-testid={testId}
      className={combinedClassName}
      {...props}
    >
      {children}
    </NextLink>
  );
}

