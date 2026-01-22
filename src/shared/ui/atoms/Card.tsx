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
        "bg-[#0a0a0f]/80 backdrop-blur-sm border border-cyan-500/30 p-6 relative",
        "hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all duration-200",
        className
      )}
      style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-500/50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-500/50 pointer-events-none"></div>
      
      {/* Circuit pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '25px 25px'
      }}></div>
      
      <div className="relative">
        {children}
      </div>
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
          <h2 className="text-lg font-bold font-mono text-cyan-400 uppercase tracking-wider hover:text-cyan-300 transition-colors cursor-pointer" style={{ textShadow: '0 0 10px #00ffff40' }}>
            {title}
          </h2>
        </Link>
      ) : (
        <h2 className="text-lg font-bold font-mono text-cyan-400 uppercase tracking-wider" style={{ textShadow: '0 0 10px #00ffff40' }}>
          {title}
        </h2>
      )}
      {description && (
        <p className="mt-1 text-sm text-cyan-100/50 font-mono">{description}</p>
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
