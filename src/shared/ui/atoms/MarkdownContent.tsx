import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export interface MarkdownContentProps {
  content: string;
  className?: string;
  testId?: string;
  variant?: "light" | "dark";
}

/**
 * MarkdownContent Component
 *
 * Centralized markdown rendering with consistent styling
 * Supports GitHub Flavored Markdown including h4 headings
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  className = "",
  testId,
  variant = "light",
}) => {
  const isDark = variant === "dark";

  // Color classes based on variant - using explicit colors for dark mode
  const colors = {
    text: isDark ? "text-cyan-100/70" : "text-gray-900",
    textMuted: isDark ? "text-cyan-100/80" : "text-gray-800",
    textSecondary: isDark ? "text-cyan-100/60" : "text-gray-700",
    textTertiary: isDark ? "text-cyan-100/50" : "text-gray-600",
    link: isDark ? "text-cyan-400 hover:text-cyan-300" : "text-blue-600 hover:text-blue-800",
    code: isDark ? "bg-black/30 text-cyan-300" : "bg-gray-100 text-gray-800",
    codeBlock: isDark ? "bg-black/50 text-cyan-100" : "bg-gray-900 text-gray-100",
    blockquote: isDark ? "border-cyan-500 text-cyan-100/70 bg-cyan-500/10" : "border-blue-500 text-gray-700 bg-blue-50",
    hr: isDark ? "border-cyan-500/30" : "border-gray-300",
  };

  return (
    <div
      data-testid={testId}
      className={`${colors.text} ${className}`.trim()}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ ...props }) => (
            <h1 className={`text-2xl font-bold mt-6 mb-4 ${colors.text}`} {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className={`text-xl font-bold mt-5 mb-3 ${colors.text}`} {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className={`text-lg font-bold mt-4 mb-2 ${colors.textMuted}`} {...props} />
          ),
          h4: ({ ...props }) => (
            <h4 className={`text-base font-semibold mt-3 mb-2 ${colors.textMuted}`} {...props} />
          ),
          h5: ({ ...props }) => (
            <h5 className={`text-sm font-semibold mt-2 mb-1 ${colors.textSecondary}`} {...props} />
          ),
          h6: ({ ...props }) => (
            <h6 className={`text-xs font-semibold mt-2 mb-1 ${colors.textSecondary}`} {...props} />
          ),
          p: ({ ...props }) => (
            <p className={`mb-2 last:mb-0 ${colors.text}`} {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className={`list-disc pl-5 mb-2 space-y-1 ${colors.text}`} {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className={`list-decimal pl-5 mb-2 space-y-1 ${colors.text}`} {...props} />
          ),
          li: ({ ...props }) => (
            <li className={`mb-1 ${colors.text}`} {...props} />
          ),
          code: ({ className: codeClassName, ...props }) => {
            const isInline = !codeClassName?.includes("language-");
            return isInline ? (
              <code className={`${colors.code} px-1.5 py-0.5 rounded text-sm font-mono`} {...props} />
            ) : (
              <code className={`block ${colors.codeBlock} p-4 rounded-lg text-sm font-mono overflow-x-auto my-3`} {...props} />
            );
          },
          pre: ({ ...props }) => (
            <pre className="my-3 overflow-x-auto" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote className={`border-l-4 ${colors.blockquote} pl-4 py-2 my-3 italic`} {...props} />
          ),
          a: ({ ...props }) => (
            <a className={`${colors.link} underline`} {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className={`font-semibold ${colors.text}`} {...props} />
          ),
          em: ({ ...props }) => (
            <em className="italic" {...props} />
          ),
          hr: ({ ...props }) => (
            <hr className={`my-4 border-t ${colors.hr}`} {...props} />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-3">
              <table className={`min-w-full divide-y ${isDark ? "divide-cyan-500/30 border-cyan-500/30" : "divide-gray-200 border-gray-200"} border`} {...props} />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className={isDark ? "bg-black/30" : "bg-gray-50"} {...props} />
          ),
          tbody: ({ ...props }) => (
            <tbody className={`${isDark ? "bg-transparent divide-cyan-500/20" : "bg-white divide-gray-200"} divide-y`} {...props} />
          ),
          tr: ({ ...props }) => (
            <tr {...props} />
          ),
          th: ({ ...props }) => (
            <th className={`px-4 py-2 text-left text-xs font-semibold ${colors.textSecondary} uppercase tracking-wider`} {...props} />
          ),
          td: ({ ...props }) => (
            <td className={`px-4 py-2 text-sm ${colors.textTertiary}`} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
